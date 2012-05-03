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
	zIndex: 0, // below player
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
	
	check: function()
	{
		console.debug("resetting hideTimer to 1");
		// while player is touching entity continue resetting
		// a timer which when it runs out, will make this entity invisible
		if(this.hideTimer==null) this.hideTimer = new ig.Timer();
		this.hideTimer.set(0.1);
	},
	
	update: function()
	{
		if(this.aboveTimer != null && this.aboveTimer.delta() >= 0)
		{
			console.debug("putting grass above player");
			this.zIndex = 2; // above the player
			ig.game.sortEntitiesDeferred();
			delete this.aboveTimer;
		}
		
		if(this.hideTimer != null && this.hideTimer.delta() >= 0)
		{
			console.debug("putting grass below player again");
			this.zIndex = 0; // behind the player
			ig.game.sortEntitiesDeferred();
			delete this.hideTimer;
		}
		
		this.parent();
	}
});

});