ig.module (
    
    'game.ents.local-player'
)

.requires(
    
    'game.ents.player'
)
.defines(function(){

    EntityLocalPlayer = EntityPlayer.extend({
	
	isLocal: true,
	
	speed: 69,
	runSpeed: 138,
	walkSpeed: 69,
	jumpSpeed: 69,
	maxVel: { x: 138, y: 138 },
	moveState: 'idle', // idle, walk, run
	
	size: {x: 16, y: 16},
	offset: { x: 0, y: 16 },
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE,
	animSheet: new ig.AnimationSheet( 'media/people/rs.boy.png', 16, 32 ),
	
	lastState: '', // used to only send network move updates if change occurs
    
	facing: '',
	facingLast: '',
	isMove: false, // waiting for move key-press
	isJump: false,
	leftFoot: true, // used to alternate step animations
	destination: 0, // used for both x and y planes
	moveWaiting: false, // used for waiting while a door opens
	moveWhen: 0, // system time in ms to wait before moving
	moveDoor: false, // contains exit entity to use after moveWhen
	moveCommitPending: false, // helps decide whether to move or just change direction
	moveCommitWhen: 0, // system time in ms when will commit to a move
	moveCommitDirection: '',
	
	skin: 'labgeek',
	
	netInit: function()
	{
	    socket.emit('hereIAm', this.pos.x, this.pos.y, this.facing, ig.game.mapName, this.skin);	
	}
	
	startMove: function()
	{
	    // determine speed (running or walking)
	    if(ig.input.state('run'))
	    {
		this.moveState = 'run';
		this.speed = this.runSpeed;
	    }
	    else
	    {
		this.moveState = 'walk';
		this.speed = this.walkSpeed;
	    }
	    
	    this.isMove = true;
	    setMoveDestination(this);
	    
	    var newGrass = facingGrass(this);
	    if(newGrass) newGrass.play();
	    
	    moveAnimStart(this, true);
	    
	    // send movement update only when change occurs
	    if( this.facingLast != this.facing || this.lastState != this.moveState )
	    {
		emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
		this.lastState  = this.moveState;
	    }
	    
	    this.facingLast = this.facing;
	},
	
	startJump: function()
	{
	    // determine speed
	    this.moveState = 'jump';
	    this.speed = this.jumpSpeed;
	    
	    this.isJump = true;
	    this.jumpStart = new ig.Timer();
	    spawnShadow(this);
	    setMoveDestination(this);
		    
	    moveAnimStart(this, true);
	    emitJump(this.pos.x, this.pos.y, this.facing);
	    this.facingLast = this.facing;
	},
	
	init: function( x, y, settings ) {
	    this.parent( x, y, settings );
	    
	    // set players appearance
	    this.reskin(this.skin);
	    
	    // initiate network
	    netInit(this);
	    
	    /*
	    // create a name entity to follow this one
	    ig.game.spawnEntity(
		EntityName,
		this.pos.x,
		this.pos.y,
		{ follow: this.name, color: 'white' }
	    );
	    */
	},
	
	reskin: function()
	{
	    if(this.skin)
	    {
		switch(this.skin)
		{
		    // kind of like enum
		    case 'boy':
		    case 'girl':
		    case 'fat':
		    case 'kid':
		    case 'labgeek':
			this.animSheet = new ig.AnimationSheet( 'media/people/rs.' + this.skin + '.png', 16, 32 );
			break;
		    default:
			this.animSheet = new ig.AnimationSheet( 'media/people/rs.boy.png', 16, 32 );
			break;
		}
		// add the animations
		this.addAnim( 'walkUpA', 0.13333, [2,0], true );
		this.addAnim( 'walkUpB', 0.13333, [1,0], true );
		this.addAnim( 'walkDownA', 0.13333, [14,12], true );
		this.addAnim( 'walkDownB', 0.13333, [13,12], true );
		this.addAnim( 'walkLeftA', 0.13333, [8,6], true );
		this.addAnim( 'walkLeftB', 0.13333, [7,6], true );
		this.addAnim( 'walkRightA', 0.13333, [8,6], true );
		this.addAnim( 'walkRightB', 0.13333, [7,6], true );
		this.addAnim( 'runUpA', 0.08333, [4,3], true );
		this.addAnim( 'runUpB', 0.08333, [5,3], true );
		this.addAnim( 'runDownA', 0.08333, [16,15], true );
		this.addAnim( 'runDownB', 0.08333, [17,15], true );
		this.addAnim( 'runLeftA', 0.08333, [10,9], true );
		this.addAnim( 'runLeftB', 0.08333, [11,9], true );
		this.addAnim( 'runRightA', 0.08333, [10,9], true );
		this.addAnim( 'runRightB', 0.08333, [11,9], true );
		this.addAnim( 'slowup', 0.26667, [2,0,1,0] );
		this.addAnim( 'slowdown', 0.26667, [14,12,13,12] );
		this.addAnim( 'slowleft', 0.26667, [8,6,7,6] );
		this.addAnim( 'slowright', 0.26667, [8,6,7,6] );
		this.addAnim( 'idleup', 0.1, [0], true );
		this.addAnim( 'idledown', 0.1, [12], true );
		this.addAnim( 'idleleft', 0.1, [6], true );
		this.addAnim( 'idleright', 0.1, [6], true );
		// flip right-facing animations
		this.anims.walkRightA.flip.x = true;
		this.anims.walkRightB.flip.x = true;
		this.anims.runRightA.flip.x = true;
		this.anims.runRightB.flip.x = true;
		this.anims.slowright.flip.x = true;
		this.anims.idleright.flip.x = true;
		// set initial animation
		this.moveAnimStop();
	    }
	},
	
	update: function() {
	    
	    this.zIndex = this.pos.y + 2;
	    
	    this.parent();
	    
	    // action (like reading a sign or talking to npc)
	    if(ig.input.pressed('action') && !this.isMove)
	    {
		    action(this);	    
	    }
	    
	    // handle zoning
	    if(this.moveDoor && !this.moveWaiting && !this.isMove)
	    {
		// we just entered a door, so zone
		this.moveDoor.trigger();
	    }
	    else
	    {
		/////////////////////
		// Handle Movement //
		/////////////////////
		if(this.moveWaiting)
		{
		    // about to move
		    console.debug("Waiting to move...");
		    moveWait(this);
		}
		else if(this.isJump)
		{
		    // a move has already been started
		    finishJump(this);
		}
		else if(this.isMove)
		{
		    // a move has already been started
		    finishMove(this);
		}
		else if( ig.input.state('left') &&
			!ig.input.state('right') )
		{
		    // if player is trying to move left
		    this.facing = 'left';
		    movePressed(this);
		}
		else if( ig.input.state('right') &&
			!ig.input.state('left') )
		{
		    // if player is trying to move right
		    this.facing = 'right';
		    movePressed(this);
		}
		else if( ig.input.state('up')&&
			!ig.input.state('down') )
		{
		    // if player is trying to move up
		    this.facing = 'up';
		    movePressed(this);
		}
		else if( ig.input.state('down') &&
			!ig.input.state('up') )
		{
		    // if player is trying to move down
		    this.facing = 'down';
		    movePressed(this);
		}
		else
		{
		    
		    // if player not trying to move, set to idle
		    moveAnimStop(this);
		    // keep all slow-walk animations reset
		    this.anims.slowleft.rewind();
		    this.anims.slowright.rewind();
		    this.anims.slowup.rewind();
		    this.anims.slowdown.rewind();
		}
	    }
    
		
	}
    });
    
})