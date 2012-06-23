ig.module('game.entities.camera-dodge')

.requires('impact.entity')

.defines(function() {

	EntityCameraDodge = ig.Entity.extend({

		_wmIgnore: true,

		lineWidth: 4,

		lineColor: '#f00',

		limit: {
			x: undefined,
			y: undefined
		},

		// Limit to which direction?
		states: ['left', 'up', 'right', 'down'],

		// Index of state.
		index: 0,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Get game tilesize.
			this.tilesize = ig.game.collisionMap.tilesize;

			// Set cursor size.
			this.size.x = this.size.y = this.tilesize;

			// Calculate default limit.
			this.recalculate();
		},

		getState: function() {

			return this.states[this['index']];
		},

		// Select next state.
		next: function() {

			this['index'] = ((this['index'] == this.states.length - 1) ? 0 : this['index'] + 1);
			this.recalculate();
			return this;
		},

		// Sets index to that of the matching state.
		set: function(state) {

			var newIndex = this.states.indexOf(state);
			
			if (newIndex != -1) {

				this['index'] = newIndex;
				this.recalculate();
				return true;
			}

			else return false;
		},
		
		// Re-calculate limits based on current state.
		recalculate: function() {

			switch (this.states[this['index']]) {

			case 'up':

				this.limit.y = this.pos.y;
				this.limit.x = undefined;
				break;

			case 'down':

				this.limit.y = this.pos.y + this.size.y - ig.system.height;
				this.limit.x = undefined;
				break;

			case 'left':

				this.limit.x = this.pos.x;
				this.limit.y = undefined;
				break;

			case 'right':

				this.limit.x = this.pos.x + this.size.x - ig.system.width;
				this.limit.y = undefined;
				break;
			}
		},

		update: function() {

			if(typeof this.factory == 'undefined') {

				this.factory = ig.game.getEntitiesByType(EntityCameraDodgeFactory)[0];
			}

			else {

				if(this.factory._killed) this.kill();

				this.visible = this.factory.visible;

			}

			this.parent();
		},

		draw: function() {

			if(this.visible) {

				switch (this.states[this['index']]) {

				case 'left':

					var startX = this.pos.x;
					var startY = this.pos.y;
					var endX = startX;
					var endY = startY + this.size.y;
					break;

				case 'right':

					var startX = this.pos.x + this.size.x;
					var startY = this.pos.y;
					var endX = startX;
					var endY = startY + this.size.y;
					break;

				case 'up':

					var startX = this.pos.x;
					var startY = this.pos.y;
					var endX = startX + this.size.x;
					var endY = startY;
					break;

				case 'down':

					var startX = this.pos.x;
					var startY = this.pos.y + this.size.y;
					var endX = startX + this.size.x;
					var endY = startY;
					break;
				}

				// Set line characteristics.
				ig.system.context.strokeStyle = this.lineColor;
				ig.system.context.lineWidth = this.lineWidth;

				// Draw line on edge limit.
				ig.system.context.beginPath();
				ig.system.context.moveTo(
				ig.system.getDrawPos(startX - ig.game.screen.x), ig.system.getDrawPos(startY - ig.game.screen.y));
				ig.system.context.lineTo(
				ig.system.getDrawPos(endX - ig.game.screen.x), ig.system.getDrawPos(endY - ig.game.screen.y));
				ig.system.context.stroke();
				ig.system.context.closePath();

				// Draw first line to make a cross.
				startX = this.pos.x + (this.size.x / 4);
				startY = this.pos.y + (this.size.y / 4)
				endX = this.pos.x + this.size.x - (this.size.x / 4);
				endY = this.pos.y + this.size.y - (this.size.y / 4);
				ig.system.context.beginPath();
				ig.system.context.moveTo(
				ig.system.getDrawPos(startX - ig.game.screen.x), ig.system.getDrawPos(startY - ig.game.screen.y));
				ig.system.context.lineTo(
				ig.system.getDrawPos(endX - ig.game.screen.x), ig.system.getDrawPos(endY - ig.game.screen.y));
				ig.system.context.stroke();
				ig.system.context.closePath();

				// Draw second line to complete cross.
				startX = this.pos.x + (this.size.x / 4);
				startY = this.pos.y + this.size.y - (this.size.y / 4);
				endX = this.pos.x + this.size.x - (this.size.x / 4);
				endY = this.pos.y + (this.size.y / 4);
				ig.system.context.beginPath();
				ig.system.context.moveTo(
				ig.system.getDrawPos(startX - ig.game.screen.x), ig.system.getDrawPos(startY - ig.game.screen.y));
				ig.system.context.lineTo(
				ig.system.getDrawPos(endX - ig.game.screen.x), ig.system.getDrawPos(endY - ig.game.screen.y));
				ig.system.context.stroke();
				ig.system.context.closePath();
			}
		}


	});
});