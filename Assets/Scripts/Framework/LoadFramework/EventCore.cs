using ApplySDK;
using UnityEngine;

public class EventCore : MonoBehaviour
{
    public static AEventCore Instance;
    private void Awake()
    {
        DontDestroyOnLoad(gameObject);
        Instance = new AEventCore();
    }
}
