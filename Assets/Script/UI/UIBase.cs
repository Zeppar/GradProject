using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
public class UIBase : MonoBehaviour
{
  
    void Start()
    {
        
    }

    void Update()
    {
        
    }
    public void LoadLevel(int count)
    {
        SceneManager.LoadScene(count);
    }
}
