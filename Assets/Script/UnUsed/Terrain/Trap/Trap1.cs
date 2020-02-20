using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Trap1 : TrapBase
{
    public float AttackInt = 75;
    // Start is called before the first frame update
    void Start()
    {
        base.Set(AttackInt);
    }

    // Update is called once per frame
    void Update()
    {
       
        //transform.rotation = new Quaternion(transform.rotation.x, transform.rotation.y, transform.rotation.z + 0.1f,0.1f);
       
        transform.Rotate(0, 0, 30);




    }
    private void LateUpdate()
    {
        /*/print(transform.rotation.z);
        if (transform.rotation.z == 1)
        {
            transform.rotation = new Quaternion(transform.rotation.x, transform.rotation.y, 0,0.1f );
            
        }
        /*/
    }

    public override void TarpTrigger(GameObject Trigger)
    {
        base.TarpTrigger(Trigger);
    }
    private void OnCollisionEnter2D(Collision2D coll)
    {
        if (coll.gameObject.tag == "Player")
        {
            TarpTrigger(coll.gameObject);
        }
    }
}

