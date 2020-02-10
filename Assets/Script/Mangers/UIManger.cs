using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIManger : MonoBehaviour
{
    public Image SkillIcon1;
    public Image SkillIcon2;
  

    void Start()
    {
        
    }

    void Update()
    {
        
    }

    public void UpdataSkillIcon(List<SkillInfo> currentSkillList)
    {
        for (int i = 0; i < currentSkillList.Count; i++)
        {
            if(i == 0)
            {

                SkillIcon1.sprite = Resources.Load<Sprite>(currentSkillList[i].Icon);
            }
            else if(i == 1)
            {              
                SkillIcon2.sprite = Resources.Load<Sprite>(currentSkillList[i].Icon);
                print("1");
            }
            else
            {
                Debug.LogError("同志，你有多少技能啊");
            }
                       
        }
    }
}
