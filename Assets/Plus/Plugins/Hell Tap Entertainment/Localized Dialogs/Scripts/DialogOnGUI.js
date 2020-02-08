////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// 	DialogOnGUI.js
//
//	Renders LDC using Unity's built-in OnGUI.
//
//	Created By Melli Georgiou
//	© 2012 - 2015 Hell Tap Entertainment LTD
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#pragma strict
import System.Collections.Generic;

static var com : DialogOnGUI;												// DialogOnGUI static

// GUI Resolution Matrix
private var originalWidth : float = 960.0*2;  								// define here the original resolution
private var originalHeight : float = 640.0*2; 								// you used to create the GUI contents 
private var scale : Vector3;
private var svMat : Matrix4x4;
private var fitScale : float = 0;											// The scale used when working on Scale To Fit modes.
private var fitScaleOffset : Vector3 = Vector3.zero;						// The offset version of scale

// Skins
@System.NonSerialized														// Comment this line out to see the debug DialogUI.status in the editor
var skin : GUISkin;															// Default English GUISkin

// Scaling Mode
var scalingMethod : OnGuiScaleMode = OnGuiScaleMode.StretchToFill;
enum OnGuiScaleMode{StretchToFill, 
					ScaleToFit,
					OverScale
				}

// Scaling Anchor				
var scalingAnchor : OnGuiScaleAnchor = OnGuiScaleAnchor.Bottom;			
enum OnGuiScaleAnchor{	Center,
						Left,
						Right,
						Top,
						Bottom,
						TopLeft,
						TopRight,
						BottomLeft,
						BottomRight
					}

var scaleToFitBackgroundWidener : float = 1.5;								// The scale factor to resize the background width (only applies to ScaleToFit)

// Scaling Options
var scaleTransition : boolean = false;										// Scale Up GUI when dialog is appearing
var rotateTransition : boolean = false;										// Rotate GUI when dialog is appearing

// Options
var alwaysUseHiDef : boolean = false;										// Always uses HiDef no matter what platform we're on.
var useHiDefOnMobileBuilds : boolean = false;								// Automatically uses Hi-Def on Mobile builds.
var useHiDefOnWebBuilds : boolean = false;									// Automatically uses Hi-Def on Web builds.
var useHiDefOnFlashBuilds : boolean = false;								// Automatically uses Hi-Def on Flash builds.
var useHiDefOnMetroBuilds : boolean = true;									// Automatically uses Hi-Def on Flash builds.
var useHiDefOnStandaloneBuilds : boolean = true;							// Automatically uses Hi-Def on standalone builds.
var useHiDefOnConsoleBuilds : boolean = true;								// Automatically uses Hi-Def on Flash builds.
private var useHD : boolean = false;										// The final result - are we using HD?

// ** NEW in 3.2 Skin Class
var skins : DUISkinSetup = new DUISkinSetup();
class DUISkinSetup{
	
	// The Skins
	var localizedSkinsHD : DUI_LocalizedSkins = new DUI_LocalizedSkins("HD");	// Skins for different languages in HD
	var localizedSkins : DUI_LocalizedSkins = new DUI_LocalizedSkins();			// Skins for different languages in standard resolution
	
	@System.NonSerialized
	var forceFocusButton : GUIStyle;											// A Style where the button has a focus always showing.
	@System.NonSerialized
	var originalFocusButton : GUIStyle;											// A Style based on the original button style
}	
	// Languages
	class DUI_LocalizedSkins {
		var english : String = "UI/DialogSkin - English";
		var chinese : String = "UI/DialogSkin - Chinese";
		var korean : String = "UI/DialogSkin - Korean";
		var japanese : String = "UI/DialogSkin - Japanese";
		var german : String = "UI/DialogSkin - German";
		var french : String = "UI/DialogSkin - French";
		var spanish : String = "UI/DialogSkin - Spanish";
		var italian : String = "UI/DialogSkin - Italian";
		var portuguese : String = "UI/DialogSkin - Portuguese";
		var russian : String = "UI/DialogSkin - Russian";
		
		
		// Default Constructor passes to the main one with a style...
		function DUI_LocalizedSkins(){
			DUI_LocalizedSkins("");
		}
		
		// Constructor with Style setting
		function DUI_LocalizedSkins( style : String ){
			
			// if we've defined an "HD" style, use the HD filepath
			if(style == "HD"){
				english = "UIHD/DialogSkinHD - English";
				chinese = "UIHD/DialogSkinHD - Chinese";
				korean = "UIHD/DialogSkinHD - Korean";
				japanese = "UIHD/DialogSkinHD - Japanese";
				german = "UIHD/DialogSkinHD - German";
				french = "UIHD/DialogSkinHD - French";
				spanish = "UIHD/DialogSkinHD - Spanish";
				italian = "UIHD/DialogSkinHD - Italian";
				portuguese = "UIHD/DialogSkinHD - Portuguese";
				russian = "UIHD/DialogSkinHD - Russian";
				
			// Otherwise, use the default filepath.	
			} else {
				english = "UI/DialogSkin - English";
				chinese = "UI/DialogSkin - Chinese";
				korean = "UI/DialogSkin - Korean";
				japanese = "UI/DialogSkin - Japanese";
				german = "UI/DialogSkin - German";
				french = "UI/DialogSkin - French";
				spanish = "UI/DialogSkin - Spanish";
				italian = "UI/DialogSkin - Italian";
				portuguese = "UI/DialogSkin - Portuguese";
				russian = "UI/DialogSkin - Russian";
			}
		}	
	}

// Titles
private var titleRect : Rect;											// Rect of the title
private var titleRectShadow : Rect;										// Rect of the title's Shadow
private var subtitleRect : Rect;										// Rect of the subtitle
private var subtitleRectShadow : Rect;									// Rect of the subtitle's Shadow

// Helper Values
private var lastTime : float = 0;
private var guiDeltaTime : float = 0;

// Update Style Text Size Depending On if we're using HD Skins or not
private var updateDialogStylesTextSizes : boolean = false;

