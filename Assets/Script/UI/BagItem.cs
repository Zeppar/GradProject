using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class BagItem : MonoBehaviour, IDropHandler
{
    public GoodInfo goodInfo;//每个BagItem，都有一个GoodInfo
    public int index;
   
    public void OnDrop(PointerEventData eventData)//但作为目标
    {
        
        GoodItem dropedItem = eventData.pointerDrag.GetComponent<GoodItem>();
        
        if (goodInfo == null) //需要修改修改修改修改
        {
            goodInfo = new GoodInfo();//先将自己的GoodInfo赋值           
            goodInfo.goodType = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.goodType;//同步物品类型        
            goodInfo.skill = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.skill;
            goodInfo.Consumables = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.Consumables;
            GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo = null;//设置原格子的goodinfo为空
            dropedItem.SlotInedx = index;//设置物品的格子索引为自己
            
       
        }
        else if(goodInfo.skill.ID == GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.skill.ID) { //相同物品可叠加
            
            goodInfo.count++;
            GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo = null;
            UIManger.instance.bagPanel.UpdataItem();
        }
        else if(goodInfo != null)//如果自己有物体，这交换物体数据
        {
            print("不同类型物品交换");
            
             //* ***************************************
            // *********目前有bug，暂停使用********* 
           //  * ***************************************
            GoodInfo Todrop = goodInfo;
            GoodInfo Tome = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo;
            goodInfo = Tome;
            GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo = Todrop;
           
            UIManger.instance.bagPanel.goodItem_List[index].SlotInedx = dropedItem.SlotInedx;
            dropedItem.SlotInedx = index;



            dropedItem.OnEndDrag(eventData);
            UIManger.instance.bagPanel.UpdataItem();
        }
    }
}
