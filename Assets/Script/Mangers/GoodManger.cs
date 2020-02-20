using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoodManger : MonoBehaviour
{
    public int bagCount = 16;

    public List<GoodInfo> goodInfoList;

    public bool isDirty = false;

    public void AddItemToPanel(GoodInfo.GoodType _goodType,int id)
    {
        for (int i = 0; i < goodInfoList.Count; i++)
        {
            if (goodInfoList[i].goodType == GoodInfo.GoodType.Null)
            {
                goodInfoList[i].goodType = _goodType;
                if(_goodType == GoodInfo.GoodType.Skill)
                {
                    goodInfoList[i].skill = GameManger.instance.skillManager.FindSkillWithID(id);
                }
                else
                {
                    Debug.LogError("道具还没有做");
                }
                isDirty = true;
                print("Aaaa");
            }
        }
    }
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
