using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SkillActionManger : MonoBehaviour
{
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.K))
        {
            FlowCanvas.FlowScriptController action = UIManger.instance.quickSkill1.GetComponent<BagItem>().skillAction.GetComponent<FlowCanvas.FlowScriptController>();
            if (action != null)
            {
                action.SendEvent("Action");
            }
            else { Debug.LogWarning("兄弟，没技能"); }
            
        }
        if (Input.GetKeyDown(KeyCode.L))
        {
            FlowCanvas.FlowScriptController action = UIManger.instance.quickSkill2.GetComponent<BagItem>().skillAction.GetComponent<FlowCanvas.FlowScriptController>();
            if (action != null)
            {
                action.SendEvent("Action");
            }
            else { Debug.LogWarning("兄弟，没技能"); }

        }
    }
}

