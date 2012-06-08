ig.module('game.chat-log')

.requires()

.defines(function() {

	ChatLog = ig.Class.extend({

		// ID of element that holds all elements.
		wrapperId: 'ChatLog',

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
			//"font-weight": "bold",

			// Give text a drop shadow.
			"text-shadow": "0.1em 0.1em 0.2em black",

			// Font size.
			"font-size": "10pt"
		},

		// CSS settings for the log container.
		logContainerCSS: {
			"background": "black", 

			"border-radius": "15px"
		},

		init: function(width, height, logId) {

			// Set width in pixels.
			this.width = width;

			// Set height in pixels.
			this.height = height;

			// Set element to hold messages.
			this.htmlLogId = logId;

			// Create wrapper element.
			$('body').append($('<div id="' + this.wrapperId + '"/>'));

			// Position the wrapper over canvas.
			$('#' + this.wrapperId).css("position", "absolute");
			$('#' + this.wrapperId).css("width", $('#canvas').width());
			$('#' + this.wrapperId).css("height", $('#canvas').height());
			$('#' + this.wrapperId).css("left", 0);
			$('#' + this.wrapperId).css("right", 0);
			$('#' + this.wrapperId).css("top", 0);
			$('#' + this.wrapperId).css("bottom", 0);
			$('#' + this.wrapperId).css("margin", "auto");
			//$('#' + this.wrapperId).css("border", "5px solid green");

			// Create a log container.
			$('#' + this.wrapperId).append($('<div id="' + this.htmlLogId + '-container"/>'));

			// Apply CSS settings to chat log container.
			for(var property in this.logContainerCSS)
			{
				$('#' + this.htmlLogId).css( property, this.logContainerCSS[property] );
			}

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