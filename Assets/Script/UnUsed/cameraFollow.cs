using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class cameraFollow : MonoBehaviour
{
    public Transform player;
    public float Ahead;//当角色向右移动时，摄像机比任务位置领先，当角色向左移动时，摄像机比角色落后
    public Vector3 Targetpos;//摄像机的最终目标
    public float smooth;//摄像机平滑移动的值
    Vector3 screenPosition;//将物体从世界坐标转换为屏幕坐标
    Vector3 mousePositionOnScreen;//获取到点击屏幕的屏幕坐标

    Vector3 mousePositionInWorld;//将点击屏幕的屏幕坐标转换为世界坐标
   

    // Use this for initialization
    void Start()
    {

    }

 

  

    // Update is called once per frame
    
    void Update()
    {
       
        Targetpos = new Vector3(player.transform.position.x, transform.position.y, transform.position.z);
        if (player.transform.localScale.x > 0)
        {
            
            Targetpos = new Vector3(player.transform.position.x + Ahead, player.position.y, transform.position.z);
        }
        if (player.transform.localScale.x < 0)
        {
            Targetpos = new Vector3(player.transform.position.x - Ahead, player.position.y, transform.position.z);
        }
        //让摄像机进行平滑的移动

        //获取鼠标在相机中（世界中）的位置，转换为屏幕坐标；
        screenPosition = Camera.main.WorldToScreenPoint(transform.position);
        //获取鼠标在场景中坐标
        mousePositionOnScreen = Input.mousePosition;
        //让场景中的Z=鼠标坐标的Z
        mousePositionOnScreen.z = screenPosition.z;
        //将相机中的坐标转化为世界坐标
        mousePositionInWorld = Camera.main.ScreenToWorldPoint(mousePositionOnScreen);
        //物体跟随鼠标移动
        Vector3 vector3 = new Vector3((mousePositionInWorld.x+ player.position.x + player.position.x) /3 , (mousePositionInWorld.y+ player.position.y + player.position.y) /3,-1000);
        

        transform.position = Vector3.Lerp(transform.position, vector3, smooth);
        
    }
    
}
