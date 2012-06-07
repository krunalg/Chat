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

		// Handles exactly how a move takes place (speed, effects, etc.)
		startMove: function() {
			
			// Set movement speed.
			this.setMoveState('walk');

			// Spawn new grass entity if needed.
			var newGrass = this.trySpawningGrass();
			if (newGrass) newGrass.play();

			// Remove old grass entity if leaving one.
			var oldGrass = this.inGrass();
			if (oldGrass) oldGrass.markForDeath();

			// Player is moving.
			this.isMove = true;

			// Set player destination.
			this.setMoveDestination();

			// Start animations.
			this.moveAnimStart(true);
		},

		// Determine if player should continue moving or stop.
		continueOrStop: function()
		{
			// Not moving.
			this.isMove = false;

			// Set idle animation.
			this.moveAnimStop();

			// Prevent movement for a time.
			this.moveTimer.set(this.moveDelay);
		},


		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Create timer to move the player.
			this.moveTimer = new ig.Timer();

			// Add some randomness to deyncronize all NPC's.
			this.moveTimer.set(Math.random() * 3);

			// Set movement pattern according to Weltmeister values.
			if (this.behaviour == 'a') {

				// Move pattern A.
				this.movePattern = ['up', 'down', 'up', 'right', 'down', 'down', 'left', 'left', 'left', 'right', 'right', 'left', 'up', 'right'];

			} else if (this.behaviour == 'b') {

				// Move pattern B.
				this.movePattern = ['down', 'left', 'right', 'left', 'right', 'up'];
			}
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