// Move a UGUI "Screen Space - Camera" on top of the UI
var newUICam : Camera = null;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	AWAKE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Awake(){

	// Make this statically available
	com = this;

	// Tell DialogUI that this is the new GUI Component
	DialogUI.guiComponent = this as Component;

	// Make sure to set this to false on Awake
	updateDialogStylesTextSizes = false;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	USE HD SKINS?
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UseHDSkins() : boolean {

	// Template variable - If anything goes wrong, we return false to preserve memory.
	var shallWeUseHD : boolean = false;

	// MOBILE BUILDS
	#if UNITY_IPHONE || UNITY_ANDROID || UNITY_WP8 || UNITY_BLACKBERRY

		if(useHiDefOnMobileBuilds){ shallWeUseHD = true; }

	// WEB BUILDS
	#elif UNITY_WEBPLAYER

		if(useHiDefOnWebBuilds){ shallWeUseHD = true; }

	// FLASH BUILDS
	#elif UNITY_FLASH

		if(useHiDefOnFlashBuilds){ shallWeUseHD = true; }

	// METRO BUILDS
	#elif UNITY_METRO

		if(useHiDefOnMetroBuilds){ shallWeUseHD = true; }
	
	// STANDALONE BUILDS
	#elif UNITY_STANDALONE || UNITY_DASHBOARD_WIDGET
	
		if(useHiDefOnStandaloneBuilds){ shallWeUseHD = true; }
	
	// CONSOLE BUILDS
	#elif UNITY_PS3 || UNITY_XBOX360
	
		if(useHiDefOnConsoleBuilds){ shallWeUseHD = true; }

	#endif

	// If we are ALWAYS using HiDef, override platform choices now.
	if( alwaysUseHiDef ){
		shallWeUseHD = true;
	}

	// If anything goes wrong, return false to preserve memory.
	return shallWeUseHD;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	START
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Start () {
	
	// Localize Tokens
	DialogUI.dui.LocalizeTokens();
	
	// Should we use HD Skins?
	useHD = UseHDSkins();

	// ==============================================
	//	MODIFY STYLE SIZES IF WE'RE USING HD SKINS
	// ==============================================

	// Update DialogUI Text sizes - Only do this once.
	if( useHD && updateDialogStylesTextSizes == false ){

		// Set flag so we cant do this again
		updateDialogStylesTextSizes = true;

		// Make sure we can see the Dialog styles ...
		if( DialogUI.dui != null && DialogUI.dui.styles != null && DialogUI.dui.styles.list != null && 
			DialogUI.dui.styles.list.length > 0 
		){
			// Loop through the Dialog Styles and look for custom font sizes
			for( var style : DUIStyleList in DialogUI.dui.styles.list ){
				// If a custom font size has been set, double it.
				if( style != null && style.fontSize > 0){
					style.fontSize = Mathf.Round(style.fontSize * 2 );
				}
			}

			// Recreate Injector Code
			DialogUI.dui.CreateStyleInjectorCode();
		}
	}

	// ==============================================
	//	SETUP SKINS BASED ON LANGUAGE
	// ==============================================

	// ENGLISH
	if ( DialogLocalization.language == "English" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.english) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.english) as GUISkin;
		}
	}
	
	// CHINESE
	else if ( DialogLocalization.language == "Chinese" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.chinese) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.chinese) as GUISkin;
		}
	}
	
	// KOREAN
	else if ( DialogLocalization.language == "Korean" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.korean) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.korean) as GUISkin;
		}
	}
	
	// JAPANESE
	else if ( DialogLocalization.language == "Japanese" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.japanese) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.japanese) as GUISkin;
		}
	}
	
	// GERMAN
	else if ( DialogLocalization.language == "German" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.german) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.german) as GUISkin;
		}
	}
	
	// FRENCH
	else if ( DialogLocalization.language == "French" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.french) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.french) as GUISkin;
		}
	}
	
	// SPANISH
	else if ( DialogLocalization.language == "Spanish" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.spanish) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.spanish) as GUISkin;
		}
	}
	
	// ITALIAN
	else if ( DialogLocalization.language == "Italian" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.italian) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.italian) as GUISkin;
		}
	}
	
	// PORTUGUESE
	else if ( DialogLocalization.language == "Portuguese" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.portuguese) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.portuguese) as GUISkin;
		}
	}
	
	// RUSSIAN
	else if ( DialogLocalization.language == "Russian" ){
		if(useHD){
			skin = Resources.Load(skins.localizedSkinsHD.russian) as GUISkin;
		} else {
			skin = Resources.Load(skins.localizedSkins.russian) as GUISkin;
		}
	}

	// FINAL ERROR CHECK
	// If there was a problem with the skin
	if ( skin == null ){
		// Problem loading dialog skin
		Debug.Log("LDC: (DialogUI) ERROR -> There was a problem loading localized skin for language: " + DialogLocalization.language);	
	}

	// Update Force Button
	UpdateForceFocusButton();
	
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	UNCLAMPED LERP FUNCTION
//	Allows us to lerp directly between 2 points
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Unclamped Lerp Function
function LDC_UnclampedLerp( a : float, b : float, t : float ) : float {
	t = Mathf.Clamp01( t );
	return t*b + (1-t)*a;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	UPDATE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// The Current Transition Effect
var transitionEffect : DUI_TransitionEffects = DUI_TransitionEffects.None;
private var transitionEffectSpeed : float = 7.5;	// was 7.5

// Transition Helper Variables
var oldTransition : DUI_TransitionEffects = DUI_TransitionEffects.None;		// The last selected Transition
private var positionVec : Vector3 = Vector3.zero;  							// We use this to calculate movement based transitions
private var matrixScreenWidener : float = 1;								// Used to offset push transitions with scale to fit modes.

// Function
function Update(){

	// Handle Button Focus
	if( DialogUI.dui != null && DialogUI.dui.fade >= 1){
		DoButtonFocus();
	}

	// Scroll view on Touch devices
	if( !DialogUI.ended && 
		DialogUI.dialogStyle == DIALOGSTYLE.IconGrid &&
		Input.touchCount > 0
	){
		
		if (Input.touches[0].phase == TouchPhase.Moved ){
			DialogUI.scrollPosition.x -= Input.touches[0].deltaPosition.x;
			DialogUI.scrollPosition.y += Input.touches[0].deltaPosition.y;
		}
	}

	// ====================
	//	MATRIX TRANSITIONS
	// ====================

	// If we're using scale to fit, factor in the backgroundwidener so push transitions look better!
	matrixScreenWidener = 1;
	if( scalingMethod == OnGuiScaleMode.ScaleToFit && scaleToFitBackgroundWidener > 1 ){
		matrixScreenWidener = scaleToFitBackgroundWidener;
	} 

	// Make sure we can see the DialogUI component
	if( DialogUI.dui != null ){

		// Set the current transition
		transitionEffect = DialogUI.transition;

		// If the transition has changed, reset the values
		if( transitionEffect != oldTransition ){
			// Debug.Log("TRANSITION CHANGED TO: " + transitionEffect.ToString() );
			oldTransition = transitionEffect;

			// Reset Transition Movement When We Detect A Change ( fixes glitches )
			ResetTransitionMovement();
		}
		
		// ================
		// PUSH LEFT
		// ================

		if( transitionEffect == DUI_TransitionEffects.PushLeft ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, -Screen.width * matrixScreenWidener, 1-DialogUI.dui.fade );

			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.y = 0;
				if( positionVec.x < 0 ){ positionVec.x = Screen.width * matrixScreenWidener; }
				positionVec.x = LDC_UnclampedLerp( positionVec.x, 0, DialogUI.dui.fade );  
			}

		// ================
		// PUSH RIGHT
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.PushRight ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, Screen.width * matrixScreenWidener, 1-DialogUI.dui.fade );
			
			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.y = 0;
				if( positionVec.x > 0 ){ positionVec.x = -Screen.width * matrixScreenWidener; }
				positionVec.x = LDC_UnclampedLerp( positionVec.x, 0, DialogUI.dui.fade );  
			}

		// ================
		// PUSH UP
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.PushUp ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){

				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, -Screen.height, 1-DialogUI.dui.fade );  
			
			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.x = 0;
				if( positionVec.y < 0 ){ positionVec.y = Screen.height; }
				positionVec.y = LDC_UnclampedLerp( positionVec.y, 0, DialogUI.dui.fade );  
			}

		// ================
		// PUSH DOWN
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.PushDown ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, Screen.height, 1-DialogUI.dui.fade );  
			
			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.x = 0;
				if( positionVec.y > 0 ){ positionVec.y = -originalHeight; }
				positionVec.y = LDC_UnclampedLerp( positionVec.y, 0, DialogUI.dui.fade );  
			}
		
		
		// ================
		// PEEP FROM LEFT
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.InAndOutFromLeft ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, -Screen.width * matrixScreenWidener, 1-DialogUI.dui.fade );  

			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, 0, DialogUI.dui.fade );  
			}

		// ================
		// PEEP FROM RIGHT
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.InAndOutFromRight ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, Screen.width * matrixScreenWidener, 1-DialogUI.dui.fade );  

			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.y = 0;
				positionVec.x = LDC_UnclampedLerp( positionVec.x, 0, DialogUI.dui.fade ); 
			}


		// ================
		// PEEP FROM TOP
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.InAndOutFromTop ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, -Screen.height, 1-DialogUI.dui.fade );    
			
			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, 0, DialogUI.dui.fade );  
			}	

		// ================
		// PEEP FROM BOTTOM
		// ================

		} else if( transitionEffect == DUI_TransitionEffects.InAndOutFromBottom ){ 
		
			if( DialogUI.status == DUISTATUS.FADEOUT ){
				
				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, Screen.height, 1-DialogUI.dui.fade );  

			} else if( DialogUI.status == DUISTATUS.SHOW ){

				positionVec.x = 0;
				positionVec.y = LDC_UnclampedLerp( positionVec.y, 0, DialogUI.dui.fade );  
			}
		} 
		
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	RESET TRANSITION MOVEMENT
//	When the transition has changed, we should place the effects at the correct position depending if its fading in or out.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ResetTransitionMovement(){

	// Completely reset the position vector by default
	positionVec = Vector3.zero;

	// PUSH LEFT
	if( transitionEffect == DUI_TransitionEffects.PushLeft ||
		transitionEffect == DUI_TransitionEffects.InAndOutFromLeft
	){ 
		if( DialogUI.status == DUISTATUS.FADEOUT ){
			
			positionVec.y = 0;
			positionVec.x = 0; 
		
		} else if( DialogUI.status == DUISTATUS.SHOW ){

			positionVec.y = 0;
			positionVec.x = -Screen.width * matrixScreenWidener; 
		}
	}

	// PUSH RIGHT
	else if( transitionEffect == DUI_TransitionEffects.PushRight ||
		transitionEffect == DUI_TransitionEffects.InAndOutFromRight
	){ 
		if( DialogUI.status == DUISTATUS.FADEOUT ){
			
			positionVec.y = 0;
			positionVec.x = 0; 
		
		} else if( DialogUI.status == DUISTATUS.SHOW ){

			positionVec.y = 0;
			positionVec.x = Screen.width * matrixScreenWidener;
		}
	}

	// PUSH UP
	else if( transitionEffect == DUI_TransitionEffects.PushUp ||
		transitionEffect == DUI_TransitionEffects.InAndOutFromTop
	){ 
		if( DialogUI.status == DUISTATUS.FADEOUT ){

			positionVec.x = 0;
			positionVec.y = 0;  
		
		} else if( DialogUI.status == DUISTATUS.SHOW ){

			positionVec.x = 0;
			positionVec.y = -Screen.height;  
		}
	}

	// PUSH DOWN
	else if( transitionEffect == DUI_TransitionEffects.PushDown ||
		transitionEffect == DUI_TransitionEffects.InAndOutFromBottom
	){ 
		if( DialogUI.status == DUISTATUS.FADEOUT ){
			
			positionVec.x = 0;
			positionVec.y = 0;  
		
		} else if( DialogUI.status == DUISTATUS.SHOW ){

			positionVec.x = 0;
			positionVec.y = Screen.height;  
		}
	}

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	FIXED UPDATE
//	This function is usually more performance friendly than Update. So we do our array looping and animation here!
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function FixedUpdate(){
	
	// PORTRAIT ANIMATIONS
	if( DialogUI.portraitAnimation != null ){
		DoDialogCastAnimationUpdate(DialogUI.portraitAnimation);
	}
	
	// BACKGROUND LAYERS
	// If we are displaying Background Layers, let's update them!
	if( DialogUI.dui.displayBackgroundLayers && DialogUI.dui.bgLayers.length > 0){
	
		// Loop through the background layers
		for( var bgLayer : DialogUIBackgroundLayers in DialogUI.dui.bgLayers ){
			
			// Make sure there is an animation setup here ...
			if( bgLayer.anim != null ){
				DoDialogCastAnimationUpdate(bgLayer.anim);	
			}
			
			// FADE IN
			if(bgLayer.display == DUI_LAYER_STATUS.FadeIn ){
				
				// Fade in ..
				if( bgLayer.opacity < 1 ){
					bgLayer.opacity += Time.deltaTime / DialogUI.dui.options.fadeDuration;
					
				// If we have reached 1, then automatically change its display mode to "Show"	
				} else {
					bgLayer.opacity = 1;
					bgLayer.display = DUI_LAYER_STATUS.Show;	
				}
			}
			
			// FADE OUT
			else if(bgLayer.display == DUI_LAYER_STATUS.FadeOut ){
				
				// Fade Out ..
				if( bgLayer.opacity > 0 ){
					bgLayer.opacity -= Time.deltaTime / DialogUI.dui.options.fadeDuration;
					
				// If we have reached 0, then automatically change its display mode to "Hide"	
				} else {
					bgLayer.opacity = 0;
					bgLayer.display = DUI_LAYER_STATUS.Hide;	
					bgLayer.tex = null;	
				}
			}
			
		}
	}
	
	// ACTOR LAYERS
	// If we are displaying Background Layers, let's update them!
	if( DialogUI.dui.displayActorLayers && DialogUI.dui.bgActors.length > 0){
	
		// Loop through the background layers
		for( var bgActor : DialogUIActorLayers in DialogUI.dui.bgActors ){
			
			// Make sure there is an animation setup here ...
			if( bgActor.anim != null ){
				DoDialogCastAnimationUpdate(bgActor.anim);	
			}
					
			// FADE IN
			if(bgActor.display == DUI_LAYER_STATUS.FadeIn ){
				
				// Fade in ..
				if( bgActor.opacity < 1 ){
					bgActor.opacity += Time.deltaTime / DialogUI.dui.options.fadeDuration;
					
				// If we have reached 1, then automatically change its display mode to "Show"	
				} else {
					bgActor.opacity = 1;
					bgActor.display = DUI_LAYER_STATUS.Show;	
				}
			}
			
			// FADE OUT
			else if(bgActor.display == DUI_LAYER_STATUS.FadeOut ){
				
				// Fade Out ..
				if( bgActor.opacity > 0 ){
					bgActor.opacity -= Time.deltaTime / DialogUI.dui.options.fadeDuration;
					
				// If we have reached 0, then automatically change its display mode to "Hide"	
				} else {
					bgActor.opacity = 0;
					bgActor.display = DUI_LAYER_STATUS.Hide;	
					bgActor.tex = null;	
				}
			}
			
			// TWEEN RECT
			// If we're using static motion (or the actor is now on "Show" mode), simply use the Standard Rect
			if( bgActor.motion == DUI_ACTOR_MOTION.Static || bgActor.display == DUI_LAYER_STATUS.Show){
				bgActor.motionRect = bgActor.rect;
				
			// Otherwise, calculate the motion	
			} else {
				bgActor.motionRect = CalculateMotionRect(bgActor.rect, bgActor.motion, bgActor.opacity );
			}
			
			// HD Setting - enlarge the images for HD
			if(useHD){
				bgActor.motionRect.x = bgActor.motionRect.x*2;
				bgActor.motionRect.y = bgActor.motionRect.y*2;
				bgActor.motionRect.width = bgActor.motionRect.width*2;
				bgActor.motionRect.height = bgActor.motionRect.height*2;
			}
			
		}
	}

	// ==================================
	// ANIMATE CUSTOM BUTTONS
	// ==================================

	// Animate Custom Button 1
	if( DialogUI.buttonIcon1Animation != null ){
		DoDialogCastAnimationUpdate( DialogUI.buttonIcon1Animation );	
	}

	// Animate Custom Button 2
	if( DialogUI.buttonIcon2Animation != null ){
		DoDialogCastAnimationUpdate( DialogUI.buttonIcon2Animation );	
	}

	// Animate Multiple Custom Buttons
	if( DialogUI.multipleButtonsIconAnimation != null && DialogUI.multipleButtonsIconAnimation.length > 0 ){
		for( var mbia : DialogCastActor in DialogUI.multipleButtonsIconAnimation ){
			if( mbia != null ){
				DoDialogCastAnimationUpdate( mbia );	
			}
		}
	}

	// Animate PopupImage Background
	if( DialogUI.popupImageAnimation != null ){
		DoDialogCastAnimationUpdate( DialogUI.popupImageAnimation );	
	}

	// Animate Icon Grid Custom Buttons
	if( DialogUI.IG_buttons != null && DialogUI.IG_buttons.length > 0 ){
		for( var igb : IconGridButtons in DialogUI.IG_buttons ){
			if( igb != null && igb.dca != null ){
				DoDialogCastAnimationUpdate( igb.dca );	
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO BACKGROUND UI
//	Draws the Background UI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// enum DUI_ACTOR_MOTION{Static,Left,Right,Top,Bottom }						// How the Actor moves IN to the frame.
function CalculateMotionRect( theRect : Rect, motion : DUI_ACTOR_MOTION, fade : float ){
		
	// STATIC
	if( motion == DUI_ACTOR_MOTION.Static){
		// Do nothing..
	}
	
	// From Left
	else if( motion == DUI_ACTOR_MOTION.Left){
				
		theRect.x = (theRect.x - 256) + (256 * fade );
	}
	
	// From Right
	else if( motion == DUI_ACTOR_MOTION.Right){
		
		theRect.x = (theRect.x + 256) - (256 * fade );
	}
	
	// From Top
	else if( motion == DUI_ACTOR_MOTION.Top){
		
		theRect.y = (theRect.y - 256) + (256 * fade );
	}
	
	// From Bottom
	else if( motion == DUI_ACTOR_MOTION.Bottom){
		
		theRect.y = (theRect.y + 256) - (256 * fade );
	}
	
	// Return the Motion Rect
	return theRect;
	
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO BACKGROUND UI
//	Draws the Background UI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper Rects
private var fullScreenRect = Rect(0,0,960,640);

// Main Function
function DoBackgroundUI(){

	// if HD, enlarge the fullScreenRect
	if( useHD ){
		fullScreenRect = Rect(0, 0, 1920, 1280);
	}
	
	// If we are displaying Background Layers, let's update them!
	if( DialogUI.dui.displayBackgroundLayers && DialogUI.dui.bgLayers.length > 0){
		
		// Loop through the background layers
		for( var bgLayer : DialogUIBackgroundLayers in DialogUI.dui.bgLayers ){
		
			// Set the opacity of this background layer
			if( bgLayer.display != DUI_LAYER_STATUS.Hide ){
				GUI.color.a = bgLayer.opacity;
			}
			
			// Draw Actor Layer with animation
			if( bgLayer.anim != null && bgLayer.tex != null ){
				GUI.DrawTexture(fullScreenRect, DoDialogCastAnimation(bgLayer.anim, bgLayer.tex), bgLayer.scale, true );
			
			// Otherwise just draw the standard icon
			} else if( bgLayer.tex != null ){
				GUI.DrawTexture(fullScreenRect, bgLayer.tex, bgLayer.scale, true );
			}
			
		}
	
	}
	
}

// Main Function
function DoActorUI(){
	
	// If we are displaying Background Layers, let's update them!
	if( DialogUI.dui.displayActorLayers && DialogUI.dui.bgActors.length > 0){
		
		// Loop through the background layers
		for( var bgActor : DialogUIActorLayers in DialogUI.dui.bgActors ){
		
			// Set the opacity of this background layer
			if( bgActor.display != DUI_LAYER_STATUS.Hide ){
				GUI.color.a = bgActor.opacity;
			}
			
			// Draw Actor Layer with animation
			if( bgActor.anim != null && bgActor.tex != null ){
				GUI.DrawTexture(bgActor.motionRect, DoDialogCastAnimation(bgActor.anim, bgActor.tex), bgActor.scale, true );
			
			// Otherwise just draw the standard icon
			} else if( bgActor.tex != null ){
				GUI.DrawTexture(bgActor.motionRect, bgActor.tex, bgActor.scale, true );
			}
			
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	UPDATE FORCE BUTTON
//	We create a new GUIStyle to help with Password and Data Entry DialogUI.screens.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UpdateForceFocusButton(){
	if(skin!=null){
		
		skins.originalFocusButton = GUIStyle(skin.button);
		skins.forceFocusButton = GUIStyle(skin.button);
		
		skins.forceFocusButton.normal.background = skin.button.focused.background;
		skins.forceFocusButton.normal.textColor = skin.button.focused.textColor;
		
		skins.forceFocusButton.hover.background = skin.button.focused.background;
		skins.forceFocusButton.hover.textColor = skin.button.focused.textColor;
		
		skins.forceFocusButton.active.background = skin.button.focused.background;
		skins.forceFocusButton.active.textColor = skin.button.focused.textColor;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	SETUP GUI MATRIX
//	This Scales up the UI so things originally designed for Retina Display on iPhone will fit on other resolutions.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SetupGUIMatrix(){
	
	// Setup original width heights depending on HD setting.
	if( useHD ){
		originalWidth = 1920;
		originalHeight = 1280;
	} else {
		originalWidth = 960;
		originalHeight = 640;
	}
	
	// STANDARD SCALING MODE - STRETCH TO FILL
	if( scalingMethod == OnGuiScaleMode.StretchToFill ){

		// Dynamic Resolution UI
		scale.x = Screen.width/originalWidth; // calculate horizontal scale
	    scale.y = Screen.height/originalHeight; // calculate vertical scale
	    scale.z = 1;
	    svMat = GUI.matrix; // save current matrix	

	    // Dont use an offset
	    fitScaleOffset = Vector3.zero;

		// Apply Matrix Effects
		MatrixEffects();
	    
	    // substitute matrix - only scale is altered from standard
	    GUI.matrix = Matrix4x4.TRS( fitScaleOffset, Quaternion.identity, scale);

	// SCALE TO FIT
	} else if (scalingMethod == OnGuiScaleMode.ScaleToFit) {

		// Figures out which is smaller out of the original width or the original height
		fitScale = Mathf.Min( Screen.width/originalWidth, Screen.height/originalHeight);

		scale.x = (originalWidth*fitScale) / originalWidth;
		scale.y = (originalHeight*fitScale) / originalHeight;
		scale.z = 1;
	    svMat = GUI.matrix; // save current matrix	

	    // Create the offset so we can build anchors
	    fitScaleOffset.x = Screen.width - (originalWidth*fitScale);
	    fitScaleOffset.y = Screen.height - (originalHeight*fitScale);
		fitScaleOffset.z = 0;

		// ========
		// ANCHORS
		// ========

		// Center
		if( scalingAnchor == OnGuiScaleAnchor.Center ){
			fitScaleOffset.x = fitScaleOffset.x * 0.5;
			fitScaleOffset.y = fitScaleOffset.y * 0.5;
		}

		// Left
		else if( scalingAnchor == OnGuiScaleAnchor.Left ){
			fitScaleOffset.x = fitScaleOffset.x * 0;
			fitScaleOffset.y = fitScaleOffset.y * 0.5;
		}

		// Right
		else if( scalingAnchor == OnGuiScaleAnchor.Right ){
			fitScaleOffset.x = fitScaleOffset.x * 1;
			fitScaleOffset.y = fitScaleOffset.y * 0.5;
		}

		// Top
		else if( scalingAnchor == OnGuiScaleAnchor.Top ){
			fitScaleOffset.x = fitScaleOffset.x * 0.5;
			fitScaleOffset.y = fitScaleOffset.y * 0;
		}

		// Bottom
		else if( scalingAnchor == OnGuiScaleAnchor.Bottom ){
			fitScaleOffset.x = fitScaleOffset.x * 0.5;
			fitScaleOffset.y = fitScaleOffset.y * 1;
		}

		// Top Left
		else if( scalingAnchor == OnGuiScaleAnchor.TopLeft ){
			fitScaleOffset.x = fitScaleOffset.x * 0;
			fitScaleOffset.y = fitScaleOffset.y * 0;
		}

		// Top Right
		else if( scalingAnchor == OnGuiScaleAnchor.TopRight ){
			fitScaleOffset.x = fitScaleOffset.x * 1;
			fitScaleOffset.y = fitScaleOffset.y * 0;
		}

		// Bottom Left
		else if( scalingAnchor == OnGuiScaleAnchor.BottomLeft ){
			fitScaleOffset.x = fitScaleOffset.x * 0;
			fitScaleOffset.y = fitScaleOffset.y * 1;
		}

		// Bottom Right
		else if( scalingAnchor == OnGuiScaleAnchor.BottomRight ){
			fitScaleOffset.x = fitScaleOffset.x * 1;
			fitScaleOffset.y = fitScaleOffset.y * 1;
		}

		// Apply Matrix Effects
		MatrixEffects();
	    
	    // substitute matrix - only scale is altered from standard
	    GUI.matrix = Matrix4x4.TRS( fitScaleOffset, Quaternion.identity, scale);
    
    // OVERSCALE
	} else if (scalingMethod == OnGuiScaleMode.OverScale) {

		// Figures out which is greater out of the original width or the original height
		fitScale = Mathf.Max( Screen.width/originalWidth, Screen.height/originalHeight);

		scale.x = (originalWidth*fitScale) / originalWidth;
		scale.y = (originalHeight*fitScale) / originalHeight;
		scale.z = 1;
	    svMat = GUI.matrix; // save current matrix	

	    // Create the offset so we can build anchors
	    fitScaleOffset.x = Screen.width - (originalWidth*fitScale);
	    fitScaleOffset.y = Screen.height - (originalHeight*fitScale);
		fitScaleOffset.z = 0;

		// Apply Matrix Effects
		MatrixEffects();

		// substitute matrix - only scale is altered from standard
	    GUI.matrix = Matrix4x4.TRS( fitScaleOffset, Quaternion.identity, scale);
	}

	// Apply Matrix Rotations At The End
	DoMatrixRotation();

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	MATRIX EFFECTS
//	This Scales up the UI so things originally designed for Retina Display on iPhone will fit on other resolutions.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MatrixEffects(){

	// If the chosen effect needs to modify the scale, do it here:
	if( transitionEffect == DUI_TransitionEffects.BarnDoors ||
		transitionEffect == DUI_TransitionEffects.Eyelids ||
		transitionEffect == DUI_TransitionEffects.Popup ||
		transitionEffect == DUI_TransitionEffects.Zoom ||
		transitionEffect == DUI_TransitionEffects.ZoomHorizontal ||
		transitionEffect == DUI_TransitionEffects.ZoomVertical ||
		transitionEffect == DUI_TransitionEffects.Spin ||
		transitionEffect == DUI_TransitionEffects.SpinPopup ||
		transitionEffect == DUI_TransitionEffects.SpinZoom
	){ 

		// ===========================
		//	WAITING FOR A NEW SCREEN
		// ===========================

		// Waiting for new screen
		if( DialogUI.dui.fade <= 0 ){

			// Horizontal Popup offset
			if( transitionEffect == DUI_TransitionEffects.BarnDoors ||
				transitionEffect == DUI_TransitionEffects.Popup ||
				transitionEffect == DUI_TransitionEffects.SpinPopup
			){ 
				fitScaleOffset.x = 0;
				scale.x = 0.0000001;
			}

			// Vertical Popup Offset
			if( transitionEffect == DUI_TransitionEffects.Eyelids ||
				transitionEffect == DUI_TransitionEffects.Popup ||
				transitionEffect == DUI_TransitionEffects.SpinPopup
			){ 
				fitScaleOffset.y = 0;
				scale.y = 0.0000001;
			}

			// Zoom Offset
			if( transitionEffect == DUI_TransitionEffects.Zoom ||
				transitionEffect == DUI_TransitionEffects.SpinZoom ||
				transitionEffect == DUI_TransitionEffects.ZoomHorizontal ||
				transitionEffect == DUI_TransitionEffects.ZoomVertical
			){

				// Horizontal
				if( transitionEffect == DUI_TransitionEffects.Zoom ||
					transitionEffect == DUI_TransitionEffects.SpinZoom ||
					transitionEffect == DUI_TransitionEffects.ZoomHorizontal 
				){
					fitScaleOffset.x -= (Screen.width*0.5) - ( (Screen.width*0.5) * 0.0000001 );
					scale.x = (scale.x * 2) - (scale.x * 0.0000001 );
				}

				// Vertical
				if( transitionEffect == DUI_TransitionEffects.Zoom ||
					transitionEffect == DUI_TransitionEffects.SpinZoom ||
					transitionEffect == DUI_TransitionEffects.ZoomVertical 
				){
					fitScaleOffset.y -= (Screen.height*0.5) - ( (Screen.height*0.5) * 0.0000001 );
					scale.y = (scale.y * 2) - (scale.y * 0.0000001);
				}
			}

		// ===========================
		//	WHILE TANSITIONING
		// ===========================	
		
		// While transitioning
		} else if( DialogUI.dui.fade > 0 && DialogUI.dui.fade < 1){ 

			// Horizontal offset
			if( transitionEffect == DUI_TransitionEffects.BarnDoors ||
				transitionEffect == DUI_TransitionEffects.Popup ||
				transitionEffect == DUI_TransitionEffects.SpinPopup
			){
				fitScaleOffset.x += (Screen.width*0.5) - ( (Screen.width*0.5) * DialogUI.dui.fade);
				scale.x = scale.x * DialogUI.dui.fade;
			}

			// Vertical offset
			if( transitionEffect == DUI_TransitionEffects.Eyelids ||
				transitionEffect == DUI_TransitionEffects.Popup ||
				transitionEffect == DUI_TransitionEffects.SpinPopup
			){
				fitScaleOffset.y += (Screen.height*0.5) - ( (Screen.height*0.5) * DialogUI.dui.fade);
				scale.y = scale.y * DialogUI.dui.fade;
			}

			// Zoom Offset
			if( transitionEffect == DUI_TransitionEffects.Zoom ||
				transitionEffect == DUI_TransitionEffects.SpinZoom ||
				transitionEffect == DUI_TransitionEffects.ZoomHorizontal ||
				transitionEffect == DUI_TransitionEffects.ZoomVertical
			){

				// Horizontal Zoom
				if( transitionEffect == DUI_TransitionEffects.Zoom ||
					transitionEffect == DUI_TransitionEffects.SpinZoom ||
					transitionEffect == DUI_TransitionEffects.ZoomHorizontal
				){
					fitScaleOffset.x -= (Screen.width*0.5) - ( (Screen.width*0.5) * DialogUI.dui.fade);
					scale.x = (scale.x * 2) - (scale.x * DialogUI.dui.fade);
				}

				// Vertical Zoom
				if( transitionEffect == DUI_TransitionEffects.Zoom ||
					transitionEffect == DUI_TransitionEffects.SpinZoom ||
					transitionEffect == DUI_TransitionEffects.ZoomVertical
				){
					fitScaleOffset.y -= (Screen.height*0.5) - ( (Screen.height*0.5) * DialogUI.dui.fade);
					scale.y = (scale.y * 2) - (scale.y * DialogUI.dui.fade);
				}
			}
		}
	}

	// Apply the movement vector for movement based transitions
	fitScaleOffset = fitScaleOffset + positionVec;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO MATRIX ROTATION
//	If this transition requires rotation, do it here (this happens AFTER the matrix has been set)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

private var transitionMatrixRotationAngle : float = 0;
function DoMatrixRotation(){
	
	// Spinning
	if(	transitionEffect == DUI_TransitionEffects.Spin ||
		transitionEffect == DUI_TransitionEffects.SpinPopup ||
		transitionEffect == DUI_TransitionEffects.SpinZoom
	){

		// When fading out, always rotate backwards
		if( DialogUI.status == DUISTATUS.FADEOUT ){

			transitionMatrixRotationAngle =  ( 360 * Mathf.Clamp(1 - DialogUI.dui.fade, 0, 1)) ;

		// Otherwise rotate normally
		} else {

			transitionMatrixRotationAngle =  ( 360 * Mathf.Clamp(DialogUI.dui.fade, 0, 1)) ;
		}

		// Rotate The UI
		GUIUtility.RotateAroundPivot(transitionMatrixRotationAngle, Vector2( Screen.width*0.5, Screen.height*0.5) );

	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	END GUI MATRIX
//	Stops the GUI Matrix
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function EndGUIMatrix(){
	
	// restore matrix before returning
    GUI.matrix = svMat; // restore matrix	
    
    // Always make sure the color is restored too
	GUI.color = Color.white;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	ON GUI
//	Setup the GUI Matrix and run the UI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var depth : int = 0;
function OnGUI () {

	// Do OnGUI DeltaTime
	guiDeltaTime = Time.realtimeSinceStartup - lastTime;
	lastTime = Time.realtimeSinceStartup;

	// Set LDC GUI Depth
	GUI.depth = depth;

	// Make sure the DialogUI.dui.alpha is higher than 0 otherwise there's nothing to show.
	if ( DialogUI.dui.alpha > 0 ){
		
		// Setup GUI Matrix
		SetupGUIMatrix();
	
			// Run the Background UI Code
			DoBackgroundUI();
			
			// Run the Actor UI Code
			DoActorUI();
	
			// Run the Main UI Code (Dialogs)
			DoDialogUI();
			
			// Handle Input Focus.
			DoFocusControl();

		// Setup GUI Matrix
		EndGUIMatrix();

		// If we're using a UGUI cam, move it to the top of the UI 
		// NOTE: only works if canvas is using "Screen Space - Camera".
		if (newUICam != null && Event.current.type == EventType.Repaint) {
			newUICam.Render();
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO FOCUS CONTROL
//	If we haven't setup the GUI Keys correctly, don't use the focus control because it looks weird.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

private var usingFocusControl : boolean = false;	// We are using keyboard / joystick input for the UI
private var usingFocusStyle : GUIStyle;
function DoFocusControl(){

	// Focus the right control
	if( DialogUI.dui.options.selectGuiWithTheseKeycodes.length > 1 && 
		( DialogUI.dui.options.focusNextGuiWithTheseKeycodes.length > 0 || DialogUI.dui.options.focusPreviousGuiWithTheseKeycodes.length > 0) &&
		DialogUI.dui.currentSelection >= 0 // This line was added in LDC v4.1
	){
		GUI.FocusControl(DialogUI.dui.buttonNames[DialogUI.dui.currentSelection]);
		usingFocusControl = true;
	} else {
		usingFocusControl = false;	
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO BUTTON FOCUS
//	Handles using the arrow keys to move between buttons.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DoButtonFocus(){
	
	// Run this if we actually have some button names to process and the DialogUI is active.
	if( !DialogUI.ended && DialogUI.dui.buttonNames.length > 0 ){
		
		// CYCLING THROUGH BUTTONS / AXES
		// For Password and Data Entry styles, we use the event system to look for return / enter.
		// For all other styles, we use this:
		if( DialogUI.dialogStyle != DIALOGSTYLE.Password && 
			DialogUI.dialogStyle != DIALOGSTYLE.DataEntry
		){
		
			// Dont do cycles unless there is more than 1 button name...
			if( DialogUI.dui.buttonNames.length > 1 ){ 

				// Cycle Next
		    	if ( InputKeyWasPressed(DialogUI.dui.options.focusNextGuiWithTheseKeycodes) ) { 
		    		
		    		// Set Focus Selection
		    		DialogUI.dui.currentSelection += 1; 
		    		DialogUI.PlayFocusAudio();
		    		FocusUpdateScrollViews();

		    	}
		    	
		    	// Cycle Previous
		    	else if ( InputKeyWasPressed(DialogUI.dui.options.focusPreviousGuiWithTheseKeycodes) ) { 
		    		
		    		// Set Focus Selection
		    		DialogUI.dui.currentSelection -= 1; 
		    		DialogUI.PlayFocusAudio();
		    		FocusUpdateScrollViews();

		    	}
		    	
			    // Check for focus with axes
				else if( inputKeyBlocker == false && 
					DialogUI.dui.options.focusGuiWithTheseAxes!=null &&
					DialogUI.dui.options.focusGuiWithTheseAxes.length > 0
				){
					for(var test : LDCInputAxes in DialogUI.dui.options.focusGuiWithTheseAxes ){
						// Make sure this axis is valid...
						if ( test != null && Input.GetAxis (test.axis) != null ){
							
							// Setup invert value
							var invert : float = 1;
							if(test.invert){invert = -1;}

							// Debug
							//print("test: "+test.axis + "  ->  "+ (Input.GetAxis(test.axis)*invert) );

							// Check Up
							if( Input.GetAxis(test.axis)*invert < -0.5 ){
								
								// Set Focus Selection
								DialogUI.dui.currentSelection -= 1; 
								DialogUI.PlayFocusAudio();
								FocusUpdateScrollViews();

						    	// We need to do this to add gaps in the axis input as it doesn't work like a button.
						    	StopCoroutine("TempBlockInputKeys");
						    	StartCoroutine("TempBlockInputKeys", 0.15);

						    	// Break Loop once we've found a working axis
						    	break;
							}

							// Check down
							else if( Input.GetAxis(test.axis)*invert > 0.5 ){

								// Set Focus Selection
								DialogUI.dui.currentSelection += 1; 
								DialogUI.PlayFocusAudio();
								FocusUpdateScrollViews();

						    	// We need to do this to add gaps in the axis input as it doesn't work like a button.
						    	StopCoroutine("TempBlockInputKeys");
						    	StartCoroutine("TempBlockInputKeys", 0.15);

						    	// Break Loop once we've found a working axis
						    	break;
							}
						}	
					}
				}
			}	

			// Keep selection integer in range
		    if( DialogUI.dui.currentSelection < 0){
		    	DialogUI.dui.currentSelection = DialogUI.dui.buttonNames.length -1;
		    	FocusUpdateScrollViews();
		    } else if ( DialogUI.dui.currentSelection > DialogUI.dui.buttonNames.length -1){
		    	DialogUI.dui.currentSelection = 0;
		    	FocusUpdateScrollViews();
		    }

			// If we have selected this button, set the correct boolean in the array so we can toggle it OnGUI.
		    if( inputKeyBlocker == false && InputKeyWasPressed(DialogUI.dui.options.selectGuiWithTheseKeycodes) ){

		    	// BUGFIX: Temporarily block input keys for a second.
		    	// We need to do this because of the timing on OnGUI - it would cause end actions to fire twice.
		    	StopCoroutine("TempBlockInputKeys");
		    	StartCoroutine("TempBlockInputKeys", 1.0);

		    	// Flag the current UI item as true.
		    //	DialogUI.buttons[DialogUI.dui.currentSelection] = true;	// Changed this in v4.2 to the line below.
		    	DialogUI.buttons[DialogUI.currentSelection] = true;
		    	DialogUI.PlayButonAudio();
		    }
	    
	    }
	    
	    // DEBUG
	    //if(Application.isEditor){
//			print(DialogUI.dialogStyle.ToString()+" - Current Selection:" + DialogUI.dui.buttonNames[DialogUI.dui.currentSelection] + "   id: "+DialogUI.dui.currentSelection);
	    //}
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	TEMPORARILY BLOCK INPUT KEYS
//	We need to do this because of the timing on OnGUI - it would cause end actions to fire twice.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

private var inputKeyBlocker : boolean = false;
function TempBlockInputKeys( duration : float ){
	inputKeyBlocker = true;
	//print("Blocking Input Keys.");
	var counter : float = duration;
	while(counter > 0){
		counter -= Time.deltaTime;
		yield;
	}
	//print("Unblocking Input Keys.");
	inputKeyBlocker = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	INPUT KEY WAS PRESSED
//	Checks to see if any of the keys setup in a String array has been pressed
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function InputKeyWasPressed( inputs : KeyCode[] ){
	
	// Skip dialog with any of these Keys
	if( inputs!=null && inputs.length > 0 ){
		for(var key : KeyCode in inputs ){
			if (Input.GetKeyUp(key) ){
				return true;
			}	
		}
	}	

	// If there are no input keys setup, or none were found, return false.
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO DIALOG UI
//	The Main Dialog UI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// General Helper Rects
private var bgRect : Rect = new Rect();
private var portraitRect : Rect = new Rect();
private var actorRect : Rect = new Rect();
private var actorRectShadow : Rect = new Rect();
private var dialogRect : Rect = new Rect();
private var dialogRectShadow : Rect = new Rect();		
private var yesRect : Rect = new Rect();
private var noRect : Rect = new Rect();
private var skipRect : Rect = new Rect();
private var verticalOffset : int = 0; 
private var textFieldRect : Rect = new Rect();
private var dataEntryButton : Rect = new Rect();

// Button Helperes
private var buttonOffset : Vector2 = Vector2(0,0);
private var dynamicGUIContent : GUIContent = new GUIContent();				// For Button 1
private var dynamicGUIContent2 : GUIContent = new GUIContent();				// For Button 2
private var dynamicGUIContentMultiple : GUIContent = new GUIContent();		// For Multiple Buttons

// Data Entry Rects
private var dataEntryBorderRect : Rect = new Rect();
private var dataEntryTitleRect : Rect = dataEntryBorderRect;
private var dataEntryTitleRectShadow : Rect = dataEntryTitleRect;

// Password
private var passwordBorderRect : Rect = new Rect();
private var passwordTitleRect : Rect = new Rect();
private var passwordTitleRectShadow : Rect = new Rect();
private var passwordTextFieldRect : Rect = new Rect();
private var passwordButton : Rect = new Rect();

// Popup Helper Rects
private var popupImageBGRect : Rect = new Rect();
private var popupTitle : Rect = new Rect();
private var popupTitleShadow : Rect = new Rect();
private var popupText : Rect = new Rect();
private var popupTextShadow : Rect = new Rect();
private var popupButtonRect : Rect = new Rect(); 
private var popupButtonRect2 : Rect = new Rect();

// Icon Grid helper Variables
private var IG_HeaderHeight : int = 0;
private var IG_NumberOfIconsMinusClose : int = 0;
private var IG_NumberOfRows : int = 1;
private var IG_CurrentIcon : int = 0;
private var IG_Spacer : int = 0;
private var IG_ContentSizeX : int = 0; 
private var IG_ContentSizeY : int = 0; 
private var iconGridBGRect : Rect = new Rect();
private var IG_ActualScrollRect : Rect = new Rect();
private var iconGridICRect : Rect = new Rect();
private var IG_TitleRect : Rect = new Rect();
private var IG_SubtitleRect : Rect = new Rect();
private var IG_TitleRectShadow : Rect = new Rect();
private var IG_SubtitleRectShadow : Rect = new Rect();
private var IG_Close_Btn : Rect = new Rect();
private var IG_Btn : Rect = new Rect();
private var IG_Btn_Label : Rect = new Rect();
private var IG_ModifiedButtonStyle : GUIStyle = new GUIStyle(); 

// Auto scroll helpers
private var originalVerticalScrollbar : GUIStyle = new GUIStyle();
private var titleStyleOverride : GUIStyle = new GUIStyle();
private var subtitleStyleOverride : GUIStyle = new GUIStyle();
private var subtitleShadowStyle : GUIStyle = new GUIStyle();
var theAutoScrollRect : Rect = new Rect();
private var theShadowScrollRect : Rect = new Rect();

// Function		
function DoDialogUI(){
	
	// Use this GUI Skin
	if(skin){GUI.skin = skin;}
	
	// Cache the buttonOffset if it is available
	if( skin != null && skin.customStyles.length >= 10 && skin.customStyles[9] != null ){
		buttonOffset = skin.customStyles[9].contentOffset;
	}

	// =================
	//	BACKGROUND
	// =================
	
	// Show Background If Not Hidden
	if( !DialogUI.dui.options.hideBackgroundFromUI ){
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color.a = DialogUI.dui.alpha - DialogUI.dui.hideBackgroundSubtractor;
		
		// Draw the bottom Black Strip
		if( !useHD ){

			// Standard Background Rect
			bgRect = Rect(0,640-159,960,160);

			// Multiply width of background if we're using a Scalt To Fit option...
			if( scalingMethod == OnGuiScaleMode.ScaleToFit && scaleToFitBackgroundWidener > 1 ){
				bgRect = Rect( 
								(960*0.5) - ((960*scaleToFitBackgroundWidener) *0.5), 
								640-159, 
								960*scaleToFitBackgroundWidener,
								160
							);
			}

		// HD ...	
		} else {

			// HD Background Rect
			bgRect = Rect(0, 1280-318, 1920, 320);

			// Multiply width of background if we're using a Scalt To Fit option...
			if( scalingMethod == OnGuiScaleMode.ScaleToFit && scaleToFitBackgroundWidener > 1 ){
				bgRect = Rect( 
								(1920*0.5) - ((1920*scaleToFitBackgroundWidener) *0.5), 
								1280-318, 
								1920*scaleToFitBackgroundWidener, 
								320
							);
			}
		}
		GUI.Label(bgRect, "", skin.customStyles[2]);
	}
	
	// =================
	//	TEXT
	// =================
	
	// Show Text If Not Hidden
	if( !DialogUI.dui.options.hideAllTextFromUI ){
		
		// Don't show text on 3 buttons or more
		if ( 	DialogUI.dialogStyle != DIALOGSTYLE.MultipleButtons && 
				DialogUI.dialogStyle != DIALOGSTYLE.DataEntry && 
				DialogUI.dialogStyle != DIALOGSTYLE.Password &&
				DialogUI.dialogStyle != DIALOGSTYLE.Title &&
				DialogUI.dialogStyle != DIALOGSTYLE.Popup &&
				DialogUI.dialogStyle != DIALOGSTYLE.IconGrid
		){
			
			// Draw Actor String ( with shadow )
			if( !useHD ){
				actorRect = Rect(266, 640-175,500,50);
			} else {
				actorRect = Rect(532, 1280-350, 1000, 100);
			}
			
			// Resize the text field to take up the whole DialogUI.screen if there is no DialogUI.portrait icon setup
			if( DialogUI.dui.options.ResizeTextIfNoPortraitsAreSetup && DialogUI.portrait==null){
				if( !useHD ){
					actorRect.x = 20;
					actorRect.width += 246;
				} else {
					actorRect.x = 40;
					actorRect.width += 492;
				}
			}
			
			// Setup Shadow based on the Actor Rect
			actorRectShadow = actorRect;
			if( !useHD ){
				actorRectShadow.x += 1;
				actorRectShadow.y += 1;
			} else {
				actorRectShadow.x += 2;
				actorRectShadow.y += 2;
			}
			
			// Do Title And Shadow (Title / Actor)
			DoStyleAndShadow( 	actorRect, actorRectShadow, skin.customStyles[1], DialogUI.dui.actorName,
							 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );
			
			// Dialog String
			// Lets make sure we're not hiding the body text
			if( !DialogUI.dui.options.hideAllBodyTextFromUI ){
				
				if( !useHD ){
					dialogRect = Rect(266,640-125,500,125);
				} else {
					dialogRect = Rect(532, 1280-250, 1000, 250);
				}
				
				// Resize the text field to take up the whole DialogUI.screen if there is no DialogUI.portrait icon setup
				if( DialogUI.dui.options.ResizeTextIfNoPortraitsAreSetup && DialogUI.portrait==null){
					if( !useHD ){
						dialogRect.x = 20;
						dialogRect.width += 246;
					} else {
						dialogRect.x = 40;
						dialogRect.width += 492;
					}
				}
				
				// Setup Shadow based on the Dialog Rect
				dialogRectShadow = dialogRect;
				if( !useHD ){
					dialogRectShadow.x += 1;
					dialogRectShadow.y += 1;
				} else {
					dialogRectShadow.x += 2;
					dialogRectShadow.y += 2;
				}
				
				// Make text space smaller if we're showing 2 buttons
				if( DialogUI.dialogStyle == DIALOGSTYLE.YesOrNo || DialogUI.dialogStyle == DIALOGSTYLE.TwoButtons){
					if( !useHD ){
						dialogRect.width = 340;
						dialogRectShadow.width = 340;
					} else {
						dialogRect.width = 680;
						dialogRectShadow.width = 680;
					}
				}
			
				// Body Text Shadow
				if( DialogUI.dui.options.drawBodyTextShadows && DialogUI.dui.options.scrollableTextExtraFooterSpace == false ){
					
					// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
					GUI.color = Color.black;
					if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}
					
					// Draw Body Name Shadow
					//GUI.Label(dialogRectShadow, DialogUI.currentDialogText, skin.customStyles[0]);
					GUI.Label( dialogRectShadow, DialogUI.ReplaceAllRichTextColorToNewColor(  DialogUI.currentDialogText, new Color32( 0, 0, 0, GUI.color.a)), skin.customStyles[0]);
				}
				
				
				// ========================
				// DONT USE SCROLLING
				// ========================

				// Draw Dialog Text normally if we are not using auto scrolling and there are no overrides
				if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.Off && 
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault ||
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.Off
				){

					// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
					GUI.color = Color.white; 
					if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}

					// Draw Label
					GUI.Label(dialogRect, DialogUI.currentDialogText, skin.customStyles[0]);

				// Use Autoscrolling!
				} else {

					// Cache Scrollbar settings
					originalVerticalScrollbar = GUI.skin.verticalScrollbar;
					if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
						DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
						DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
					){
						GUI.skin.verticalScrollbar = GUIStyle.none;
					}

					// Start The Scroll View
					GUILayout.BeginArea ( dialogRect );

					// Automatic scroll
					if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
						DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
						DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
					){
						DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingFixedValue, GUIStyle.none, GUILayout.Width (dialogRect.width), GUILayout.Height (dialogRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
					
					// Manually scrolling
					} else {
						DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingValue, GUIStyle.none, GUILayout.Width (dialogRect.width), GUILayout.Height (dialogRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
					}

					// Body Text Shadow
					if( DialogUI.dui.options.drawBodyTextShadows ){
						
						// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
						GUI.color = Color.black;
						if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
							GUI.color.a = DialogUI.dui.fade;
						} else {
							GUI.color.a = 1;	
						}

						// Draw Body Name Shadow
						//GUILayout.Label(DialogUI.currentDialogText, skin.customStyles[0] );
						GUILayout.Label( DialogUI.ReplaceAllRichTextColorToNewColor(  DialogUI.currentDialogText, new Color32( 0, 0, 0, GUI.color.a)), skin.customStyles[0]);


						// Cache the last scroll rect to get the height
  						theShadowScrollRect = GUILayoutUtility.GetLastRect();
  						if(theShadowScrollRect!=null){ 

  							// Reverse the shadow offset to do the normal text
  							if( !useHD ){
								theShadowScrollRect.x -= 1;
								theShadowScrollRect.y -= 1;
							} else {
								theShadowScrollRect.x -= 2;
								theShadowScrollRect.y -= 2;
							}


  							// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
							GUI.color = Color.white; 
							if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
								GUI.color.a = DialogUI.dui.fade;
							} else {
								GUI.color.a = 1;	
							}

							// Draw the normal text
  							GUI.Label(theShadowScrollRect, DialogUI.currentDialogText, skin.customStyles[0] );
  						}
					

					} else {

						// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
						GUI.color = Color.white; 
						if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
							GUI.color.a = DialogUI.dui.fade;
						} else {
							GUI.color.a = 1;	
						}

						// Draw the label
						GUILayout.Label(DialogUI.currentDialogText, skin.customStyles[0] );

					}
 
					// Cache the last scroll rect to get the height
  					theAutoScrollRect = GUILayoutUtility.GetLastRect();
  					if(theAutoScrollRect!=null){ DialogUI.dui.options.autoScrollingHeight = theAutoScrollRect.height - (dialogRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace); }

 					// End the Scroll view
  					GUILayout.EndScrollView ();

 					GUILayout.EndArea();

 					// Reset vertical scrollbar
 					GUI.skin.verticalScrollbar = originalVerticalScrollbar;
				}

			}
		}
	}
	
	// =================
	//	BUTTONS
	// =================
	
	// Use Standard Next Button	
	if ( DialogUI.dialogStyle == DIALOGSTYLE.NextButton 
		#if UNITY_POSTBRUTAL
			|| DialogUI.dialogStyle == DIALOGSTYLE.VoiceRoom 
		#endif
	){
		
		// Show Next Button if we've not set it to be hidden
		if( !DialogUI.dui.options.hideAllSingleButtonsFromUI && !DialogUI.hideNextButton ){
			
			// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
			if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade;
			} else {
				GUI.color.a = 1;	
			}
		
			// Setup Skip Rect
			if(DialogUI.dui.options.useButtonTransitions){
				
				// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
				if( DialogUI.dui.fade >= 1 ){
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
					}
				} else {
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
					}
				}
				
			} else {
				if( !useHD ){
					skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
				} else {
					skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			
			// Draw Skip Button
			GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
			if( LDC_GUIButton(	skipRect, DialogUI.dui.LocalizeNextButton() ) || DialogUI.buttons[0] == true ){

				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1){
					if(DialogUI.screen){
						DialogUI.screen.Skip();
						DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
					}
				}
			}
		}
	}
	
	// Use Standard Yes / No Options
	else if( DialogUI.dialogStyle == DIALOGSTYLE.YesOrNo ){
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}
		
		// Setup Yes Button
		if( DialogUI.dui.options.useButtonTransitions ){
			 
			// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
			if( DialogUI.dui.fade >= 1 ){
				if( !useHD ){
					yesRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
				} else {
					yesRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
				}
			} else {
				if( !useHD ){
					yesRect = Rect( buttonOffset.x + 800+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
				} else {
					yesRect = Rect( buttonOffset.x + 1600+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			 
		} else {
			if( !useHD ){
				yesRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
			} else {
				yesRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
			}
		}
		
		// Draw Yes Button
		GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
		if( LDC_GUIButton(yesRect, DialogUI.dui.LocalizeYesButton() ) || DialogUI.buttons[0] == true ){
			// Make sure the button has finished fading in first!
			if(DialogUI.dui.fade>=1){
				
				if(DialogUI.screen){
					DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
					DialogUI.screen.Yes();
				}
			}
		}
		
		// No Button
		if( DialogUI.dui.options.useButtonTransitions ){
			
			// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
			if( DialogUI.dui.fade >= 1 ){
				if( !useHD ){
					noRect = Rect( buttonOffset.x + 640, buttonOffset.y + 640-100, 140, 64 );
				} else {
					noRect = Rect( buttonOffset.x + 1280, buttonOffset.y + 1280-200, 280, 128 );
				}
			} else {
				if( !useHD ){
					noRect = Rect( buttonOffset.x + 640+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
				} else {
					noRect = Rect( buttonOffset.x + 1280+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			
		} else {
			if( !useHD ){
				noRect = Rect( buttonOffset.x + 640, buttonOffset.y + 640-100, 140, 64 );
			} else {
				noRect = Rect( buttonOffset.x + 1280, buttonOffset.y + 1280-200, 280, 128 );
			}
		}
		
		// Draw No Button
		GUI.SetNextControlName(DialogUI.dui.buttonNames[1]);
		if( LDC_GUIButton(noRect, DialogUI.dui.LocalizeNoButton() ) || DialogUI.buttons[1] == true ){
			// Make sure the button has finished fading in first!
			if(DialogUI.dui.fade>=1){
				if(DialogUI.screen){
					DialogUI.buttons[1] = false; // This blocks the action from repeating if we pressed a button.
					DialogUI.screen.No();
				}
			}
		}
	} 
	
	// Use Custom Single Button	
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.OneButton ) {
		
		// Show Next Button if we've not set it to be hidden
		if( !DialogUI.dui.options.hideAllSingleButtonsFromUI && !DialogUI.hideNextButton ){
			
			// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
			if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade;
			} else {
				GUI.color.a = 1;	
			}
		
			// Setup Skip Rect
			if(DialogUI.dui.options.useButtonTransitions){
				
				// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
				if( DialogUI.dui.fade >= 1 ){
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
					}
				} else {
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
					}
				}
				
			} else {
				if( !useHD ){
					skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
				} else {
					skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			
			// Draw Skip Button
			GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
			dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
			if( LDC_GUIButton(	skipRect, dynamicGUIContent )  ||
				//LDC_GUIButton(	skipRect, DialogUI.customButton1 )  || This was the original
							DialogUI.buttons[0] == true 
			){
				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1){
					if(DialogUI.screen){
						DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
						DialogUI.screen.Skip();
					}
				}
			}
		}
	}
	
	// Custom 2 Buttons
	else if( DialogUI.dialogStyle == DIALOGSTYLE.TwoButtons ){
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}
		
		// Setup Yes Button
		if( DialogUI.dui.options.useButtonTransitions ){

			 // If DialogUI.dui.fade has already completed, set up the rect to absolute positions
			if( DialogUI.dui.fade >= 1 ){
				if( !useHD ){
					yesRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
				} else {
					yesRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
				}
			} else {
				if( !useHD ){
					yesRect = Rect( buttonOffset.x + 800+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
				} else {
					yesRect = Rect( buttonOffset.x + 1600+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			 
		} else {
			if( !useHD ){
				yesRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
			} else {
				yesRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
			}
		}
		
		// Draw Custom Yes Button
		GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
		dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
		if( LDC_GUIButton(yesRect, dynamicGUIContent ) || DialogUI.buttons[0] == true ){
			// Make sure the button has finished fading in first!
			if(DialogUI.dui.fade>=1){
				if(DialogUI.screen){
					DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
					DialogUI.screen.Yes();
				}
			}
		}
		
		// No Button
		if( DialogUI.dui.options.useButtonTransitions ){
			
			// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
			if( DialogUI.dui.fade >= 1 ){
				if( !useHD ){
					noRect = Rect( buttonOffset.x + 640, buttonOffset.y + 640-100, 140, 64 );
				} else {
					noRect = Rect( buttonOffset.x + 1280, buttonOffset.y + 1280-200, 280, 128 );
				}
			} else {
				if( !useHD ){
					noRect = Rect( buttonOffset.x + 640+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
				} else {
					noRect = Rect( buttonOffset.x + 1280+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			
		} else {
			if( !useHD ){
				noRect = Rect( buttonOffset.x + 640, buttonOffset.y + 640-100, 140, 64 );
			} else {
				noRect = Rect( buttonOffset.x + 1280, buttonOffset.y + 1280-200, 280, 128 );
			}
		}
		
		// Draw Custom No Button
		GUI.SetNextControlName(DialogUI.dui.buttonNames[1]);
		dynamicGUIContent2 = new GUIContent(DialogUI.customButton2, DoDialogCastAnimation(DialogUI.buttonIcon2Animation, DialogUI.buttonIcon2) );
		if( LDC_GUIButton(	noRect, dynamicGUIContent2 ) || DialogUI.buttons[1] == true ){
			// Make sure the button has finished fading in first!
			if(DialogUI.dui.fade>=1){
				if(DialogUI.screen){
					DialogUI.buttons[1] = false; // This blocks the action from repeating if we pressed a button.
					DialogUI.screen.No();
				}
			}
		}
	}
	
	// Use Multiple Buttons
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.MultipleButtons ) {
		
		// Calculate the Offset for the button Panel
		var panelOffset : int;
		if( !useHD ){
			panelOffset = (DialogUI.multipleButtons.length) * (48+20);
		} else {
			panelOffset = (DialogUI.multipleButtons.length) * (96+40);
		}
		
		//	BACKGROUND
		
		// Show Background If Not Hidden
		if( !DialogUI.dui.options.hideChoicePanelFromUI ){
			
			// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
			GUI.color.a = DialogUI.dui.fade;
			
			// Draw the bottom Black Strip
			if( !useHD ){
				bgRect = Rect(buttonOffset.x + 256, buttonOffset.y + 640-(82+panelOffset),690,(62+panelOffset)  );
			} else {
				bgRect = Rect(buttonOffset.x + 512, buttonOffset.y + 1280-(164+panelOffset),1380,(124+panelOffset)  );
			}
			
			if(DialogUI.dui.actorName=="" || DialogUI.dui.options.hideAllTextFromUI  || DialogUI.dui.options.hideAllTitleTextFromUI ){
				if( !useHD ){
					bgRect.height = panelOffset + 20;
					bgRect.y += 40;
				} else {
					bgRect.height = panelOffset + 40;
					bgRect.y += 80;
				}
			}
			
			// If we dont have a DialogUI.portrait setup, use the whole width of the DialogUI.screen
			if( DialogUI.portrait == null ){
				if( !useHD ){
					bgRect.x -= 246;
					bgRect.width += 246;
				} else {
					bgRect.x -= 492;
					bgRect.width += 492;
				}
			}
			
			// Draw the box
			GUI.Box(bgRect, "", skin.customStyles[3]);
		}
		
		// PORTRAIT
		
		// Draw the DialogUI.portrait
		DoPortrait();
		
		// TITLE
		
		// Make sure we're not hiding all the title text
		if(!DialogUI.dui.options.hideAllTitleTextFromUI ){
				
			// Draw Actor String ( with shadow )
			if( !useHD ){
				actorRect = Rect( buttonOffset.x + 276, buttonOffset.y + 640-(72+panelOffset),650, 50);
			} else {
				actorRect = Rect( buttonOffset.x + 552, buttonOffset.y + 1280-(144+panelOffset), 1300, 100);
			}
			
			// If we dont have a DialogUI.portrait setup, use the whole width of the DialogUI.screen
			if( DialogUI.portrait == null ){
				if( !useHD ){
					actorRect.x -= 246;
					actorRect.width += 246;
				} else {
					actorRect.x -= 492;
					actorRect.width += 492;
				}
			}
			
			// Setup the Shadow Rect
			actorRectShadow = actorRect;
			if( !useHD ){
				actorRectShadow.x += 1;
				actorRectShadow.y += 1;
			} else {
				actorRectShadow.x += 2;
				actorRectShadow.y += 2;
			}

			//GUI.Label(actorRect, DialogUI.dui.actorName, skin.customStyles[4]);

			// Do Title And Shadow (Title / Actor)
			DoStyleAndShadow( 	actorRect, actorRectShadow, skin.customStyles[4], DialogUI.dui.actorName,
							 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );

		}
		
		//	BUTTONS
		
		// Loop through the multiple options
		if(DialogUI.multipleButtons.length > 0 ){
			var moCounter : int = 0;
			for( var mButtonChoice : String in DialogUI.multipleButtons ){
				if(mButtonChoice){
					
					// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
					if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}
					
					// Setup vertical offset
					if( !useHD ){
						verticalOffset = moCounter * (48+20);
					} else {
						verticalOffset = moCounter * (96+40);
					}
					
					// Setup Skip Rect
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 276, buttonOffset.y + (640 -(22+panelOffset) )+verticalOffset, 650, 48 );
					} else {
						skipRect = Rect( buttonOffset.x + 552, buttonOffset.y + (1280 -(44+panelOffset) )+verticalOffset, 1300, 96 );
					}
					
					// If we dont have a DialogUI.portrait setup, use the whole width of the DialogUI.screen
					if( DialogUI.portrait == null ){
						if( !useHD ){
							skipRect.x -= 246;
							skipRect.width += 246;
						} else {
							skipRect.x -= 492;
							skipRect.width += 492;
						}
					}
				
				//Decision Time
					
					// Draw Multiple Choice Button
					GUI.SetNextControlName(DialogUI.dui.buttonNames[moCounter]);
					dynamicGUIContentMultiple = new GUIContent(mButtonChoice, DoDialogCastAnimation(DialogUI.multipleButtonsIconAnimation[moCounter], DialogUI.multipleButtonsIcon[moCounter]) );
					if( LDC_GUIButton(skipRect, dynamicGUIContentMultiple )
						/*LDC_GUIButton(skipRect, mButtonChoice ) // This is the original code*/|| DialogUI.buttons[moCounter] == true 

					){

						// Make sure the button has finished fading in first!
						if(DialogUI.dui.fade>=1){
							if(DialogUI.screen){
								DialogUI.buttons[moCounter] = false; // This blocks the action from repeating if we pressed a button.
								DialogUI.screen.MultipleChoiceNext(moCounter);
							}
						}
					}
					
					// Increment the 3 button spacer
					moCounter++;
				}
			}
		}
	}
	

	// USE DATA ENTRY
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.DataEntry ) {
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color = Color.white; 
		if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}
		
		// dataEntryAnchor
		
		// Create the background rect (border rect)	
		dataEntryBorderRect = new Rect();
		if( !useHD ){
			dataEntryBorderRect = Rect((960/2)-(800/2),50,800,120);
		} else {
			dataEntryBorderRect = Rect((1920/2)-(1600/2), 100, 1600, 240);
		}
		
		// Add the ANCHOR offsets here
		if( DialogUI.dataEntryAnchor == DS_DATA_ANCHOR.Middle ){
			if( !useHD ){
				dataEntryBorderRect.y = (640/2) - (dataEntryBorderRect.height/2);
			} else {
				dataEntryBorderRect.y = (1280/2) - (dataEntryBorderRect.height/2);
			}
			
		} else if( DialogUI.dataEntryAnchor == DS_DATA_ANCHOR.Bottom ){
			if( !useHD ){
				dataEntryBorderRect.y = 640 - (dataEntryBorderRect.height + 50);
			} else {
				dataEntryBorderRect.y = 1280 - (dataEntryBorderRect.height + 100);
			}
		}
		
		// Title
		dataEntryTitleRect = dataEntryBorderRect;
		if( !useHD ){
			dataEntryTitleRect.y += 10;
		} else {
			dataEntryTitleRect.y += 20;
		}

		// Subtitle
		dataEntryTitleRectShadow = dataEntryTitleRect;
		if( !useHD ){
			dataEntryTitleRect.x += 1;
			dataEntryTitleRect.x += 1;
		} else {
			dataEntryTitleRect.y += 2;
			dataEntryTitleRect.y += 2;
		}
		
		// Draw the box
		GUI.Box(dataEntryBorderRect, "", skin.customStyles[3]);
		
		// Do Title And Shadow
		DoStyleAndShadow( 	dataEntryTitleRect, dataEntryTitleRectShadow, skin.customStyles[4], DialogUI.dui.actorName,
							 DialogUI.dui.options.drawBodyTextShadows, DialogUI.dui.options.hideAllBodyTextFromUI  );


		// Text field Rect
		textFieldRect = dataEntryBorderRect;
		if( !useHD ){
			textFieldRect.width -= 20;
			textFieldRect.x += 10;
			textFieldRect.y += 60;
			textFieldRect.width -= (128+10);
			textFieldRect.height = 48;
		} else {
			textFieldRect.width -= 40;
			textFieldRect.x += 20;
			textFieldRect.y += 120;
			textFieldRect.width -= (256+20);
			textFieldRect.height = 96;
		}
		
		// Data Entry Button
		dataEntryButton = textFieldRect;
		if( !useHD ){
			dataEntryButton.width = 128;
			dataEntryButton.x += (textFieldRect.width+10);
		} else {
			dataEntryButton.width = 256;
			dataEntryButton.x += (textFieldRect.width+20);
		}
		
		// If the Data Entry String is valid ..
		if(DialogUI.dataEntryString!=null){ 
			
			// Find out if we have hit return / enter
			var dataEntrySubmitText : boolean = false;
			if (Event.current.type == EventType.KeyDown && DialogUI.dui.options.selectGuiWithTheseKeycodes.length > 0 ){
				
				// Cycle through the keycodes and test if we have used it.
				for( var dataEntryEvent : KeyCode in DialogUI.dui.options.selectGuiWithTheseKeycodes ){
					if(Event.current.keyCode == dataEntryEvent){
						dataEntrySubmitText = true;
						break;
					}
				}
			}
			
			// Show the Data Entry Text Field
			GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
			DialogUI.dataEntryString = GUI.TextField (textFieldRect, DialogUI.dataEntryString, DialogUI.dataEntryCharacterLimit, skin.customStyles[5]); 
						
			// Remove all line breaks
			DialogUI.dataEntryString = DialogUI.dataEntryString.Replace("\n","");
			
			// If we are using the number format, and this isn't one, reset to the default value!
			var outputFloat = floatRef();	// Needed for the TryParse function!
		//	if( DialogUI.dataEntryFormat == DS_DATA_FORMAT.Number && !float.TryParse(DialogUI.dataEntryString, outputFloat) ){
			if ( DialogUI.dataEntryFormat == DS_DATA_FORMAT.Number && !DialogUI.ParseTokenAsFloat(DialogUI.dataEntryString, outputFloat) ){	
					
				if(DialogUI.dataEntryDefaultValue != ""){
					DialogUI.dataEntryString = DialogUI.dataEntryDefaultValue;
				} else {
					DialogUI.dataEntryString = "0";
				}
			}
			
			// Set textfield caret to end position
			if( DialogUI.setupTextField && DialogUI.dui.fade >= 0.1){
//				print("Setting up Textfield");
				DialogUI.setupTextField = false;
				var te : TextEditor = GUIUtility.GetStateObject(typeof(TextEditor), GUIUtility.keyboardControl) as TextEditor;
				if (te != null){te.MoveCursorToPosition(new Vector2(5555, 5555));}
			}
			
			GUI.SetNextControlName(DialogUI.dui.buttonNames[1]);
			dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
			if( LDC_GUIButton(dataEntryButton, dynamicGUIContent, usingFocusControl ? skins.forceFocusButton : skins.originalFocusButton) || dataEntrySubmitText ){
				
				// Apply string to the token first
				if( DialogUI.dui.tokens.length > 0 && DialogUI.dataEntryToken < DialogUI.dui.tokens.length){
					DialogUI.dui.tokens[DialogUI.dataEntryToken].value = DialogUI.dataEntryString;
				} else {
					Debug.Log("LDC: (DialogUI) Couldn't set Token (with ID: "+DialogUI.dataEntryToken+" ) from Data Entry DialogUI.screen because the token could not be found.");	
				}
				
				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1 && DialogUI.screen){
					DialogUI.screen.Skip();
				}
			}
		}
	}
	
		
	// USE PASSWORD
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.Password ) {
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color = Color.white; 
		if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}
		
		// dataEntryAnchor
		
		// Create the background rect (border rect)	
		passwordBorderRect = new Rect();
		if( !useHD ){
			passwordBorderRect = Rect((960/2)-(800/2),50,800,120);
		} else {
			passwordBorderRect = Rect((1920/2)-(1600/2), 100, 1600, 240);
		}
		
		// Add the ANCHOR offsets here
		if( DialogUI.dataEntryAnchor == DS_DATA_ANCHOR.Middle ){
			if( !useHD ){
				passwordBorderRect.y = (640/2) - (passwordBorderRect.height/2);
			} else {
				passwordBorderRect.y = (1280/2) - (passwordBorderRect.height/2);
			}
		} else if( DialogUI.dataEntryAnchor == DS_DATA_ANCHOR.Bottom ){
			if( !useHD ){
				passwordBorderRect.y = 640 - (passwordBorderRect.height + 50);
			} else {
				passwordBorderRect.y = 1280 - (passwordBorderRect.height + 100);
			}
		}
		
		// Title
		passwordTitleRect = passwordBorderRect;
		if( !useHD ){
			passwordTitleRect.y += 10;
		} else {
			passwordTitleRect.y += 20;
		}

		// Subtitle
		passwordTitleRectShadow = passwordTitleRect;
		if( !useHD ){
			passwordTitleRectShadow.x += 1;
			passwordTitleRectShadow.x += 1;
		} else {
			passwordTitleRectShadow.y += 2;
			passwordTitleRectShadow.y += 2;
		}
		
		// Draw the box
		GUI.Box(passwordBorderRect, "", skin.customStyles[3]);
	//	GUI.Box(passwordTitleRect, DialogUI.dui.actorName, skin.customStyles[4]);

		// Do Title And Shadow
		DoStyleAndShadow( 	passwordTitleRect, passwordTitleRectShadow, skin.customStyles[4], DialogUI.dui.actorName,
							 DialogUI.dui.options.drawBodyTextShadows, DialogUI.dui.options.hideAllBodyTextFromUI  );
		
		// Text field Rect
		passwordTextFieldRect = passwordBorderRect;
		if( !useHD ){
			passwordTextFieldRect.width -= 20;
			passwordTextFieldRect.x += 10;
			passwordTextFieldRect.y += 60;
			passwordTextFieldRect.width -= (128+10);
			passwordTextFieldRect.height = 48;
		} else {
			passwordTextFieldRect.width -= 40;
			passwordTextFieldRect.x += 20;
			passwordTextFieldRect.y += 120;
			passwordTextFieldRect.width -= (256+20);
			passwordTextFieldRect.height = 96;
		}
		
		// Data Entry Button
		passwordButton = passwordTextFieldRect;
		if( !useHD ){
			passwordButton.width = 128;
			passwordButton.x += (passwordTextFieldRect.width+10);
		} else {
			passwordButton.width = 256;
			passwordButton.x += (passwordTextFieldRect.width+20);
		}
		
		// If the Data Entry String is valid ..
		if(DialogUI.dataEntryString!=null){ 
			
			// Find out if we have hit return / enter
			var passwordSubmitText : boolean = false;
			if (Event.current.type == EventType.KeyDown && DialogUI.dui.options.selectGuiWithTheseKeycodes.length > 0 ){
				
				// Cycle through the keycodes and test if we have used it.
				for( var passwordEvent : KeyCode in DialogUI.dui.options.selectGuiWithTheseKeycodes ){
					if(Event.current.keyCode == passwordEvent){
						passwordSubmitText = true;
						break;
					}
				}
			}
			
			// Show the Data Entry Text Field
			GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
			if( DialogUI.passwordMask ){
				DialogUI.dataEntryString = GUI.PasswordField (passwordTextFieldRect, DialogUI.dataEntryString, "*"[0], 255, skin.customStyles[5] );
			} else {
				DialogUI.dataEntryString = GUI.TextField (passwordTextFieldRect, DialogUI.dataEntryString, 255, skin.customStyles[5]); 
			}
			
			// Remove all line breaks
			DialogUI.dataEntryString = DialogUI.dataEntryString.Replace("\n","");
			
			// Set textfield caret to end position
			if( DialogUI.setupTextField && DialogUI.dui.fade >= 0.1 ){
				DialogUI.setupTextField = false;
				var te2 : TextEditor = GUIUtility.GetStateObject(typeof(TextEditor), GUIUtility.keyboardControl) as TextEditor;
				if (te2 != null){te2.MoveCursorToPosition(new Vector2(5555, 5555));}
			}
			
			// Enter Button
			GUI.SetNextControlName(DialogUI.dui.buttonNames[1]);
			dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
			if( LDC_GUIButton(passwordButton, dynamicGUIContent, usingFocusControl ? skins.forceFocusButton : skins.originalFocusButton) || passwordSubmitText ){
				
				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1 && DialogUI.screen){
				
					// If we are matching a token and the token is NOT ""
					if( DialogUI.passwordMatchToToken && 
						DialogUI.dui.tokens.length > 0 && 
						DialogUI.dataEntryToken < DialogUI.dui.tokens.length
					){
					
						// See if the token matches
						if( DialogUI.dui.tokens[DialogUI.dataEntryToken].value == DialogUI.dataEntryString ||
							!DialogUI.passwordCaseSensitive && DialogUI.dui.tokens[DialogUI.dataEntryToken].value.ToLower() == DialogUI.dataEntryString.ToLower()
						){
							Debug.Log("LDC: (DialogUI) The Token Matches - Password Match Successful");
							DialogUI.screen.Yes();
							
						} else {
						
							Debug.Log("LDC: (DialogUI) The Token does NOT match - Password Match Failed");
							DialogUI.screen.No();
						}
					
					// If we are matching a string
					} else if( !DialogUI.passwordMatchToToken ){
					
						// See if the String matches
						if( DialogUI.dataEntryString == DialogUI.passwordAnswer ||
							!DialogUI.passwordCaseSensitive && DialogUI.dataEntryString.ToLower() == DialogUI.passwordAnswer.ToLower()
						){
							Debug.Log("LDC: (DialogUI) The String Matches - Password Match Successful");
							DialogUI.screen.Yes();
							
						} else {
						
							Debug.Log("LDC: (DialogUI) The String does NOT match - Password Match Failed");
							DialogUI.screen.No();
						}
					
						
					
					// If something went wrong
					} else {
						Debug.Log("LDC: (DialogUI) Password Screen Error - This token is probably not setup correctly. Will default as a password failure.");
						DialogUI.screen.No();
					}
				
				
				}
			}
		}
	}
	
	
	// USE TITLE
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.Title ) {
		
		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		//GUI.color = Color.white; 
		GUI.color = DialogUI.titleColor; 
		if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}	
	
		// Setup Rects in HD
		if( useHD ){
			
			titleRect = new Rect(DialogUI.titleOffset.x * 2, DialogUI.titleOffset.y * 2, DialogUI.titleSize.x * 2, DialogUI.titleSize.y * 2);
			titleRectShadow = titleRect;
			titleRectShadow.x += 2;
			titleRectShadow.y += 2;
			
			subtitleRect = new Rect(DialogUI.subtitleOffset.x * 2, DialogUI.subtitleOffset.y * 2, DialogUI.subtitleSize.x * 2, DialogUI.subtitleSize.y * 2);
			subtitleRectShadow = subtitleRect;
			subtitleRectShadow.x += 2;
			subtitleRectShadow.y += 2;
		
		// Setup Rects in Standard definition	
		} else {
			
			titleRect = new Rect(DialogUI.titleOffset.x, DialogUI.titleOffset.y, DialogUI.titleSize.x, DialogUI.titleSize.y );
			titleRectShadow = titleRect;
			titleRectShadow.x += 1;
			titleRectShadow.y += 1;
			
			subtitleRect = new Rect(DialogUI.subtitleOffset.x, DialogUI.subtitleOffset.y, DialogUI.subtitleSize.x, DialogUI.subtitleSize.y);
			subtitleRectShadow = subtitleRect;
			subtitleRectShadow.x += 1;
			subtitleRectShadow.y += 1;
		
		}

		// Override the GUIStyles so we can have custom allignment and font sizes
		titleStyleOverride = new GUIStyle(skin.customStyles[8]);
		subtitleStyleOverride = new GUIStyle(skin.customStyles[7]);

		// Setup Title overrides
		if(DialogUI.overrideTitleFont != null ){ titleStyleOverride.font = DialogUI.overrideTitleFont; }
		if(DialogUI.titleFontSize > 0){ 
			if( DialogUI.titleFontSize > 0 ){
				titleStyleOverride.fontSize = DialogUI.titleFontSize; 
				// Double the size for HD
				if(useHD){ titleStyleOverride.fontSize = titleStyleOverride.fontSize * 2; };
			}

		}
		titleStyleOverride.alignment = DialogUI.titleAllignment;
		
		// Setup Subtitle overrides
		if(DialogUI.overrideSubtitleFont != null ){ subtitleStyleOverride.font = DialogUI.overrideSubtitleFont; }
		if(DialogUI.subtitleFontSize > 0){ 
			if( DialogUI.subtitleFontSize > 0 ){
				subtitleStyleOverride.fontSize = DialogUI.subtitleFontSize; 
				// Double the size for HD
				if(useHD){ subtitleStyleOverride.fontSize = subtitleStyleOverride.fontSize * 2; };
			}
		}
		subtitleStyleOverride.alignment = DialogUI.subtitleAllignment;

		// DO TITLE SCREEN WITHOUT AUTO-SCROLLING
		// Draw Dialog Text normally if we are not using auto scrolling and there are no overrides
		if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.Off && 
			DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault ||
			DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.Off
		){

			// Do Title And Shadow (Title / Actor)
			DoStyleAndShadow( 	titleRect, titleRectShadow, titleStyleOverride, DialogUI.actorName,
							 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );

			// Do Body Text (Subtitle)
			DoStyleAndShadow( 	subtitleRect, subtitleRectShadow, subtitleStyleOverride, DialogUI.currentDialogText,
							 DialogUI.dui.options.drawBodyTextShadows, DialogUI.dui.options.hideAllBodyTextFromUI  );


		// DO TITLE SCREEN WITH AUTO-SCROLLING
		} else if( !DialogUI.dui.options.hideAllTextFromUI ){

			// =============================
			//	DO THE MAIN TITLE NORMALLY
			// =============================

			// Do Title And Shadow (Title / Actor)
			DoStyleAndShadow( 	titleRect, titleRectShadow, titleStyleOverride, DialogUI.actorName,
							 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );

			// =================================
			//	START AUTO-SCROLL FOR SUBTITLE
			// =================================

			// Cache Scrollbar settings
			originalVerticalScrollbar = GUI.skin.verticalScrollbar;
			if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
			){
				GUI.skin.verticalScrollbar = GUIStyle.none;
			}

			// Start The Scroll View
			GUILayout.BeginArea ( subtitleRect );

			// Automatic scroll
			if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
			){
				DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingFixedValue, GUIStyle.none, GUILayout.Width (subtitleRect.width), GUILayout.Height (subtitleRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
			
			// Manually scrolling
			} else {
				DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingValue, GUIStyle.none, GUILayout.Width (subtitleRect.width), GUILayout.Height (subtitleRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
			}

			// =====================
			//	CONTENT
			// =====================

			// Subtitle With Shadow
			if( DialogUI.dui.options.drawBodyTextShadows ){
			 
				// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
				GUI.color = Color.black;
				if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
					GUI.color.a = DialogUI.dui.fade;
				} else {
					GUI.color.a = 1;	
				}

				// Use Typewriter Effect or Not
				if( DialogUI.dui.options.hideAllBodyTextFromUI == false ){

					// Draw Label
				//	GUILayout.Label( DialogUI.currentDialogText, subtitleStyleOverride);
					GUILayout.Label( DialogUI.ReplaceAllRichTextColorToNewColor(  DialogUI.currentDialogText, new Color32( 0, 0, 0, GUI.color.a)), subtitleStyleOverride);


				// If we're hiding the body text, we need to do a trick by rendering it out with no opacity. This is so the GetLastRect will work!	
				} else {
					
					// Set alpha to 0 so we cant see what was drawn to the screen
					GUI.color.a = 0;

					// Draw Label
					GUILayout.Label( DialogUI.currentDialogText, subtitleStyleOverride);

					// Reset the alpha value
					GUI.color = Color.black;
					if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}

				}

				// Cache the last scroll rect to get the height
				theShadowScrollRect = GUILayoutUtility.GetLastRect();
				if(theShadowScrollRect!=null){ 

					// Reverse the shadow offset to do the normal text
					if( !useHD ){
						theShadowScrollRect.x -= 1;
						theShadowScrollRect.y -= 1;
					} else {
						theShadowScrollRect.x -= 2;
						theShadowScrollRect.y -= 2;
					}


					// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
					GUI.color = Color.white; 
					if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}

					// Draw Label
					if( DialogUI.dui.options.hideAllBodyTextFromUI == false ){
						GUI.Label( theShadowScrollRect, DialogUI.currentDialogText, subtitleStyleOverride);
					}
				}
				
			// Subtitle without shadow
			} else {
			
				// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha for the subtitle
				GUI.color = DialogUI.subtitleColor; 
				if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
					GUI.color.a = DialogUI.dui.fade;
				} else {
					GUI.color.a = 1;	
				}

				// Draw label
				if( DialogUI.dui.options.hideAllBodyTextFromUI == false ){

					GUILayout.Label( DialogUI.currentDialogText, subtitleStyleOverride);
				
				// FIX: If we're hiding the body text, we need to do a trick by rendering it out with no opacity. 
				// This is so the GetLastRect will work!	
				} else {
					
					// Set alpha to 0 so we cant see what was drawn to the screen
					GUI.color.a = 0;

					GUILayout.Label( DialogUI.currentDialogText, subtitleStyleOverride);
				
					// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha for the subtitle
					GUI.color = DialogUI.subtitleColor; 
					if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
						GUI.color.a = DialogUI.dui.fade;
					} else {
						GUI.color.a = 1;	
					}
				}
			}

			// ===================
			//	END AUTO-SCROLL
			// ===================

			// Cache the last scroll rect to get the height
			theAutoScrollRect = GUILayoutUtility.GetLastRect();
			if(theAutoScrollRect!=null){ DialogUI.dui.options.autoScrollingHeight = theAutoScrollRect.height - (subtitleRect.height-DialogUI.dui.options.scrollableTextExtraFooterSpace); }

			// End the Scroll view
			GUILayout.EndScrollView ();

			GUILayout.EndArea();

			// Reset vertical scrollbar
			GUI.skin.verticalScrollbar = originalVerticalScrollbar;

		}


		// ----> THIS IS THE BUTTON
		
		// Show Next Button if we've not set it to be hidden
		if( !DialogUI.dui.options.hideAllSingleButtonsFromUI && !DialogUI.hideNextButton ){
			
			// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
			GUI.color = Color.white; 
			if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade;
			} else {
				GUI.color.a = 1;	
			}
		
			// Setup Skip Rect
			if(DialogUI.dui.options.useButtonTransitions){
				
				// If DialogUI.dui.fade has already completed, set up the rect to absolute positions
				if( DialogUI.dui.fade >= 1 ){
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
					}
				} else {
					if( !useHD ){
						skipRect = Rect( buttonOffset.x + 800+(255*(1-DialogUI.dui.fade)), buttonOffset.y + 640-100, 140, 64 );
					} else {
						skipRect = Rect( buttonOffset.x + 1600+(510*(1-DialogUI.dui.fade)), buttonOffset.y + 1280-200, 280, 128 );
					}
				}
				
			} else {
				if( !useHD ){
					skipRect = Rect( buttonOffset.x + 800, buttonOffset.y + 640-100, 140, 64 );
				} else {
					skipRect = Rect( buttonOffset.x + 1600, buttonOffset.y + 1280-200, 280, 128 );
				}
			}
			
			// Draw Skip Button
			GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
			dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
			if( LDC_GUIButton(	skipRect, dynamicGUIContent )  || 
							DialogUI.buttons[0] == true 
			){
				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1){
					if(DialogUI.screen){
						DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
						DialogUI.screen.Skip();
					}
				}
			}
		}
	}

	// USE POPUP IMAGE
	else if ( DialogUI.dialogStyle == DIALOGSTYLE.Popup ) {

		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color = Color.white; 
		if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}

		// -------------------
		//	RECTS
		// -------------------

		// Create the background Rect
		if( !useHD ){
			popupImageBGRect = new Rect( 	(960/2) - (DialogUI.popupSizeX/4), 
											(640/2) - (DialogUI.popupSizeY/4),
											DialogUI.popupSizeX/2,
											DialogUI.popupSizeY/2
										);
		} else {
			popupImageBGRect = new Rect( 	(1920/2) - (DialogUI.popupSizeX/2), 
											(1280/2) - (DialogUI.popupSizeY/2),
											DialogUI.popupSizeX,
											DialogUI.popupSizeY
										);
		}

		// Popup Title
		popupTitle = popupImageBGRect;
		popupTitleShadow = popupTitle;
		if( !useHD ){
			popupTitleShadow.x += 2;
			popupTitleShadow.y += 2;
		} else {
			popupTitleShadow.x += 1;
			popupTitleShadow.y += 1;
		}

		// Button
		if( !useHD ){
			popupButtonRect =	Rect(
										(popupImageBGRect.x + popupImageBGRect.width) - ( (DialogUI.popupButtonSizeX*0.5) + (DialogUI.popupButtonSpacer*0.5) ),
										(popupImageBGRect.y + popupImageBGRect.height) - ( (DialogUI.popupButtonSizeY*0.5)+ (DialogUI.popupButtonSpacer*0.5) ),
										DialogUI.popupButtonSizeX*0.5,
										DialogUI.popupButtonSizeY*0.5
									);
		} else {
			popupButtonRect =	Rect(
										(popupImageBGRect.x + popupImageBGRect.width) - (DialogUI.popupButtonSizeX + DialogUI.popupButtonSpacer ),
										(popupImageBGRect.y + popupImageBGRect.height) - (DialogUI.popupButtonSizeY + DialogUI.popupButtonSpacer ),
										DialogUI.popupButtonSizeX,
										DialogUI.popupButtonSizeY
									);
		}

		// Second Button
		popupButtonRect2 = popupButtonRect; 
		if( !useHD ){
			popupButtonRect2.x -= ( (DialogUI.popupButtonSizeX*0.5)+ (DialogUI.popupButtonSpacer*0.5) );
		} else {
			popupButtonRect2.x -= ( DialogUI.popupButtonSizeX + DialogUI.popupButtonSpacer );
		}


		// Popup text
		popupText = popupTitle;
		if( !useHD ){
			popupText.y += (32+16)+8;
			popupText.height -= (32+16) + (popupButtonRect.height+32);
		} else {
			popupText.y += (64+32)+16;
			popupText.height -= (64+32) + (popupButtonRect.height+64);
		}
		popupTextShadow = popupText;
		if( !useHD ){
			popupTextShadow.x += 2;
			popupTextShadow.y += 2;
		} else {
			popupTextShadow.x += 1;
			popupTextShadow.y += 1;
		}

		// -------------------
		//	BACKGROUND
		// -------------------

		// Draw The background
		GUI.Box(popupImageBGRect, "", skin.customStyles[10]);
		if(DialogUI.popupImage!=null){ 

			// Set background opacity
			if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade*DialogUI.popupBackgroundAlpha;
			} else {
				GUI.color.a = 1*DialogUI.popupBackgroundAlpha;	
			}

			// Draw the background
			GUI.DrawTexture( popupImageBGRect, DoDialogCastAnimation(DialogUI.popupImageAnimation, DialogUI.popupImage) );
		}

		// -------------------
		//	TEXT
		// -------------------

		// Set Opacity
		if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}

		// Do Title And Shadow (Title / Actor)
		DoStyleAndShadow( popupTitle, popupTitleShadow, skin.customStyles[11], DialogUI.actorName,
				 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );


		// Popup Text String
		// Lets make sure we're not hiding the body text
		if( !DialogUI.dui.options.hideAllBodyTextFromUI ){
			
			// ========================
			// DONT USE SCROLLING
			// ========================

			// Draw Dialog Text normally if we are not using auto scrolling and there are no overrides
			if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.Off && 
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault ||
				DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.Off
			){

				// Do Body Text (Subtitle)
				DoStyleAndShadow( 	popupText, popupTextShadow, skin.customStyles[12], DialogUI.currentDialogText,
				 DialogUI.dui.options.drawBodyTextShadows, DialogUI.dui.options.hideAllBodyTextFromUI  );

			// ========================
			//	USE AUTOSCROLLING
			// ========================

			} else {

				// Cache Scrollbar settings
				originalVerticalScrollbar = GUI.skin.verticalScrollbar;
				if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
				){
					GUI.skin.verticalScrollbar = GUIStyle.none;
				}

				// Start The Scroll View
				GUILayout.BeginArea ( popupText );

				// Automatic scroll
				if( DialogUI.dui.options.scrollableDialogText == DIALOG_SCROLLING.AutomaticScrolling && 
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.UseDefault  ||
					DialogUI.scrollingOptions == DIALOG_OVERRIDE_SCROLLING.AutomaticScrolling 
				){
					DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingFixedValue, GUIStyle.none, GUILayout.Width (popupText.width), GUILayout.Height (popupText.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
				
				// Manually scrolling
				} else {
					DialogUI.dui.options.autoScrollingValue = GUILayout.BeginScrollView (DialogUI.dui.options.autoScrollingValue, GUIStyle.none, GUILayout.Width (popupText.width), GUILayout.Height (popupText.height-DialogUI.dui.options.scrollableTextExtraFooterSpace) );
				}

					// Do content here!
					// Body Text Shadow
					if( DialogUI.dui.options.drawBodyTextShadows ){

						// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
						GUI.color = Color.black;
						if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
							GUI.color.a = DialogUI.dui.fade;
						} else {
							GUI.color.a = 1;	
						}

						// Draw Body Name Shadow - using special functions to replace all colors to black
						GUILayout.Label( DialogUI.ReplaceAllRichTextColorToNewColor(  DialogUI.currentDialogText, new Color32( 0, 0, 0, GUI.color.a)), skin.customStyles[12]);

						// Cache the last scroll rect to get the height
  						theShadowScrollRect = GUILayoutUtility.GetLastRect();
  						if(theShadowScrollRect!=null){ 

  							// Reverse the shadow offset to do the normal text
  							if( !useHD ){
								theShadowScrollRect.x -= 1;
								theShadowScrollRect.y -= 1;
							} else {
								theShadowScrollRect.x -= 2;
								theShadowScrollRect.y -= 2;
							}

  							// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
							GUI.color = Color.white; 
							if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
								GUI.color.a = DialogUI.dui.fade;
							} else {
								GUI.color.a = 1;	
							}

							// Draw the normal text
  							GUI.Label(theShadowScrollRect, DialogUI.currentDialogText, skin.customStyles[12] );
  						}

					// Dont draw body text shadows
					} else {

						// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
						GUI.color = Color.white; 
						if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
							GUI.color.a = DialogUI.dui.fade;
						} else {
							GUI.color.a = 1;	
						}

						// Draw Body Name Shadow
						GUILayout.Label(DialogUI.currentDialogText, skin.customStyles[12] );

					}

				// Cache the last scroll rect to get the height
				theAutoScrollRect = GUILayoutUtility.GetLastRect();
				if(theAutoScrollRect!=null){ DialogUI.dui.options.autoScrollingHeight = theAutoScrollRect.height - (popupText.height-DialogUI.dui.options.scrollableTextExtraFooterSpace); 
				}

				// End the Scroll view
				GUILayout.EndScrollView ();
				GUILayout.EndArea();

				// Reset vertical scrollbar
				GUI.skin.verticalScrollbar = originalVerticalScrollbar;

			}
		}

		// Draw First Button		
		GUI.SetNextControlName(DialogUI.dui.buttonNames[0]);
		dynamicGUIContent = new GUIContent(DialogUI.customButton1, DoDialogCastAnimation(DialogUI.buttonIcon1Animation, DialogUI.buttonIcon1) );
		if( LDC_GUIButton( popupButtonRect, dynamicGUIContent )  ||
			DialogUI.buttons[0] == true 
		){
			// Make sure the button has finished fading in first!
			if(DialogUI.dui.fade>=1){
				if(DialogUI.screen){
					DialogUI.buttons[0] = false; // This blocks the action from repeating if we pressed a button.
					if( DialogUI.popupOptions == POPUP_OPTIONS.OneButton ){	
						DialogUI.screen.Skip();
					} else if( DialogUI.popupOptions == POPUP_OPTIONS.TwoButtons ){	
						DialogUI.screen.Yes();
					}
				}
			}
		}

		// Draw Second Button
		if( DialogUI.popupOptions == POPUP_OPTIONS.TwoButtons ){		
			GUI.SetNextControlName(DialogUI.dui.buttonNames[1]);
			dynamicGUIContent = new GUIContent(DialogUI.customButton2, DoDialogCastAnimation(DialogUI.buttonIcon2Animation, DialogUI.buttonIcon2) );
			if( LDC_GUIButton( popupButtonRect2, dynamicGUIContent )  ||
				DialogUI.buttons[1] == true 
			){
				// Make sure the button has finished fading in first!
				if(DialogUI.dui.fade>=1){
					if(DialogUI.screen){
						DialogUI.buttons[1] = false; // This blocks the action from repeating if we pressed a button.
						DialogUI.screen.No();
					}
				}
			}
		}
	}


	// =================
	//	ICON GRID
	// =================

	else if ( DialogUI.dialogStyle == DIALOGSTYLE.IconGrid ) {

		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color = Color.white; 
		if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}

		// ------------------------
		//	RECTS
		// ------------------------

		// Create the background / Window Rect
		if( !useHD ){
			iconGridBGRect = new Rect( 		((960*0.5) - (DialogUI.IG_WindowSizeX*0.25)) + (DialogUI.IG_WindowOffsetX*0.5), 
											((640*0.5) - (DialogUI.IG_WindowSizeY*0.25)) + (DialogUI.IG_WindowOffsetY*0.5) ,
											DialogUI.IG_WindowSizeX*0.5,
											DialogUI.IG_WindowSizeY*0.5
										);
		} else {
			iconGridBGRect = new Rect( 		(1920*0.5) - (DialogUI.IG_WindowSizeX*0.5) + (DialogUI.IG_WindowOffsetX), 
											(1280*0.5) - (DialogUI.IG_WindowSizeY*0.5) + (DialogUI.IG_WindowOffsetY),
											DialogUI.IG_WindowSizeX,
											DialogUI.IG_WindowSizeY
										);
		}
		// Debug.Log( "Window: "+ iconGridBGRect.width + " x " + iconGridBGRect.height);

		// Calculate number of icons
		IG_NumberOfIconsMinusClose = DialogUI.IG_buttons.length;
		if(DialogUI.IG_firstIconIsCloseButton){ IG_NumberOfIconsMinusClose -= 1; }

		// Calculate how many rows we need to 
		// NOTE: total icons / icons per row. If there is a remainder, add an extra row. Always make sure there is at least 1 row.
		IG_NumberOfRows = IG_NumberOfIconsMinusClose / DialogUI.IG_iconsPerRow;
		if( IG_NumberOfIconsMinusClose % DialogUI.IG_iconsPerRow > 0 ){ IG_NumberOfRows++;}
		if( IG_NumberOfRows < 1 ){ IG_NumberOfRows = 1; }

		// Auto-Calculate the Content Size based on icon sizes and rows
		IG_Spacer = DialogUI.IG_IconSpacer; if( !useHD ){ IG_Spacer = IG_Spacer * 0.5; }
		IG_ContentSizeX = (DialogUI.IG_iconSizeX * DialogUI.IG_iconsPerRow) + ((DialogUI.IG_iconsPerRow+1) * IG_Spacer); 

		// Add the Icon Labels into the calculation if we have enabled it!
		if( DialogUI.IG_showIconLabels ){
			IG_ContentSizeY = IG_Spacer + ((DialogUI.IG_iconSizeY+DialogUI.IG_iconLabelSize) * IG_NumberOfRows) + ((IG_NumberOfRows) * IG_Spacer); 
		} else {
			IG_ContentSizeY = IG_Spacer + (DialogUI.IG_iconSizeY * IG_NumberOfRows) + ((IG_NumberOfRows) * IG_Spacer); 
		}

		// Content fix for HD version ... 
		if( useHD ){
			IG_ContentSizeX -= ( (DialogUI.IG_iconsPerRow+1)  * IG_Spacer)*0.5;
			IG_ContentSizeY -= (IG_NumberOfRows * IG_Spacer)*0.5;
		}

		// Figure out the sizes for the Title and Subtitle
		IG_HeaderHeight = 0;	// Reset the total height of the header of the window

		// Title - Use the fixed height if available, or default to 100
		if( DialogUI.IG_WindowShowTitle ){
			IG_TitleRect = iconGridBGRect;
			if( skin.customStyles[13] != null && skin.customStyles[13].fixedHeight > 0){ 
				IG_TitleRect.height =  skin.customStyles[13].fixedHeight; 
				IG_HeaderHeight += skin.customStyles[13].fixedHeight;
			} else {
				if( !useHD ){
					IG_TitleRect.height = 55; 
					IG_HeaderHeight += 55;
				} else {
					IG_TitleRect.height = 110; 
					IG_HeaderHeight += 110;
				}
			}

			// Do Shadow
			IG_TitleRectShadow = IG_TitleRect;
			if( !useHD ){
				IG_TitleRectShadow.x += 1;
				IG_TitleRectShadow.y += 1;
			} else {
				IG_TitleRectShadow.x += 2;
				IG_TitleRectShadow.y += 2;
			}
		}
		
		// SubTitle - Use the fixed height if available, or default to 60
		if( DialogUI.IG_WindowShowSubtitle ){
			IG_SubtitleRect = IG_TitleRect;
			if( !DialogUI.IG_WindowShowTitle ){ IG_SubtitleRect = iconGridBGRect; };

			if( skin.customStyles[14] != null && skin.customStyles[14].fixedHeight > 0){ 
				IG_SubtitleRect.height =  skin.customStyles[14].fixedHeight;
				IG_SubtitleRect.y += IG_TitleRect.height;
				IG_HeaderHeight += skin.customStyles[14].fixedHeight;
			} else {
				if( !useHD ){
					IG_SubtitleRect.height = 36;
					if( DialogUI.IG_WindowShowTitle ){ IG_SubtitleRect.y += IG_TitleRect.height; }
					IG_HeaderHeight += 36;
				} else {
					IG_SubtitleRect.height = 72;
					if( DialogUI.IG_WindowShowTitle ){ IG_SubtitleRect.y += IG_TitleRect.height; }
					IG_HeaderHeight += 72;
				}
			}

			// Do Shadow
			IG_SubtitleRectShadow = IG_SubtitleRect;
			if( !useHD ){
				IG_SubtitleRectShadow.x += 1;
				IG_SubtitleRectShadow.y += 1;
			} else {
				IG_SubtitleRectShadow.x += 2;
				IG_SubtitleRectShadow.y += 2;
			}
		}

		// Create the Actual Scroll Rect - based on the window rect and the header space
		IG_ActualScrollRect = iconGridBGRect;
		if( IG_HeaderHeight > 0 ){
			IG_ActualScrollRect.y += IG_HeaderHeight;
			IG_ActualScrollRect.height -= IG_HeaderHeight;
		}
		// Add a spacer in between the text and the content, and the bottom.
		if(DialogUI.IG_AddSpaceBetweenSubtitleAndContent){
			IG_ActualScrollRect.y += IG_Spacer;
			IG_ActualScrollRect.height -= IG_Spacer; //*2;
		}

		// Create the Inner Content Rect
		if( !useHD ){
			iconGridICRect = new Rect( 		0, 
											IG_HeaderHeight,
											IG_ContentSizeX,
											IG_ContentSizeY
										);
		} else {
			iconGridICRect = new Rect( 		0, 
											IG_HeaderHeight,
											IG_ContentSizeX*2,
											IG_ContentSizeY*2
										);
		}
		

	//	Debug Window and Content Rect Sizes
	//	Debug.Log( "Window: "+ IG_ActualScrollRect.width + " x " + IG_ActualScrollRect.height);
	//	Debug.Log( "Content: "+ iconGridICRect.width + " x " + iconGridICRect.height);

		// ------------------------
		//	BACKGROUND
		// ------------------------

		// Draw The background
		if(DialogUI.IG_showPanelBG){ GUI.Box(iconGridBGRect, "", skin.customStyles[10]); }
		if(DialogUI.popupImage!=null){ 

			// Set background opacity
			if( DialogUI.dui.options.useButtonFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade*DialogUI.IG_BackgroundAlpha;
			} else {
				GUI.color.a = 1*DialogUI.IG_BackgroundAlpha;	
			}

			// Draw the background
			GUI.DrawTexture( iconGridBGRect, DoDialogCastAnimation(DialogUI.popupImageAnimation, DialogUI.popupImage) );
		}

		// ------------------------
		//	TITLE / SUBTITLE TEXT
		// ------------------------

		// Make sure we're not hiding all the title text
		if( DialogUI.IG_WindowShowTitle ){
			
			// Do Title
			DoStyleAndShadow( 	IG_TitleRect, IG_TitleRectShadow, skin.customStyles[13], DialogUI.actorName,
				 DialogUI.dui.options.drawTitleTextShadows, DialogUI.dui.options.hideAllTitleTextFromUI  );
		}

		// Lets make sure we're not hiding the body text
		if( DialogUI.IG_WindowShowSubtitle ){

			// Do Body Text (Subtitle)
			DoStyleAndShadow( 	IG_SubtitleRect, IG_SubtitleRectShadow, skin.customStyles[14], DialogUI.currentDialogText,
				 DialogUI.dui.options.drawBodyTextShadows, DialogUI.dui.options.hideAllBodyTextFromUI  );
		}


		// ------------------------
		//	SCROLL VIEW
		// ------------------------

		// Make there are icons setup ...
		if(DialogUI.IG_buttons != null && DialogUI.IG_buttons.length > 0){ // replace later
			
			// Reset counter and start from the beginning
			IG_CurrentIcon = 0;

			// Modify the Button Style for the Custom Icon Grid
			if(!DialogUI.IG_showButtonBackgrounds){
				IG_ModifiedButtonStyle = new GUIStyle(skin.button);
				IG_ModifiedButtonStyle.normal.background = null;
				IG_ModifiedButtonStyle.hover.background = null;
				IG_ModifiedButtonStyle.active.background = null;
				IG_ModifiedButtonStyle.focused.background = null;
				IG_ModifiedButtonStyle.imagePosition = DialogUI.IG_buttonImagePosition;
				IG_ModifiedButtonStyle.alignment = DialogUI.IG_buttonAllignment;
				if( DialogUI.IG_AddInnerIconSpacing > 0){
					IG_ModifiedButtonStyle.padding.left += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.right += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.top += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.bottom += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
				}

			} else {
				IG_ModifiedButtonStyle = new GUIStyle(skin.button);
				IG_ModifiedButtonStyle.imagePosition = DialogUI.IG_buttonImagePosition;
				IG_ModifiedButtonStyle.alignment = DialogUI.IG_buttonAllignment;
				if( DialogUI.IG_AddInnerIconSpacing > 0){
					IG_ModifiedButtonStyle.padding.left += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.right += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.top += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
					IG_ModifiedButtonStyle.padding.bottom += (useHD ? DialogUI.IG_AddInnerIconSpacing : DialogUI.IG_AddInnerIconSpacing * 0.5);
				}
			}
			
			// If we have enabled the close button
			if(DialogUI.IG_firstIconIsCloseButton){

				// Calculate The Rect
				if( !useHD ){
					IG_Close_Btn = new Rect(
												(iconGridBGRect.x + iconGridBGRect.width) - (skin.customStyles[10].margin.right + (DialogUI.IG_closeButtonSize*0.5)),
												iconGridBGRect.y + skin.customStyles[10].margin.top,
												DialogUI.IG_closeButtonSize*0.5,
												DialogUI.IG_closeButtonSize*0.5
											);
				} else {
					IG_Close_Btn = new Rect(
												(iconGridBGRect.x + iconGridBGRect.width) - (skin.customStyles[10].margin.right + (DialogUI.IG_closeButtonSize)),
												iconGridBGRect.y + skin.customStyles[10].margin.top,
												DialogUI.IG_closeButtonSize,
												DialogUI.IG_closeButtonSize
											);
				}

				// Draw The Button
				GUI.enabled = !DialogUI.IG_buttons[IG_CurrentIcon].logicFailed;
				GUI.SetNextControlName(DialogUI.dui.buttonNames[IG_CurrentIcon]);
				dynamicGUIContentMultiple = new GUIContent( DialogUI.IG_buttons[IG_CurrentIcon].title, DoDialogCastAnimation(DialogUI.IG_buttons[IG_CurrentIcon].dca, DialogUI.IG_buttons[IG_CurrentIcon].buttonIcon ) );
				if( LDC_GUIButton(IG_Close_Btn, dynamicGUIContentMultiple, IG_ModifiedButtonStyle ) || DialogUI.buttons[IG_CurrentIcon] == true ){

					// Make sure the button passed logic and has finished fading in first!
					if( DialogUI.IG_buttons[IG_CurrentIcon].logicFailed == false && DialogUI.dui.fade>=1){
						if(DialogUI.screen){
							DialogUI.buttons[IG_CurrentIcon] = false; // This blocks the action from repeating if we pressed a button.
							DialogUI.screen.IconGridNext(IG_CurrentIcon);
						//	Debug.Log("Clicked Button: "+ IG_CurrentIcon + "   ("+ DialogUI.dui.buttonNames[IG_CurrentIcon] +")" );
						}
					}
				}

				// Reset GUI Enabled
				GUI.enabled = true;


				// Make sure the Current Icon starts at 1 during the for loop
				IG_CurrentIcon = 1;
			}
			

			
			// Set up the Scroll View
			DialogUI.scrollPosition = GUI.BeginScrollView( IG_ActualScrollRect, DialogUI.scrollPosition, iconGridICRect, DialogUI.IG_useXScrolling, DialogUI.IG_useYScrolling);
				

				// Loop through each row and column ...
				for( var IG_row : int = 0; IG_row < IG_NumberOfRows; IG_row++ ){
					for( var IG_col : int = 0; IG_col < DialogUI.IG_iconsPerRow; IG_col++ ){
							
						// Make sure we're within range
						if( IG_CurrentIcon < DialogUI.IG_buttons.length ){
							
							// Calculate The Rect
							if( !useHD ){
								IG_Btn = new Rect(	
													IG_Spacer + (IG_col * DialogUI.IG_iconSizeX) + (IG_col * IG_Spacer),
													IG_HeaderHeight + IG_Spacer + (IG_row * (DialogUI.IG_iconSizeY+DialogUI.IG_iconLabelSize)) + (IG_row * IG_Spacer),
													DialogUI.IG_iconSizeX,
													DialogUI.IG_iconSizeY
												);
							} else {
								IG_Btn = new Rect(	
													IG_Spacer + (IG_col * DialogUI.IG_iconSizeX*2) + (IG_col * IG_Spacer),
													IG_HeaderHeight + IG_Spacer + (IG_row * (DialogUI.IG_iconSizeY+DialogUI.IG_iconLabelSize)*2) + (IG_row * IG_Spacer),
													DialogUI.IG_iconSizeX*2,
													DialogUI.IG_iconSizeY*2
												);	
							}

							// Do the Button Labels
							if( DialogUI.IG_showIconLabels ){

								// Setup the Label Rect
								IG_Btn_Label = IG_Btn;
								IG_Btn_Label.y += IG_Btn.height;
								IG_Btn_Label.height += DialogUI.IG_iconLabelSize;

								// If this button's logic has failed, add 50% opacity to the label...
								if(DialogUI.IG_buttons[IG_CurrentIcon].logicFailed){ GUI.color.a = DialogUI.dui.fade * 0.5; }

								// Draw Label
								if( !DialogUI.dui.options.hideAllTextFromUI && !DialogUI.dui.options.hideAllBodyTextFromUI ){
									GUI.Label(IG_Btn_Label, DialogUI.IG_buttons[IG_CurrentIcon].logicFailed ? DialogUI.IG_buttons[IG_CurrentIcon].failedLabel : DialogUI.IG_buttons[IG_CurrentIcon].label, skin.customStyles[15] );
								}

								// Restore alpha
								if(DialogUI.IG_buttons[IG_CurrentIcon].logicFailed){ GUI.color.a = DialogUI.dui.fade; }
							}

							// Record the last Rect we used - we use this for scrolling keyboard focus
							DialogUI.IG_buttons[IG_CurrentIcon].currentRect = IG_Btn;

							// Draw The Button
							GUI.enabled = !DialogUI.IG_buttons[IG_CurrentIcon].logicFailed;
							GUI.SetNextControlName(DialogUI.dui.buttonNames[IG_CurrentIcon]);
							dynamicGUIContentMultiple = new GUIContent( DialogUI.IG_buttons[IG_CurrentIcon].title, DoDialogCastAnimation(DialogUI.IG_buttons[IG_CurrentIcon].dca, DialogUI.IG_buttons[IG_CurrentIcon].buttonIcon ) );
							if( LDC_GUIButton(IG_Btn, dynamicGUIContentMultiple, IG_ModifiedButtonStyle ) || DialogUI.buttons[IG_CurrentIcon] == true ){

								// Make sure the button passed logic and has finished fading in first!
								if(DialogUI.IG_buttons[IG_CurrentIcon].logicFailed == false && DialogUI.dui.fade>=1){
									if(DialogUI.screen){
										DialogUI.buttons[IG_CurrentIcon] = false; // This blocks the action from repeating if we pressed a button.
										DialogUI.screen.IconGridNext(IG_CurrentIcon);
									//	Debug.Log("Clicked Button: "+ IG_CurrentIcon + "   ("+ DialogUI.dui.buttonNames[IG_CurrentIcon] +")" );
									}
								}
							}

							// Reset GUI Enabled
							GUI.enabled = true;
							
						}
						
						// Update Current Icon
						IG_CurrentIcon++;
						

					}
				}
						
			// End the Scroll View
			GUI.EndScrollView();
		
		}
			
	
	// <- End of Icon Grid
	}


	// =================
	//	PORTRAIT
	// =================

	if( DialogUI.portrait != null && 
		DialogUI.dialogStyle != DIALOGSTYLE.MultipleButtons &&
		DialogUI.dialogStyle != DIALOGSTYLE.DataEntry &&
		DialogUI.dialogStyle != DIALOGSTYLE.Password &&
		DialogUI.dialogStyle != DIALOGSTYLE.Popup
	){
		
		DoPortrait();
	}

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO STYLE AND SHADOW
//	Draws a style and automatically adds shadows if setup to do so
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// R = OriginalRect, SR = Shadow Rect, OGS = Original GUI Style, textToDisplay = text to show, drawShadows should be a forward of either
// drawTitleTextShadows or drawBodyTextShadows, hideText should either be HideAllTitleTextFromUI, or HideAllBodyTextFromUI
function DoStyleAndShadow( R : Rect, SR : Rect, OGS : GUIStyle, textToDisplay : String, drawShadows : boolean, hideText : boolean ){

	// Body Text Shadow
	if( drawShadows == true ){

		// =========================
		//	BACKGROUND
		// =========================

		// First Draw the background without text if one has been setup
		if( OGS.normal.background != null ){

			GUI.color = Color.white; 
			GUI.contentColor = Color.white;
			if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade;
			} else {
				GUI.color.a = 1;	
			}

			// Background
			GUI.Label( R, "", OGS );

		}

		// =========================
		//	SHADOW
		// =========================

		if( DialogUI.dui.options.hideAllTextFromUI == false && hideText == false ){
		
			// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
			GUI.contentColor = Color.black;
			if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
				GUI.color.a = DialogUI.dui.fade;
			} else {
				GUI.color.a = 1;	
			}
			
			// Create a new style based on the old one, but without a background
			subtitleShadowStyle = new GUIStyle( OGS );	// subtitleShadowStyle is already defined as a private variable!
			if( DialogUI.dui.options.drawBodyTextShadows ){
				subtitleShadowStyle.normal.background = null;
			}

			// Draw the shadow of text with the new style
			GUI.Label( SR, DialogUI.ReplaceAllRichTextColorToNewColor(  textToDisplay, new Color32( 0, 0, 0, GUI.color.a)), subtitleShadowStyle );

			// =========================
			//	TEXT
			// =========================

			// Reset content color and  
			GUI.contentColor = Color.white;

			// Draw Dialog Text
			GUI.Label( R, textToDisplay, subtitleShadowStyle );
		}

	// Without shadows
	} else {

		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		GUI.color = Color.white; 
		if( DialogUI.dui.options.useTextFades || DialogUI.dui.alpha < 1){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}

		// If we shouldn't hide text, draw the style with the text
		if( DialogUI.dui.options.hideAllTextFromUI == false && hideText == false ){

			// Draw Dialog Text
			GUI.Label( R, textToDisplay, OGS );

		// Otherwise just draw the style without text
		} else {

			// Draw Dialog Without text
			GUI.Label( R, "", OGS );

		}
		
	}
}	




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	FOCUS UPDATE SCROLL VIEWS
//	When moving the focus with the keyboard in the IconGrid style, we try to move to the correct position in the scrollview.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

