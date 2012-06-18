ig.module('game.entities.non-weltmeister.camera-dodge')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodge = ig.Entity.extend({

		lineWidth: 4,

		lineColor: '#f00',

		// Currently selected state.
		limit: {
			x: undefined,
			y: undefined
		},

		ajaxURL: 'http://127.0.0.1/pokemon-chat/mapper/camera-dodge.php',

		// Possible camera restrictions.
		states: ['left', 'up', 'right', 'down'],

		// Index of current state.
		index: 0,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get game tilesize.
			this.tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = this.tilesize;

			// Set first limit.
			this.next();
		},

		ajax: function(action) {

			var x = this.pos.x;
			var y = this.pos.y;

			var request = $.ajax({
			  	
			  	url: this.ajaxURL,
			  	type: "POST",
			  	
			  	// Send states always, even though it's only needed for writes.
			  	data: {action: action, x : x, y: y, state: this.states[this['index']]},
			  	dataType: "html"
			});

			request.done(function(msg) {
			  	console.log('camera-dodge.ajax(): ' + action + ' success at: ' + x + ', ' + y);
			});

			request.fail(function(jqXHR, textStatus) {
			  	console.log('camera-dodge.ajax(): ' + action + ' FAILED at: ' + x + ', ' + y + '... ' + textStatus);
			});
		},

		// Change to next possible state and return current state.
		next: function() {

			// Select next state.
			this['index'] = ((this['index'] == this.states.length - 1) ? 0 : this['index'] + 1);

			switch (this.states[this['index']]) {

			case 'up':

				this.limit.y = this.pos.y;
				this.limit.x = undefined;
				break;

			case 'down':

				this.limit.y = this.pos.y + this.size.y - ig.system.height;
				this.limit.x = undefined;
				break;

			case 'left':

				this.limit.x = this.pos.x;
				this.limit.y = undefined;
				break;

			case 'right':

				this.limit.x = this.pos.x + this.size.x - ig.system.width;
				this.limit.y = undefined;
				break;
			}

			// Update state on server.
			this.ajax('write');

			return this.states[this['index']];
		},

		kill: function() {

			// Remove record from server.
			this.ajax('delete');

			this.parent();
		},

		draw: function() {

			switch (this.states[this['index']]) {

			case 'left':

				var startX = this.pos.x;
				var startY = this.pos.y;
				var endX = startX;
				var endY = startY + this.size.y;
				break;

			case 'right':

				var startX = this.pos.x + this.size.x;
				var startY = this.pos.y;
				var endX = startX;
				var endY = startY + this.size.y;
				break;

			case 'up':

				var startX = this.pos.x;
				var startY = this.pos.y;
				var endX = startX + this.size.x;
				var endY = startY;
				break;

			case 'down':

				var startX = this.pos.x;
				var startY = this.pos.y + this.size.y;
				var endX = startX + this.size.x;
				var endY = startY;
				break;
			}

			// Set line characteristics.
			ig.system.context.strokeStyle = this.lineColor;
			ig.system.context.lineWidth = this.lineWidth;

			// Begin drawing line along limit edge.
			ig.system.context.beginPath();
			ig.system.context.moveTo(
			ig.system.getDrawPos(startX - ig.game.screen.x), ig.system.getDrawPos(startY - ig.game.screen.y));
			ig.system.context.lineTo(
			ig.system.getDrawPos(endX - ig.game.screen.x), ig.system.getDrawPos(endY - ig.game.screen.y));
			ig.system.context.stroke();
			ig.system.context.closePath();
		}


	});
});