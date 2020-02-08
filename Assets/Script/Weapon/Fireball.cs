using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Fireball : MonoBehaviour
{
    public int speed = 3500;
    public int attack = 35;
    public GameObject Boom;
    // Start is called before the first frame update
    
    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag(Util.Enemy))
        {
            collision.gameObject.GetComponent<Enemy>().Attacked(35);
        }
        Instantiate(Boom, transform.position,transform.rotation);
        Destroy(gameObject);
    }
}
