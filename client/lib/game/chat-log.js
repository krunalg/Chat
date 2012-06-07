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

		},

		/*
		 * Adds a new message to the end of the log.
		 *
		 * @param  html string    HTML formatted message.   
		 * @return      undefined
		 */
		push: function(html) {
			
			// Add new content to the log.
			$('#' + $htmlLogId).append(html);
		},

		/*
		 * Removes excess messages if there is more than allowed by the buffer.
		 *
		 * @return undefined
		 */
		prune: function() {
			
			// Get number of messages in log.
			var messageCount = $('#' + htmlLogId' > div').length;

			// Check if there are too many messages.
			if (messageCount > this.buffer) 
			{
				// How many messages to remove.
				var removeCount = messageCount - this.buffer;

				for(var i=0; i<removeCount; i++)
				{
					// Remove oldest entry.
					$('#' + $htmlLogId + ' :first-child').remove();
				}
			}
		}

	});


})