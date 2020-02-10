using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy2 : Enemy {

    public int dir = 1;//玩家方向

    //射线属性
    private ContactFilter2D contactFilter;
    private RaycastHit2D[] resultArr = new RaycastHit2D[16];

    //攻击
    public float attackInterval;
    private float lastAttackTime = 0;
    public Transform AttackPoint;
    public float range;//攻击范围

    //敌人属性
    public int attack = 10;


    public override void Begin() {

        contactFilter.useTriggers = false;
        contactFilter.useLayerMask = true;
        contactFilter.SetLayerMask(LayerMask.GetMask("Ground"));
        //contactFilter.SetLayerMask(LayerMask.GetMask("Enemy"));
    }
    public override void DataUp() {

    }

    public override void Attack() {
        if (Time.time - lastAttackTime < attackInterval) {
            return;
        }
        Collider2D coll = Physics2D.OverlapCircle(AttackPoint.position, range);
        if (coll == null) { return; }

        if (coll.CompareTag("Player")) {
            Player.GetComponent<Player>().Hit(10);
            //anim.Play("Skeleton_Attack");
            Debug.Log(" -------- ");
            anim.SetTrigger("Attack");
            lastAttackTime = Time.time;
        }


    }

    public override void Attacked(int IntCount) {
        if (HP > 0) {
            base.Attacked(IntCount);
            //anim.Play("Skeleton_Hit");
            anim.SetTrigger("Hurt");
            lastAttackTime = Time.time;
            print("敌人被攻击，攻击后血量+" + base.HP);
        }




    }
    public override void Seek() {
        anim.SetBool("Walk", true);
        int count = rd.Cast(new Vector2(dir, 0), contactFilter, resultArr, 5 + 0.01f);

        RaycastHit2D hit = Physics2D.Raycast(transform.position + new Vector3(dir * 5, 0), new Vector2(0, -1), 2);

        if (count > 0 || hit.collider == null) {
            dir *= -1;
            transform.localScale = new Vector2(transform.localScale.x * -1, transform.localScale.y);
        }
        transform.position = new Vector2(transform.position.x + speed * Time.deltaTime * dir, transform.position.y);



    }
    public override void Chase() {
        anim.SetBool("Walk", true);
        int curDir = GameManger.instance.player.transform.position.x > transform.position.x ? 1 : -1;
        transform.position = new Vector2(transform.position.x + speed * Time.deltaTime * curDir, transform.position.y);
        transform.localScale = new Vector2(transform.localScale.x * -curDir, transform.localScale.y);
    }
    public override void Die() {
        base.Die();
        anim.SetBool("Dead", true);
    }
    public void DestorySelf() {
        Destroy(gameObject);
    }
}
