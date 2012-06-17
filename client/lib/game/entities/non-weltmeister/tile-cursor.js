ig.module('game.entities.non-weltmeister.tile-cursor')

.requires('impact.entity')

.defines(function() {

	EntityTileCursor = ig.Entity.extend({

		lineWidth: 2,
		
		lineColor: '#fff',

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get game tilesize.
			this.tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = this.tilesize;
		},

		update: function() {

			// Match position to tile mouse is over.
			this.pos.x = Math.floor((ig.input.mouse.x + ig.game.screen.x ) / this.tilesize) * this.tilesize;
			this.pos.y = Math.floor((ig.input.mouse.y + ig.game.screen.y ) / this.tilesize) * this.tilesize;

			// Get the would be name of a camera-dodge entity if it exists at this location.
			var name = 'CD.' + this.pos.x + '.' + this.pos.y;

			// Entity by that name exists?
			var cameraDodge = ig.game.getEntityByName(name);

			// Add or alter a camera dodge.
			if( ig.input.pressed('mouse1') ) {

				// Entity exists?
				if(typeof cameraDodge != 'undefined') {

					// Change limit.
					cameraDodge.next();
				
				} else {

					// Spawn camera-dodge entity.
					ig.game.spawnEntity(EntityCameraDodge, this.pos.x, this.pos.y, {name: name});	
				}
			} 

			// Remove a camera dodge.
			else if (ig.input.pressed('mouse2') ) {
				
				// Entity exists?
				if(typeof cameraDodge != 'undefined') {

					// Kill it.
					cameraDodge.kill();
				
				}
			}
		},

		draw: function() {

			ig.system.context.strokeStyle = this.lineColor;
			ig.system.context.lineWidth = this.lineWidth;
			
			// Draw rectangle around tile.
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - (this.lineWidth/2),
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - (this.lineWidth/2),
				(this.size.x + (this.lineWidth/2)) * ig.system.scale,
				(this.size.y + (this.lineWidth/2)) * ig.system.scale
			);
		}


	});
});