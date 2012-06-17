ig.module('game.entities.non-weltmeister.camera-dodge')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodge = ig.Entity.extend({

		lineWidth: 4,
		
		lineColor: '#f00',

		// Currently selected state.
		limit: undefined,

		// Possible camera restrictions.
		states: ['left', 'up', 'right', 'down' ],

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get game tilesize.
			this.tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = this.tilesize;

			// Set current limit.
			this.limit = this.states[0];
		},

		// Change to next possible state.
		next: function() {

			// Index of current limit.
			var index = this.states.indexOf(this.limit);

			// Select next limit.
			this.limit = ( index == this.states.length-1 ? this.states[0] : this.states[index + 1] );
		},

		update: function() {

			this.parent();
		},

		draw: function() {

			switch(this.limit) {

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

			ig.system.context.strokeStyle = this.lineColor;
			ig.system.context.lineWidth = this.lineWidth;

			ig.system.context.beginPath();
			ig.system.context.moveTo( 
				ig.system.getDrawPos(startX - ig.game.screen.x),
				ig.system.getDrawPos(startY - ig.game.screen.y)
			);
			ig.system.context.lineTo( 
				ig.system.getDrawPos(endX - ig.game.screen.x),
				ig.system.getDrawPos(endY - ig.game.screen.y)
			);
			ig.system.context.stroke();
			ig.system.context.closePath();
		}


	});
});