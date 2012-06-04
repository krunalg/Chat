ig.module(
	'game.entities.non-weltmeister.surf'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySurf = ig.Entity.extend({
	
	size: { x: 16, y: 16 },
	offset: { x: 8, y: 8 },

	follow: null, // name of entity to follow

	animSheet: new ig.AnimationSheet( 'media/rs.surf.png', 32, 32 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		// Add each possible faced state.
		this.addAnim('up', 1, [0], true);
		this.addAnim('down', 1, [2], true);
		this.addAnim('left', 1, [1], true);
		this.addAnim('right', 1, [1], true);
		
		// Flip the image for facing right.
		this.anims.right.flip.x = true;
	},	
	
	draw: function()
	{
		/*
		var target = ig.game.getEntityByName(this.follow);
		if(target!=undefined)
		{
			this.pos.x = target.pos.x;
			this.pos.y = target.pos.y;
		}
		else
		{
			console.debug( "Suft entity could not find entity '" +
				       this.follow + "' and will now kill() itself.");
			this.kill();
		}
		*/
		
		this.parent();
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});