using Fungus;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NPC : MonoBehaviour
{
    // Start is called before the first frame update
    public string Message;
    public BoxCollider2D BoxCollider2D;
    public BoxCollider2D BoxCollider2D1;
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
    private void OnTriggerStay2D(Collider2D collision)
    {
        
        if (collision.tag.Equals("Player"))
        {
            
            if (Input.GetKeyDown(KeyCode.F))
            {
                collision.GetComponent<PlayerController>().CanMove = false;
                Flowchart.BroadcastFungusMessage(Message);
            }
           // Destroy(BoxCollider2D);
            //Destroy(BoxCollider2D1);
            
           
        }

    }
    private void OnTriggerExit2D(Collider2D collision)
    {
        try
        {
            collision.GetComponent<PlayerBase>().CanMove = true;
        }
        catch (System.Exception)
        {

         
        }
            
        
         
    }
}
