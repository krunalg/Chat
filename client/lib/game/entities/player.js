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
		player.pos.x = player.destination;
		break;
	    case 'right':
		player.pos.x = player.destination;
		break;
	    case 'up':
		player.pos.y = player.destination;
		break;
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
	    
	    // check if we should go another time
	    if( moveStillPressed(player.facing) && canMove(player) )
	    {
		player.startMove();
	    }
	    else 
	    {
		// end move state
		player.isMove = false;
		player.vel.x = player.vel.y = 0;
		moveAnimStop(player);
	    }
	    
	    var exit = overExit(player);
	    if(exit && exit.isDoor!='1' && player.facing!='down')
	    {
		// if exit exists, is not a door, and player is not facing down
		exit.stopAnim(); // turn off exit arrow
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
	// check map collisions
	var res = ig.game.collisionMap.trace( player.pos.x, player.pos.y, vx, vy, player.size.x, player.size.y );
	if(res.collision.x || res.collision.y) return false;
	
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
    
    var moveAnimStart = function(player)
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
	player.leftFoot = !player.leftFoot;
	player.currentAnim.rewind();
    };
    
    
    
    var emitMove = function(xstart,ystart,direction,client)
    {
	socket.emit('receiveMove',xstart,ystart,direction,client);
    }
    
    var netInit = function(player)
    {
	socket.emit('initializePlayer', player.pos.x, player.pos.y, player.facing, player.name);	
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
		    ig.game.messages.push('Sign: ' + signs[i].message);
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
		    ig.game.messages.push(npcs[i].name + ': ' + npcs[i].message);
		    ig.game.rebuildMessageBox(ig.game);
		}
	    }
	}
    }
    
    var movePressed = function(player)
    {
	if(canMove(player))
	{
	    var cancelMove = false;
	    
	    // check if walking out an exit
	    if(player.facing=='down') // as far now, exits are always down
	    {
		var exit = overExit(player);
		if(exit)
		{
		    exit.trigger();
		    cancelMove = true;
		}
	    }
	    
	    if(!cancelMove)
	    {
		// disable exit animations that shouldn't be
		turnOffExitAnimations(player);
		
		// enable ones that should
		// check if facing an exit
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
		    // if approaching a ground exit facing down
		    else if(player.facing=='down')
		    {
			exit.startAnim();
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
    
    var turnOffExitAnimations = function (player)
    {
	// turn off any exit animations that shouldn't be playing
	var exits = ig.game.getEntitiesByType( EntityExit );
	if(exits)
	{
	    for(var i=0; i<exits.length; i++)
	    {
		// if not standing over
		if( exits[i].pos.x!=player.pos.x ||
		    exits[i].pos.y!=player.pos.y )
		{
		    exits[i].stopAnim();
		}
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
		    messagebox: "",
		    type: ig.Entity.TYPE.A,
		    zIndex: 1,
		    
		    messageboxtimer: 200,
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
		    
		    facing: "down",
		    facingLast: "down",
		    facingUpdated: false,
		    isMove: false, // waiting for move key-press
		    leftFoot: true, // used to alternate step animations
		    moveUnit: 16, // per unit of travel
		    destination: 0, // used for both x and y planes
		    moveWaiting: false, // used for waiting while a door opens
		    moveWhen: 0, // system time in ms to wait before moving
		    moveDoor: false, // contains exit entity to use after moveWhen
		    
		    
		    startMove: function()
		    {
			this.isMove = true;
			setMoveDestination(this);
			moveAnimStart(this);
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
			this.currentAnim = this.anims.idledown;
			
			// things to skip if loaded in weltmeister
			if(getFileName()!='weltmeister.html')
			{
			    // set player name
			    this.name = username;			    
			    
			    // player position
				
			    // grab players db start position
			    if( (jsonPos.x!=-1) && (jsonPos.y!=-1) )
			    {
				// player position data from database
				this.pos.x = jsonPos.x;
				this.pos.x = jsonPos.y;
				this.facing = jsonPos.facing;
			    }
			    
			    // initiate network
			    netInit(this);
			}
		    },
		    
		    ready: function()
		    {
			// give preference to a goTo
			var goTo = ig.game.goTo;
			if(goTo != null)
			{
			    var exits = ig.game.getEntitiesByType( EntityExit );
			    if(EntityExit)
			    {
				for(var i=0; i<exits.length; i++)
				{
				    if(exits[i].me==ig.game.goTo)
				    {
					var oy = 0;
					if(exits[i].isDoor == '1') oy += 16; // magic number!! BAD!
					this.pos.x = exits[i].pos.x;
					this.pos.y = exits[i].pos.y + oy;
				    }
				}
			    }
			    ig.game.goTo = null; // reset
			}
		    },
		    
		    update: function() {
			
			
			
			// action
			if(ig.input.pressed('action') && !this.isMove)
			{
				action(this);	    
			}
			
			// movement
			if(this.moveDoor && !this.moveWaiting && !this.isMove)
			{
			    // we just entered a door, zone
			    this.moveDoor.trigger();
			}
			if(this.moveWaiting)
			{
			    console.debug("Waiting to move...");
			    moveWait(this);
			}
			else
			{
			    if(this.isMove)
			{
			    finishMove(this);
			}
			else
			{
			    if( ig.input.state('left')
				    && !ig.input.state('right'))
				{
				    this.facing = 'left';
				    movePressed(this);
				}
				else if( ig.input.state('right')
					&& !ig.input.state('left'))
				{
				    this.facing = 'right';
				    if(canMove(this))
				    movePressed(this);
				}
				else if( ig.input.state('up')
					&& !ig.input.state('down'))
				{
				    this.facing = 'up';
				    movePressed(this);
				}
				else if( ig.input.state('down')
					&& !ig.input.state('up'))
				{
				    this.facing = 'down';
				    movePressed(this);
				}
				else
				{
				    moveAnimStop(this);
				    // keep all slow-walk animations reset
				    this.anims.slowleft.rewind();
				    this.anims.slowright.rewind();
				    this.anims.slowup.rewind();
				    this.anims.slowdown.rewind();
				}
    
				
				//moveAnimStart(this,'slow');
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
		moveAnimStart(this);
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