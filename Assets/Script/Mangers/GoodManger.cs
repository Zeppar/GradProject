using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoodManger : MonoBehaviour
{
    public int bagCount = 16;

    public List<BagItem> goodInfoList;

    public bool isDirty = false;
   

   

    public void AddItemToPanel(GoodInfo.GoodType _goodType,int id)
    {
        for (int i = 0; i < goodInfoList.Count; i++)
        {
            if (goodInfoList[i].goodInfo.goodType == GoodInfo.GoodType.Null)
            {
                goodInfoList[i].goodInfo.goodType = _goodType;
                if(_goodType == GoodInfo.GoodType.Skill)
                {
                    goodInfoList[i].goodInfo.skill = GameManger.instance.skillManager.FindSkillWithID(id);
                    print("[GoodManger] 数据更新，增加物品到背包");
                    GameManger.instance.uiManger.bagPanel.UpdataItem();
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

        for (int i = 0; i < goodInfoList.Count; i++)
        {
            print(goodInfoList[i].goodInfo.goodType + "Name:" + goodInfoList[i].name);
        }
    }
}
