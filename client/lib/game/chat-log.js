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

		init: function(width, height, logId) {

			// Set width in pixels.
			this.width = width;

			// Set height in pixels.
			this.height = height;

			// Set element to hold messages.
			this.htmlLogId = logId;

			// Create log HTML element.
			$('body').append($('<div id="' + this.htmlLogId + '"/>'));

			// Set log width.
			$('#' + this.htmlLogId).width(this.width);

			// Set log height.
			$('#' + this.htmlLogId).height(this.height);

			// Set a red border for debugging.
			$('#' + this.htmlLogId).css("border", "2px solid red");

			// Setting scrolling.
			$('#' + this.htmlLogId).css("overflow-x", "hidden");
			$('#' + this.htmlLogId).css("overflow-y", "scroll");
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