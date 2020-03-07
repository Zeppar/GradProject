using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using FlowCanvas;
using FlowCanvas.Nodes;
using ParadoxNotion.Design;

[Category("Skill")]
public class FireBall : CallableActionNode
{
    public override void Invoke()
    {
        GameManger.instance.skillParticleCreator.CreateFireball(GameManger.instance.playerScript.AttackPoint.position, new Vector2(GameManger.instance.player.transform.GetComponent<PlayerController>().dir, 0));
    }

    
}

[Category("Skill")]
public class Wait : CallableActionNode<float>
{
    public override void Invoke(float time)
    {
        GameManger.instance.WaitTime(time);
    }
  
}
