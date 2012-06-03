ig.module(
	'game.entities.non-weltmeister.bubble'
)
.requires(
	'impact.entity',
	'impact.font'
)
.defines(function(){

EntityBubble = ig.Entity.extend({
	size: { x: 16, y: 16 },
	
	animSheet: new ig.AnimationSheet( 'media/rs.jump.png', 16, 8 ),
	
	// to work properly, top/bottom-left/right must all be same dimensions
	topLeft: new ig.Image( 'media/chat-bubble-tleft.png' ),
	topRight: new ig.Image( 'media/chat-bubble-tright.png' ),
	bottomLeft: new ig.Image( 'media/chat-bubble-bleft.png' ),
	bottomRight: new ig.Image( 'media/chat-bubble-bright.png' ),
	pointer: new ig.Image( 'media/chat-bubble-point.png' ),
	fill: new ig.Image( 'media/chat-bubble-fill.png' ),
	font: new ig.Font( 'media/font.white.with.shadow.png' ),
	
	// some vars
	msg: '',
	from: '', // name of entity to follow
	toPrint: '', // will be created later
	msgMaxWidth: 100, // in px
	timer: null, // used to kill old bubbles
	lifespan: 3, // time in seconds before death
	
	// calculations (in px)
	heightOfMessage: 0, // found later
	spaceBetweenLines: 2,
	longestLine: 0, // found later

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// start timer to destroy bubble
		this.timer = new ig.Timer();
		this.timer.set(this.lifespan);
		
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
		this.heightOfMessage -= 3; // because impact auto adds a few px below even for one-liners
		this.longestLine -= 1; // DO NOT CHANGE (removes extra px added by Impact)
	},	
	
	draw: function( reallyDraw )
	{
		// Only draw when the 'reallyDraw' param is true, 
		// so it ignores the "normal" draw call
		if( reallyDraw )
		{
			var target = ig.game.getEntityByName(this.from);
			if(target!=undefined)
			{
				this.pos.x = target.pos.x;
				this.pos.y = target.pos.y;
			}
			var x = this.pos.x - ig.game.screen.x + this.size.x/2;
			var y = this.pos.y - ig.game.screen.y - this.size.y - this.heightOfMessage + 2;
			var padding = 2;
			var cornerWidth = this.topLeft.width;
			var cornerHeight = this.topLeft.height;
			
			// draw rectangles
			this.fill.draw(
				x - this.longestLine/2 - padding - cornerWidth,
				y - padding,
				0,
				0,
				this.longestLine + padding*2 + cornerWidth*2,
				this.heightOfMessage + padding*2
			);
			this.fill.draw(
				x - this.longestLine/2 - padding,
				y - padding - cornerHeight,
				0,
				0,
				this.longestLine + padding*2,
				this.topLeft.height
			);
			this.fill.draw(
				x - this.longestLine/2 - padding,
				y + this.heightOfMessage + padding,
				0,
				0,
				this.longestLine + padding*2,
				this.topLeft.height
			);
			
			// draw corners
			this.topLeft.draw(
				x - this.longestLine/2 - padding - cornerWidth,
				y - padding - cornerHeight
			);
			this.topRight.draw(
				x + this.longestLine/2 + padding,
				y - padding - cornerHeight
			);
			this.bottomLeft.draw(
				x - this.longestLine/2 - padding - cornerWidth,
				y + this.heightOfMessage + padding
			);
			this.bottomRight.draw(
				x + this.longestLine/2 + padding,
				y + this.heightOfMessage + padding
			);
			this.pointer.draw(
				x - this.pointer.width/2,
				y + this.heightOfMessage + padding + cornerHeight
			);
			
			// draw message
			this.font.draw(
				this.toPrint,
				x,
				y,
				ig.Font.ALIGN.CENTER
			);
			
			this.parent();
		}
	},
	
	update: function()
	{
		this.parent();
		
		if(this.timer.delta()>=0) this.kill();
	}
	
});

});