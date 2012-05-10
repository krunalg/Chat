ig.module(
	'game.entities.input'
)
.requires(
	'impact.entity',
	'impact.font'
)
.defines(function(){

EntityInput = ig.Entity.extend({
	size: { x: 157, y: 24 },
	
	top: new ig.Image( 'media/chat-input-top.png' ),
	bottom: new ig.Image( 'media/chat-input-bottom.png' ),
	left: new ig.Image( 'media/chat-input-left.png' ),
	right: new ig.Image( 'media/chat-input-right.png' ),
	fill: new ig.Image( 'media/chat-bubble-fill.png' ),
	font: new ig.Font( 'media/04b03.black.font.png' ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},	
	
	draw: function()
	{
		//
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});