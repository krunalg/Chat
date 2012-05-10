ig.module(
	'game.ents.name'
)
.requires(
	'impact.entity',
	'impact.font'
)
.defines(function(){

EntityName = ig.Entity.extend({
	
	size: { x: 16, y: 16 },
	white: new ig.Font( 'media/04b03.font.png' ),
	blue: new ig.Font( 'media/04b03.font.bl.png' ),
	green: new ig.Font( 'media/04b03.font.gr.png' ),
	
	follow: null, // name of entity to follow
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},	
	
	draw: function( reallyDraw )
	{
		// Only draw when the 'reallyDraw' param is true, 
		// so it ignores the "normal" draw call
		if( reallyDraw )
		{
			var target = ig.game.getEntityByName(this.follow);
			if(target!=undefined)
			{
				this.pos.x = target.pos.x;
				this.pos.y = target.pos.y;
			}
			else
			{
				console.debug( "Name entity could not find entity '" +
					       this.follow + "' and will not kill() itself.");
				this.kill();
			}
			
			this.green.draw(
				this.follow,
				this.pos.x - ig.game.screen.x + this.size.x/2,
				this.pos.y - ig.game.screen.y - this.size.y,
				ig.Font.ALIGN.CENTER
			);
			
			this.parent();
		}
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});