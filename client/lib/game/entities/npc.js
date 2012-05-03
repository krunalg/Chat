ig.module (
    
    'game.entities.npc'
)

.requires(
    
    'impact.entity',
    'impact.font'
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
	
	// check other player collisions
	var pcs = ig.game.getEntitiesByType( EntityOtherplayer );
	if(pcs)
	{
	    for(var i=0; i<pcs.length; i++)
	    {
		if( (pcs[i].pos.x == player.pos.x + vx) &&
		       (pcs[i].pos.y == player.pos.y + vy) )
		{
		    return false;
		}
	    }
	}
	
	// check for collision against local player
	var pc = ig.game.getEntitiesByType( EntityPlayer )[0];
	if(pc)
	{
	    if( (pc.pos.x == player.pos.x + vx) &&
		   (pc.pos.y == player.pos.y + vy) )
	    {
		return false;
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
    
    var facingGrass = function(player)
    // returns a grass entity if player is facing one
    // otherwise returns false
    {
	var vx = vy = 0;
	var tilesize = ig.game.collisionMap.tilesize;
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
	// check for collision against grass entity
	var allGrass = ig.game.getEntitiesByType( EntityGrass );
	if(allGrass)
	{
	    for(var i=0; i<allGrass.length; i++)
	    {
		if( allGrass[i].pos.x == player.pos.x + vx &&
		    allGrass[i].pos.y == player.pos.y + vy )
		{
		    return allGrass[i];
		}
	    }
	}
	return false;
    }
    
    var inGrass = function(player)
    // returns a grass entity if player is in one
    // otherwise returns false
    {
	// check for collision against grass entity
	var allGrass = ig.game.getEntitiesByType( EntityGrass );
	if(allGrass)
	{
	    for(var i=0; i<allGrass.length; i++)
	    {
		if( allGrass[i].pos.x == player.pos.x &&
		    allGrass[i].pos.y == player.pos.y )
		{
		    return allGrass[i];
		}
	    }
	}
	return false;
    }
    
   
		EntityNpc = ig.Entity.extend({
		    
		    // recorded travel time of 9 units (144px)
		    // in 2.100 seconds in VBA.
		    // ie 144/2.1 = 68.571428 or ~69
		    speed: 69,
		    size: {x: 16, y: 16},
		    type: ig.Entity.TYPE.A,
		    animSheet: new ig.AnimationSheet( 'media/entity-icons.png', 16, 16 ),
		    
		    facing: "down",
		    facingLast: "down",
		    facingUpdated: false,
		    isMove: false, // waiting for move key-press
		    leftFoot: true, // used to alternate step animations
		    moveUnit: 16, // per unit of travel
		    destination: 0, // used for both x and y planes
		    
		    movePattern: ['left','up','right','down'],
		    moveNext: 0,
		    lastMove: new Date().getTime(),
		    moveDelay: 2000,
		    faceNextMove: function()
		    {
			this.facing = this.movePattern[this.moveNext];
			moveAnimStop(this);
		    },
		    justMoved: function()
		    {
			this.moveNext++;
			if(this.moveNext >= this.movePattern.length)
			this.moveNext = 0; // cycle pattern
		    },
		    
		    startMove: function()
		    {
			var newGrass = facingGrass(this);
			if(newGrass) newGrass.play();
			
			this.isMove = true;
			setMoveDestination(this);
			moveAnimStart(this);
			//emitMove(this.pos.x, this.pos.y, this.facing, this.name);
			this.facingLast = this.facing;
			this.facingUpdated = false;
		    },
		    
		    finishMove: function()
		    {
		    
			// check if reached destination
			if(destinationReached(this)) {
			    
			    // ensure player is at legal coordinates
			    alignToGrid(this);
			    
			    // end move state
			    this.isMove = false;
			    this.vel.x = this.vel.y = 0;
			    moveAnimStop(this);
			    this.lastMove = new Date().getTime();
		    
			}
			// continue to destination
			else
			{
			    move(this);
			}  
		    },
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// things to skip if loaded in weltmeister
			if(getFileName()!='weltmeister.html')
			{
			    this.nameFont = new ig.Font( 'media/04b03.font.gr.png' );
			}
			
			// weltmeister icon
			this.addAnim( 'weltmeister', 0.1, [1] );
			this.currentAnim = this.anims.weltmeister;
		    },
		    
		    ready: function()
		    {
			this.offset = { x: 0, y: 16 };
			
			this.animSheet = new ig.AnimationSheet( 'media/fatty.png', 16, 32 );
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
			this.addAnim( 'idleup', 0.1, [0] );
			this.addAnim( 'idledown', 0.1, [6] );
			this.addAnim( 'idleleft', 0.1, [3] );
			this.addAnim( 'idleright', 0.1, [3] );
			// flip right-facing animations
			this.anims.walkRightA.flip.x = true;
			this.anims.walkRightB.flip.x = true;
			this.anims.idleright.flip.x = true;
			// set initial animation
			this.currentAnim = this.anims.idledown;
		    },
		    
		    draw: function()
		    {
		    	// things to skip if loaded in weltmeister
			if(getFileName()!='weltmeister.html')
			{
			    // draw name above head
			    this.nameFont.draw(
				    this.name,
				    this.pos.x - ig.game.screen.x + this.size.x/2,
				    this.pos.y - ig.game.screen.y - this.size.y,
				    ig.Font.ALIGN.CENTER
				);
			}
			
			this.parent();
		    },
		    
		    update: function() {
			
			this.zIndex = this.pos.y + 1;
			
			if(this.isMove)
			{
			    this.finishMove(this);
			}
			else
			{
			    var currTime = new Date().getTime();
			    if(currTime - this.lastMove > this.moveDelay)
			    {
				this.faceNextMove();
				if(canMove(this))
				{
				    this.startMove();
				    this.justMoved();
				}
			    }
			}
			
			
			
			// IMPORANT! DON'T TOUCH!!
			this.parent();
			    
		    }
		});
 


    
})