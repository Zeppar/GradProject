using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoodManger
{
    public int bagCount = 16;

    public List<BagItem> goodInfoList = new List<BagItem>();

    public bool isDirty = false;
   

   

    public void AddItemToPanel(GoodInfo.GoodType _goodType,int id)
    {
        for (int i = 0; i < goodInfoList.Count; i++) //还未检查检查检查检查检查
        {
            if (goodInfoList[i].goodInfo == null)
            {
                goodInfoList[i].goodInfo = new GoodInfo();
                goodInfoList[i].goodInfo.goodType = _goodType;
                if(_goodType == GoodInfo.GoodType.Skill)
                {
                    goodInfoList[i].goodInfo.skill = GameManger.instance.skillManager.FindSkillWithID(id);
                  
                   UIManger.instance.bagPanel.UpdataItem();
                    return;
                   
                }
                else
                {
                    Debug.LogError("道具还没有做");
                    return;
                }                                
            }
        }
        isDirty = true;
    }
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
      
    }
}
