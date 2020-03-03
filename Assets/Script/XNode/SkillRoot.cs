using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using XNode;
using Planilo.BT;

[CreateNodeMenu("MyNode/Skill Root")]
public class SkillRoot : BTBranchNode
{
    [Input] public string SkillName1;


    [Output] public string SkillName;
    [Output] public Sprite SkillIcon;
    [Output] public string SkillMeto;
 

    protected override BTGraphResult InternalRun()
    {
        SkillName = SkillName1;
        return BTGraphResult.Success;
    }

   
}
