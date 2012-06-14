ig.module('game.entities.non-weltmeister.sandcloud')

.requires('impact.entity')

.defines(function() {

	EntitySandcloud = ig.Entity.extend({

		size: {
			x: 32,
			y: 32
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.sandcloud.png', 32, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('static', 1, [0], true);

			// Set current animation.
			this.currentAnim = this.anims['static'];
		},

		handleMovementTrace: function(res) {

			// This completely ignores the trace result (res) and always
			// moves the entity according to its velocity
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		},

		update: function() {

			// Call parent.
			this.parent();
		}
		

	});
});