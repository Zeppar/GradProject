using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    private Rigidbody2D rb;
    public float speed;
    public float jumpForce;
    private float moveInput;

    private bool isGrounded;
    private bool isJump = false;

    public Transform feetPos;
    public float checkRadius;
    public LayerMask whatIsGround;

    public ParticleSystem dust_ps;
    public int dir = 1;
    //计时器
    private float jumpTimeCounter;//实时更新的值
    public float jumpTime;//设置一个计时值

    public bool CanMove = true;
    
    public Animator anim;
    public AudioClip Jump;
    public AudioClip GameStart;
    public AudioSource source;

    // Start is called before the first frame update
    void Start()
    {
        
        rb = gameObject.GetComponent<Rigidbody2D>();
       
        anim = gameObject.GetComponent<Animator>();
        source = gameObject.GetComponent<AudioSource>();
        //source.PlayOneShot(GameStart);


    }

    // Update is called once per frame
    void FixedUpdate()
    {
        moveInput = Input.GetAxisRaw("Horizontal");
       
        rb.velocity = new Vector2(moveInput * speed, rb.velocity.y);
        if (moveInput != 0)
        {
            anim.SetBool("Walk", true);
        }
        else if(isJump == false)
        {
            anim.SetBool("Walk", false);
        }
        if(transform.position.y<= -40)
        {
            
        }
    }

    
    private void Update()
    {
        isGrounded = Physics2D.OverlapCircle(feetPos.position, checkRadius, whatIsGround);
        dust_ps.gameObject.SetActive(isGrounded);
        if (moveInput>0)
        {
            //transform.eulerAngles = new Vector2(0, 0);
            transform.rotation = new Quaternion(0, 0, 0, 0);
            dir = 1;
        }
        else if(moveInput<0)
        {
            //transform.eulerAngles = new Vector2(0, 180);
            transform.rotation = new Quaternion(0, 180, 0, 0);
            dir = -1;
        }
       
        if (isGrounded  == true)
        {
            
            if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow))
            {
                isJump = true;
                jumpTimeCounter = jumpTime;
                rb.velocity = Vector2.up * jumpForce;
                
                //source.PlayOneShot(Jump);
            }
        }

        if(isJump == true)
        {
            anim.SetTrigger("Jump");
            if ( Input.GetKey(KeyCode.Space) || Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow)) {
                if (jumpTimeCounter > 0)
                {
                    rb.velocity = Vector2.up * jumpForce;
                    jumpTimeCounter -= Time.deltaTime;
                }
                else
                {
                    isJump = false;
                }
            }
        }
        if(Input.GetKeyUp(KeyCode.Space) || Input.GetKeyUp(KeyCode.W) || Input.GetKeyUp(KeyCode.UpArrow))
        {
            isJump = false;
        }
    }
}
