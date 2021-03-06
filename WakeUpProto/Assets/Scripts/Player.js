var maximumHitPoints = 100.0;
var hitPoints = 100.0;

var heartRate : float = 100.0;
var MAX_HEARTBEATS : float = 100.0;
var MIN_HEARTBEATS : float = 0.0;
var deathOn : boolean;

var DELAYED_START : float = 2.0;


private var deltaHeartRate : float;

// Player attributes
private var player : GameObject;
private var playerMovement : CharacterMotorMovement;
private var playerSpeed : float;
private var maxSpeed : float;
private var currentLevel : int;

// Visual Effect
private var vignette : Vignetting;
var vignetteScale : float;

function Awake () {
	Screen.lockCursor = true;
	
	// Player values
	player = GameObject.FindGameObjectWithTag("Player");
	playerMovement = player.GetComponentInChildren(CharacterMotor).movement;
	maxSpeed = player.GetComponent(CharacterMotor).movement.maxForwardSpeed;
	
	vignette = player.GetComponentInChildren(Vignetting);
	vignette.blurSpread = 10;
	
	currentLevel = Application.loadedLevel;
	
	playerMaxSpeedWalking = playerMovement.maxForwardSpeed;
}

// For Heart Rate
private var playerMaxSpeedWalking : float;
var playerMaxSpeedRunning : float;
function FixedUpdate () { 
	CheckMouseLocking();
	
	//Controls added on:
	if ( Input.GetKey(KeyCode.LeftShift) ) {
		playerMovement.maxForwardSpeed   = playerMaxSpeedRunning;
		playerMovement.maxBackwardsSpeed = playerMaxSpeedRunning;
		playerMovement.maxSidewaysSpeed  = playerMaxSpeedRunning;
		maxSpeed = playerMaxSpeedRunning;
	} else {
		playerMovement.maxForwardSpeed  = playerMaxSpeedWalking;
		playerMovement.maxBackwardsSpeed = playerMaxSpeedWalking;
		playerMovement.maxSidewaysSpeed  = playerMaxSpeedWalking;
		maxSpeed = playerMaxSpeedWalking;
	}
	
	
	//Speed info:
	playerSpeed = playerMovement.velocity.magnitude;
	
	// Hacky, ccould be improved.
	deltaHeartRate = Mathf.Tan((playerSpeed / (maxSpeed/2)) - 1) * Time.fixedDeltaTime * 10;
	if (heartRate <= 10 && deltaHeartRate <= 0) {
		deltaHeartRate /= 10;
		//ApplyDamage(0.1);
	}
	if (DELAYED_START > 0) {
		DELAYED_START -= Time.fixedDeltaTime;
	} else {
		heartRate += deltaHeartRate/2;
	}
	
	if ( heartRate <= MIN_HEARTBEATS ) {
		heartRate = MIN_HEARTBEATS;
	}	
	if ( heartRate >= MAX_HEARTBEATS )
		heartRate = MAX_HEARTBEATS;
	
	vignette.intensity = (100 - heartRate) * vignetteScale;
}

function ApplyDamage (damage : float) {
	if (hitPoints < 0.0)
		return;

	// Apply damage
	hitPoints -= damage;
	print("player health: " + hitPoints);

	// Play pain sound when getting hit - but don't play so often
	/*
	if (Time.time > gotHitTimer && painBig && painLittle) {
		// Play a big pain sound
		if (hitPoints < maximumHitPoints * 0.2 || damage > 20) {
			audio.PlayOneShot(painBig, 1.0 / audio.volume);
			gotHitTimer = Time.time + Random.Range(painBig.length * 2, painBig.length * 3);
		} else {
			// Play a small pain sound
			audio.PlayOneShot(painLittle, 1.0 / audio.volume);
			gotHitTimer = Time.time + Random.Range(painLittle.length * 2, painLittle.length * 3);
		}
	} */

	// Are we dead?
	if (hitPoints < 0.0 && deathOn)
		Die();
}

function Die () {
	hitPoints = 0.0;
	/*
	if (die)
		AudioSource.PlayClipAtPoint(die, transform.position);
	*/
	// Disable all script behaviours (Essentially deactivating player control)
	var coms : Component[] = GetComponentsInChildren(MonoBehaviour);
	for (var b in coms) {
		var p : MonoBehaviour = b as MonoBehaviour;
		if (p)
			p.enabled = false;
	}
	
	LevelLoadFade.FadeAndLoadLevel(Application.loadedLevel, Color.white, 2.0);
}

//Debug - draw the heartbeat on the gui
function OnGUI () {
	var scaledHeartRate : float = Mathf.Floor(heartRate) + 60.0f;
	GUI.TextArea(new Rect(10, 10, 100, 20), "Heart Rate: " + scaledHeartRate);
	GUI.TextArea(new Rect(10, 30, 100, 20), "Health: " + Mathf.Floor(hitPoints));
	
	//GUI.TextArea(new Rect(40, 50, 80, 20), "" + playerSpeed);
	//GUI.TextArea(new Rect(120, 50, 80, 20), "" + deltaHeartRate);
	
	if (GUI.Button(Rect(20,Screen.height-40,100,30),"Quit Game")){
      LevelLoadFade.FadeAndLoadLevel("Start", Color.white, 2.0);
     } 
}


// Mouse Locking
private var wasLocked = false;
function CheckMouseLocking() {
	// In standalone player we have to provide our own key
    // input for unlocking the cursor
    if (Input.GetKeyDown ("escape")) {	// Currently only locks the cursor
        Screen.lockCursor = false;
    }
    if (Input.GetKeyDown ("l")) {	// Currently only locks the cursor
        Screen.lockCursor = true;
    }
    
    // Did we lose cursor locking?
    // eg. because the user pressed escape
    // or because he switched to another application
    // or because some script set Screen.lockCursor = false;
    if (!Screen.lockCursor && wasLocked) {
        wasLocked = false;
        DidUnlockCursor();
    }
    // Did we gain cursor locking?
    else if (Screen.lockCursor && !wasLocked) {
        wasLocked = true;
        DidLockCursor ();
    }
}

// Called when the cursor is actually being locked
function DidLockCursor () {
    Debug.Log("Locking cursor");
}

// Called when the cursor is being unlocked
// or by a script calling Screen.lockCursor = false;
function DidUnlockCursor () {
    Debug.Log("Unlocking cursor");

}