private var focusScrollRect : Rect = new Rect();
function FocusUpdateScrollViews(){

	// Icon Grid
	if(DialogUI.dialogStyle == DIALOGSTYLE.IconGrid){

	//	Debug.Log("Update Icon Grid Focus");

		// Make sure we have enough buttons to match the selection
		if( DialogUI.IG_buttons != null && DialogUI.currentSelection != null &&
			DialogUI.currentSelection >= 0 &&
			DialogUI.IG_buttons.length > DialogUI.currentSelection &&
			DialogUI.IG_buttons[DialogUI.currentSelection] != null &&
			DialogUI.IG_buttons[DialogUI.currentSelection].currentRect != null
		){

			// Cache the focusRect and create a new destination Vector2
			focusScrollRect = DialogUI.IG_buttons[DialogUI.currentSelection].currentRect;
			destinationScrollViewMove = new Vector2( focusScrollRect.x - IG_Spacer - iconGridICRect.x, focusScrollRect.y - (iconGridICRect.y + IG_Spacer) );

			// Set the position
			StopCoroutine("SmoothScrollViewMove");
			StartCoroutine( "SmoothScrollViewMove", destinationScrollViewMove );

		}
	}
}

private var destinationScrollViewMove : Vector2 = new Vector2();
var SmoothScrollViewMoveTimeOut : float = 0;
function SmoothScrollViewMove( newPosition : Vector2 ){

	// Set TimeOut
	SmoothScrollViewMoveTimeOut = 2.0;

	// Make sure the Dialog is still playing ...
	if(!DialogUI.ended && DialogUI.dialogStyle == DIALOGSTYLE.IconGrid ){
		while( 	SmoothScrollViewMoveTimeOut > 0 &&
				// If we're using the first icon as a close button, only scroll to a new button if its not the close button...
				(DialogUI.IG_firstIconIsCloseButton && DialogUI.currentSelection > 0 && DialogUI.scrollPosition != destinationScrollViewMove ||
				// Otherwise, if we're not using a close button, always scroll towards the current button ...
				!DialogUI.IG_firstIconIsCloseButton && DialogUI.scrollPosition != destinationScrollViewMove)
		){
			SmoothScrollViewMoveTimeOut -= Time.deltaTime;
			DialogUI.scrollPosition = Vector2.MoveTowards(	DialogUI.scrollPosition, destinationScrollViewMove, 
															Mathf.Max(iconGridICRect.width, iconGridICRect.height) * (Time.deltaTime*1.5) );
			yield;
		}
	}
}
// guiDeltaTime

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO PORTRAIT
//	Draws the Portrait in OnGUI
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

