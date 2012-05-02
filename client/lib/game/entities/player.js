ig.module (
    
    'game.entities.player'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    
    
    
    
    var destinationReached = function(player)
    // returns true if reached or past destination
    // otherwise returns false
    {
	switch(player.facing) {
	    case 'left':
		return player.pos.x<=player.destination;
		break;
	    case 'right':
		return player.pos.x>=player.destination;
		break;
	    case 'up':
		return player.pos.y<=player.destination;
		break;
	    case 'down':
		return player.pos.y>=player.destination;
		break;
	}
	return false;
    }
    
    var moveStillPressed = function(facing)
    // returns true if the last held down
    // input hasn't changed; false otherwise
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
    };
    
    var move = function(player)
    // instructs impact to move player
    // in the direction he's facing
    {
	switch(player.facing)
	{
	    case 'left':
		player.vel.x = -player.speed;
		break;
	    case 'right':
		player.vel.x = +player.speed;
		break;
	    case 'up':
		player.vel.y = -player.speed;
		break;
	    case 'down':
		player.vel.y = +player.speed;
		break;
	}
    };
    
    var alignToGrid = function(player)
    {
	switch(player.facing)
	{
	    case 'left':
	    case 'right':
		player.pos.x = player.destination;
		break;
	    case 'up':
	    case 'down':
		player.pos.y = player.destination;
		break;
	}
    };
    
    var setMoveDestination = function(player)
    {
	switch(player.facing)
	{
	    case 'left':
		player.destination = player.pos.x - player.moveUnit;
		break;
	    case 'right':
		player.destination = player.pos.x + player.moveUnit;
		break;
	    case 'up':
		player.destination = player.pos.y - player.moveUnit;
		break;
	    case 'down':
		player.destination = player.pos.y + player.moveUnit;
		break;
	}
    };
    
    var finishMove = function(player) {
    
	// check if reached destination
	if(destinationReached(player)) {
	    
	    // ensure player is at legal coordinates
	    alignToGrid(player);
	    
	    // stop player
	    player.vel.x = player.vel.y = 0;
	    
	    // check if we should continue moving
	    if(moveStillPressed('left'))
	    {
		player.facing = 'left';
		if(canMove(player)) player.startMove();
	    }
	    else if(moveStillPressed('right'))
	    {
		player.facing = 'right';
		if(canMove(player)) player.startMove();
	    }
	    else if(moveStillPressed('up'))
	    {
		player.facing = 'up';
		if(canMove(player)) player.startMove();
	    }
	    else if(moveStillPressed('down'))
	    {
		player.facing = 'down';
		if(canMove(player)) player.startMove();
	    }
	    else 
	    {
		// end move state
		player.isMove = false;
		//player.vel.x = player.vel.y = 0;
		moveAnimStop(player);
	    }  
	}
	// continue to destination
	else
	{
	    move(player);
	}  
    };
    
    var facingExit = function(player)
    // returns an exit entity if the player
    // is facing one
    {
	var vx = vy = 0;
	var tilesize = 16; // this should not be here!!
	switch(player.facing)
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
		if( doors[i].pos.x == player.pos.x + vx &&
		    doors[i].pos.y == player.pos.y + vy )
		{
		    return doors[i];
		}
	    }
	}
	return false;
    }
    
    var overExit = function (player)
    // returns an exit entity if the player is standing
    // on one. else return false
    {
	// check for collision against an exit entity
	var exits = ig.game.getEntitiesByType( EntityExit );
	if(exits)
	{
	    for(var i=0; i<exits.length; i++)
	    {
		if( exits[i].pos.x == player.pos.x &&
		    exits[i].pos.y == player.pos.y &&
		    exits[i].isDoor != '1')
		{
		    return exits[i];
		}
	    }
	}
	return false;
    }
    
    var canMove = function(player)
    // returns true if no collision will occur
    // in the direction the player faces
    {
	var vx = 0;
	var vy = 0;
	switch(player.facing)
	{
	    case 'left':
		vx = -1;
		break;
	    case 'right':
		vx = 1;
		break;
	    case 'up':
		vy = -1;
		break;
	    case 'down':
		vy = 1;
		break;
	}
	// check map collisions
	var res = ig.game.collisionMap.trace( player.pos.x, player.pos.y, vx, vy, player.size.x, player.size.y );
	if(res.collision.x || res.collision.y) return false;
	
	/* // Don't bother checking collisions agains signs
	// check sign collisions
	var signs = ig.game.getEntitiesByType( EntitySign );
	if(signs)
	{
	    for(var i=0; i<signs.length; i++)
	    {
		if( (signs[i].pos.x == player.pos.x + vx) &&
		       (signs[i].pos.y == player.pos.y + vy) )
		{
		    return false;
		}
	    }
	}
	*/
	
	// check npc collisions
	var npcs = ig.game.getEntitiesByType( EntityNpc );
	if(npcs)
	{
	    for(var i=0; i<npcs.length; i++)
	    {
		if( (npcs[i].pos.x == player.pos.x + vx) &&
		       (npcs[i].pos.y == player.pos.y + vy) )
		{
		    return false;
		}
	    }
	}
	
	
	return true; // no collisions
    };
    
    var moveAnimStop = function(player)
    // set animation to idle
    {
	switch(player.facing)
	{

	    case 'left':
		player.currentAnim = player.anims.idleleft;
		break;
	    case 'right':
		player.currentAnim = player.anims.idleright;
		break;
	    case 'up':
		player.currentAnim = player.anims.idleup;
		break;
	    case 'down':
		player.currentAnim = player.anims.idledown;
		break;
	};
    }
    
    var moveAnimStart = function(player, alternateFeet) // ignore is used to skip changing feet
    {
	switch(player.facing)
	{
	    case 'left':
		if(player.leftFoot) player.currentAnim = player.anims.walkLeftA;
		else player.currentAnim = player.anims.walkLeftB;
		break;
	    case 'right':
		if(player.leftFoot) player.currentAnim = player.anims.walkRightA;
		else player.currentAnim = player.anims.walkRightB;
		break;
	    case 'up':
		if(player.leftFoot) player.currentAnim = player.anims.walkUpA;
		else player.currentAnim = player.anims.walkUpB;
		break;
	    case 'down':
		if(player.leftFoot) player.currentAnim = player.anims.walkDownA;
		else player.currentAnim = player.anims.walkDownB;
		break;
	}
	if(alternateFeet) player.leftFoot = !player.leftFoot;
	player.currentAnim.rewind();
    };
    
    
    
    var emitMove = function(xstart,ystart,direction,client)
    {
	socket.emit('receiveMove',xstart,ystart,direction,client);
    }
    
    var netInit = function(player)
    {
	socket.emit('hereIAm', player.pos.x, player.pos.y, player.facing, ig.game.mapName);	
    }
    
    var emitDirection = function(client,direction)
    // sends player.facing value to server
    {
	socket.emit('receiveDirection',client,direction);
    }
    
    // used for hack to disable sockets only
    // when running weltmeister
    var getFileName = function()
    {
	//this gets the full url
	var url = document.location.href;
	//this removes the anchor at the end, if there is one
	url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
	//this removes the query after the file name, if there is one
	url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
	//this removes everything before the last slash in the path
	url = url.substring(url.lastIndexOf("/") + 1, url.length);
	//return
	return url;
    }
    
    var action = function(player)
    {
	var vx = vy = 0;
	    var tilesize = 16; // this should not be here!!
	    switch(player.facing)
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
		if( (signs[i].pos.x == player.pos.x + vx) &&
		       (signs[i].pos.y == player.pos.y + vy) )
		{
		    ig.game.messages.push('Sign: ' + signs[i].msg);
		    ig.game.rebuildMessageBox(ig.game);
		}
	    }
	}
	
	// tries to read signs
	var npcs = ig.game.getEntitiesByType( EntityNpc );
	if(npcs)
	{
	    for(var i=0; i<npcs.length; i++)
	    {
		if( (npcs[i].pos.x == player.pos.x + vx) &&
		       (npcs[i].pos.y == player.pos.y + vy) )
		{
		    ig.game.messages.push(npcs[i].name + ': ' + npcs[i].msg);
		    ig.game.rebuildMessageBox(ig.game);
		}
	    }
	}
    }
    
    var movePressed = function(player)
    {
	
	// do a step animation, regardless of whether player moves
	moveAnimStart(player, false);
	
	
	if(player.moveCommitDirection!=player.facing)
	{
	    // don't let player combine different keys for one commit
	    player.moveCommitPending = false;
	    player.moveCommitWhen = 0;
	}
	
	if(!player.moveCommitPending)
	{
	    // start pending commit for faced direction
	    player.moveCommitPending = true;
	    player.moveCommitDirection = player.facing;
	    player.moveCommitWhen = new Date().getTime() + 80; // (2/60)sec ! move to globals magic is bad
	}
	
	// if its been (2/60)sec since player first pressed the key
	// then
	if( new Date().getTime() - player.moveCommitWhen >= 0 )
	{
	    player.moveCommitPending = false; // happening now, so now reset for next time
	    player.moveCommitWhen = 0; // reset for cleanness
	    
	    turnOffExitAnimations();
	    
	    if(canMove(player))
	    {
		var cancelMove = false;
		
		// handle zoning
		if(player.facing=='down') // as for now, flor exit go down
		{
		    var exit = overExit(player);
		    if(exit)
		    {
			exit.trigger(); // zone
			cancelMove = true;
		    }
		}
		
		if(!cancelMove)
		{
		    // disable exit animations that shouldn't be
		    //turnOffExitAnimations(player);
		    //console.debug('turning off arrows.');
		    
		    // facing an exit
		    var exit = facingExit(player);
		    if(exit)
		    {
			// check if going through a door
			if(exit.isDoor=='1')
			{
			    exit.startAnim();
			    // 22 frame wait @ 60 frames per second = 22/60 = 0.36666..sec
			    player.moveWhen = 336.7 + new Date().getTime();
			    player.moveWaiting = true;
			    player.moveDoor = exit;
			    cancelMove = true; // prevent player from starting to move too soon
			}
			// not a door
			else
			{
			    if(player.facing=='down') exit.startAnim(); // approaching floor exit
			}
		    }
		
		    // if no exits have taken place, move
		    if(!cancelMove) player.startMove();
		}
	    }
	    else
	    {
		// can't move, set slow walk animation
		switch(player.facing)
		{
		    case 'left':
			player.currentAnim = player.anims.slowleft;
			break;
		    case 'right':
			player.currentAnim = player.anims.slowright;
			break;
		    case 'up':
			player.currentAnim = player.anims.slowup;
			break;
		    case 'down':
			player.currentAnim = player.anims.slowdown;
			break;
		}
		// emit players faced direction, if changed
		if(!player.facingUpdated && player.facing!=player.facingLast)
		{
		    emitDirection(player.name, player.facing);
		    player.facingUpdated = true;
		}
	    }
	}
    }
    
    var moveWait = function(player)
    {
	if(player.moveWaiting)
	{
	    if(new Date().getTime() - player.moveWhen >= 0)
	    {
		player.startMove();
		player.moveWaiting = false;
	    }
	}
    }
    
    var turnOffExitAnimations = function ()
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
    }
    

   
		//////////////////
		// EntityPlayer //
		//////////////////
		EntityPlayer = ig.Entity.extend({
		    
		    // recorded travel time of 9 units (144px)
		    // in 2.100 seconds in VBA.
		    // ie 144/2.1 = 68.571428 or ~69
		    speed: 69,
		    size: {x: 16, y: 16},
		    offset: { x: 0, y: 16 },
		    type: ig.Entity.TYPE.A,
		    zIndex: 1,
		    nameFont: new ig.Font( 'media/04b03.font.png' ),
		    
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
		    
		    facing: '',
		    facingLast: '',
		    facingUpdated: false,
		    isMove: false, // waiting for move key-press
		    leftFoot: true, // used to alternate step animations
		    moveUnit: 16, // per unit of travel
		    destination: 0, // used for both x and y planes
		    moveWaiting: false, // used for waiting while a door opens
		    moveWhen: 0, // system time in ms to wait before moving
		    moveDoor: false, // contains exit entity to use after moveWhen
		    moveCommitPending: false, // helps decide whether to move or just change direction
		    moveCommitWhen: 0, // system time in ms when will commit to a move
		    moveCommitDirection: '',
		    
		    startMove: function()
		    {
			this.isMove = true;
			setMoveDestination(this);
			moveAnimStart(this, true);
			emitMove(this.pos.x, this.pos.y, this.facing, this.name);
			this.facingLast = this.facing;
			this.facingUpdated = false;
		    },
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// add the animations
			var walkRate = 0.13125;
			this.addAnim( 'walkUpA', walkRate, [2,0,0] );
			this.addAnim( 'walkUpB', walkRate, [1,0,0] );
			this.addAnim( 'walkDownA', walkRate, [8,6,6] );
			this.addAnim( 'walkDownB', walkRate, [7,6,6] );
			this.addAnim( 'walkLeftA', walkRate, [5,3,3] );
			this.addAnim( 'walkLeftB', walkRate, [4,3,3] );
			this.addAnim( 'walkRightA', walkRate, [5,3,3] );
			this.addAnim( 'walkRightB', walkRate, [4,3,3] );
			this.addAnim( 'slowup', walkRate*2, [2,0,1,0] );
			this.addAnim( 'slowdown', walkRate*2, [8,6,7,6] );
			this.addAnim( 'slowleft', walkRate*2, [5,3,4,3] );
			this.addAnim( 'slowright', walkRate*2, [5,3,4,3] );
			this.addAnim( 'idleup', 0.1, [0] );
			this.addAnim( 'idledown', 0.1, [6] );
			this.addAnim( 'idleleft', 0.1, [3] );
			this.addAnim( 'idleright', 0.1, [3] );
			// flip right-facing animations
			this.anims.walkRightA.flip.x = true;
			this.anims.walkRightB.flip.x = true;
			this.anims.slowright.flip.x = true;
			this.anims.idleright.flip.x = true;
			// set initial animation
			this.currentAnim = null; // none
			
			// things to skip if loaded in weltmeister
			if(getFileName()!='weltmeister.html')
			{
			    // initiate network
			    netInit(this);
			}
		    },
		    
		    draw: function() {
			
			// draw players name above head
			this.nameFont.draw(
				this.name,
				this.pos.x - ig.game.screen.x + this.size.x/2,
				this.pos.y - ig.game.screen.y - this.size.y,
				ig.Font.ALIGN.CENTER
			    );
			
			this.parent();
		    },
		    
		    update: function() {
			
			
			// handle mouse click pathfinding
			if (ig.input.pressed('leftClick')) {
				var runtimeStart = new Date();
				this.getPath(ig.input.mouse.x + ig.game.screen.x, ig.input.mouse.y + ig.game.screen.y);
				var runtimeEnd = new Date();
				ig.log('getPath runtime: ' + (runtimeEnd - runtimeStart));
			}
			//this.followPath(this.speed);
			
			
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
			
			
			
			
			// IMPORANT! DON'T TOUCH!!
			this.parent();
			    
		    }
		});
 

