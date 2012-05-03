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
	checkAgainst: ig.Entity.TYPE.A,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.zIndex = 3 + this.pos.y, // above player, otherplayer, and npc
		
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
		this.parent();
	}
});

});