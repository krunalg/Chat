ig.module(

'game.entities.sign')

.requires(

'impact.entity')

.defines(function() {

	EntitySign = ig.Entity.extend({

		size: {
			x: 16,
			y: 16
		},

		// The message to be drawn to screen.
		msg: '',

		// Load image resource for Weltmeister.
		animSheet: new ig.AnimationSheet('media/entity-icons.png', 16, 16),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Specify which icon to use in Weltmeister.
			this.addAnim('weltmeister', 0.1, [3], true);

			// Set current icon.
			this.currentAnim = this.anims.weltmeister;
		},

		ready: function() {

			// Make sign entity invisible in-game.
			delete this.currentAnim;
		},

		update: function() {

			// Call parent.
			this.parent();
		}
	});

})