private var portraitSize : Vector2 = Vector2(512,512);
private var portraitOffset : Vector2 = Vector2(0,0);
function DoPortrait(){

	// Setup the size if we have the custom DialogUI.portrait style available
	if( skin.customStyles.length >= 7 && skin.customStyles[6] != null ){
		portraitSize = Vector2( skin.customStyles[6].fixedWidth, skin.customStyles[6].fixedHeight );
		portraitOffset = skin.customStyles[6].contentOffset;

	// Otherwise set it up on the fly...	
	} else {
		if( !useHD ){
			portraitSize = Vector2( 256, 256 );
		} else {
			portraitSize = Vector2( 512, 512 );
		}	
	}
	
	// We are not allowing any FADE INs on this DialogUI.screen
	if( DialogUI.noPortraitFadeIn && DialogUI.status == DUISTATUS.SHOW ) {
	
		// Set color to full opacity
		GUI.color.a = 1;
		
		// Setup the rect
		if( !useHD ){
			portraitRect = Rect(portraitOffset.x, 640-(portraitSize.y-1), portraitSize.x, portraitSize.y );
		} else {
			portraitRect = Rect(portraitOffset.x, 1280-(portraitSize.y-2), portraitSize.x, portraitSize.y );
		}
		
		// Draw Portrait
		if( DialogUI.portraitAnimation != null && DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DoDialogCastAnimation(DialogUI.portraitAnimation, DialogUI.portrait), ScaleMode.StretchToFill, true );
		} else if( DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DialogUI.portrait, ScaleMode.StretchToFill, true );
		}
		
	// We are not allowing any FADE OUTs on this DialogUI.screen
	} else if( DialogUI.noPortraitFadeOut && (DialogUI.status == DUISTATUS.FADEOUT || DialogUI.status == DUISTATUS.WAITFORSCREEN) ) {
	
		// Set color to full opacity
		GUI.color.a = 1;
		
		// Setup the rect
		if( !useHD ){
			portraitRect = Rect(portraitOffset.x, 640-(portraitSize.y-1), portraitSize.x, portraitSize.y );
		} else {
			portraitRect = Rect(portraitOffset.x, 1280-(portraitSize.y-1), portraitSize.x, portraitSize.y );
		}
		
		// Draw Portrait
		if( DialogUI.portraitAnimation != null && DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DoDialogCastAnimation(DialogUI.portraitAnimation, DialogUI.portrait), ScaleMode.StretchToFill, true );
		} else if( DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DialogUI.portrait, ScaleMode.StretchToFill, true );
		}
	
	// Otherwise ..
	} else {

		// Setup the DialogUI.dui.fade in / out DialogUI.dui.alpha
		if( DialogUI.dui.options.usePortraitFades || DialogUI.dui.alpha < 1 ){
			GUI.color.a = DialogUI.dui.fade;
		} else {
			GUI.color.a = 1;	
		}
	
		// Setup the rect
		if( DialogUI.dui.options.usePortraitTransitions ){

			if( DialogUI.dui.fade >= 1){
				if( !useHD ){
					portraitRect = Rect(portraitOffset.x-((portraitSize.x-1)*(0) ), portraitOffset.y+ (640-(portraitSize.y-1)), portraitSize.x, portraitSize.y);
				} else {
					portraitRect = Rect(portraitOffset.x-((portraitSize.x-1)*(0) ), portraitOffset.y+ (1280-(portraitSize.y-1)), portraitSize.x, portraitSize.y);
				}
				
			} else {
				if( !useHD ){
					portraitRect = Rect(portraitOffset.x-((portraitSize.x-1)*(1-DialogUI.dui.fade)), portraitOffset.y+ (640-(portraitSize.y-1)), portraitSize.x, portraitSize.y);
				} else {
					portraitRect = Rect(portraitOffset.x-((portraitSize.x-1)*(1-DialogUI.dui.fade)), portraitOffset.y+ (1280-(portraitSize.y-1)), portraitSize.x, portraitSize.y);
				}
			}
			
		} else {
			
			// Setup the rect
			if( !useHD ){
				portraitRect = Rect(portraitOffset.x, 640-(portraitSize.y-1), portraitSize.x, portraitSize.y );
			} else {
				portraitRect = Rect(portraitOffset.x, 1280-(portraitSize.y-1), portraitSize.x, portraitSize.y );
			}
		}
		
		// Draw Portrait
		if( DialogUI.portraitAnimation != null && DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DoDialogCastAnimation(DialogUI.portraitAnimation, DialogUI.portrait), ScaleMode.StretchToFill, true );
		} else if( DialogUI.portrait != null ){
			GUI.DrawTexture(portraitRect, DialogUI.portrait, ScaleMode.StretchToFill, true );
		}
	}	
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO DIALOG CAST ANIMATION
//	Returns the correct frame of animation from a DialogCastActor animation - as a Texture2D
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DoDialogCastAnimation( anim : DialogCastActor, backupTex : Texture2D ){

	// Make sure we've sent an DialogCastActor (Animation) and its set to animate
	if( anim!=null && anim.animated && anim.frames[anim.currentFrame]!=null ){
		
		// Return the correct animation frame
		return(anim.frames[anim.currentFrame]);
	}
	
	// If something is wrong, return the backup tex
	return backupTex;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	DO DIALOG CAST ANIMATION UPDATE
//	Handles the timing functions via Update - doesnt return any textures
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DoDialogCastAnimationUpdate (anim : DialogCastActor ){
	
	// Make sure we've sent an DialogCastActor (Animation) and its set to animate
	if( anim!=null && anim.animated ){
			
		// Add time to the timer
		anim.timer += Time.deltaTime;
		
		// if timer has reached the animation speed, move to the next frame
		if( anim.timer >= anim.animationSpeed ){
			anim.currentFrame++;
			anim.timer = 0;
		}
		
		// If current frame is larger than the array, loop back to the appropriate frame
		if(anim.currentFrame > anim.frames.length-1 ){
			anim.currentFrame = Mathf.Clamp( anim.loopToFrame, 0, anim.frames.length-1 );
		}
	}
	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//	LDC GUI BUTTON
//	Abstraction for built-in GUI.Button
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LDC_GUIButton( r : Rect, s : String ) : boolean {

	// Check for rollovers in PB
	#if UNITY_POSTBRUTAL
		var r2 : Rect = r;
		if(DialogUI.dialogStyle == DIALOGSTYLE.IconGrid ){	// Apply the Scroll Rect offset if we're using Icon Grids ...
			r2.x += IG_ActualScrollRect.x;
			r2.y += IG_ActualScrollRect.y - (DialogUI.scrollPosition.y + iconGridICRect.y );
		}
		if( MainUI.MatrixMouseContains( r2 ) ){ Engine.com.cursor.isButton = 0.15; }
	#endif

	// If the user clicked this button
	if( GUI.Button(r, s ) ){
		DialogUI.PlayButonAudio();
		return true;
	}

	// Return false by default
	return false;
}

function LDC_GUIButton( r : Rect, c : GUIContent ) : boolean {

	// Check for rollovers in PB
	#if UNITY_POSTBRUTAL
		var r2 : Rect = r;
		if(DialogUI.dialogStyle == DIALOGSTYLE.IconGrid ){	// Apply the Scroll Rect offset if we're using Icon Grids ...
			r2.x += IG_ActualScrollRect.x;
			r2.y += IG_ActualScrollRect.y - (DialogUI.scrollPosition.y + iconGridICRect.y );
		}
		if( MainUI.MatrixMouseContains( r2 ) ){ Engine.com.cursor.isButton = 0.15; }
	#endif

	// If the user clicked this button
	if( GUI.Button(r, c ) ){
		DialogUI.PlayButonAudio();
		return true;
	}

	// Return false by default
	return false;
}

function LDC_GUIButton( r : Rect, c : GUIContent, s : GUIStyle ) : boolean {

	// Check for rollovers in PB
	#if UNITY_POSTBRUTAL
		var r2 : Rect = r;
		if(DialogUI.dialogStyle == DIALOGSTYLE.IconGrid ){	// Apply the Scroll Rect offset if we're using Icon Grids ...
			r2.x += IG_ActualScrollRect.x;
			r2.y += IG_ActualScrollRect.y - (DialogUI.scrollPosition.y + iconGridICRect.y );
		}
		if( MainUI.MatrixMouseContains( r2 ) ){ Engine.com.cursor.isButton = 0.15; }
	#endif

	// If the user clicked this button
	if( GUI.Button(r, c, s ) ){
		DialogUI.PlayButonAudio();
		return true;
	}

	// Return false by default
	return false;
}
