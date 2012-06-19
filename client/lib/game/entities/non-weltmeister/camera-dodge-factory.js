ig.module('game.entities.non-weltmeister.camera-dodge-factory')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodgeFactor = ig.Entity.extend({

		// Where to read, write, and delete camera dodge info via AJAX.
		ajaxURL: 'http://127.0.0.1/pokemon-chat/mapper/camera-dodge.php',

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get existing camera dodges.
			var request = $.ajax({
			  	url: this.ajaxURL,
			  	type: "POST",
			  	data: {action: 'read'},
			  	dataType: "json"
			});

			request.done(function(msg) {
			  	console.log('Ajax success: ' + msg);
			});

			request.fail(function(jqXHR, textStatus) {
			  	console.log('Ajax failed:' + textStatus);
			});
		},

		update: function() {

			this.parent();
		}


	});
});