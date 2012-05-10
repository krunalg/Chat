ig.module(
	'game.ents.jump'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityJump = ig.Entity.extend({
	speed: 69,
	size: {x: 16, y: 16},
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),
	offset: {x: 0, y: -8},
	direction: 'down',
	arrived: false, // will be true when no longer moving and aligned
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.zIndex = 0,
		
		this.addAnim( 'jump', (8/60), [0,0,0,0,1,2,3,3], true );
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
		if(!this.arrived)
		{
			switch(this.direction)
			{
				case 'left':
					if(this.pos.x <= this.dX)
					{
						this.vel.x = 0;
						this.pos.x = this.dX;
						this.arrived = true;
					}
					break;
				case 'right':
					if(this.pos.x >= this.dX)
					{
						this.vel.x = 0;
						this.pos.x = this.dX;
						this.arrived = true;
					}
					break;
				case 'up':
					if(this.pos.y <= this.dY)
					{
						this.vel.y = 0;
						this.pos.y = this.dY;
						this.arrived = true;
					}
					break;
				case 'down':
					if(this.pos.y >= this.dY)
					{
						this.vel.y = 0;
						this.pos.y = this.dY;
						this.arrived = true;
					}
					break;
			}
		}

		
		// bring only first frame of dust above player
		if(this.currentAnim.frame == 4)	this.zIndex = this.pos.y + 3;
		if(this.currentAnim.frame == 5)	this.zIndex = this.pos.y + 0;
		
		// kill entity at last frame
		if(this.currentAnim.frame == 7) this.kill();
		
		this.parent();
	}
});

});