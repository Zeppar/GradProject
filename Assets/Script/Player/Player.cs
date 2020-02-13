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
    private Coroutine resetAttackCor = null;
    private AnimatorStateInfo currentState;

    void Start()
    {
        HP = maxHP;
        anim = GetComponent<Animator>();
        currentState = anim.GetCurrentAnimatorStateInfo(0);
    } 
    void Update()
    {
        Attack();
       
    }

    void Attack() {
        currentState = anim.GetCurrentAnimatorStateInfo(0);
        if (!currentState.IsName("Idle") && currentState.normalizedTime > 1.6F)
        {
            anim.SetInteger("Attack", 0);
            attackCount = 0;
        }

        if (Input.GetKeyDown(KeyCode.J)) {
            if (currentState.IsName("Idle") && attackCount == 0 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 1);
                attackCount = 1;
            }
            else if (currentState.IsName("Attack1") && attackCount == 1 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 2);
                attackCount = 2;
            }
            if (currentState.IsName("Attack2") && attackCount == 2 && currentState.normalizedTime > 0.5F)
            {
                anim.SetInteger("Attack", 3);
                attackCount = 3;
            }
            Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);
           
          
            if (coll != null && coll.CompareTag("Enemy") && !coll.GetComponent<Enemy>().dead) {
                coll.GetComponent<Enemy>().BeAttacked(attack);
            }
            
        }
        if (Input.GetKeyDown(KeyCode.K)) {
            GameManger.instance.skillParticleCreator.CreateFireball(AttackPoint.position, new Vector2(transform.GetComponent<PlayerController>().dir, 0));
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
