ig.module (
    
    'game.ents.local-player'
)

.requires(
    
    'game.ents.player'
)
.defines(function(){

    EntityLocalPlayer = EntityPlayer.extend({
	
	isLocal: true,
	lastState: '', // used to only send network move updates if change occurs
	facingLast: '',
	moveWaiting: false, // used for waiting while a door opens
	moveWhen: 0, // system time in ms to wait before moving
	moveDoor: false, // contains exit entity to use after moveWhen
	moveCommitPending: false, // helps decide whether to move or just change direction
	moveCommitWhen: 0, // system time in ms when will commit to a move
	moveCommitDirection: '',
	
	netInit: function()
	{
	    socket.emit('hereIAm', this.pos.x, this.pos.y, this.facing, ig.game.mapName, this.skin);	
	},
	
	emitJump: function(x, y, direction)
	{
	    socket.emit('receiveJump', x, y, direction);
	},
	
	emitUpdateMoveState: function(x, y, direction, state)
	{
	    socket.emit('receiveUpdateMoveState', x, y, direction, state);
	},
	
	emitDirection: function(client,direction) // FIX THIS: client not needed. perhaps merge method with emitUpdateMoveState
	// sends player.facing value to server
	{
	    socket.emit('receiveDirection',client,direction);
	},
	
	action: function()
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
	    
	    // tries to read signs
	    var signs = ig.game.getEntitiesByType( EntitySign );
	    if(signs)
	    {
		for(var i=0; i<signs.length; i++)
		{
		    if( (signs[i].pos.x == this.pos.x + vx) &&
			   (signs[i].pos.y == this.pos.y + vy) )
		    {
			var bubbleDuration = 3; // magic numbers are bad!
			ig.game.spawnEntity( EntityBubble, signs[i].pos.x, signs[i].pos.y,
			{
				 msg: signs[i].msg,
				 lifespan: bubbleDuration 
			} );
		    }
		}
	    }
	    
	    // tries to read npc message
	    var npcs = ig.game.getEntitiesByType( EntityNpc );
	    if(npcs)
	    {
		for(var i=0; i<npcs.length; i++)
		{
		    if( (npcs[i].pos.x == this.pos.x + vx) &&
			   (npcs[i].pos.y == this.pos.y + vy) )
		    {
			// display chat bubble
			var bubbleDuration = 3; // magic numbers are bad!
			ig.game.spawnEntity( EntityBubble, npcs[i].pos.x, npcs[i].pos.y,
			{
				 msg: npcs[i].msg,
				 lifespan: bubbleDuration // magic numbers are bad!
			} );
			npcs[i].moveTimer.set(bubbleDuration+1);
			
			ig.game.hideName(npcs[i].name, bubbleDuration);
			
			break;
		    }
		}
	    }
	},
	
	facingExit: function()
	// returns the exit entity that the local player is
	// facing, returns false if none
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
	    // check for collision against an exit entity
	    var doors = ig.game.getEntitiesByType( EntityExit );
	    if(doors)
	    {
		for(var i=0; i<doors.length; i++)
		{
		    if( doors[i].pos.x == this.pos.x + vx &&
			doors[i].pos.y == this.pos.y + vy )
		    {
			return doors[i];
		    }
		}
	    }
	    return false;
	},
	
	overExit: function ()
	// returns the exit entity that the local player is
	// standing on, returns false if none
	{
	    // check for collision against an exit entity
	    var exits = ig.game.getEntitiesByType( EntityExit );
	    if(exits)
	    {
		for(var i=0; i<exits.length; i++)
		{
		    if( exits[i].pos.x == this.pos.x &&
			exits[i].pos.y == this.pos.y &&
			exits[i].type != 'door')
		    {
			return exits[i];
		    }
		}
	    }
	    return false;
	},
	
	preStartMove: function()
	{
	    var cancelMove = false;
		    
	    // handle floor-exit zoning
	    var exit = this.overExit();
	    if(exit && this.facing==exit.direction)
	    {
		exit.trigger(); // zone
		cancelMove = true;
	    }
	    
	    if(!cancelMove)
	    {		    
		// facing an exit
		var exit = this.facingExit();
		if(exit)
		{
		    // check if going through a door
		    if(exit.type=='door')
		    {
			exit.startAnim();
			// 22 frame wait @ 60 frames per second = 22/60 = 0.36666..sec
			this.moveWhen = 336.7 + new Date().getTime();
			this.moveWaiting = true;
			this.moveDoor = exit;
			cancelMove = true; // prevent player from starting to move too soon
		    }
		    // not a door
		    else
		    {
			if(this.facing==exit.direction) exit.startAnim(); // approaching floor exit
		    }
		}
	    
		// if no exits have taken place, move
		if(!cancelMove)
		{
		    this.startMove();
		}
	    }
	},
	
	movePressed: function()
	{
	    if(this.moveCommitDirection!=this.facing)
	    {
		// don't let player combine different keys for one commit
		this.moveCommitPending = false;
		this.moveCommitWhen = 0;
	    }
	    
	    if(!this.moveCommitPending)
	    {
		// start pending commit for faced direction
		this.moveCommitPending = true;
		this.moveCommitDirection = this.facing;
		
		// next line only runs once per direction, skip delay if facing already
		if(this.facingLast==this.facing) var delay = 0; else var delay = 80;
		this.moveCommitWhen = new Date().getTime() + delay;
	    }
	    
	    // player is now committed to (trying to) move
	    if( new Date().getTime() - this.moveCommitWhen >= 0)
	    {
		this.moveCommitPending = false; // happening now, so now reset for next time
		this.moveCommitWhen = 0; // reset for cleanness
		
		this.turnOffExitAnimations();
		
		if(this.canJump())
		{
		    this.startJump();
		}
		else if(this.canMove())
		{
		    this.preStartMove();
		}
		else
		{
		    console.debug("Trying to set slow walk...");
		    // can't move, set slow walk animation
		    switch(this.facing)
		    {
			case 'left':
			    this.currentAnim = this.anims.slowleft;
			    break;
			case 'right':
			    this.currentAnim = this.anims.slowright;
			    break;
			case 'up':
			    this.currentAnim = this.anims.slowup;
			    break;
			case 'down':
			    this.currentAnim = this.anims.slowdown;
			    break;
		    }
		}
	    }
	    else // player has not yet committed to (trying to) move
	    {
		// if player changed faced direction
		if(this.facing!=this.facingLast)
		{
		    this.emitDirection(this.name, this.facing); // inform others players
		    this.facingLast = this.facing; // so we don't inform them again
		    this.moveAnimStart(false); // step-animate the change
		    
		    // check if we are on an exit that needs animating
		    var exit = this.overExit(this);
		    if(exit)
		    {
			if(this.facing==exit.direction) exit.startAnim();
			else exit.stopAnim();
		    }
		}
	    }
	},
	
	moveWait: function()
	{
	    if(this.moveWaiting)
	    {
		if(new Date().getTime() - this.moveWhen >= 0)
		{
		    this.startMove();
		    this.moveWaiting = false;
		}
	    }
	},
	
	turnOffExitAnimations: function ()
	// turn off all exit animations
	{
	    var exits = ig.game.getEntitiesByType( EntityExit );
	    if(exits)
	    {
		for(var i=0; i<exits.length; i++)
		{
		    exits[i].stopAnim();
		}
	    }
	},
	
	moveStillPressed: function(facing)
	// returns true if the supplied param
	// facing key is currently pressed
	{
	    switch(facing)
	    {
		case 'left':
		    return ( ig.input.state('left')
			&& !ig.input.state('right') )
		    break;
		case 'right':
		    return ( ig.input.state('right')
			&& !ig.input.state('left') )
		    break;
		case 'up':
		    return ( ig.input.state('up')
			&& !ig.input.state('down') )
		    break;
		case 'down':
		    return ( ig.input.state('down')
			&& !ig.input.state('up') )
		    break;
		
	    }
	    return false;
	},
	
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
	    this.setMoveDestination();
	    
	    var newGrass = this.facingGrass();
	    if(newGrass) newGrass.play();
	    
	    this.moveAnimStart();
	    
	    // send movement update only when change occurs
	    if( this.facingLast != this.facing || this.lastState != this.moveState )
	    {
		this.emitUpdateMoveState(this.pos.x, this.pos.y, this.facing, this.moveState);
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
	    this.spawnShadow();
	    this.setMoveDestination();
		    
	    this.moveAnimStart(true);
	    this.emitJump(this.pos.x, this.pos.y, this.facing);
	    this.facingLast = this.facing;
	},
	
	init: function( x, y, settings ) {
	    this.parent( x, y, settings );
	    
	    // initiate network
	    this.netInit();
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
		    this.action(this);	    
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
		    this.moveWait();
		}
		else if(this.isJump)
		{
		    // a move has already been started
		    this.finishJump();
		}
		else if(this.isMove)
		{
		    // a move has already been started
		    this.finishMove();
		}
		else if( ig.input.state('left') &&
			!ig.input.state('right') )
		{
		    // if player is trying to move left
		    this.facing = 'left';
		    this.movePressed();
		}
		else if( ig.input.state('right') &&
			!ig.input.state('left') )
		{
		    // if player is trying to move right
		    this.facing = 'right';
		    this.movePressed();
		}
		else if( ig.input.state('up')&&
			!ig.input.state('down') )
		{
		    // if player is trying to move up
		    this.facing = 'up';
		    this.movePressed();
		}
		else if( ig.input.state('down') &&
			!ig.input.state('up') )
		{
		    // if player is trying to move down
		    this.facing = 'down';
		    this.movePressed();
		}
		else
		{
		    
		    // if player not trying to move, set to idle
		    this.moveAnimStop();
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