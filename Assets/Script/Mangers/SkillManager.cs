using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LitJson;
using System.IO;
public class SkillInfo
{   public int ID { get; set; }
    public string Title { get; set; }
    public int Value { get; set; }
    public int Range { get; set; }
    public string Describe { get; set; }

    public string Icon { get; set; }


}

public class SkillManager
{
  
    public Dictionary<int, SkillInfo> skill_Dic = new Dictionary<int, SkillInfo>();
    public List<SkillInfo> currentSkillList = new List<SkillInfo>();

    public void InitSkill(){

        JsonData skilldata = JsonMapper.ToObject(File.ReadAllText(Application.dataPath + "/Json/Skill.json"));
        for (int i = 0; i < skilldata.Count; i++){
            SkillInfo info = new SkillInfo();
            info.ID = (int)skilldata[i]["id"];
            info.Title = skilldata[i]["title"].ToString();
            info.Value = (int)skilldata[i]["value"];
            info.Range = (int)skilldata[i]["range"];
            info.Describe = skilldata[i]["describe"].ToString();
            info.Icon = skilldata[i]["icon"].ToString();
            skill_Dic.Add((int)skilldata[i]["id"],info);
            
        }
    }

    public SkillInfo FindSkillWithID(int _id)
    {
        if (!skill_Dic.ContainsKey(_id))
        {
            return null;
        }
        return skill_Dic[_id];
    }

    public void AddSkill(SkillInfo skill)
    {
        if (currentSkillList.Count == 2)
        {
            currentSkillList.RemoveAt(0);
            Debug.Log("技能过多，移除技能");
        }
        currentSkillList.Add(skill);

        Debug.Log("增加技能 ID:" + skill.ID + "技能 标题:" + skill.Title);
       

    }
}


