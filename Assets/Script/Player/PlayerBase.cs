using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerBase : MonoBehaviour {
    public enum State {
        Jump,
        SJump,
        OnGround,
        Attack
    }
    public int KillCount;
    public Material matLocking;
    public GameObject Target = null;
    private string State_Str = "游戏已待命";
    public Text State_Text;
    public float speed;
    private Rigidbody2D rd;
    private Animator anim;
    private bool movelocking = false;
    public Slider UI_HP;
    //public Slider UI_Target_HP;
    public int AttackInt = 25;
    private float HP;
    private readonly float Max_HP = 1000;
    public GameObject Bullet;
    public float lastFireTime = 0;
    private readonly float FireInterval = 5f;
    public float lastAttackTime = 0;
    private readonly float AttackInterval = 0.5f;
    public Text FireWaitText;
    public GameObject Win;
    public GameObject Weapon;
    public GameObject Lost;
    public bool CanMove = true;

    // 存储运动
    Vector3 screenPosition;//将物体从世界坐标转换为屏幕坐标
    Vector3 mousePositionOnScreen;//获取到点击屏幕的屏幕坐标

    Vector3 mousePositionInWorld;//将点击屏幕的屏幕坐标转换为世界坐标
    public State state;
    // Start is called befor
    void Awake() {
        HP = Max_HP;
        rd = transform.GetComponent<Rigidbody2D>();
        anim = transform.GetComponent<Animator>();

    }
    void Start() {
        state = new State();


        UI_HP.maxValue = Max_HP;


    }
    public float AddHP(int _Hp) {
        HP += _Hp;
        if (HP > Max_HP) {
            HP = Max_HP;
        }
        return HP;
    }

    // Update is called once per frame
    void Update() {
        State_Text.text = State_Str;
        //ChangeColour();
        AutoLock();
        //LockTarget();
        // Move();
        Attack();
        if (HP <= 0) {
            Lost.SetActive(true);

        }


    }



    void AutoLock() {


        GameObject[] Auto_targets = GameObject.FindGameObjectsWithTag("Enemy");
        GameObject Auto_target = null;
        if (Auto_targets.Length <= 0) {

            // Win.SetActive(true);
            return;
        }
        float LessDistance = 10000;
        for (int i = 0; i < Auto_targets.Length; i++) {
            float i_Dis = Vector2.Distance(transform.position, Auto_targets[i].transform.position);
            if (i_Dis < LessDistance) {
                Auto_target = Auto_targets[i];
                LessDistance = i_Dis;
            }

        }
        if (Auto_target != null) {
            Target = Auto_target;
        } else {
            Debug.LogError("Error-----Auto Target is null");
        }



    }

    void Move() {
        if (!CanMove) {
            return;
        }
        if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.RightShift)) {
            if (state == State.OnGround || state == State.Jump) {
                // rigidbody.AddForce(new Vector2(0, 750), ForceMode2D.Impulse);
                rd.velocity = new Vector2(rd.velocity.x, 10);
                if (state == State.Jump) { state = State.SJump; }

            }



        }
        if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A)) {
            transform.position = new Vector2(transform.position.x - speed * Time.deltaTime, transform.position.y);
            anim.SetBool("Walk", true);
            //transform.rotation = new Quaternion(0, 180, 0, 0);
        } else if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D)) {
            transform.position = new Vector2(transform.position.x + speed * Time.deltaTime, transform.position.y);
            anim.SetBool("Walk", true);
            //transform.rotation = new Quaternion(0, 0, 0, 0);
        } else {
            anim.SetBool("Walk", false);

        }
        //获取鼠标在相机中（世界中）的位置，转换为屏幕坐标；
        screenPosition = Camera.main.WorldToScreenPoint(transform.position);
        //获取鼠标在场景中坐标
        mousePositionOnScreen = Input.mousePosition;
        //让场景中的Z=鼠标坐标的Z
        mousePositionOnScreen.z = screenPosition.z;
        //将相机中的坐标转化为世界坐标
        mousePositionInWorld = Camera.main.ScreenToWorldPoint(mousePositionOnScreen);
        if (mousePositionInWorld.x > transform.position.x) {
            transform.localRotation = new Quaternion(0, 0, 0, 0);
        } else {
            transform.localRotation = new Quaternion(0, 180, 0, 0);
        }


    }
    void Attack() {
        if (FireWaitText != null) {
            if (FireInterval - (Time.time - lastFireTime) <= 0) {
                FireWaitText.text = "";
            } else {
                FireWaitText.text = (FireInterval - (Time.time - lastFireTime)).ToString();
            }
        }
        UI_HP.value = HP;

        if (Input.GetMouseButtonDown(0) && Target != null && Weapon == null) {
            anim.Play("Player_AttackDemo");
            if (Vector2.Distance(transform.position, Target.transform.position) > 2) {
                State_Str = "距离太远，无法攻击";
                return;
            }
            if (Time.time - lastAttackTime < AttackInterval) {
                return;
            }
            //print("[PlayerBase]照理攻击了");


            Target.GetComponent<Enemy>().BeAttacked(AttackInt);
            lastAttackTime = Time.time;

        }
        if (Input.GetMouseButtonDown(1)) {
            if (Time.time - lastFireTime < FireInterval) {

                return;
            }
            if (transform.rotation.y == 0) {
                Instantiate(Bullet, transform.position, transform.rotation).GetComponent<Fire>().AddOrDes = "+";
            } else {
                Instantiate(Bullet, transform.position, transform.rotation).GetComponent<Fire>().AddOrDes = "-";
            }
            lastFireTime = Time.time;


        }
    }
    public float Attacked(float _int, GameObject target) {
        HP -= _int;
        if (target.tag == "Trap") { rd.AddRelativeForce(new Vector3(1500, 0, 0), ForceMode2D.Impulse); }

        if (HP <= 0) {
            Lost.SetActive(true);
        }
        return HP;
    }
    private void OnCollisionEnter2D(Collision2D coll) {
        if (coll.gameObject.tag == "OBS" || coll.gameObject.tag == "Enemy") {
            state = State.OnGround;
        }

        if (coll.gameObject == Target && movelocking == true) {
            movelocking = false;
            print("[PlayerBase]冲撞完成");
            State_Str = "冲撞完成";
            rd.bodyType = RigidbodyType2D.Dynamic;
            transform.position = new Vector2(transform.position.x, transform.position.y);

        }

        if (coll.gameObject.tag == "Bullet") {
            HP -= coll.gameObject.GetComponent<Fire>().Attack_Int;

            Destroy(coll.gameObject);
        }

    }
    private void OnCollisionStay2D(Collision2D coll) {


        if (coll.gameObject.tag == "Enemy") {
            // HP -= 1F;
            Attacked(1, coll.gameObject);
        }


    }
    private void OnCollisionExit2D(Collision2D coll) {
        if (coll.gameObject.tag == "OBS") {
            state = State.Jump;
        }
    }

    void OnTriggerEnter(Collider collider) {
        //进入触发器执行的代码
        print("Hello" + collider.name);
    }


}

