using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    public int MaxHP;
    public int _HP;
    public int speed;
    public GameObject Player;
  
    public int AttDis = 5;
    public int HP
    {
        get { return _HP; }
        set {
           _HP =  Mathf.Clamp(value,0,MaxHP);
           if(_HP <= 0)
            {
                Die();
            }
        }
    }
    public Rigidbody2D rd;
    public float chaseDis = 2;
    public float stopDis = 2;
    public int SkillID;

    public void Start()
    {
        rd = GetComponent<Rigidbody2D>();
        Player = GameObject.FindGameObjectWithTag("Player");
        HP = MaxHP;
        Begin();
        
    }
    public virtual void Begin()
    {

    }
    private void Update()
    {
        Attack();
        if (Vector2.Distance(Player.transform.position, transform.position) < chaseDis)
        {
            if (Vector2.Distance(Player.transform.position, transform.position) > stopDis)
            {
                Chase();
            }
            else
            {
                
            }
        }
        else
        {         
            Seek();
        }
       
    }
    public virtual void Attack()
    {

    }
    public virtual void Attacked(int IntCount)
    {
        HP -= IntCount;
    }
    public virtual void Seek()
    {

    }
    public virtual void Chase()
    {

    }

    public virtual void Die()
    {
        GameManger.instance.skillStoneCreator.CreateSkillStone(SkillID,transform.position);
        Destroy(gameObject);
    }
    private void OnCollisionEnter2D(UnityEngine.Collision2D coll)
    {
      
    }



}
