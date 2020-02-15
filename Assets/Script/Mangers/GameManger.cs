using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManger : MonoBehaviour
{
    // Start is called before the first frame update
    public static GameManger instance;
    public SkillManager skillManager = new SkillManager();
    public Player playerScript;
    public GameObject player;
    public SkillStoneCreator skillStoneCreator;
    public UIManger uiManger;
    public SkillParticleCreator skillParticleCreator;
    void Awake()
    {
        instance = this;
    }
    void Start()
    {
        skillManager.InitSkill();
        print("已完成技能加载，共加载到了 "+skillManager.skill_Dic.Count+ " 个技能");
        
    }

    // Update is called once per frame
    void Update()
    {
        uiManger.UpdataSkillIcon(skillManager.currentSkillList);
        uiManger.UpdateHpBar(playerScript.HP);
    }
}
