using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManger : MonoBehaviour
{
    // Start is called before the first frame update
    public static GameManger instance;//实例

    public SkillManager skillManager = new SkillManager();//技能管理器实例
    public GoodManger goodManger = new GoodManger();//物品管理器实例

    public Player playerScript;//玩家脚本
    public GameObject player;//玩家物体

    public SkillStoneCreator skillStoneCreator;//技能石创建器
    public SkillParticleCreator skillParticleCreator;//技能特效创建器
   
    
    void Awake()
    {
        instance = this;//实例化自己
    }
    void Start()
    {
        skillManager.InitSkill();//初始化技能
             
      goodManger.AddItemToPanel(GoodInfo.GoodType.Skill, 0);//测试！！！  创建两个物品用于测试
      goodManger.AddItemToPanel(GoodInfo.GoodType.Skill, 2);
    }

    
}
