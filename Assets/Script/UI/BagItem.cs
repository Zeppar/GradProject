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
            GoodInfo dropinfo = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo;
            goodInfo.goodType = dropinfo.goodType;//同步物品类型          
            GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo = null;//设置原各自的goodinfo为空


            dropedItem.SlotInedx = index;//设置物品的格子索引为自己
            
       
        }
    }
}
