ig.module (
    
    'game.entities.player'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    //var ismove = 0;
    var speed = 100;
   
		//////////////////
		// EntityPlayer //
		//////////////////
		EntityPlayer = ig.Entity.extend({
		    size: {x: 16, y: 32},
		    messagebox: "",
		    type: ig.Entity.TYPE.A,
		    nettimer: 10,
		    name: "player",
		    gamename: "player" + Math.floor(Math.random()*999),
		    messageboxtimer: 200,
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
		    
		    facing: "down", // default
		    isMoving: false,
		    moveDistance: 16, // per unit of travel
		    moveRemain: 0, // counter used for movement
		    
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// add the animations
			this.addAnim( 'walkup', .21, [2,0,1,0] );
			this.addAnim( 'walkdown', .21, [8,6,7,6] );
			this.addAnim( 'walkleft', .21, [5,3,4,3] );
			this.addAnim( 'walkright', .21, [5,3,4,3] );
			this.addAnim( 'idleup', 0.1, [0] );
			this.addAnim( 'idledown', 0.1, [6] );
			this.addAnim( 'idleleft', 0.1, [3] );
			this.addAnim( 'idleright', 0.1, [3] );
			// flip right-facing animations
			this.anims.walkright.flip.x = true;
			this.anims.idleright.flip.x = true;
			// set initial animation
			this.currentAnim = this.anims.idledown;
			
			socket.emit('initializeplayer', this.gamename); 
		    },
		    
		    update: function() {
			    
		    	    
		    // complete movement cycles
		    if(this.isMoving)
		    {
			if(this.facing == 'left')
			{
			    this.vel.x = -speed;
			    this.messagebox = "left!!";
			}
			
		    }
		    
		    // take movement commands
		    if( !this.isMoving && ig.input.state('left') )
		    {
			// assuming nothing is in our way
			this.isMoving = true;
			this.facing = 'left';
			this.moveRemain = this.moveDistance;
			
			//this.vel.x = -speed;
			//ismove = 3;
			
			
			// animation
			this.currentAnim = this.anims.walkleft;
			//currentanimation = 3;
		    }
		    else if( !this.isMoving && ig.input.state('right') )
		    {
			this.vel.x = +speed;
			//ismove = 2;
			this.facing = 'right';
			
			// animation
			this.currentAnim = this.anims.walkright;
			//currentanimation = 4;
		    }
		    else if( !this.isMoving && ig.input.state('up') )
		    {
			this.vel.y = -speed;
			//ismove = 1;
			this.facing = 'up';
			
			// animation
			this.currentAnim = this.anims.walkup;
			//currentanimation = 1;
		    }
		    else if( !this.isMoving && ig.input.state('down') )
		    {
			this.vel.y = +speed;
			//ismove = 4;
			this.facing = 'down';
			
			// animation
			this.currentAnim = this.anims.walkdown;
			//currentanimation = 2;
		    }
		    else
		    {
			this.vel.x = 0;
			this.vel.y = 0;
			//ismove = 0;
		    }
			    
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
		    
		    // SEND SOCKET UPDATES FOR MOVEMENT
			    
		    if(this.nettimer < 1 && this.isMoving != 0)
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