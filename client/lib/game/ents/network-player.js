ig.module (
    
    'game.ents.network-player'
)

.requires(
    
    'game.ents.player'
)
.defines(function(){

    EntityNetworkPlayer = EntityPlayer.extend({
	zPriority: 1,
	    
	isLocal: false,
	
	size: {x: 16, y: 16},
	offset: { x: 0, y: 16 },
	type: ig.Entity.TYPE.B,
	
	moveState: 'idle', // idle, walk, run
	
	name: "otherplayer",
	animation: 1,
	
	//checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.PASSIVE,
	animSheet: new ig.AnimationSheet( 'media/people/rs.boy.png', 16, 32 ),
	
	facing: 'down',
	isMove: false, // being animated or not
	isJump: false, // used to time offsets in animation
	leftFoot: true, // used to alternate step animations
	destination: 0, // used for both x and y planes
	
	skin: 'boy',
	
	init: function( x, y, settings )
	{
	    this.parent( x, y, settings );
			    
	    this.reskin(this.skin);
	    
	    // create a name entity to follow this one
	    ig.game.spawnEntity(
		EntityName,
		this.pos.x,
		this.pos.y,
		{ follow: this.name, color: 'blue' }
	    );
	    
	    var player = this; // reference to be used by socket events
	    
	    socket.on('moveUpdateOtherPlayer-'+this.name, function (x, y, direction, state)
	    {
		    player.vel.x = 0;
		    player.vel.y = 0;
		    player.pos.x = x;
		    player.pos.y = y;
		    player.facing = direction;
		    player.moveState = state;
		    player.netStartMove();
	    });
	    
	    socket.on('updateOtherPlayer-'+this.name, function (direction) {
		    player.facing = direction;
	    });
	    
	    socket.on('otherPlayerJump-'+this.name, function (x, y, direction)
	    {
		    player.vel.x = 0;
		    player.vel.y = 0;
		    player.pos.x = x;
		    player.pos.y = y;
		    player.facing = direction;
		    player.moveState = 'jump';
		    player.netStartJump();
	    });
	    
	    socket.on('reskinOtherPlayer-'+this.name, function (skin) {
		    player.skin = skin;
		    player.reskin();
	    });
	    
	    socket.on('dropPlayer-'+this.name, function ()
	    {
		    ig.game.events.push(player.name + " left the area.");
		    player.kill();
	    });

	},
	
	goAgain: function()
	// determines if player will continue moving or stop
	{
	    if(this.moveState=='idle')
	    {
		// stop
		this.isMove = false;
		this.isJump = false;
		this.moveAnimStop();
	    }
	    else
	    {
		if(this.canMove()) this.netStartMove();
	    }
	},
	
	netStartMove: function()
	{
	    if(this.moveState=='idle') this.isMove = false;
	    else
	    {
		// determine speed
		if(this.moveState=='run') this.speed = this.runSpeed;
		else if(this.moveState=='walk') this.speed = this.walkSpeed;
		
		// create grass effect
		var newGrass = this.facingGrass();
		if(newGrass) newGrass.play();
		
		this.isMove = true;
		this.setMoveDestination();
		this.moveAnimStart();
	    }
	},
	
	netStartJump: function()
	{
	    // determine speed
	    this.moveState = 'jump';
	    this.speed = this.jumpSpeed;
	    
	    this.isJump = true;
	    this.jumpStart = new ig.Timer();
	    this.spawnShadow();
	    this.setMoveDestination();
		    
	    this.moveAnimStart();
	},
	
	draw: function() {
	    this.parent();
	},
	
	update: function()
	{
	    this.parent();
	    
	    // movement
	    if(this.isJump || this.isMove)
	    {
		this.finishMove();
	    }
	    else
	    {
		// keep animation consistent with this.facing
		this.moveAnimStop();
	    }

	}
    });

   
})