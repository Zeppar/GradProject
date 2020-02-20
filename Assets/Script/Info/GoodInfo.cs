using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoodInfo : MonoBehaviour
{
    public GoodInfo()
    {
        goodType = GoodType.Null;
        id = -1;
    }
    public GoodInfo(int _id)
    {
        goodType = GoodType.Null;
        id = _id;
    }
    public enum GoodType{
        Item,
        Skill,
        Null
        }
    public SkillInfo skill;
    public ConsumablesInfo Consumables;
    public int count = -1;
    public int id;
    public GoodType goodType;
    
}
