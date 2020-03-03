using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using XNode;

public class PrintValueNode : Node {

	[Input] public float a;
	protected override void Init() {
		base.Init();
		
	}

	// Return the correct value of an output port when requested
	public override object GetValue(NodePort port) {
		Debug.Log(a);
		return null; 
	}
}