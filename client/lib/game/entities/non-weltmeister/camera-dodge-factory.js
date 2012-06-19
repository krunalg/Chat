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

		// Added a new entity or if one exists, change its state.
		click: function(x, y) {

			var action = 'write';

			var entityName = this.generateName(x, y);

			var entity = ig.game.getEntityByName(entityName);

			if(typeof entity != 'undefined') {

				this.ajax(action, entity.next());

			} else {
				
				this.ajax(action, ig.game.spawnEntity(EntityCameraDodge, x, y, {name: entityName}));
			}
		},

		remove: function(x, y) {

			var action = 'delete';

			var entityName = this.generateName(x, y);

			var entity = ig.game.getEntityByName(entityName);

			if(typeof entity != 'undefined') {

				this.ajax(action, entity);
				entity.kill();

			}
		},

		generateName: function(x, y) {

			return 'CameraDodgeX' + x + 'Y' + y;
		},

		update: function() {

			this.parent();

			// Perform first time build of AJAX-retrieved entities.
			if(!this.built && typeof this.buildMe != 'undefined') {
				
				for(var x in this.buildMe) {
				
					for(var y in this.buildMe[x]) {

						var numericX = parseInt(x);
						
						var numericY = parseInt(y);
						
						var entityName = this.generateName(numericX, numericY);
						
						var cameraDodge = ig.game.spawnEntity(EntityCameraDodge, numericX, numericY, {name: entityName});
						
						// Set state.
						cameraDodge.set(this.buildMe[x][y]);
					}
				}

				this.built = true;
			}
		}


	});
});