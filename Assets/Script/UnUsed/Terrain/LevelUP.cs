using Fungus;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LevelUP : MonoBehaviour
{
    public int IntoCount;
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Player")){
            Flowchart.BroadcastFungusMessage("Level");
            if (collision.GetComponent<PlayerBase>().KillCount >= IntoCount)
            {
                Flowchart.BroadcastFungusMessage("LevelUp");
                print("LevelUP");
            }
        }
    }
}
