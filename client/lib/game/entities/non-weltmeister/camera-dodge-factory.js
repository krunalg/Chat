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

			// Nessesary to pass this entity into AJAX events.
			var factory = this;

			// Get existing camera dodges.
			var request = $.ajax({
			  	url: this.ajaxURL,
			  	type: "POST",
			  	data: {action: 'read'},
			  	dataType: "json"
			});

			request.done(function(json) {
			  	factory.buildMe = json;
			});

			request.fail(function(jqXHR, textStatus) {
				console.log('Failed AJAX read of camera-dodge entities. Status: ' + textStatus);
				factory.kill();
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
			  	// Do nothing.
			});

			request.fail(function(jqXHR, textStatus) {
			  	console.debug('Failure to ' + action + ' camera-dodge at: ' + x + ', ' + y + '... ' + textStatus);
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

		/*
		 * Returns all the camera-dodge entities that are visible on screen.
		 * Note that it's important that ig.game.screen.x/y be centered over
		 * the player before calling this.
		 *
		 * @return array of entities if some are found, else return undefined.
		 */
		getDodges: function() {

			var entities = ig.game.getEntitiesByType(EntityCameraDodge);

			// Store matching entities here.
			var onScreen = new Array();

			for (var i = 0; i < entities.length; i++) {

				var x = entities[i].pos.x;
				var y = entities[i].pos.y;
				var width = entities[i].size.x;
				var height = entities[i].size.y;
				var state = entities[i].getState();

				switch(state) {

					case 'left':
					case 'right':

						// Limit edge is visible.
						startX = x;
						endX   = x + width;
						break;

					case 'up':
					case 'down':

						// ANY part of entity is visible.
						startX = x + width - 1;
						endX   = x;
						break;
				}
				
				if (startX >= ig.game.screen.x && endX < (ig.game.screen.x + ig.system.width) && y >= ig.game.screen.y && (y + height) < (ig.game.screen.y + ig.system.height)) {

					onScreen.push(entities[i]);
				}
			}

			// Return a populated array or undefined.
			return (onScreen.length == 0 ? undefined : onScreen);
		},

		update: function() {

			this.parent();

			this.visible = !ig.game.cameraDodging;

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

				this.buildMe = undefined;
				this.built = true;
			}
		}


	});
});