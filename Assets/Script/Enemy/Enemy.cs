﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour
{
    //玩家属性
    public int MaxHP;
    public int _HP;
    public int speed;
    public int AttDis = 5;
    public int HP
    {
        get { return _HP; }
        set
        {
            _HP = Mathf.Clamp(value, 0, MaxHP);
            if (_HP <= 0)
            {
                Die();
            }
        }
    }

    public GameObject Player;
    public Animator anim;
    public Rigidbody2D rd;


    //巡逻属性
    public float chaseDis = 2;
    public float stopDis = 2;


    public int SkillID;

    public void Start()
    {
        anim = GetComponent<Animator>();
        rd = GetComponent<Rigidbody2D>();
        Player = GameObject.FindGameObjectWithTag("Player");
        HP = MaxHP;
        Begin();
        
    }
    public virtual void Begin()
    {

    }
    public virtual void DataUp()
    {

    }
    private void Update()
    {
       
        DataUp();
        if (Vector2.Distance(Player.transform.position, transform.position) < chaseDis)
        {
            if (Vector2.Distance(Player.transform.position, transform.position) > stopDis)
            {
                Chase();
                anim.SetBool("Walk", true);
            }
            else
            {
                anim.SetBool("Walk", false);
                Attack();
            }
        }
        else
        {         
            Seek();
            anim.SetBool("Walk", true);
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
