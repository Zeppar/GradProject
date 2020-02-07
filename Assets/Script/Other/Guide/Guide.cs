using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Guide : MonoBehaviour
{
    // Start is called before the first frame update
    public GameObject player;
    public float Dis = 7;
    public GameObject guide;
    public Text UI_Describe;
    public string describe = "None";
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if(Vector2.Distance(transform.position, player.transform.position) < Dis)
        {
            guide.SetActive(true);
            UI_Describe.text = describe;
        }
        else
        {
            //guide.SetActive(false);
        }

        
    }
}
