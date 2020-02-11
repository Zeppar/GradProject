using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Pathfinding;
using UnityEngine.UI;
public class EnemyBase : Enemy { 

    // Start is called before the first frame update
    public new float HP;
    public float Max_HP = 100;
    private Animator anim;
    private SpriteRenderer spriterenderer;
    public Transform PointA, PointB;

    public GameObject target;
    public Slider UI_HP;
    public Camera UICamera;
    public Transform Head;
    public float xOffset;
    public float yOffset;
    public RectTransform recTransform;
    bool hastarget = false;
    void Awake()
    {
        HP = Max_HP;
        anim = transform.GetComponent<Animator>();
        spriterenderer = transform.GetComponent<SpriteRenderer>();

    }

    private new void Start()
    {
        UI_HP.maxValue = Max_HP;
    }

    // Update is called once per fram


    void Update()
    {
        Seek();
        UI_HP.value = HP;
        
        Vector2 player2DPosition = Camera.main.WorldToScreenPoint(Head.position);
        recTransform.position = player2DPosition + new Vector2(xOffset, yOffset);

        //血条超出屏幕就不显示
        if (player2DPosition.x > Screen.width || player2DPosition.x < 0 || player2DPosition.y > Screen.height || player2DPosition.y < 0)
        {
            recTransform.gameObject.SetActive(false);
        }
        else
        {
            recTransform.gameObject.SetActive(true);


        }
    }
    public override void Seek()
    {
        if (Vector2.Distance(transform.position, target.transform.position) < 30)
        {
            transform.GetComponent<AIPath>().canMove = true;
            hastarget = true;
        }
        else if(!hastarget)
        {
            transform.GetComponent<AIPath>().canMove = false;
        }
    }
    void LateUpdate()
    {
        transform.position = new Vector3(transform.position.x, transform.position.y, 0);
    }
    public override void BeAttacked(int IntCount)
    {
        base.BeAttacked(IntCount);
    }
    public override void Die()
    {
        Destroy(gameObject);
    }

    public void ToChild(GameObject Parent)
    {
        transform.parent = Parent.transform;
    }
    private void OnCollisionEnter2D(UnityEngine.Collision2D coll)
    {
        Debug.Log("被法术击中+"+coll.gameObject.name);
        if (coll.gameObject.tag == "PBullet")
        {
            HP -= coll.gameObject.GetComponent<Fire>().Attack_Int;
            Destroy(coll.gameObject);
            if (HP <= 0)
            {

                target.GetComponent<PlayerBase>().KillCount += 1;
                Destroy(gameObject);

            }
            //GameObject.Destroy(this.gameObject);
        }
    }
   
}






    
