ig.module(
	'game.entities.bubble'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBubble = ig.Entity.extend({
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		//
	},	
	
	update: function()
	{
		this.parent();
	}
});

});