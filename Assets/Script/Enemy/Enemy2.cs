using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy2 : Enemy
{

    public int dir = 1;
    private ContactFilter2D contactFilter;//碰撞层的碰撞
    private RaycastHit2D[] resultArr = new RaycastHit2D[16];
    public float distance = 5;

    public override void Begin()
    {
        
        contactFilter.useTriggers = false;
        contactFilter.useLayerMask = true;
        contactFilter.SetLayerMask(LayerMask.GetMask("Ground"));
        //contactFilter.SetLayerMask(LayerMask.GetMask("Enemy"));
    }

    public override void Attack()
    {
     
        
    }
    public override void Attacked(int IntCount)
    {
        
        base.Attacked(IntCount);
        print("敌人被攻击，攻击后血量+" + base.HP);

    }
    public override void Seek()
    {
        int count = rd.Cast(new Vector2(dir, 0), contactFilter, resultArr, distance + 0.01f);
              
        RaycastHit2D hit = Physics2D.Raycast(transform.position+new Vector3(dir*5,0), new Vector2(0,-1),2);
       
        if (count > 0 || hit.collider == null)
        {
            dir *= -1;
            transform.localScale = new Vector2(transform.localScale.x * -1, transform.localScale.y);
        }
        transform.position = new Vector2(transform.position.x + speed * Time.deltaTime * dir, transform.position.y);


       
    }
    public override void Chase()
    {
        int curDir = GameManger.instance.player.transform.position.x> transform.position.x ? 1 : -1;
        transform.position = new Vector2(transform.position.x + speed * Time.deltaTime * curDir, transform.position.y);
       
    }





}
