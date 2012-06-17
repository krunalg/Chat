ig.module('game.entities.non-weltmeister.tile-cursor')

.requires('impact.entity')

.defines(function() {

	EntityTileCursor = ig.Entity.extend({

		lineWidth: 2,

		lineColor: '#f00',

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Game tilesize.
			var tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = tilesize;
		},

		update: function() {

			// Set to mouse position.
			this.pos.x = ig.input.mouse.x + ig.game.screen.x;
			this.pos.y = ig.input.mouse.y + ig.game.screen.y;
		},

		draw: function() {

			ig.system.context.strokeStyle = this.lineColor;
			ig.system.context.lineWidth = this.lineWidth;
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - (this.lineWidth/2),
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - (this.lineWidth/2),
				(this.size.x + (this.lineWidth/2)) * ig.system.scale,
				(this.size.y + (this.lineWidth/2)) * ig.system.scale
			);
		}


	});
});