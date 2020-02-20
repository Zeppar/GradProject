using System.Collections;
using System.Collections.Generic;
using UnityEngine;

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
        for (int i = 0; i < manger.bagCount; i++)
        {
            GameObject slotToAdd = Instantiate(slot);
            slotToAdd.transform.SetParent(skillPanel.transform);
            slotToAdd.transform.position = Vector2.zero;
            slotToAdd.GetComponent<BagItem>().goodInfo = new GoodInfo(-1);
           
            manger.goodInfoList.Add(slotToAdd.GetComponent<BagItem>().goodInfo);
            
        }
    }
    public void UpdataItem()
    {
        if (manger.isDirty)
        {
            print("a");
            for (int i = 0; i < manger.goodInfoList.Count; i++)
            {
                print("b");
                if (manger.goodInfoList[i].goodType != GoodInfo.GoodType.Null)
                {
                    print("c");
                    for (int o = 0; o < manger.goodInfoList.Count; o++)
                    {
                        print("d");
                        if (manger.goodInfoList[o].id == -1)
                        {
                            print("e");
                            Instantiate(item).transform.SetParent(manger.goodInfoList[o].transform);
                            manger.isDirty = false;
                        }
                    }
                }
            }
          
        }
    }
}
