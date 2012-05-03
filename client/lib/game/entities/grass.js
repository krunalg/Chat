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
	coverTimer: null, // timer used to hide player behind grass
	hideTimer: null, // used to make this entity invis after player leaves
	checkAgainst: ig.Entity.TYPE.A,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'rustle', 0.1667, [0,1,2,3,4], true ); // 10 frames of 60 per
		this.currentAnim = null; // invisible by default
	},	
	
	play: function()
	{
		this.currentAnim = this.anims.rustle;
		this.currentAnim.rewind();
		this.aboveTimer = new ig.Timer();
		this.aboveTimer.set(0.183) // 11/60th of a sec
		
		// after 11/60th of a sec place entity above player
	},
	
	hide: function()
	{
		console.debug("Hiding patch of grass");
		//this.currentAnim = null;
		this.zIndex = this.pos.y + 0; // below player all players
		ig.game.sortEntitiesDeferred();
	},
	
	update: function()
	{
		if(this.aboveTimer != null && this.aboveTimer.delta() >= 0)
		{
			console.debug("Putting patch of grass above player");
			this.zIndex = 3 + this.pos.y; // above all players and npcs
			ig.game.sortEntitiesDeferred();
			delete this.aboveTimer;
		}
		
		this.parent();
	}
});

});