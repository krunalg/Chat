ig.module('game.entities.non-weltmeister.sand-cloud')

.requires('impact.entity')

.defines(function() {

	EntitySandCloud = ig.Entity.extend({

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
			
			var pos = this.circularPath(this.timer);

			if (this.currentAnim) {
				this.currentAnim.draw(
				pos.x + this.pos.x - this.offset.x - ig.game._rscreen.x, pos.y + this.pos.y - this.offset.y - ig.game._rscreen.y);
			}
		},

		circularPath: function(index) {
			var radius = 80;
			var cx = 120;
			var cy = 120;
			var aStep = 3; // 3 degrees per step
			var theta = index * aStep; // +ve angles are cw
			var newX = cx + radius * Math.cos(theta * Math.PI / 180);
			var newY = cy + radius * Math.sin(theta * Math.PI / 180);

			// return an object defining state that can be understood by drawFn
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