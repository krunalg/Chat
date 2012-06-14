ig.module('game.entities.non-weltmeister.sand-cloud')

.requires('impact.entity')

.defines(function() {

	EntitySandCloud = ig.Entity.extend({

		size: {
			x: 32,
			y: 32
		},

		// Rotations per second.
		rotationRate: (1 / 0.45),

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.sandcloud.png', 32, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('static', 1, [0], true);

			// Set current animation.
			this.currentAnim = this.anims['static'];

			// Timer used to move along path.
			this.timer = new ig.Timer();
		},

		handleMovementTrace: function(res) {

			// This completely ignores the trace result (res) and always
			// moves the entity according to its velocity
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		},

		draw: function() {

			var pos = this.circularPath(this.timer.delta() * this.rotationRate, this.pos.x, this.pos.y);

			if (this.currentAnim) {
				this.currentAnim.draw(
				pos.x - this.offset.x - ig.game._rscreen.x, pos.y - this.offset.y - ig.game._rscreen.y);
			}
		},

		circularPath: function(index, cx, cy) {
			var radius = 16;
			var theta = -1 * index * 360; // +ve angles are cw
			var newX = cx + radius * Math.cos(theta * Math.PI / 180);
			var newY = cy + radius * Math.sin(theta * Math.PI / 180);

			return {
				x: newX,
				y: newY
			};
		},

		update: function() {

			// Call parent.
			this.parent();
		}


	});
});