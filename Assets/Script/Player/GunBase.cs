using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GunBase : MonoBehaviour
{

    //ublic GameObject target;

    public GameObject Bullet;
    public Transform FireTran;
    private GameObject Player;
    void Start()
    {
        Player = GameObject.FindGameObjectWithTag("Player");
    }

    // Update is called once per frame
    void Update()
    {
        Attack();
      



    }
    void Attack()
    {
        if(Input.GetMouseButtonDown(0))
        if (Player.transform.rotation.y == 0)
        {
            Instantiate(Bullet, transform.position, transform.rotation).GetComponent<Fire>().AddOrDes = "+";
        }
        else
        {
            Instantiate(Bullet, transform.position, transform.rotation).GetComponent<Fire>().AddOrDes = "-";
        }
    }

}
