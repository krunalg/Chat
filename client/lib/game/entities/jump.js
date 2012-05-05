ig.module(
	'game.entities.jump'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityJump = ig.Entity.extend({
	speed: 69,
	size: {x: 16, y: 16},
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),
	checkAgainst: ig.Entity.TYPE.A,
	offset: {x: 0, y: -8},
	direction: 'down',
	aligned: false, // will be true when no longer moving and aligned
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.zIndex = 0,
		
		this.addAnim( 'jump', 0.1667, [0,0,0,0,1,2,3] ); // 10 frames of 60 per
		this.currentAnim = this.anims.jump;
		
		this.dX = this.pos.x; // destination x
		this.dY = this.pos.y; // and y
		var tilesize = ig.game.collisionMap.tilesize;
		
		switch(this.direction)
		{
			case 'left':
				this.vel.x = -this.speed;
				this.dX -= tilesize * 2;
				break;
			case 'right':
				this.vel.x = +this.speed;
				this.dX += tilesize * 2;
				break;
			case 'up':
				this.vel.y = -this.speed;
				this.dY -= tilesize * 2;
				break;
			case 'down':
				this.vel.y = +this.speed;
				this.dY += tilesize * 2;
				break;
		}
	},	
	
	update: function()
	{
		switch(this.direction)
		{
			case 'left':
				if(this.pos.x <= this.dX) this.vel.x = 0;
				this.aligned = true;
				break;
			case 'right':
				if(this.pos.x >= this.dX) this.vel.x = 0;
				this.aligned = true;
				break;
			case 'up':
				if(this.pos.y <= this.dY) this.vel.y = 0;
				this.aligned = true;
				break;
			case 'down':
				if(this.pos.y >= this.dY) this.vel.y = 0;
				this.aligned = true;
				break;
		}
		
		this.parent();
	}
});

});