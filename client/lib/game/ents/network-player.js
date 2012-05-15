ig.module (
    
    'game.ents.network-player'
)

.requires(
    
    'game.ents.player'
)
.defines(function(){

    EntityNetworkPlayer = EntityPlayer.extend({
	    
	isLocal: false,
	
	size: {x: 16, y: 16},
	offset: { x: 0, y: 16 },
	type: ig.Entity.TYPE.B,
	
	speed: 69,
	runSpeed: 138,
	walkSpeed: 69,
	jumpSpeed: 69,
	maxVel: { x: 138, y: 138 },
	moveState: 'idle', // idle, walk, run
	
	name: "otherplayer",
	animation: 1,
	
	//checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.PASSIVE,
	animSheet: new ig.AnimationSheet( 'media/people/rs.boy.png', 16, 32 ),
	
	facing: 'down',
	isMove: false, // being animated or not
	isJump: false, // used to time offsets in animation
	leftFoot: true, // used to alternate step animations
	destination: 0, // used for both x and y planes
	
	skin: 'boy',
	
	init: function( x, y, settings )
	{
	    this.parent( x, y, settings );
			    
	    this.reskin(this.skin);
	    
	    // create a name entity to follow this one
	    ig.game.spawnEntity(
		EntityName,
		this.pos.x,
		this.pos.y,
		{ follow: this.name, color: 'blue' }
	    );
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
		this.addAnim( 'idleup', 0.1, [0], true );
		this.addAnim( 'idledown', 0.1, [12], true );
		this.addAnim( 'idleleft', 0.1, [6], true );
		this.addAnim( 'idleright', 0.1, [6], true );
		// flip right-facing animations
		this.anims.walkRightA.flip.x = true;
		this.anims.walkRightB.flip.x = true;
		this.anims.runRightA.flip.x = true;
		this.anims.runRightB.flip.x = true;
		this.anims.idleright.flip.x = true;
		// set initial animation
		moveAnimStop(this);
	    }
	},
	
	netStartMove: function()
	{
	    if(this.moveState=='idle') this.isMove = false;
	    else
	    {
		// determine speed
		if(this.moveState=='run') this.speed = this.runSpeed;
		else if(this.moveState=='walk') this.speed = this.walkSpeed;
		
		// create grass effect
		var newGrass = facingGrass(this);
		if(newGrass) newGrass.play();
		
		this.isMove = true;
		setMoveDestination(this);
		moveAnimStart(true);
	    }
	},
	
	netStartJump: function()
	{
	    // determine speed
	    this.moveState = 'jump';
	    this.speed = this.jumpSpeed;
	    
	    this.isJump = true;
	    this.jumpStart = new ig.Timer();
	    spawnShadow(this);
	    setMoveDestination(this);
		    
	    moveAnimStart(true);
	},
	
	draw: function() {
	    this.parent();
	},
	
	update: function()
	{
	    this.zIndex = this.pos.y + 1;
	    
	    this.parent();
	    
	    // movement
	    if(this.isJump)
	    {
		// a move has already been started
		finishJump(this);
	    }
	    else if(this.isMove)
	    {
		finishMove(this);
	    }
	    else
	    {
		// keep animation consistent with this.facing
		moveAnimStop(this);
	    }

	}
    });

   
})