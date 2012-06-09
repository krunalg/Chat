ig.module('game.entities.non-weltmeister.footprint')

.requires('impact.entity')

.defines(function() {

	EntityFootprint = ig.Entity.extend({
		
		size: {
			x: 16,
			y: 16
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.footprint.png', 16, 16),
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create left animation.
			this.addAnim('left', 0.1667, 
				[
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,2,1,2,1,2,1,2,
					1,2,1,2,1,2,1,2
				], true);

			// Create Right animation.
			this.addAnim('right', 0.1667, 
				[
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,
					1,2,1,2,1,2,1,2,
					1,2,1,2,1,2,1,2
				], true);

			// Create up animation.
			this.addAnim('up', 0.1667, 
				[
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,2,0,2,0,2,0,2,
					0,2,0,2,0,2,0,2
				], true);

			// Create down animation.
			this.addAnim('down', 0.1667, 
				[
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,0,0,0,0,0,0,0,
					0,2,0,2,0,2,0,2,
					0,2,0,2,0,2,0,2
				], true);

			switch (this.facing) {
			case 'left':
			case 'right':
			case 'up':
			case 'down':
				
				// Set current animation.
				this.currentAnim = this.anims[this.facing];
				break;

			default:

				// Error if no direction supplied.
				throw new Error("Footprint entity was spawned without the 'facing' property.");
			}
		},

		update: function() {
			
			// Update animations.
			if (this.currentAnim != null) this.currentAnim.update();
			
			// Check if animation has finished.
			if (this.currentAnim.loopCount >= 1) 
			{
				// Free up resources.
				this.kill();
			}
		}

	});
});
