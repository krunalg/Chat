ig.module('game.entities.sand-cloud')

.requires('impact.entity')

.defines(function() {

	EntitySandCloud = ig.Entity.extend({

		_wmIgnore: true,

		size: {
			x: 32,
			y: 32
		},

		vel: {
			
			// No horizontal movement.
			x: 0,

			// Move 1 pixel 60 times per second.
			y: -60
		},

		// Rotations per second.
		rotationRate: (1 / 0.45),

		// Radius of circular path.
		radius: 16,

		// Timer used to move entity along path.
		timer: null,

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.sand-cloud.png', 32, 32),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('static', 1, [0], true);

			// Set current animation.
			this.currentAnim = this.anims['static'];

			// Start the timer.
			this.timer = new ig.Timer();

			// Prevent speed capping.
			this.maxVel.x = Math.abs(this.vel.x);
			this.maxVel.y = Math.abs(this.vel.y);
		},

		handleMovementTrace: function(res) {

			// This completely ignores the trace result (res) and always
			// moves the entity according to its velocity
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		},

		draw: function() {
			if (this.currentAnim) {
				this.currentAnim.draw(
				this.newPos.x - this.offset.x - ig.game._rscreen.x, this.newPos.y - this.offset.y - ig.game._rscreen.y);
			}
		},

		/*
		 * Returns new x and y positions of circular path centered on the original position.
		 * (Adaptated from similar function found at: http://arc.id.au/JsAnimation.html)
		 *
		 * @param  rate float Number of rotations per second.
		 * @param  cx   integer Center position x in pixels.
		 * @param  cy   integer Center position y in pixels.
		 * @return      object contains two properties, the new x and y.
		 */
		circularPath: function(rate, cx, cy) {
			var theta = -1 * rate * 360; // +angles are cw
			var newX = cx + this.radius * Math.cos(theta * Math.PI / 180);
			var newY = cy + this.radius * Math.sin(theta * Math.PI / 180);

			return {
				x: newX,
				y: newY
			};
		},

		update: function() {

			// Move along circular path.
			this.newPos = this.circularPath(this.timer.delta() * this.rotationRate, this.pos.x, this.pos.y);

			if( (this.pos.y - this.offset.y) < ig.game._rscreen.y - this.size.y - this.radius ) this.kill();

			// Call parent.
			this.parent();
		}


	});
});