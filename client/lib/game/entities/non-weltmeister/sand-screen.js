ig.module('game.entities.non-weltmeister.sand-screen')

.requires('impact.entity')

.defines(function() {

	EntitySandScreen = ig.Entity.extend({

		size: {
			x: 64,
			y: 64
		},

		vel: {
			
			// Move 4 pixels 60 times per second.
			x: (-4 * 60),

			// Move 1 pixel 60 times per second.
			y: (-1 * 60)
		}

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.sand-screen.png', 64, 64),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('static', 1, [0], true);

			// Set current animation.
			this.currentAnim = this.anims['static'];

			// Prevent speed capping.
			this.maxVel.x = Math.abs(this.vel.x);
			this.maxVel.y = Math.abs(this.vel.y);

			// Used to know where to start draw-tiling.
			this.startPos = new Object();

			// Number of tiles to cover horizontal.
			this.tilesX = Math.ceil(ig.system.width / this.size.x) + 1;

			// Number of tiles to cover vertical.
			this.tilesY = Math.ceil(ig.system.height / this.size.y) + 1;
		},

		draw: function() {

			// Repeat tiles to cover entire screen.
			if (this.currentAnim) {
				for (var y = 0; y < this.tilesY; y++) {
					for (var x = 0; x < this.tilesX; x++) {
						this.currentAnim.draw(
						this.startPos.x + (x * this.size.x) - this.offset.x, this.startPos.y + (y * this.size.y) - this.offset.y);
					}
				}
			}
		},

		handleMovementTrace: function(res) {

			// This completely ignores the trace result (res) and always
			// moves the entity according to its velocity
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		},

		update: function() {

			// Calculate start positions for tiling.
			this.startPos.x = Math.floor(this.pos.x % this.size.x);
			this.startPos.y = Math.floor(this.pos.y % this.size.y);

			// Adjust non-negative x or y values.
			if (this.startPos.x > 0) this.startPos.x = this.startPos.x - this.size.x;
			if (this.startPos.y > 0) this.startPos.y = this.startPos.y - this.size.y;

			// Call parent.
			this.parent();
		}


	});
});