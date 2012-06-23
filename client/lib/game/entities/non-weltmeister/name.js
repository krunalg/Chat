ig.module('game.entities.non-weltmeister.name')

.requires('impact.entity', 'impact.font')

.defines(function() {

	EntityName = ig.Entity.extend({

		_wmIgnore: true,

		// Load font resources.
		white: new ig.Font('media/font.white.with.shadow.png'),
		blue: new ig.Font('media/font.blue.with.shadow.png'),
		green: new ig.Font('media/font.green.with.shadow.png'),

		size: {
			x: 16,
			y: 16
		},

		// What color of font to use.
		color: null,

		// Reference of entity of which to follow.
		follow: null,

		// Used to temporarily stop drawing.
		hideTimer: null,

		// Initialize
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create timer used for hiding name.
			this.hideTimer = new ig.Timer();
		},

		update: function() {

			// Kill name entity if player no longer exists.
			if (this.follow._killed) this.kill();

			// Call parent.
			this.parent();
		},

		draw: function(reallyDraw) {
			// Only draw when the 'reallyDraw' param is true, 
			// so it ignores the "normal" draw call.
			// Additionally, draw only if we shouldn't hide instead
			if (reallyDraw && this.hideTimer.delta() >= 0) {

				// If we know of an entity to follow.
				if (this.follow) {

					// Use position of that entity.
					this.pos = this.follow.pos;

				} else {

					// Write debug message.
					console.debug("EntityName: " + this.name + " does not have an entity to follow and will now suicide.");

					// Free up resources.
					this.kill();
				}

				// Select font color.
				switch (this.color) {
				case 'green':
				case 'blue':
				case 'white':

					// Draw font to screen.
					this[this.color].draw(
					this.follow.name, this.pos.x - ig.game.screen.x + this.size.x / 2, this.pos.y - ig.game.screen.y - this.size.y, ig.Font.ALIGN.CENTER);
					break;

				default:

					// Throw an error if no color was specified when spawned.
					throw "Error: EntityName was not supplied valid color.";
					break;

				}
			}

			// Call parent.
			this.parent();
		}


	});
});