ig.module(
	'game.entities.bubble'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBubble = ig.Entity.extend({
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),
	
	// load graphics
	topLeft: new ig.Image( 'media/chat-bubble-tleft.png' ),
	topRight: new ig.Image( 'media/chat-bubble-tright.png' ),
	bottomLeft: new ig.Image( 'media/chat-bubble-bleft.png' ),
	bottomRight: new ig.Image( 'media/chat-bubble-bright.png' ),
	pointer: new ig.Image( 'media/chat-bubble-point.png' ),

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