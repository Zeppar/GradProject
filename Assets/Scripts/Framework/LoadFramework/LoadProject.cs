using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class LoadProject : MonoBehaviour
{
    [SerializeField] int FirstSceneIndex=1;
    void Start()
    {
        SceneManager.LoadScene(FirstSceneIndex);
    }
}
