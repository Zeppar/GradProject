using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Trap : TrapBase
{
    public float AttackInt = 50;
    // Start is called before the first frame update
    void Start()
    {
        base.Set(AttackInt);
    }

    // Update is called once per frame
    void Update()
    {
        
    }
    public override void TarpTrigger(GameObject Trigger)
    {
        base.TarpTrigger(Trigger);
    }
    private void OnCollisionEnter2D(Collision2D coll)
    {
        if(coll.gameObject.tag == "Player")
        {
            TarpTrigger(coll.gameObject);
        }
    }
}
