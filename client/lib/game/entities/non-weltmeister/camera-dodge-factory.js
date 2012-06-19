ig.module('game.entities.non-weltmeister.camera-dodge-factory')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodgeFactory = ig.Entity.extend({

		// Where to read, write, and delete camera dodge info via AJAX.
		ajaxURL: 'http://127.0.0.1/pokemon-chat/mapper/camera-dodge.php',

		// 2D array populated via Ajax.
		buildMe: undefined,

		// Used for one time building entities.
		built: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get existing camera dodges.
			var request = $.ajax({
			  	url: this.ajaxURL,
			  	type: "POST",
			  	data: {action: 'read'},
			  	dataType: "json"
			});

			request.done(function(json) {
			  	ig.game.cdFactory.buildMe = json;
			  	console.log('Ajax successful: camera-dodge-factory init()');
			});

			request.fail(function(jqXHR, textStatus) {
				console.log('Ajax failed: camera-dodge-factory init() ' + textStatus);
				this.kill();
			});
		},

		update: function() {

			this.parent();

			if(!this.built && typeof this.buildMe != 'undefined') {
				
				for(var x in this.buildMe) {
				
					for(var y in this.buildMe[x]) {

						var cameraDodge = ig.game.spawnEntity(EntityCameraDodge, x, y);
						cameraDodge['index'] = cameraDodge.states.indexOf(this.buildMe[x][y]);
					}
				}

				this.built = true;
			}
		}


	});
});