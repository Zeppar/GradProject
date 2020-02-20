using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Prize : MonoBehaviour
{
    Animator anim;
    // Start is called before the first frame update
    void Start()
    {
        anim = transform.GetComponent<Animator>();
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Trigger();
        }
        
    }
    void Trigger()
    {
        
        Collider2D[] col4 = Physics2D.OverlapPointAll(Camera.main.ScreenToWorldPoint(Input.mousePosition));

        if (col4.Length > 0)
        {
            
            foreach (Collider2D c in col4)
            {
                
                //do what you want
                if (c.tag == "Prize")
                {
                    print("被点击");                                      
                    PlayerPrefs.SetInt("Money", PlayerPrefs.GetInt("Money") + 10);
                    print("金币加10，目前金币：" + PlayerPrefs.GetInt("Money"));
                    anim.Play("Press");
                    
                }
               
            }
        }
        
        }
    public void Destroy()
    {
        Destroy(gameObject);
    }

}

