ig.module('game.entities.non-weltmeister.bubble').requires('impact.entity', 'impact.font').defines(function() {

	EntityBubble = ig.Entity.extend({
		
		size: {
			x: 16,
			y: 16
		},

		// Load image resources.
		topLeft: new ig.Image('media/chat-bubble-tleft.png'),
		topRight: new ig.Image('media/chat-bubble-tright.png'),
		bottomLeft: new ig.Image('media/chat-bubble-bleft.png'),
		bottomRight: new ig.Image('media/chat-bubble-bright.png'),
		pointer: new ig.Image('media/chat-bubble-point.png'),
		fill: new ig.Image('media/chat-bubble-fill.png'),
		font: new ig.Font('media/font.white.with.shadow.png'),

		// Raw, unprocessed message.
		msg: '',

		// Name of the entity to follow.
		from: '',

		// Processed version of msg.
		toPrint: '',

		// Maximum width in pixels for text.
		msgMaxWidth: 100,

		// Used to kill() old bubbles.
		timer: new ig.Timer(),

		// Time in seconds before entity is killed.
		lifespan: 3,

		// This value is calculated later.
		heightOfMessage: 0,

		// This value is calculated later.
		longestLine: 0,

		// How much space does Impact put between lines?
		spaceBetweenLines: 2,

		// Initialize
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Start count-down to this entity's death.
			this.timer.set(this.lifespan);

			// The following code breaks up our msg into an array of
			// smaller messagew which do not violate msgMaxWidth.
			
			// Break into individual words.
			var words = this.msg.split(' ');
			
			// Create an array where we'll store our <=msgMaxWidth lines.
			var lines = new Array();

			// Initialize our first line.
			var currStr = '';
			var lineWidth = 0;

			// 
			for (var i = 0; i < words.length; i++) {
				
				// Only add a space if it's not the first word.
				var space = (i==0) ? '':' ';

				// Add a word to the current line.
				var tryStr = currStr + space + words[i];

				// Check if current line fits within maximum.
				if (this.font.widthForString(tryStr) <= this.msgMaxWidth) 
				{
					// It does, so make this our new current line.
					currStr = tryStr;
				}
				
				// We exceeded the max width, so make a new line.
				else
				{
					// Measure width of current line.
					lineWidth = this.font.widthForString(currStr);
					
					// Check if this has been the longest line so far.
					if (lineWidth > this.longestLine) 
					{
						// Update the longest line.
						this.longestLine = lineWidth;
					}

					// Add current line to the rest.
					lines.push(currStr);

					// Start a new current line with one word in it.
					currStr = words[i];
				}
			}
			// finish array
			if (currStr != '') {
				lines.push(currStr);
				lineWidth = this.font.widthForString(currStr);
				if (lineWidth > this.longestLine) this.longestLine = lineWidth;
			}

			// converts array of msg parts into
			// one string to be printed
			this.toPrint = '';
			for (var i = 0; i < lines.length; i++) {
				if (i != 0) this.toPrint += "\n";
				this.toPrint += lines[i];
				// for calculating height of entire message
				this.heightOfMessage += this.font.height;
			}
			this.heightOfMessage -= 3; // because impact auto adds a few px below even for one-liners
			this.longestLine -= 1; // DO NOT CHANGE (removes extra px added by Impact)
		},

		draw: function(reallyDraw) {
			// Only draw when the 'reallyDraw' param is true, 
			// so it ignores the "normal" draw call
			if (reallyDraw) {
				var target = ig.game.getEntityByName(this.from);
				if (target != undefined) {
					this.pos.x = target.pos.x;
					this.pos.y = target.pos.y;
				}
				var x = this.pos.x - ig.game.screen.x + this.size.x / 2;
				var y = this.pos.y - ig.game.screen.y - this.size.y - this.heightOfMessage + 2;
				var padding = 2;
				var cornerWidth = this.topLeft.width;
				var cornerHeight = this.topLeft.height;

				// draw rectangles
				this.fill.draw(
				x - this.longestLine / 2 - padding - cornerWidth, y - padding, 0, 0, this.longestLine + padding * 2 + cornerWidth * 2, this.heightOfMessage + padding * 2);
				this.fill.draw(
				x - this.longestLine / 2 - padding, y - padding - cornerHeight, 0, 0, this.longestLine + padding * 2, this.topLeft.height);
				this.fill.draw(
				x - this.longestLine / 2 - padding, y + this.heightOfMessage + padding, 0, 0, this.longestLine + padding * 2, this.topLeft.height);

				// draw corners
				this.topLeft.draw(
				x - this.longestLine / 2 - padding - cornerWidth, y - padding - cornerHeight);
				this.topRight.draw(
				x + this.longestLine / 2 + padding, y - padding - cornerHeight);
				this.bottomLeft.draw(
				x - this.longestLine / 2 - padding - cornerWidth, y + this.heightOfMessage + padding);
				this.bottomRight.draw(
				x + this.longestLine / 2 + padding, y + this.heightOfMessage + padding);
				this.pointer.draw(
				x - this.pointer.width / 2, y + this.heightOfMessage + padding + cornerHeight);

				// draw message
				this.font.draw(
				this.toPrint, x, y, ig.Font.ALIGN.CENTER);

				this.parent();
			}
		},

		update: function() {
			this.parent();

			if (this.timer.delta() >= 0) this.kill();
		}

	});

});
