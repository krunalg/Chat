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
	white: new ig.Font( 'media/font.white.with.shadow.png' ),
	blue: new ig.Font( 'media/font.blue.with.shadow.png' ),
	green: new ig.Font( 'media/font.green.with.shadow.png' ),
	color: null, // what color font to use
	follow: null, // name of entity to follow
	hideTimer: null, // used to temporarily not draw
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.hideTimer = new ig.Timer();
	},	
	
	draw: function( reallyDraw )
	{
		// Only draw when the 'reallyDraw' param is true, 
		// so it ignores the "normal" draw call.
		// Additionally, draw only if we shouldn't hide instead
		if( reallyDraw && this.hideTimer.delta() >= 0 )
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
					       this.follow + "' and will now kill() itself.");
				this.kill();
			}
			
			switch(this.color)
			{
				case 'green':
					this.green.draw(
						this.follow,
						this.pos.x - ig.game.screen.x + this.size.x/2,
						this.pos.y - ig.game.screen.y - this.size.y,
						ig.Font.ALIGN.CENTER
					);
					break;
				case 'blue':
					this.blue.draw(
						this.follow,
						this.pos.x - ig.game.screen.x + this.size.x/2,
						this.pos.y - ig.game.screen.y - this.size.y,
						ig.Font.ALIGN.CENTER
					);
					break;
				default:
					this.white.draw(
						this.follow,
						this.pos.x - ig.game.screen.x + this.size.x/2,
						this.pos.y - ig.game.screen.y - this.size.y,
						ig.Font.ALIGN.CENTER
					);
					break;
			}
			
			
			this.parent();
		}
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});