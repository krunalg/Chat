ig.module(
	'game.entities.bubble'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBubble = ig.Entity.extend({
	size: { x: 16, y: 16 },
	
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),
	
	// load resources
	topLeft: new ig.Image( 'media/chat-bubble-tleft.png' ),
	topRight: new ig.Image( 'media/chat-bubble-tright.png' ),
	bottomLeft: new ig.Image( 'media/chat-bubble-bleft.png' ),
	bottomRight: new ig.Image( 'media/chat-bubble-bright.png' ),
	pointer: new ig.Image( 'media/chat-bubble-point.png' ),
	font: new ig.Font( 'font.pf.tempesta.seven.8pt.png' ),
	
	// some vars
	msg: '',
	msgMaxWidth: 100, // in px

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// breaks up msg into an array of
		// parts that don't exceed msgMaxWidth
		var explode = msg.split(' ');
		var lines = new Array();
		var currStr = '';
		for(var i=0; i<explode.length; i++)
		{
			if(i==0) var space = ''; else var space = ' ';
			var tryStr = currStr + space + explode[i];
			if(this.font.widthForString(tryStr) <= this.msgMaxWidth)
				currStr = tryStr;
			else // start new line
			{
				lines.push(currStr);
				currStr = explode[i];
			}
		}
		
		// converts array of msg parts into
		// one string to be printed
		var toPrint = '';
		for(var i=0; i<lines; i++)
		{
			if(i!=0) toPrint += "\n";
			toPrint += lines[i];
		}
	},	
	
	draw: function()
	{
		font.draw( 'msg', this.pos.x, this.pos.y, ig.Font.ALIGN.LEFT );
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});