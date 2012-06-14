ig.module('game.entities.non-weltmeister.sand-screen')

.requires('impact.entity')

.defines(function() {

	EntitySandScreen = ig.Entity.extend({

		size: {
			x: 64,
			y: 64
		},

		// Load image resource.
		animSheet: new ig.AnimationSheet('media/rs.sand-screen.png', 64, 64),

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Set up animation.
			this.addAnim('static', 1, [0], true);

			// Set current animation.
			this.currentAnim = this.anims['static'];

			// Move 4 pixels 60 times per second.
			this.maxVel.x = this.vel.x = -4 * 60;

			// Move 1 pixel 60 times per second.
			this.maxVel.y = this.vel.y = -1 * 60;
		},

		draw: function() {

			if( this.currentAnim ) {

				for(var y=0; y<Math.ceil(ig.system.height/this.size.y); y++) {
					for(var x=0; x<Math.ceil(ig.system.width/this.size.x); x++) {
						this.currentAnim.draw(
							this.pos.x + (x * this.size.x) - this.offset.x - ig.game._rscreen.x,
							this.pos.y + (y * this.size.y) - this.offset.y - ig.game._rscreen.y
						);
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

			// Call parent.
			this.parent();
		}


	});
});