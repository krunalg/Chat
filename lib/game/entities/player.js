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
    
	}
	// continue to destination
	else
	{
	    move(player);
	}  
    };
    
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
	var res = ig.game.collisionMap.trace( player.pos.x, player.pos.y, vx, vy, player.size.x, player.size.y );
	return !(res.collision.x || res.collision.y);
	
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
	socket.emit('initializePlayer', player.pos.x, player.pos.y, player.facing, player.gamename);	
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
		    name: "player",
		    gamename: "player" + Math.floor(Math.random()*999), // will change to username later
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
		    
		    startMove: function()
		    {
			this.isMove = true;
			setMoveDestination(this);
			moveAnimStart(this);
			emitMove(this.pos.x, this.pos.y, this.facing, this.gamename);
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
			
			// initiate network
			if(getFileName()!='weltmeister.html') netInit(this);
		    },
		    
		    update: function() {
					    
			// movement
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
				if(canMove(this)) this.startMove();
				else
				{
				    this.currentAnim = this.anims.slowleft;
				    if(!this.facingUpdated && this.facing!=this.facingLast)
				    {
					emitDirection(this.gamename, 'left');
					this.facingUpdated = true;
				    }
				}
			    }
			    else if( ig.input.state('right')
				    && !ig.input.state('left'))
			    {
				this.facing = 'right';
				if(canMove(this)) this.startMove();
				else
				{
				    this.currentAnim = this.anims.slowright;
				    if(!this.facingUpdated && this.facing!=this.facingLast)
				    {
					emitDirection(this.gamename, 'right');
					this.facingUpdated = true;
				    }
				}
			    }
			    else if( ig.input.state('up')
				    && !ig.input.state('down'))
			    {
				this.facing = 'up';
				if(canMove(this)) this.startMove();
				else
				{
				    this.currentAnim = this.anims.slowup;
				    if(!this.facingUpdated && this.facing!=this.facingLast)
				    {
					emitDirection(this.gamename, 'up');
					this.facingUpdated = true;
				    }
				}
			    }
			    else if( ig.input.state('down')
				    && !ig.input.state('up'))
			    {
				this.facing = 'down';
				if(canMove(this)) this.startMove();
				else
				{
				    this.currentAnim = this.anims.slowdown;
				    if(!this.facingUpdated && this.facing!=this.facingLast)
				    {
					emitDirection(this.gamename, 'down');
					this.facingUpdated = true;
				    }
				}
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
	    gamename: "",
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