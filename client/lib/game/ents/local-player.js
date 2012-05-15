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
	
	goAgain: function()
	// determines if player will continue moving or stop
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
	    
	    this.moveAnimStart(true);
	    
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
		else if(this.isJump || this.isMove)
		{
		    // a move or jump has already been started
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