/*
This entity calls ig.game.loadLevel() when its triggeredBy() method is called -
usually through an EntityTrigger entity.


Keys for Weltmeister:

level
	Name of the level to load. E.g. "LevelTest1" or just "test1" will load the 
	'LevelTest1' level.
*/

ig.module(
	'game.entities.exit'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityExit = ig.Entity.extend({
	//_wmDrawBox: true,
	//_wmBoxColor: 'rgba(0, 0, 255, 0.7)',
	
	size: {x: 16, y: 16},
	
	map: null,
	goTo: null,
	
	animSheet: new ig.AnimationSheet( 'media/entity-icons.png', 16, 16 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// add the animations
		this.addAnim( 'weltmeister', 0.1, [0] );
		this.currentAnim = this.anims.weltmeister;
		
		//		
	},
	
	ready: function()
	{
		delete this.currentAnim; // invisible in-game
		
		// who will trigger the exit?
		this.player = ig.game.getEntitiesByType( EntityPlayer )[0];
	},
	
	update: function()
	{
		if( this.player.pos.x == this.pos.x &&
		    this.player.pos.y == this.pos.y)
		{
			console.debug("You're stepping on me.");
			// if all values not null
			if( !(this.map==null || this.goTo==null) )
			{
				console.debug("Gonna load the map.");
				ig.game.zone(this.map, this.goTo);
			}
		}
		
		this.parent();
	}
});

});