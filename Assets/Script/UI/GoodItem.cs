using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class GoodItem : MonoBehaviour,IBeginDragHandler, IDragHandler, IEndDragHandler
{
   
    public int SlotInedx;
    public void OnBeginDrag(PointerEventData eventData)
    {
        
            this.transform.SetParent(transform.parent.parent);
            this.transform.position = eventData.position;
            GetComponent<CanvasGroup>().blocksRaycasts = false;
        
    }

    public void OnDrag(PointerEventData eventData)
    {
       
            this.transform.position = eventData.position;
        
    }

    public void OnEndDrag(PointerEventData eventData)
    {
       
        transform.SetParent(GameManger.instance.goodManger.goodInfoList[SlotInedx].transform);
        transform.position = transform.parent.position;
        GetComponent<CanvasGroup>().blocksRaycasts = true;
    }
}
