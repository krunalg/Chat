ig.module('game.entities.grass').requires('impact.entity').defines(function() {

	EntityGrass = ig.Entity.extend({
		
		size: {
			x: 16,
			y: 16
		},

		animSheet: new ig.AnimationSheet('media/grass-animation.png', 16, 16),
		killTimer: null,
		markedForDeath: false,

		// Start count-down until this entity will be killed.
		markForDeath: function() {
			this.killTimer.set(3);
			this.markedForDeath = true;
		},

		// Save this entity from being killed.
		revive: function() {
			this.markedForDeath = false;
		},

		// Initiate
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create timer to count-down to entity's death.
			this.killTimer = new ig.Timer();

			this.zIndex = 4 + this.pos.y, // above players
			this.addAnim('rustle', 0.1667, [0, 1, 2, 3, 4], true); // 10 frames of 60 per
			this.currentAnim = null; // invisible by default
		},

		play: function() {
			// Reset animation to first frame.
			this.anims.rustle.rewind();

			// Set animation.
			this.currentAnim = this.anims.rustle;
		},

		// Override all update function.
		update: function() {
			
			// Update animations.
			if (this.currentAnim != null) this.currentAnim.update();
			
			// Check if entity is no longer needed.
			if (this.markedForDeath && this.killTimer.delta() >= 0) 
			{
				// Free up resources.
				this.kill();
			}
		}

	});
});
