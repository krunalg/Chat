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

		ajax: function(action, entity) {

			var x = entity.pos.x;
			var y = entity.pos.y;

			var request = $.ajax({
			  	
			  	url: this.ajaxURL,
			  	type: "POST",
			  	
			  	// Send states always, even though it's only needed for writes.
			  	data: {action: action, x : x, y: y, state: entity.states[entity['index']]},
			  	dataType: "html"
			});

			request.done(function(msg) {
			  	console.log('camera-dodge.ajax(): ' + action + ' success at: ' + x + ', ' + y);
			});

			request.fail(function(jqXHR, textStatus) {
			  	console.log('camera-dodge.ajax(): ' + action + ' failed at: ' + x + ', ' + y + '... ' + textStatus);
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