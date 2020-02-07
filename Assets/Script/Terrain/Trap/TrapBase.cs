using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TrapBase : MonoBehaviour
{
    private float _Attack;
    public float Attack
    {
        get { return _Attack; }
        set { _Attack = value; }
    }
    public void Set(float _AttackInt)
    {
        _Attack = _AttackInt;
    }

    
   public virtual void TarpTrigger(GameObject Trigger)
    {
        if(Trigger == null) { return; }
        PlayerBase playerBase =  Trigger.GetComponent<PlayerBase>();
        if(playerBase != null)
        {
            playerBase.Attacked(_Attack,transform.gameObject);
        }
    }


}
