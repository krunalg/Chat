ig.module('game.entities.non-weltmeister.camera-dodge')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodge = ig.Entity.extend({

		lineWidth: 2,
		
		lineColor: '#fff',

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
			var index = this.states.indexOf[this.limit];

			// Select next limit.
			this.limit = ( index == this.states.length-1 ? this.states[0] : this.states[index + 1] );
		},

		update: function() {

			this.parent();
		},

		draw: function() {

		}


	});
});