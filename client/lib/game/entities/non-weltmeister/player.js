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
		}

		trySpawningGrass: function() {
			var vx = vy = 0;
			var tilesize = ig.game.collisionMap.tilesize;
			switch (this.facing) {
			case 'left':
				vx--;
				break;
			case 'right':
				vx++;
				break;
			case 'up':
				vy--;
				break;
			case 'down':
				vy++;
				break;
			}
			// First check if entity already exists
			var allGrass = ig.game.getEntitiesByType(EntityGrass);
			if (allGrass) {
				for (var i = 0; i < allGrass.length; i++) {
					if (allGrass[i].pos.x == this.pos.x + (vx * tilesize) && allGrass[i].pos.y == this.pos.y + (vy * tilesize) && !allGrass[i]._killed) {
						// Save from being killed if marked for death.
						if (allGrass[i].markedForDeath) allGrass[i].revive();

						return allGrass[i];
					}
				}
			}
			// Check if the faced tile is a grass tile.
			if (ig.game.isSpecialTile(
			(this.pos.x / tilesize) + vx, (this.pos.y / tilesize) + vy, specialTiles['grass'], 'lower')) {
				var grassX = this.pos.x + (vx * tilesize);
				var grassY = this.pos.y + (vy * tilesize);
				console.log("Creating grass entity at: " + grassX + "," + grassY);
				return ig.game.spawnEntity(EntityGrass, this.pos.x + (vx * tilesize), this.pos.y + (vy * tilesize), {
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
			// determine rate
			if (this.speed == this.walkSpeed) var rate = 'walk'; // is walking
			else var rate = 'run'; // else assume running
			// determine foot
			if (this.leftFoot) var foot = 'A';
			else var foot = 'B'

			// set animation
			this.currentAnim = this.anims[rate + ig.game.capitaliseFirstLetter(this.facing) + foot];

			if (alternateFeet) this.leftFoot = !this.leftFoot; // alternate feet
			this.currentAnim.rewind(); // starting at first frame
		},

		moveAnimStop: function()
		// set animation to idle
		{
			switch (this.facing) {

			case 'left':
			case 'right':
			case 'up':
			case 'down':
				this.currentAnim = this.anims['idle' + this.facing];
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
			this.animSheet = new ig.AnimationSheet('media/people/rs.' + this.skin + '.png', 16, 32);
			// add the animations
			this.addAnim('walkUpA', 0.13333, [2, 0], true);
			this.addAnim('walkUpB', 0.13333, [1, 0], true);
			this.addAnim('walkDownA', 0.13333, [14, 12], true);
			this.addAnim('walkDownB', 0.13333, [13, 12], true);
			this.addAnim('walkLeftA', 0.13333, [8, 6], true);
			this.addAnim('walkLeftB', 0.13333, [7, 6], true);
			this.addAnim('walkRightA', 0.13333, [8, 6], true);
			this.addAnim('walkRightB', 0.13333, [7, 6], true);
			this.addAnim('runUpA', 0.08333, [4, 3], true);
			this.addAnim('runUpB', 0.08333, [5, 3], true);
			this.addAnim('runDownA', 0.08333, [16, 15], true);
			this.addAnim('runDownB', 0.08333, [17, 15], true);
			this.addAnim('runLeftA', 0.08333, [10, 9], true);
			this.addAnim('runLeftB', 0.08333, [11, 9], true);
			this.addAnim('runRightA', 0.08333, [10, 9], true);
			this.addAnim('runRightB', 0.08333, [11, 9], true);
			this.addAnim('slowup', 0.26667, [2, 0, 1, 0]);
			this.addAnim('slowdown', 0.26667, [14, 12, 13, 12]);
			this.addAnim('slowleft', 0.26667, [8, 6, 7, 6]);
			this.addAnim('slowright', 0.26667, [8, 6, 7, 6]);
			this.addAnim('idleup', 0.1, [0], true);
			this.addAnim('idledown', 0.1, [12], true);
			this.addAnim('idleleft', 0.1, [6], true);
			this.addAnim('idleright', 0.1, [6], true);
			// flip right-facing animations
			this.anims.walkRightA.flip.x = true;
			this.anims.walkRightB.flip.x = true;
			this.anims.runRightA.flip.x = true;
			this.anims.runRightB.flip.x = true;
			this.anims.slowright.flip.x = true;
			this.anims.idleright.flip.x = true;
			// set initial animation
			this.moveAnimStop();
		},

		update: function() {
			this.zIndex = this.pos.y + this.zPriority;
			this.parent();
		}

	});


})
