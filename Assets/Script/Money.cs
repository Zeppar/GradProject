using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Fungus;

public class Money : MonoBehaviour
{
    // Start is called before the first frame update
    public Fungus.Flowchart myflowchart;
    void Start()
    {
        
      //SetIntegerVariable
    }

    // Update is called once per frame
    void Update()
    {
        if (myflowchart.GetIntegerVariable("Money") > 0)
        {
            PlayerPrefs.SetInt("Money", myflowchart.GetIntegerVariable("Money") + PlayerPrefs.GetInt("Money"));
            print("Money add " + myflowchart.GetIntegerVariable("Money") + ",Now it's" + PlayerPrefs.GetInt("Money"));
            myflowchart.SetIntegerVariable("Money", 0);
        }
    }
}
