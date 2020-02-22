using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class BagItem : MonoBehaviour, IDropHandler
{
    public GoodInfo goodInfo;
    public int index;
    private void Awake()
    {
        goodInfo = new GoodInfo();
    }
    public void OnDrop(PointerEventData eventData)
    {
        print("被拖拽+"+goodInfo.goodType+","+transform.name+","+goodInfo.id);
        GoodItem dropedItem = eventData.pointerDrag.GetComponent<GoodItem>();
        if (goodInfo.goodType == GoodInfo.GoodType.Null || goodInfo.id == -1)
        {
            print("成立拉");
            goodInfo.goodType = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.goodType;
            goodInfo.id = GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo.id;
            GameManger.instance.goodManger.goodInfoList[dropedItem.SlotInedx].goodInfo = new GoodInfo();
            dropedItem.SlotInedx = index;
           // bag.skills[dropedSkill.SlotInedx] = new SkillInfo();
           // dropedSkill.SlotInedx = SlotID;
           // bag.skills[SlotID] = dropedSkill.skill;
        }
    }
}
