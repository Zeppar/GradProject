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
    private int AttackCount = 1;
    
    public int HP
    {
        get
        {
            return _hp;
        }
        set
        {
            _hp = Mathf.Clamp(0, maxHP, value);
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



    void Start()
    {
        HP = maxHP;
        anim = GetComponent<Animator>();       
    } 
    void Update()
    {
        Attack();
    }
    
    void Attack()
    {
        
        if (Input.GetKeyDown(KeyCode.J))
        {
           
            if (Time.time - lastAttackTime < attackInterval)
            {
                return;
            }
            Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);
            if(AttackCount == 1)
            {
                anim.Play("Player_Attack1");
                AttackCount++;
            }
            else
            {
                anim.Play("Player_Attack2");
                AttackCount--;
            }
                  
            if (coll != null && coll.CompareTag("Enemy"))
            {
                coll.GetComponent<Enemy>().Attacked(attack);
            }
            lastAttackTime = Time.time;
        }
        if (Input.GetKeyDown(KeyCode.K)){
            GameManger.instance.skillParticleCreator.CreateFireball(AttackPoint.position,new Vector2(transform.GetComponent<PlayerController>().dir,0));
        }
    }

    void Die()
    {
        Destroy(gameObject);
    }

   



}