///////////////////////
// EntityOtherPlayer //
///////////////////////

EntityOtherplayer = ig.Entity.extend({
	    size: {x: 16, y: 16},
	    offset: { x: 0, y: 16 },
	    type: ig.Entity.TYPE.B,
	    speed: 69,
	    name: "otherplayer",
	    animation: 1,
	    nameFont: new ig.Font( 'media/04b03.font.bl.png' ),
	    
	    //checkAgainst: ig.Entity.TYPE.B,
	    collides: ig.Entity.COLLIDES.PASSIVE,
	    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
	    
	    facing: 'down',
	    isMove: false, // being animated or not
	    leftFoot: true, // used to alternate step animations
	    destination: 0, // used for both x and y planes
	    moveUnit: 16, // per unit of travel
	    
	    
	    init: function( x, y, settings )
	    {
		this.parent( x, y, settings );
		this.health = 100;
		
		// add the animations
		this.addAnim( 'walkUpA', 0.13125, [2,0,0] );
		this.addAnim( 'walkUpB', 0.13125, [1,0,0] );
		this.addAnim( 'walkDownA', 0.13125, [8,6,6] );
		this.addAnim( 'walkDownB', 0.13125, [7,6,6] );
		this.addAnim( 'walkLeftA', 0.13125, [5,3,3] );
		this.addAnim( 'walkLeftB', 0.13125, [4,3,3] );
		this.addAnim( 'walkRightA', 0.13125, [5,3,3] );
		this.addAnim( 'walkRightB', 0.13125, [4,3,3] );
		this.addAnim( 'slowup', .5, [2,0,1,0] );
		this.addAnim( 'slowdown', .5, [8,6,7,6] );
		this.addAnim( 'slowleft', .5, [5,3,4,3] );
		this.addAnim( 'slowright', .5, [5,3,4,3] );
		this.addAnim( 'idleup', 0.1, [0] );
		this.addAnim( 'idledown', 0.1, [6] );
		this.addAnim( 'idleleft', 0.1, [3] );
		this.addAnim( 'idleright', 0.1, [3] );
		// flip right-facing animations
		this.anims.walkRightA.flip.x = true;
		this.anims.walkRightB.flip.x = true;
		this.anims.slowright.flip.x = true;
		this.anims.idleright.flip.x = true;
		// set initial animation
		this.currentAnim = this.anims.idledown;
	    },
	    
	    netmoveplayer: function()
	    {
		this.pos.x = positionx;
		this.pos.y = positiony;
	    },
	    
	    netStartMove: function()
	    {
		this.isMove = true;
		setMoveDestination(this);
		moveAnimStart(this, true);
	    },
	    
	    draw: function() {
			
		// draw players name above head
		this.nameFont.draw(
			this.name,
			this.pos.x - ig.game.screen.x + this.size.x/2,
			this.pos.y - ig.game.screen.y - this.size.y,
			ig.Font.ALIGN.CENTER
		    );
		
		this.parent();
	    },
	    
	    update: function()
	    {
		
		// movement
		if(this.isMove)
		{
		    finishMove(this);
		} else {
		    // keep animation consistent with this.facing
		    moveAnimStop(this);
		}
		
		// IMPORANT! DON'T TOUCH!!
		this.parent();
	    }
	    
	    
	    
});


    
})