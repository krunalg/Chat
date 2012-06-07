ig.module('game.chat-log')

.requires()

.defines(function() {

	ChatLog = ig.Class.extend({

		// ID of element to hold messages.
		htmlLogId: null,

		init: function(logId) {

			// Set element to hold messages.
			this.htmlLogId = logId;
		},

		push: function(html)
		{
			// Add new content to the log.
			$('#'+$htmlLogId).append(html);
		}

	});


})