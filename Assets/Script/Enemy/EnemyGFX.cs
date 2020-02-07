using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
public class EnemyGFX : MonoBehaviour
{
    public AIPath aIPath;
    // Start is called before the first frame update
    public Animator anim;
    public string State = "亲修改";
    public GameObject player1;
    // Update is called once per frame
    void Update()
    {
        
      //  if(State == "K")
       // {
     //       aIPath.canMove = false;
    //    }
     //   else if (State == "D")
    //    {
     //       aIPath.canMove = true;
     //   }
        if (aIPath.isStopped)
        {
            anim.SetBool("RUN", false);
        }

        if(aIPath.desiredVelocity.x >= 0.01f)
        {
            
            transform.localScale = new Vector3(-4f, 4f, 1f);
            anim.SetBool("RUN", true);
        }
        else if(aIPath.desiredVelocity.x <= 0.01f)
        {
            transform.localScale = new Vector3(4f, 4f, 1f);
            anim.SetBool("RUN", true);
        }
        else
        {
            anim.SetBool("RUN", false);
        }
    }

  //  private void OnCollisionEnter2D(Collision2D coll)
   // {
        /*/Debug.LogWarning(coll.transform.name);
        if(coll == null)
        {
            State = "K";
            Debug.LogWarning("K1");
        }
       
            if (coll.transform.tag == "OBS")
            {
                State = "D";
                Debug.LogWarning("D");
            }
            else
            {
                State = "K";
                Debug.LogWarning("K2");
            }


    /*/
    //    if (transform.position.y - player1.transform.position.y < 1)
    //    {
   //         State = "K";
   //     }
    //    State = "D";



    }
  //  private void OnCollisionExit2D(Collision2D coll)
  //  {
       /*/ if (player1.transform.position.y - transform.position.y > 1 )
        {
            State = "D";
        }
        else
        {
        /*/
    //        State = "K";
        //}
       /*/
        Debug.LogWarning(coll.transform.name);
        if (coll == null)
        {
            State = "K";
            Debug.LogWarning("K1");
        }

        if (coll.transform.tag == "OBS")
        {
            State = "D";
            Debug.LogWarning("D");
        }
        else
        {
            State = "K";
            Debug.LogWarning("K2");
        }
        /*/

        

    


