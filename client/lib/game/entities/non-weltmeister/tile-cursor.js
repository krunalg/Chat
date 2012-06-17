ig.module('game.entities.non-weltmeister.tile-cursor')

.requires('impact.entity')

.defines(function() {

	EntityTileCursor = ig.Entity.extend({

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Game tilesize.
			var tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = tilesize;
		},

		update: function() {

			// Set to mouse position.
			this.pos.x = ig.input.mouse.x;
			this.pos.y = ig.input.mouse.y;
		}

		draw: function() {

			ig.system.context.strokeStyle = '#f00';
			ig.system.context.lineWidth = 1.0;
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
				this.size.x * ig.system.scale,
				this.size.y * ig.system.scale
			);
		}


	});
});