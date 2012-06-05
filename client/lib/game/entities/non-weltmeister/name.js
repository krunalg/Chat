ig.module('game.entities.non-weltmeister.name').requires('impact.entity', 'impact.font').defines(function() {

	EntityName = ig.Entity.extend({

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

		// Name of the entity to follow.
		follow: null,

		// Used to temporarily stop drawing.
		hideTimer: new ig.Timer(),

		// Initialize
		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},

		draw: function(reallyDraw) {
			// Only draw when the 'reallyDraw' param is true, 
			// so it ignores the "normal" draw call.
			// Additionally, draw only if we shouldn't hide instead
			if (reallyDraw && this.hideTimer.delta() >= 0) {

				// Create reference to player.
				var player = ig.game.getEntityByName(this.follow);

				if (player != undefined) {

					// Align to players position.
					this.pos.x = player.pos.x;
					this.pos.y = player.pos.y;

					// Set name so this entity can be found.
					this.name = player.name + "-NameEntity";

				} else {

					// Write debug message.
					console.debug("EntityName does not an Entity by the name '" + this.follow + "' and will now kill() itself.");

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
					this.follow, this.pos.x - ig.game.screen.x + this.size.x / 2, this.pos.y - ig.game.screen.y - this.size.y, ig.Font.ALIGN.CENTER);
					break;

				default:

					console.debug("EntityName was not supplied valid color and will now kill() itself.");

					// Free up resources.
					this.kill();

					break;

				}
			}

			// Call parent function.
			this.parent();
		}


	});
});
