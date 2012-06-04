ig.module(
	'game.entities.non-weltmeister.surf'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySurf = ig.Entity.extend({
	
	size: { x: 16, y: 16 },
	follow: null, // name of entity to follow
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},	
	
	draw: function()
	{
		var target = ig.game.getEntityByName(this.follow);
		if(target!=undefined)
		{
			//this.pos.x = target.pos.x;
			//this.pos.y = target.pos.y;
		}
		else
		{
			console.debug( "Name entity could not find entity '" +
				       this.follow + "' and will now kill() itself.");
			this.kill();
		}
		
		this.parent();
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});