ig.module(
	'game.entities.grass'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityGrass = ig.Entity.extend({
	size: {x: 16, y: 16},
	animSheet: new ig.AnimationSheet( 'media/grass-animation.png', 16, 16 ),
	killTimer: new ig.Timer(),
	markedForDeath: false,

	markForDeath: function()
	{
		this.killTimer.set(3);
		this.markedForDeath = true;
	}

	revive: function()
	{
		this.markedForDeath = false;
	}

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.zIndex = 4 + this.pos.y, // above players
		
		this.addAnim( 'rustle', 0.1667, [0,1,2,3,4], true ); // 10 frames of 60 per
		this.currentAnim = null; // invisible by default
	},	
	
	play: function()
	{
		this.currentAnim = this.anims.rustle;
		this.currentAnim.rewind();
	},
	
	update: function()
	{
		if(this.currentAnim!=null) this.currentAnim.update();
		if(this.markedForDeath && this.killTimer.delta()>=0) this.kill();
	}
});

});