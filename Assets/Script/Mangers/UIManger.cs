using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;



public class UIManger : MonoBehaviour
{
   
    [Header("技能图标")]
    public Image SkillIcon1;
    public Image SkillIcon2;

    [Header("主角血条")]
    public Slider playerHp;

    [Header("道具背包")]
    public BagPanel bagPanel;
    public GameObject describePanel;


    [Header("测试(用完请删除)")]
    public SkillNodeGraph function;//**TEST**//


    public static UIManger instance;


    private void Awake()
    {
        instance = this;
        bagPanel.InitSlot();
    }
    private void Start()
    {
      
    }
    private void Update()
    {
       UpdataSkillIcon(GameManger.instance.skillManager.currentSkillList);
       UpdateHpBar(GameManger.instance.playerScript.HP);
    }

    //技能图标更新
    public void UpdataSkillIcon(List<SkillInfo> currentSkillList)
    {
        for (int i = 0; i < currentSkillList.Count; i++)
        {
            if(i == 0)
            {

                SkillIcon1.sprite = Resources.Load<Sprite>(currentSkillList[i].Icon);
            }
            else if(i == 1)
            {              
                SkillIcon2.sprite = Resources.Load<Sprite>(currentSkillList[i].Icon);
                print("1");
            }
            else
            {
                Debug.LogError("同志，你有多少技能啊");
            }
                       
        }
    }
   
    //血条更新
    public void UpdateHpBar(int hp)
    {
        playerHp.value = hp;
    }

    public void LoadLevel(int index)
    {
        
    }

  
}
