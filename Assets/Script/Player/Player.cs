using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class Player : MonoBehaviour
{
   
    public  int maxHP;
    public int attack;
    public float range;
    public float attackInterval;
    private float lastAttackTime = 0;
    public bool dead = false;
    
    public int HP
    {
        get
        {
            return _hp;
        }
        set
        {
            _hp = Mathf.Clamp(value, 0, maxHP);
            if (_hp <= 0)
            {
                Die();
            }
        }
    }
    private int _hp;
    private Animator anim; 
    public GameObject Target;
    public Transform AttackPoint;

    private int attackCount = 0;
    private AnimatorStateInfo currentState;


    [Header("音乐")]
    public AudioSource audioSource;
    public AudioClip Audio_Attack;
    public AudioClip Audio_Walk;


    private Cinemachine.CinemachineCollisionImpulseSource MyInpulse;//相机震动

    void Start()
    {
        HP = maxHP;
        anim = GetComponent<Animator>();
        currentState = anim.GetCurrentAnimatorStateInfo(0);
        MyInpulse = GetComponent<Cinemachine.CinemachineCollisionImpulseSource>();//相机震动
    } 
    void Update()
    {
        if (Input.GetMouseButtonDown(1))
        {
            print("AAAAAAAAAAAAAAAAAA");
            MyInpulse.GenerateImpulse();
        }
        currentState = anim.GetCurrentAnimatorStateInfo(0);
        Attack();
        if (currentState.IsName("Walk"))
        {
            audioSource.Stop();
        }
        else
        {
            
            audioSource.clip = Audio_Walk;
            audioSource.Play();
        }
    
    }

    void Attack() {

        if (!currentState.IsName("Idle") && currentState.normalizedTime > 1.6F)
        {
            anim.SetInteger("Attack", 0);
            attackCount = 0;
        }

        if (Input.GetKeyDown(KeyCode.J) || Input.GetKeyDown(KeyCode.JoystickButton2)) {
            if (GameManger.instance.player.GetComponent<PlayerController>().isMove) { return; }
            GameObject target = null;
            if (currentState.IsName("Idle") && attackCount == 0 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 1);
                attackCount = 1;
                Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);               

                if (coll != null && coll.CompareTag("Enemy") && !coll.GetComponent<Enemy>().dead)
                {
                    coll.GetComponent<Enemy>().BeAttacked(attack);
                    target = coll.gameObject;
                }
                audioSource.PlayOneShot(Audio_Attack);
            }
            else if (currentState.IsName("Attack1") && attackCount == 1 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 2);
                attackCount = 2;
                Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);
                if (coll != null && coll.CompareTag("Enemy") && !coll.GetComponent<Enemy>().dead)
                {
                    coll.GetComponent<Enemy>().BeAttacked(attack);
                    target = coll.gameObject;
                }
                audioSource.PlayOneShot(Audio_Attack);
            }
            else if (currentState.IsName("Attack2") && attackCount == 2 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 3);
                attackCount = 3;
                Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);
                if (coll != null && coll.CompareTag("Enemy") && !coll.GetComponent<Enemy>().dead)
                {
                    coll.GetComponent<Enemy>().BeAttacked(attack);
                    target = coll.gameObject;
                  
                    print("相机抖动");
                }
                audioSource.PlayOneShot(Audio_Attack);
            }
            else { return; }
            if (target)
            {
                iTween.MoveBy(target, iTween.Hash("x", GameManger.instance.player.GetComponent<PlayerController>().dir * 2, "y", 1, "looktime", 0.5f));
                Camera.main.DOShakePosition(2, new Vector3(50, 60, 70));
                Camera.main.DOShakeRotation(2, new Vector3(10, 7, 15));
            }
            


        }
      
    }

    void Die()
    {
        dead = true;
        anim.SetBool("Dead", true);
    }

    public void BeAttacked(int _attack)
    {
        HP -= _attack;
        //print("玩家受伤，目前血量:" + HP+",敌人伤害："+_attack);
        if(HP > 0)
           
           anim.SetTrigger("Hurt");
    }


    void DestroySelf() {
        Destroy(gameObject);
    }

    public void ResetAttackCount() {
        attackCount = 0;
        anim.SetInteger("Attack", attackCount);
    }



}
