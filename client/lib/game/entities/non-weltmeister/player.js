ig.module(

'game.entities.non-weltmeister.player')

.requires(

'impact.entity').defines(function() {

	EntityPlayer = ig.Entity.extend({
		zPriority: 0,

		// false unless entity defines otherwise
		isLocal: false,
		
		// some default values
		facing: 'down',

		// True when over water; False on land.
		swimming: false,

		speed: 69,
		walkSpeed: 69,
		jumpSpeed: 69,
		runSpeed: (138 * 8),
		swimSpeed: 138,
		maxVel: {
			x: (138 * 8),
			y: (138 * 8)
		},

		// idle, walk, run, swim, (jump?)
		moveState: 'idle',

		size: {
			x: 16,
			y: 16
		},

		animSheet: new ig.AnimationSheet('media/entity-icons.png', 16, 16),

		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		// used to only send network move updates if change occurs
		lastState: '',

		// waiting for move key-press
		isMove: false,

		isJump: false,

		// used to alternate step animations
		leftFoot: true,

		// used for both x and y planes
		destination: 0,

		// Updates the speed the player and his moveState.
		setMoveState: function(state)
		{
			if (typeof this[state + 'Speed'] != 'undefined')
			{
				this.speed = this[state + 'Speed'];
				this.moveState = state;
			}
			else throw "No speed value set for for state: " + state;
		},

		// Spawns a surf entity on the tile currently faced.
		spawnSurf: function()
		{
			var offsetX = offsetY = 0;
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				offsetX--;
				break;
			case 'right':
				offsetX++;
				break;
			case 'up':
				offsetY--;
				break;
			case 'down':
				offsetY++;
				break;
			}
			ig.game.spawnEntity(EntitySurf, this.pos.x + (offsetX * tilesize), this.pos.y + (offsetY * tilesize), {
				facing: this.facing
			});
		},

		trySpawningGrass: function() {
			var offsetX = offsetY = 0;
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				offsetX--;
				break;
			case 'right':
				offsetX++;
				break;
			case 'up':
				offsetY--;
				break;
			case 'down':
				offsetY++;
				break;
			}
			// First check if entity already exists
			var allGrass = ig.game.getEntitiesByType(EntityGrass);
			if (allGrass) {
				for (var i = 0; i < allGrass.length; i++) {
					if (allGrass[i].pos.x == this.pos.x + (offsetX * tilesize) && allGrass[i].pos.y == this.pos.y + (offsetY * tilesize) && !allGrass[i]._killed) {
						// Save from being killed if marked for death.
						if (allGrass[i].markedForDeath) allGrass[i].revive();

						return allGrass[i];
					}
				}
			}
			// Check if the faced tile is a grass tile.
			if (ig.game.isSpecialTile(
			(this.pos.x / tilesize) + offsetX, (this.pos.y / tilesize) + offsetY, specialTiles['grass'], 'lower')) {
				var grassX = this.pos.x + (offsetX * tilesize);
				var grassY = this.pos.y + (offsetY * tilesize);
				console.log("Creating grass entity at: " + grassX + "," + grassY);
				return ig.game.spawnEntity(EntityGrass, this.pos.x + (offsetX * tilesize), this.pos.y + (offsetY * tilesize), {
					direction: this.facing
				});
			}

			return false;
		},

		inGrass: function()
		// returns a grass entity if player is in one
		// otherwise returns false
		{
			// check for collision against grass entity
			var allGrass = ig.game.getEntitiesByType(EntityGrass);
			if (allGrass) {
				for (var i = 0; i < allGrass.length; i++) {
					if (allGrass[i].pos.x == this.pos.x && allGrass[i].pos.y == this.pos.y) {
						return allGrass[i];
					}
				}
			}
			return false;
		},

		spawnShadow: function() {
			ig.game.spawnEntity(EntityJump, this.pos.x, this.pos.y, {
				direction: this.facing
			});
		},


		canMove: function()
		// returns true if no collision will occur
		// in the direction the player faces
		{
			var vx = vy = 0; // velocity
			var ox = oy = 0; // tile offset
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				vx = -1;
				ox = -tilesize;
				break;
			case 'right':
				vx = 1;
				ox = tilesize;
				break;
			case 'up':
				vy = -1;
				oy = -tilesize;
				break;
			case 'down':
				vy = 1;
				oy = tilesize;
				break;
			}
			// check map collisions
			var res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, vx, vy, this.size.x, this.size.y);
			if (res.collision.x || res.collision.y) return false;

			// check npc collisions
			var npcs = ig.game.getEntitiesByType(EntityNpc);
			if (npcs) {
				for (var i = 0; i < npcs.length; i++) {
					if ((npcs[i].pos.x == this.pos.x + ox) && (npcs[i].pos.y == this.pos.y + oy)) {
						return false;
					}
				}
			}


			return true; // no collisions
		},

		facingWater: function()
		// returns true if the faced tile is a swimmable water tile
		{
			var offsetX = offsetY = 0;
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				offsetX--;
				break;
			case 'right':
				offsetX++;
				break;
			case 'up':
				offsetY--;
				break;
			case 'down':
				offsetY++;
				break;
			}
			if (ig.game.isSpecialTile((this.pos.x / tilesize) + offsetX, (this.pos.y / tilesize) + offsetY, specialTiles['water'], 'lower')) {
				return true;
			}
			return false;
		},

		canJump: function()
		// returns true if faced tile is jumpable
		// otherwise false
		{
			var vx = 0;
			var vy = 0;
			var want = -1; // to match weltmeister one-way collision tiles
			var c = ig.game.collisionMap;
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				vx = -tilesize;
				want = 45;
				break;
			case 'right':
				vx = tilesize;
				want = 34;
				break;
			case 'up':
				vy = -tilesize;
				want = 12;
				break;
			case 'down':
				vy = tilesize;
				want = 23;
				break;
			}
			var pX = this.pos.x + vx;
			var pY = this.pos.y + vy;
			if (c.getTile(pX, pY) == want) return true; // can jump
			return false; // no collisions
		},

		finishMove: function() {
			if (this.isJump) {
				// update jump animation
				var jumpTime = this.jumpStart.delta();
				if (jumpTime >= 0 && jumpTime < (2 / 60)) this.offset.y = 16 + 4;
				else if (jumpTime >= (2 / 60) && jumpTime < (4 / 60)) this.offset.y = 16 + 6;
				else if (jumpTime >= (4 / 60) && jumpTime < (6 / 60)) this.offset.y = 16 + 8;
				else if (jumpTime >= (6 / 60) && jumpTime < (8 / 60)) this.offset.y = 16 + 10;
				else if (jumpTime >= (8 / 60) && jumpTime < (10 / 60)) this.offset.y = 16 + 12;
				else if (jumpTime >= (10 / 60) && jumpTime < (16 / 60)) this.offset.y = 16 + 14;
				else if (jumpTime >= (16 / 60) && jumpTime < (18 / 60)) this.offset.y = 16 + 12;
				else if (jumpTime >= (18 / 60) && jumpTime < (20 / 60)) this.offset.y = 16 + 10;
				else if (jumpTime >= (20 / 60) && jumpTime < (22 / 60)) this.offset.y = 16 + 8;
				else if (jumpTime >= (22 / 60) && jumpTime < (24 / 60)) this.offset.y = 16 + 6;
				else if (jumpTime >= (24 / 60) && jumpTime < (26 / 60)) this.offset.y = 16 + 4;
				else this.offset.y = 16 + 0;
			}

			if (this.destinationReached()) // check if reached destination
			{
				this.isJump = false; // no longer jumping (regardless if was)
				this.alignToGrid(); // ensure player is at legal coordinates
				this.vel.x = this.vel.y = 0; // stop player
				this.goAgain(); // check if we should continue moving
				if (this.isLocal) updateBorder(this); // change repeating border
			} else this.move(); // continue to destination
		},

		alignToGrid: function() {
			switch (this.facing) {
			case 'left':
			case 'right':
				this.pos.x = this.destination;
				break;
			case 'up':
			case 'down':
				this.pos.y = this.destination;
				break;
			}
		},

		setMoveDestination: function() {
			var tilesize = ig.game.collisionMap.tilesize;
			if (this.isJump) var dist = 2;
			else var dist = 1;

			switch (this.facing) {
			case 'left':
				this.destination = this.pos.x - tilesize * dist;
				break;
			case 'right':
				this.destination = this.pos.x + tilesize * dist;
				break;
			case 'up':
				this.destination = this.pos.y - tilesize * dist;
				break;
			case 'down':
				this.destination = this.pos.y + tilesize * dist;
				break;
			}
		},

		move: function()
		// instructs impact to move player
		// in the direction he's facing
		{
			switch (this.facing) {
			case 'left':
				this.vel.x = -this.speed;
				break;
			case 'right':
				this.vel.x = +this.speed;
				break;
			case 'up':
				this.vel.y = -this.speed;
				break;
			case 'down':
				this.vel.y = +this.speed;
				break;
			}
		},

		destinationReached: function()
		// returns true if reached or past destination
		// otherwise returns false
		{
			switch (this.facing) {
			case 'left':
				return this.pos.x <= this.destination;
				break;
			case 'right':
				return this.pos.x >= this.destination;
				break;
			case 'up':
				return this.pos.y <= this.destination;
				break;
			case 'down':
				return this.pos.y >= this.destination;
				break;
			}
			return false;
		},

		moveAnimStart: function(alternateFeet) {
			// Determine which foot to put forward.
			var foot = '';
			if(!this.swimming && this.moveState!='idle') 
				this.leftFoot ? foot = 'A' : foot = 'B';

			// Set current animation.
			this.currentAnim = this.anims[this.moveState + ig.game.capitaliseFirstLetter(this.facing) + foot];

			// Play from first frame.
			this.currentAnim.rewind();

			// Switch foot for next time.
			if (alternateFeet) this.leftFoot = !this.leftFoot;
		},

		moveAnimStop: function()
		// set animation to idle
		{
			switch (this.facing) {

			case 'left':
			case 'right':
			case 'up':
			case 'down':
				this.currentAnim = this.anims['idle' + ig.game.capitaliseFirstLetter(this.facing)];
				break;
			};
		},

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// set players appearance
			this.reskin(this.skin);
		},

		reskin: function() {
			switch (this.skin) {
			case 'boy':
			case 'girl':
			case 'fat':
			case 'kid':
			case 'labgeek':
				var use = true;
				break;
			default:
				var use = false;
				break;
			}
			this.offset = {
				x: 0,
				y: 16
			};
			if (!use) this.skin = 'boy';
			this.animSheet = new ig.AnimationSheet('media/people/rs.' + this.skin + '.png', 32, 32);
			
			// Add movement animations.
			this.addAnim('walkUpA', 0.13333, [3, 0], true);
			this.addAnim('walkUpB', 0.13333, [6, 0], true);
			this.addAnim('walkDownA', 0.13333, [5, 2], true);
			this.addAnim('walkDownB', 0.13333, [8, 2], true);
			this.addAnim('walkLeftA', 0.13333, [4, 1], true);
			this.addAnim('walkLeftB', 0.13333, [7, 1], true);
			this.addAnim('walkRightA', 0.13333, [4, 1], true);
			this.addAnim('walkRightB', 0.13333, [7, 1], true);
			this.addAnim('runUpA', 0.08333, [12, 9], true);
			this.addAnim('runUpB', 0.08333, [15, 9], true);
			this.addAnim('runDownA', 0.08333, [14, 11], true);
			this.addAnim('runDownB', 0.08333, [17, 11], true);
			this.addAnim('runLeftA', 0.08333, [13, 10], true);
			this.addAnim('runLeftB', 0.08333, [16, 10], true);
			this.addAnim('runRightA', 0.08333, [16, 10], true);
			this.addAnim('runRightB', 0.08333, [13, 10], true);
			this.addAnim('slowUp', 0.26667, [3, 0, 6, 0]);
			this.addAnim('slowDown', 0.26667, [5, 2, 8, 2]);
			this.addAnim('slowLeft', 0.26667, [4, 1, 7, 1]);
			this.addAnim('slowRight', 0.26667, [7, 1, 4, 1]);
			this.addAnim('idleUp', 0.1, [0], true);
			this.addAnim('idleDown', 0.1, [2], true);
			this.addAnim('idleLeft', 0.1, [1], true);
			this.addAnim('idleRight', 0.1, [1], true);
			
			// Right animations are just left animations, but flipped over x-axis.
			this.anims.walkRightA.flip.x = true;
			this.anims.walkRightB.flip.x = true;
			this.anims.runRightA.flip.x = true;
			this.anims.runRightB.flip.x = true;
			this.anims.slowRight.flip.x = true;
			this.anims.idleRight.flip.x = true;
			// set initial animation
			this.moveAnimStop();
		},

		update: function() {
			this.zIndex = this.pos.y + this.zPriority;
			this.parent();
		}

	});


})
