using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using XNode;
using Planilo.BT;




[CreateNodeMenu("MyNode/Debug Stirng")]
public class TestNode : BTTaskNode {

	[Input] public string a;
	protected override BTGraphResult InternalRun()
	{
		Debug.Log(a);		
		return BTGraphResult.Success;
		
	}
}