ig.module(
	'game.entities.bubble'
)
.requires(
	'impact.entity',
	'impact.font'
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
	fill: new ig.Image( 'media/chat-bubble-fill.png' ),
	font: new ig.Font( 'media/04b03.black.font.png' ),
	
	// some vars
	msg: '',
	toPrint: '', // will be created later
	msgMaxWidth: 100, // in px
	
	// calculations (in px)
	heightOfMessage: 0, // found later
	spaceBetweenLines: 2,
	longestLine: 0, // found later

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// breaks up msg into an array of
		// parts that don't exceed msgMaxWidth
		var explode = this. msg.split(' ');
		var lines = new Array();
		var currStr = '';
		var lineWidth = 0;
		for(var i=0; i<explode.length; i++)
		{
			if(i==0) var space = ''; else var space = ' ';
			var tryStr = currStr + space + explode[i];
			if(this.font.widthForString(tryStr) <= this.msgMaxWidth)
				currStr = tryStr;
			else // start new line
			{
				lineWidth = this.font.widthForString(currStr);
				if(lineWidth > this.longestLine)
					this.longestLine = lineWidth;
				lines.push(currStr);
				currStr = explode[i];
			}
		}
		// finish array
		if(currStr!='')
		{
			lines.push(currStr);
			lineWidth = this.font.widthForString(currStr);
			if(lineWidth > this.longestLine)
			this.longestLine = lineWidth;
		}
		
		// converts array of msg parts into
		// one string to be printed
		this.toPrint = '';
		for(var i=0; i<lines.length; i++)
		{
			if(i!=0) this.toPrint += "\n";
			this.toPrint += lines[i];
			// for calculating height of entire message
			this.heightOfMessage += this.font.height;
		}
		this.heightOfMessage -= 2; // shave off extra 2px impact seems to add on
		
	},	
	
	draw: function()
	{
		var context = ig.system.context;
		
		var x = this.pos.x - ig.game.screen.x + this.size.x/2;
		var y = this.pos.y - ig.game.screen.y - this.size.y - this.heightOfMessage;
		
		/*
		context.fillStyle = '#FFF'; // white
		context.fillRect (
			x - this.longestLine/2,
			y,
			this.longestLine,
			this.heightOfMessage
			);
		context.fillRect (
			x - this.longestLine/2 + 3,
			y - 3,
			this.longestLine - 6,
			3
			);
		context.fillRect (
			x - this.longestLine/2 + 3,
			y + this.heightOfMessage,
			this.longestLine - 6,
			3
			);
		*/
		this.fill.draw(
			x - this.longestLine/2,
			y,
			0,
			0,
			this.longestLine,
			this.heightOfMessage
		);
		this.fill.draw(
			x - this.longestLine/2 + 3,
			y - 3,
			0,
			0,
			this.longestLine - 6,
			3
		);
		this.fill.draw(
			x - this.longestLine/2 + 3,
			y + this.heightOfMessage,
			0,
			0,
			this.longestLine - 6,
			3
		);
		
		this.topLeft.draw(
				  x - this.longestLine/2,
				  y - this.topLeft.height
				  );
		this.topRight.draw(
				  x + this.longestLine/2 - this.topRight.width,
				  y - this.topRight.height
				  );
		this.bottomLeft.draw(
				  x - this.longestLine/2,
				  y + this.heightOfMessage
				  );
		this.bottomRight.draw(
				  x + this.longestLine/2 - this.bottomRight.width,
				  y + this.heightOfMessage
				  );
		this.pointer.draw(
				  x,
				  y + this.heightOfMessage + 3
				  );
		
		this.font.draw(
			       this.toPrint,
			       x,
			       y,
			       ig.Font.ALIGN.CENTER
			       );
	
	},
	
	update: function()
	{
		this.parent();
	}
	
});

});