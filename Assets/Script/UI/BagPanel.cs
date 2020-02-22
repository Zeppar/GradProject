using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class BagPanel : MonoBehaviour
{
   
    public GameObject slot;
    public GameObject item;

    GoodManger manger;
    GameObject skillPanel;

    

    private void Start()
    {
        manger = GameManger.instance.goodManger;
        skillPanel = GameObject.Find("Slot Panel");
        
    }
    public void InitSlot()
    {
        manger = GameManger.instance.goodManger;
        skillPanel = GameObject.Find("Slot Panel");
        for (int i = 0; i < manger.bagCount; i++)
        {
            GameObject slotToAdd = Instantiate(slot);
            slotToAdd.transform.SetParent(skillPanel.transform);
            slotToAdd.transform.position = Vector2.zero;
            // slotToAdd.GetComponent<BagItem>().goodInfo = new GoodInfo(-1);
           // slotToAdd.GetComponent<BagItem>().goodInfo .id= manger.goodInfoList[i].goodInfo.skill.ID;
            slotToAdd.GetComponent<BagItem>().index = i;
            slotToAdd.name = "Slot(" + i + ")";
            slotToAdd.GetComponent<BagItem>().goodInfo.goodType = GoodInfo.GoodType.Null;
            
             manger.goodInfoList.Add(slotToAdd.GetComponent<BagItem>());

            print(manger.goodInfoList[i].goodInfo.goodType);

        }
    }
    public void UpdataItem()
    {
        
            print("[BagPanel] 收到数据更改，正在同步UI");
            for (int i = 0; i < manger.goodInfoList.Count; i++)
            {
              
                if (manger.goodInfoList[i].goodInfo.goodType != GoodInfo.GoodType.Null)
                {
                    
                    for (int o = 0; o < manger.goodInfoList.Count; o++)
                    {
                        
                        if (manger.goodInfoList[o].goodInfo.id == -1)
                        {
                            
                            GameObject skillToAdd = Instantiate(item);
                            skillToAdd.transform.SetParent(manger.goodInfoList[o].transform);
                            skillToAdd.name = manger.goodInfoList[o].goodInfo.skill.Title;
                            skillToAdd.transform.position = Vector2.zero;
                           // print(skillToAdd.GetComponent<BagItem>());
                           // skillToAdd.GetComponent<BagItem>().goodInfo.id = manger.goodInfoList[o].goodInfo.id;
                           
                            skillToAdd.GetComponent<GoodItem>().SlotInedx = o;
                            item.GetComponent<Image>().sprite = Resources.Load<Sprite>(manger.goodInfoList[o].goodInfo.skill.Icon);
                            manger.isDirty = false;
                            return;
                        }
                    }
                    
                }
            }
          
        
    }
}
