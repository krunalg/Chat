ig.module (
    
    'game.ents.player'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    
    EntityPlayer = ig.Entity.extend({
	
	isLocal: false, // false unless entity defines otherwise
	
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

	facing: '', // direction player currently faces
	isMove: false, // waiting for move key-press
	isJump: false,
	leftFoot: true, // used to alternate step animations
	destination: 0, // used for both x and y planes
	
	skin: 'labgeek',
	
	facingGrass: function()
	// returns a grass entity if player is facing one
	// otherwise returns false
	{
	    var vx = vy = 0;
	    var tilesize = ig.game.collisionMap.tilesize;
	    switch(this.facing)
	    {
		case 'left':
		    vx = -tilesize;
		    break;
		case 'right':
		    vx = tilesize;
		    break;
		case 'up':
		    vy = -tilesize;
		    break;
		case 'down':
		    vy = tilesize;
		    break;
	    }
	    // check for collision against grass entity
	    var allGrass = ig.game.getEntitiesByType( EntityGrass );
	    if(allGrass)
	    {
		for(var i=0; i<allGrass.length; i++)
		{
		    if( allGrass[i].pos.x == this.pos.x + vx &&
			allGrass[i].pos.y == this.pos.y + vy )
		    {
			return allGrass[i];
		    }
		}
	    }
	    return false;
	},
	
	inGrass: function()
	// returns a grass entity if player is in one
	// otherwise returns false
	{
	    // check for collision against grass entity
	    var allGrass = ig.game.getEntitiesByType( EntityGrass );
	    if(allGrass)
	    {
		for(var i=0; i<allGrass.length; i++)
		{
		    if( allGrass[i].pos.x == this.pos.x &&
			allGrass[i].pos.y == this.pos.y )
		    {
			return allGrass[i];
		    }
		}
	    }
	    return false;
	},
	
	spawnShadow: function()
	{
	    ig.game.spawnEntity( EntityJump, this.pos.x, this.pos.y,
				{
				   direction: this.facing,
				} );
	},
	
	finishJump: function() {
	    // update jump animation
	    var jumpTime = this.jumpStart.delta();
	    if(jumpTime >= 0 && jumpTime < (2/60)) this.offset.y = 16+4;
	    else if(jumpTime >= (2/60) && jumpTime < (4/60)) this.offset.y = 16+6;
	    else if(jumpTime >= (4/60) && jumpTime < (6/60)) this.offset.y = 16+8;
	    else if(jumpTime >= (6/60) && jumpTime < (8/60)) this.offset.y = 16+10;
	    else if(jumpTime >= (8/60) && jumpTime < (10/60)) this.offset.y = 16+12;
	    else if(jumpTime >= (10/60) && jumpTime < (16/60)) this.offset.y = 16+14;
	    else if(jumpTime >= (16/60) && jumpTime < (18/60)) this.offset.y = 16+12;
	    else if(jumpTime >= (18/60) && jumpTime < (20/60)) this.offset.y = 16+10;
	    else if(jumpTime >= (20/60) && jumpTime < (22/60)) this.offset.y = 16+8;
	    else if(jumpTime >= (22/60) && jumpTime < (24/60)) this.offset.y = 16+6;
	    else if(jumpTime >= (24/60) && jumpTime < (26/60)) this.offset.y = 16+4;
	    else this.offset.y = 16+0;
	    
	    // check if reached destination
	    if(this.destinationReached()) {
		
		this.isJump = false;
		
		// ensure player is at legal coordinates
		this.alignToGrid();
		
		// stop player
		this.vel.x = this.vel.y = 0;
		
		// check if we should continue moving
		this.goAgain();
		
	    }
	    // continue to destination
	    else
	    {
		this.move();
	    }  
	},
	
	canMove: function()
	// returns true if no collision will occur
	// in the direction the player faces
	{
	    var vx = vy = 0; // velocity
	    var ox = oy = 0; // tile offset
	    var tilesize = ig.game.collisionMap.tilesize;
	    switch(this.facing)
	    {
		case 'left':
		    vx = -1;
		    ox = -tilesize;
		    break;
		case 'right':
		    vx = 1;
		    ox = tilesize;
		    break;
		case 'up':
		    vy = -1;
		    oy = -tilesize;
		    break;
		case 'down':
		    vy = 1;
		    oy = tilesize;
		    break;
	    }
	    // check map collisions
	    var res = ig.game.collisionMap.trace( this.pos.x, this.pos.y, vx, vy, this.size.x, this.size.y );
	    if(res.collision.x || res.collision.y) return false;
	    
	    // check npc collisions
	    var npcs = ig.game.getEntitiesByType( EntityNpc );
	    if(npcs)
	    {
		for(var i=0; i<npcs.length; i++)
		{
		    if( (npcs[i].pos.x == this.pos.x + ox) &&
			   (npcs[i].pos.y == this.pos.y + oy) )
		    {
			return false;
		    }
		}
	    }
	    
	    
	    return true; // no collisions
	},
	
	canJump: function()
	// returns true if faced tile is jumpable
	// otherwise false
	{
	    var vx = 0;
	    var vy = 0;
	    var want = -1; // to match weltmeister one-way collision tiles
	    var c = ig.game.collisionMap;
	    var tilesize = ig.game.collisionMap.tilesize;
	    switch(this.facing)
	    {
		case 'left':
		    vx = -tilesize;
		    want = 45;
		    break;
		case 'right':
		    vx = tilesize;
		    want = 34;
		    break;
		case 'up':
		    vy = -tilesize;
		    want = 12;
		    break;
		case 'down':
		    vy = tilesize;
		    want = 23;
		    break;
	    }
	    var pX = this.pos.x + vx;
	    var pY = this.pos.y + vy;
	    if(c.getTile(pX,pY) == want) return true; // can jump
	    return false; // no collisions
	},
	
	goAgain: function()
	// decides if another move should take place
	// and either starts one or stops the player
	{
	    if(this.isLocal) // is Player entity
	    {
		var keepMoving = true;
		
		// if key pressed, update direction and proceed with move
		if(this.moveStillPressed('left'))         this.facing = 'left';
		else if(this.moveStillPressed('right'))   this.facing = 'right';
		else if(this.moveStillPressed('up'))      this.facing = 'up';
		else if(this.moveStillPressed('down'))    this.facing = 'down';
		else keepMoving = false; // no key pressed, stop moving
    
		if(keepMoving && this.canJump())
		{
		    this.isMove = false; // will use isJump instead
		    this.startJump();
		}
		else if(keepMoving && this.canMove()) this.preStartMove();
		else
		{
		    // stop the player
		    this.isMove = false;
		    this.isJump = false;
		    this.moveState = 'idle';
		    this.lastState = 'idle';
		    this.moveAnimStop();
		    // tell other players we've stopped
		    this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
		}
	    }
	    else // is Otherplayer entity
	    {
		if(this.moveState=='idle')
		{
		    // stop the this
		    this.isMove = false;
		    this.isJump = false;
		    this.moveAnimStop();
		}
		else
		{
		    if(this.canMove()) this.netStartMove();
		}
	    }
	},
	
	finishMove: function() {
	
	    // check if reached destination
	    if(this.destinationReached()) {
		
		// ensure player is at legal coordinates
		this.alignToGrid();
		
		// stop player
		this.vel.x = this.vel.y = 0;
		
		// check if we should continue moving
		this.goAgain();
    
	    }
	    // continue to destination
	    else
	    {
		this.move();
	    }  
	},
	
	alignToGrid: function()
	{
	    switch(this.facing)
	    {
		case 'left':
		case 'right':
		    this.pos.x = this.destination;
		    break;
		case 'up':
		case 'down':
		    this.pos.y = this.destination;
		    break;
	    }
	},
	
	setMoveDestination: function()
	{
	    var tilesize = ig.game.collisionMap.tilesize;
	    if(this.isJump) var distance = 2; else var distance = 1;
	    
	    switch(this.facing)
	    {
		case 'left':
		    this.destination = this.pos.x - tilesize * distance;
		    break;
		case 'right':
		    this.destination = this.pos.x + tilesize * distance;
		    break;
		case 'up':
		    this.destination = this.pos.y - tilesize * distance;
		    break;
		case 'down':
		    this.destination = this.pos.y + tilesize * distance;
		    break;
	    }
	},
	
	move: function()
	// instructs impact to move player
	// in the direction he's facing
	{
	    switch(this.facing)
	    {
		case 'left':
		    this.vel.x = -this.speed;
		    break;
		case 'right':
		    this.vel.x = +this.speed;
		    break;
		case 'up':
		    this.vel.y = -this.speed;
		    break;
		case 'down':
		    this.vel.y = +this.speed;
		    break;
	    }
	},
	
	destinationReached: function()
	// returns true if reached or past destination
	// otherwise returns false
	{
	    switch(this.facing) {
		case 'left':
		    return this.pos.x<=this.destination;
		    break;
		case 'right':
		    return this.pos.x>=this.destination;
		    break;
		case 'up':
		    return this.pos.y<=this.destination;
		    break;
		case 'down':
		    return this.pos.y>=this.destination;
		    break;
	    }
	    return false;
	},
	
	moveAnimStart: function(alternateFeet)
	{
	    switch(this.facing)
	    {
		case 'left':
		    if(this.speed==this.walkSpeed)
		    {
			if(this.leftFoot) this.currentAnim = this.anims.walkLeftA;
			else this.currentAnim = this.anims.walkLeftB;
		    }
		    else // assume he is running
		    {
			if(this.leftFoot) this.currentAnim = this.anims.runLeftA;
			else this.currentAnim = this.anims.runLeftB;
		    }
		    break;
		case 'right':
		    if(this.speed==this.walkSpeed)
		    {
			if(this.leftFoot) this.currentAnim = this.anims.walkRightA;
			else this.currentAnim = this.anims.walkRightB;
		    }
		    else // assume he is running
		    {
			if(this.leftFoot) this.currentAnim = this.anims.runRightA;
			else this.currentAnim = this.anims.runRightB;
		    }
		    break;
		case 'up':
		    if(this.speed==this.walkSpeed)
		    {
			if(this.leftFoot) this.currentAnim = this.anims.walkUpA;
			else this.currentAnim = this.anims.walkUpB;
		    }
		    else // assume he is running
		    {
			if(this.leftFoot) this.currentAnim = this.anims.runUpA;
			else this.currentAnim = this.anims.runUpB;
		    }
		    break;
		case 'down':
		    if(this.speed==this.walkSpeed)
		    {
			if(this.leftFoot) this.currentAnim = this.anims.walkDownA;
			else this.currentAnim = this.anims.walkDownB;
		    }
		    else // assume he is running
		    {
			if(this.leftFoot) this.currentAnim = this.anims.runDownA;
			else this.currentAnim = this.anims.runDownB;
		    }
		    break;
	    }
	    if(alternateFeet) this.leftFoot = !this.leftFoot;
	    this.currentAnim.rewind();
	},
	
	moveAnimStop: function()
	// set animation to idle
	{
	    switch(this.facing)
	    {
    
		case 'left':
		    this.currentAnim = this.anims.idleleft;
		    break;
		case 'right':
		    this.currentAnim = this.anims.idleright;
		    break;
		case 'up':
		    this.currentAnim = this.anims.idleup;
		    break;
		case 'down':
		    this.currentAnim = this.anims.idledown;
		    break;
	    };
	},
	
	init: function( x, y, settings ) {
	    this.parent( x, y, settings );
	    
	    // set players appearance
	    this.reskin(this.skin);
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
	}
    });
 

    ///////////////////////
    // EntityOtherPlayer //
    ///////////////////////

    EntityOtherplayer = ig.Entity.extend({
	    
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