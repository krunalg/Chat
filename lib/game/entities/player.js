ig.module (
    
    'game.entities.player'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    //var ismove = 0;
    var speed = 80;
    
    
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
		player.vel.x = -speed;
		player.currentAnim = player.anims.walkleft;
		break;
	    case 'right':
		player.vel.x = +speed;
		player.currentAnim = player.anims.walkright;
		break;
	    case 'up':
		player.vel.y = -speed;
		player.currentAnim = player.anims.walkup;
		break;
	    case 'down':
		player.vel.y = +speed;
		player.currentAnim = player.anims.walkdown;
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
    
    var getNewDestination = function(player)
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
	    //player.pos.x = player.destination;
	    
	    alignToGrid(player);
	    
	    // check if we should go another time
	    if(moveStillPressed(player.facing))
	    {
		
		getNewDestination(player);
		// set new destination
		//player.destination = player.pos.x - player.moveUnit;
	    }
	    else 
	    {
		player.isMove = false;
		player.vel.x = player.vel.y = 0;
	    }
    
	}
	// if not then move
	else
	{
	    move(player);
	    //player.vel.x = -speed;
	    //player.currentAnim = player.anims.walkleft;
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
    
    var startMove = function(player)
    {
	switch(player.facing)
	{
	    case 'left':
		player.destination = player.pos.x - player.moveUnit;
		player.currentAnim = player.anims.walkleft;
		break;
	    case 'right':
		player.destination = player.pos.x + player.moveUnit;
		player.currentAnim = player.anims.walkright;
		break;
	    case 'up':
		player.destination = player.pos.y - player.moveUnit;
		player.currentAnim = player.anims.walkup;
		break;
	    case 'down':
		player.destination = player.pos.y + player.moveUnit;
		player.currentAnim = player.anims.walkdown;
		break;
	}
	player.isMove = true;
    }
    

   
		//////////////////
		// EntityPlayer //
		//////////////////
		EntityPlayer = ig.Entity.extend({
		    size: {x: 16, y: 16},
		    offset: { x: 0, y: 16 },
		    messagebox: "",
		    type: ig.Entity.TYPE.A,
		    nettimer: 10,
		    name: "player",
		    gamename: "player" + Math.floor(Math.random()*999),
		    messageboxtimer: 200,
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
		    
		    facing: "down",
		    isMove: false,
		    moveUnit: 16, // per unit of travel
		    //moveRemain: 0, // counter used for movement
		    destination: 0, // used in the x or y plane
		    
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// add the animations
			this.addAnim( 'walkup', .21, [2,0,1,0] );
			this.addAnim( 'walkdown', .21, [8,6,7,6] );
			this.addAnim( 'walkleft', .21, [5,3,4,3] );
			this.addAnim( 'walkright', .21, [5,3,4,3] );
			this.addAnim( 'slowup', .5, [2,0,1,0] );
			this.addAnim( 'slowdown', .5, [8,6,7,6] );
			this.addAnim( 'slowleft', .5, [5,3,4,3] );
			this.addAnim( 'slowright', .5, [5,3,4,3] );
			this.addAnim( 'idleup', 0.1, [0] );
			this.addAnim( 'idledown', 0.1, [6] );
			this.addAnim( 'idleleft', 0.1, [3] );
			this.addAnim( 'idleright', 0.1, [3] );
			// flip right-facing animations
			this.anims.walkright.flip.x = true;
			this.anims.slowright.flip.x = true;
			this.anims.idleright.flip.x = true;
			// set initial animation
			this.currentAnim = this.anims.idledown;
			
			//socket.emit('initializeplayer', this.gamename); 
		    },
		    
		    update: function() {
			
			
			/*
			 //var res = ig.game.collisionMap.trace( x, y, vx, vy, objectWidth, objectHeight );
			var res = ig.game.collisionMap.trace( this.pos.x, this.pos.y, -1, 0, this.size.x, this.size.y );
			if ( res.collision.x || res.collision.y )
			{
			    this.messagebox = "Collision left!\n" +
					      "\n player is @:\n " + (this.pos.x/16) + "," + (this.pos.y/16) +
					      "\n collision:\n " + res.tile.x + "," + res.tile.y;
			} else this.messagebox = "";
			//ig.game.collisionMap.trace
			*/
			    
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
				if(canMove(this)) startMove(this);
				else this.currentAnim = this.anims.slowleft;
			    }
			    else if( ig.input.state('right')
				    && !ig.input.state('left'))
			    {
				this.facing = 'right';
				if(canMove(this)) startMove(this);
				else this.currentAnim = this.anims.slowright;
			    }
			    else if( ig.input.state('up')
				    && !ig.input.state('down'))
			    {
				this.facing = 'up';
				if(canMove(this)) startMove(this);
				else this.currentAnim = this.anims.slowup;
			    }
			    else if( ig.input.state('down')
				    && !ig.input.state('up'))
			    {
				this.facing = 'down';
				if(canMove(this)) startMove(this);
				else this.currentAnim = this.anims.slowdown;
			    }
			    else
			    {
				this.vel.x = 0;
				this.vel.y = 0;
				//ismove = 0;
				
				
				// idle animations
				if( this.vel.y==0 && this.vel.x==0) {
				    if( this.facing == 'down' )
				    {
					this.currentAnim = this.anims.idledown;
					//currentanimation = 6;
				    }
				    if( this.facing == 'left' )
				    {
					this.currentAnim = this.anims.idleleft;
					//currentanimation = 7;
				    }
				    if( this.facing == 'right' )
				    {
					this.currentAnim = this.anims.idleright;
					//currentanimation = 8;
				    }
				    if( this.facing == 'up' )
				    {
					this.currentAnim = this.anims.idleup;
					//currentanimation = 5;
				    }
				}
				
				
			    }


			    
			}
			
				
			
			
			// SEND SOCKET UPDATES FOR MOVEMENT
				
			if(this.nettimer < 1 && this.isMove != 0)
			{
			    this.nettimer = 5;
			    // replace the number 3 with direction data used to
			    // determine proper animation via socket
			    socket.emit('recievedata',this.pos.x,this.pos.y,3,this.gamename);
			}
			this.nettimer = this.nettimer - 1;
		    
			this.parent();
			    
		    }
		});
 
///////////////////////
// EntityOtherPlayer //
///////////////////////

EntityOtherplayer = ig.Entity.extend({
	    size: {x: 16, y: 32},
	    type: ig.Entity.TYPE.B,
	    speed: 100,
	    name: "otherplayer",
	    gamename: "",
	    animation: 1,
	    //checkAgainst: ig.Entity.TYPE.B,
	    collides: ig.Entity.COLLIDES.PASSIVE,
	    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
	    
	    init: function( x, y, settings )
	    {
		this.parent( x, y, settings );
		this.health = 100;
		
		// Add the animations
		this.addAnim( 'down', .21, [8,6,7,6] );
		this.addAnim( 'left', .21, [5,3,4,3] );
		this.addAnim( 'right', .21, [5,3,4,3] );
		this.anims.right.flip.x = true;
		this.addAnim( 'idleup', 0.1, [0] );
		this.addAnim( 'idledown', 0.1, [6] );
		this.addAnim( 'idleleft', 0.1, [3] );
		this.addAnim( 'idleright', 0.1, [3] );
		this.anims.idleright.flip.x = true;
		this.currentAnim = this.anims.idledown;
	    },
	    
	    netmoveplayer: function()
	    {
		this.pos.x = positionx;
		this.pos.y = positiony;
	    },
	    
	    update: function()
	    {
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
	    }
});

    
})