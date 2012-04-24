ig.module (
    
    'game.entities.otherplayer'
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
		startMove(player);
	    }
	    else 
	    {
		// end move state
		player.isMove = false;
		player.vel.x = player.vel.y = 0;
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
    
    var moveAnim = function(player)
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
    
    var startMove = function(player)
    {
	player.isMove = true;
	setMoveDestination(player);
	moveAnim(player);
	emitMove(player.pos.x, player.pos.y, player.facing, player.gamename)
    }
    
    var emitMove = function(xstart,ystart,direction,client)
    {
	socket.emit('receiveMove',xstart,ystart,direction,client);
    }
    
    var netInit = function(player)
    {
	socket.emit('initializePlayer', player.pos.x, player.pos.y, player.facing, player.gamename);	
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
		moveAnim(this);
	    },
	    
	    update: function()
	    {
		
		// movement
		if(this.isMove)
		{
		    finishMove(this);
		}
		
		/*
		switch(this.animation)
		{
		    case 1:
			this.currentAnim = this.anims.up;
			break;
		    case 2:
			this.currentAnim = this.anims.down;
			break;
		    case 3:
			this.currentAnim = this.anims.left;
			break;
		    case 4:
			this.currentAnim = this.anims.right;
			break;
		    case 5:
			this.currentAnim = this.anims.idleup;
			break;
		    case 6:
			this.currentAnim = this.anims.idledown;
			break;
		    case 7:
			this.currentAnim = this.anims.idleleft;
			break;
		    case 8:
			this.currentAnim = this.anims.idleright;
			break;
		}
		*/
	    }
});

    
})