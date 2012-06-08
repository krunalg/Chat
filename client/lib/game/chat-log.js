ig.module('game.chat-log')

.requires()

.defines(function() {

	ChatLog = ig.Class.extend({

		// ID of element to hold messages.
		htmlLogId: null,

		// Maximum messages to keep in log.
		buffer: 100,

		// Width of log in pixels.
		width: null,

		// Height of log in pixels.
		height: null,

		// CSS settings for the log element.
		logCSS: {
			
			// No horizontal scrolling.
			"overflow-x": "hidden",

			// Enable vertical scrolling.
			"overflow-y": "auto",

			// Set bold fonts.
			"font-weight": "bold",

			// Give text a drop shadow.
			"text-shadow": "0.1em 0.1em 0.2em black"
		},

		init: function(width, height, logId) {

			// Set width in pixels.
			this.width = width;

			// Set height in pixels.
			this.height = height;

			// Set element to hold messages.
			this.htmlLogId = logId;

			// Create a log container element.
			$('body').append($('<div id="' + this.htmlLogId + '-container"/>'));

			// Position the container over canvas.
			$('#' + this.htmlLogId + '-container').css("position", "absolute");
			$('#' + this.htmlLogId + '-container').css("width", $('#canvas').width());
			$('#' + this.htmlLogId + '-container').css("height", $('#canvas').height());
			$('#' + this.htmlLogId + '-container').css("left", 0);
			$('#' + this.htmlLogId + '-container').css("right", 0);
			$('#' + this.htmlLogId + '-container').css("top", 0);
			$('#' + this.htmlLogId + '-container').css("bottom", 0);
			$('#' + this.htmlLogId + '-container').css("margin", "auto");
			//$('#' + this.htmlLogId + '-container').css("border", "5px solid green");

			// Create log HTML element.
			$('#' + this.htmlLogId + '-container').append($('<div id="' + this.htmlLogId + '"/>'));

			// Set log width.
			$('#' + this.htmlLogId).width(this.width);

			// Set log height.
			$('#' + this.htmlLogId).height(this.height);

			// Place log at bottom of canvas.
			$('#' + this.htmlLogId).css("position", "relative");
			$('#' + this.htmlLogId).css("top", $('#canvas').height() - this.height);

			// Apply CSS settings to chat log.
			for(var property in this.logCSS)
			{
				$('#' + this.htmlLogId).css( property, this.logCSS[property] );
			}
					
		},

		/*
		 * Adds a new message to the end of the log.
		 *
		 * @param  html string    HTML formatted message.
		 * @return      undefined
		 */
		push: function(html) {

			// Add new content to the log.
			$('#' + this.htmlLogId).append(html);

			// Scroll the log.
			this.scroll();
		},

		/*
		 * Scrolls the chat log to the bottom.
		 *
		 * @return undefined
		 */
		scroll: function()
		{
			// Animate the scroll.
			$('#' + this.htmlLogId).animate({scrollTop:$('#' + this.htmlLogId)[0].scrollHeight}, 1000);
		},

		/*
		 * Removes excess messages if there is more than allowed by the buffer.
		 *
		 * @return undefined
		 */
		prune: function() {

			// Get number of messages in log.
			var messageCount = $('#' + this.htmlLogId + ' > div').length;

			// Check if there are too many messages.
			if (messageCount > this.buffer) {
				// How many messages to remove.
				var removeCount = messageCount - this.buffer;

				for (var i = 0; i < removeCount; i++) {
					// Remove oldest entry.
					$('#' + this.htmlLogId + ' :first-child').remove();
				}
			}
		}

	});


})