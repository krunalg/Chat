ig.module (
    
    'game.entities.player'
)

.requires(
    
    'impact.entity'
)
.defines(function(){
    var ismove = 0;
    var speed = 100;
   
		//////////////////
		// EntityPlayer //
		//////////////////
		EntityPlayer = ig.Entity.extend({
		    size: {x: 16, y: 32},
		    direction: 1,
		    messagebox: "",
		    type: ig.Entity.TYPE.A,
		    nettimer: 10,
		    name: "player",
		    gamename: "player" + Math.floor(Math.random()*999),
		    messageboxtimer: 200,
		    checkAgainst: ig.Entity.TYPE.NONE,
		    collides: ig.Entity.COLLIDES.PASSIVE,
		    animSheet: new ig.AnimationSheet( 'media/main_brendan-walk.png', 16, 32 ),
		    
		    init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			// Add the animations
			this.addAnim( 'up', .21, [2,0,1,0] );
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
			
			socket.emit('initializeplayer', this.gamename); 
		    },
		    
		    update: function() {
			    
		    // movement
		    if( ig.input.state('left') && ismove != 1 && ismove != 2 && ismove != 4)
		    {
			this.vel.x = -speed;
			ismove = 3;
			this.direction = 3;
		    }
		    else if( ig.input.state('right')  && ismove != 1 && ismove != 3 && ismove != 4)
		    {
			this.vel.x = +speed;
			ismove = 2;
			this.direction = 2;
		    }
		    else if( ig.input.state('up')  && ismove != 3 && ismove != 2 && ismove != 4)
		    {
			this.vel.y = -speed;
			ismove = 1;
			this.direction = 1;
		    }
		    else if( ig.input.state('down')  && ismove != 1 && ismove != 2 && ismove != 3)
		    {
			this.vel.y = +speed;
			ismove = 4;
			this.direction = 4;
		    }
		    else
		    {
			this.vel.x = 0;
			this.vel.y = 0;
			ismove = 0;
		    }
			    
		    // animations
		    if( this.vel.y < 0 )
		    {
			this.currentAnim = this.anims.up;
			currentanimation = 1;
		    }
		    else if( this.vel.y > 0 )
		    {
			this.currentAnim = this.anims.down;
			currentanimation = 2;
		    }
		    else if( this.vel.x > 0 )
		    {
			this.currentAnim = this.anims.right;
			currentanimation = 4;
		    }
		    else if( this.vel.x < 0 )
		    {
			this.currentAnim = this.anims.left;
			currentanimation = 3;
		    }
		    else
		    {
			if( this.direction == 4 )
			{
			    this.currentAnim = this.anims.idledown;
			    currentanimation = 6;
			}
			if( this.direction == 3 )
			{
			    this.currentAnim = this.anims.idleleft;
			    currentanimation = 7;
			}
			if( this.direction == 2 )
			{
			    this.currentAnim = this.anims.idleright;
			    currentanimation = 8;
			}
			if( this.direction == 1 )
			{
			    this.currentAnim = this.anims.idleup;
			    currentanimation = 5;
			}
		    }
		    
		    // SEND SOCKET UPDATES FOR MOVEMENT
			    
		    if(this.nettimer < 1 && ismove != 0)
		    {
			this.nettimer = 5;
			socket.emit('recievedata',this.pos.x,this.pos.y,currentanimation,this.gamename);
		    }
		    this.nettimer = this.nettimer - 1;
		
		    this.parent();
			    
		    }
		});
 
///////////////////////
// EntityOtherPlayer //
///////////////////////

EntityOtherplayer = ig.Entity.extend({
	    size: {x: 32, y: 48},
	    type: ig.Entity.TYPE.B,
	    speed: 100,
	    name: "otherplayer",
	    gamename: "",
	    animation: 1,
	    //checkAgainst: ig.Entity.TYPE.B,
	    collides: ig.Entity.COLLIDES.PASSIVE,
	    animSheet: new ig.AnimationSheet( 'media/player.png', 32, 48 ),
	    
	    init: function( x, y, settings )
	    {
		this.parent( x, y, settings );
		this.health = 100;
		
		// Add the animations
		this.addAnim( 'up', .21, [9,10,11] );
		this.addAnim( 'down', .21, [0,1,2] );
		this.addAnim( 'left', .21, [3,4,5] );
		this.addAnim( 'right', .21, [6,7,8] );
		this.addAnim( 'idleup', 0.1, [10] );
		this.addAnim( 'idledown', 0.1, [1] );
		this.addAnim( 'idleleft', 0.1, [4] );
		this.addAnim( 'idleright', 0.1, [7] );
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