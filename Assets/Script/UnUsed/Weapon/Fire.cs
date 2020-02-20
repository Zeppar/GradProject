using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;

public class Fire : MonoBehaviour
{
    public float speed;
    public string AddOrDes = null ;
    public int Attack_Int = 10;
    private  Vector2 BeginPos;
    private Rigidbody2D myrigidbody;
    public Animation anim;
    // Start is called before the first frame update
    void Start()
    {
        BeginPos = transform.position;
        myrigidbody = transform.GetComponent<Rigidbody2D>();
        
    }

    // Update is called once per fra
    void Update()
    {
        if(AddOrDes == null)
        {
            return;
        }
        else if(AddOrDes.Equals("+")){
            transform.localPosition = new Vector2(transform.localPosition.x + speed * Time.deltaTime, transform.localPosition.y);
        }
        else if (AddOrDes.Equals("-"))
        {
            transform.localPosition = new Vector2(transform.localPosition.x - speed * Time.deltaTime, transform.localPosition.y);
        }
        /*/
        if (transform.localPosition.x > 15f || transform.localPosition.x < -15f)
        {
            Destroy(gameObject);
        }
        /*/
        if(Vector2.Distance(transform.position,BeginPos) > 20)
        {
            Destroy(gameObject);
        }



    }
    public void FireTo(Vector2 pos)
    {
        Tweener tweener = transform.DOMove(pos, 1);
        tweener.OnComplete(over);
    }
    void over()
    {
       
        Destroy(gameObject);
    }
    
}
