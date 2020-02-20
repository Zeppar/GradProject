using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Trap2 : MonoBehaviour
{
    // Start is called before the first frame update
    public Transform player;
    public float range;
    public float Dis;
    private bool InRange;
    public float Firsttime;
    public GameObject Bullet;
    public Transform FireTran;
    public float FireCD = 1.5F;
    void Start()
    {
        InRange = false;
    }

    // Update is called once per frame
    void Update()
    {
        transform.GetComponent<SpriteRenderer>().color = Color.white;
        if (transform.position.y >= player.position.y)
        {
            if(transform.position.y - player.position.y < range)
            {
                if (Vector2.Distance(transform.position, player.position) >= Dis)
                {
                    return;
                }
                if(InRange == false)
                {
                    InRange = true;
                    Firsttime = Time.time;
                }
                if(InRange == true){
                    if(Time.time - Firsttime >= FireCD)
                    {
                        print("发射");
                        Firsttime = Time.time;
                        Instantiate(Bullet, FireTran.position, transform.rotation);
                    }
                }
               // print("暗器触发");
                transform.GetComponent<SpriteRenderer>().color = Color.red;
            }
        }
        else if (transform.position.y <= player.transform.position.y)
        {
            if (player.position.y - transform.position.y < range)
            {
                if (InRange == false)
                {
                    InRange = true;
                    Firsttime = Time.time;
                    
                }
                if (InRange == true)
                {
                    
                    if (Time.time - Firsttime >= FireCD)
                    {
                        //print("发射");
                        Instantiate(Bullet, FireTran.position,transform.rotation);
                        InRange = false;
                        Firsttime = Time.time;
                    }
                }
                if (Vector2.Distance(transform.position, player.position) >= Dis)
                {
                    return;
                }
                
                transform.GetComponent<SpriteRenderer>().color = Color.red;
            }
        }
        if(transform.position.y <= player.position.y && transform.position.y >= player.transform.position.y)
        {
            InRange = false;
            Firsttime = 0;
        }
        


      
       
    }
}
