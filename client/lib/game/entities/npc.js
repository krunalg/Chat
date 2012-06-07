ig.module(

'game.entities.npc')

.requires(

'game.entities.non-weltmeister.player').defines(function() {

	EntityNpc = EntityPlayer.extend({

		// Layering priority relative to other entities.
		zPriority: 2,

		// An array of directions an NPC will move.
		movePattern: [],

		// The next move in the pattern to perform.
		moveNext: 0,

		// Used to know when next move occurs.
		moveTimer: null,

		// Time in seconds between moves.
		moveDelay: 2,

		// Changes the players faced direction.
		faceNextMove: function() {
			
			// Face direction of next move in the pattern.
			this.facing = this.movePattern[this.moveNext];

			// Update graphic.
			this.moveAnimStop();
		},

		// Sets the next move in the pattern.
		justMoved: function() {
			
			// Select next move in pattern.
			this.moveNext++;

			// Check if we reached the end of the pattern.
			if (this.moveNext >= this.movePattern.length) 
			{
				// Start the pattern over again.
				this.moveNext = 0;
			}
		},

		startMove: function() {
			// determine speed
			this.setMoveState('walk');

			// Spawn new grass entity if needed.
			var newGrass = this.trySpawningGrass();
			if (newGrass) newGrass.play();

			// Remove old grass entity if leaving one.
			var oldGrass = this.inGrass();
			if (oldGrass) oldGrass.markForDeath();

			this.isMove = true;
			this.setMoveDestination();
			this.moveAnimStart(true);
		},

		continueOrStop: function()
		// determines if player will continue moving or stop
		{
			this.isMove = false;
			this.moveAnimStop();
			this.moveTimer.set(this.moveDelay);
		},

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			this.moveTimer = new ig.Timer();
			this.moveTimer.set(Math.random() * 3); // desync NPC's from each other
			if (this.behaviour == 'a') {
				this.movePattern = ['up', 'down', 'up', 'right', 'down', 'down', 'left', 'left', 'left', 'right', 'right', 'left', 'up', 'right'];
			} else if (this.behaviour == 'b') {
				this.movePattern = ['down', 'left', 'right', 'left', 'right', 'up'];
			}

			// weltmeister icon
			this.addAnim('weltmeister', 0.1, [1]);
			this.currentAnim = this.anims.weltmeister;

			this.reskin();
		},

		ready: function() {

			// Needed for passing a persistent reference of self into functions.
			var player = this;

			// create a name entity to follow this one
			ig.game.spawnEntity(
			EntityName, this.pos.x, this.pos.y, {
				name: this.name + "NameEntity",
				follow: player,
				color: 'green'
			});
		},

		draw: function() {
			this.parent();
		},

		update: function() {
			this.parent();

			if (this.isMove) {
				this.finishMove(this);
			} else {
				if (this.moveTimer.delta() >= 0) {
					this.faceNextMove();
					if (this.canMove()) {
						this.startMove();
						this.justMoved();
					}
				}
			}
		}


	});
})