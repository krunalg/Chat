ig.module(

'game.entities.npc')

.requires(

'game.entities.non-weltmeister.player').defines(function() {
	EntityNpc = EntityPlayer.extend({

		zPriority: 2,

		// NPC movement patterns
		movePattern: [],

		// no pattern by default
		moveNext: 0,

		moveTimer: null,

		moveDelay: 2,

		// delay in seconds between moves
		faceNextMove: function() {
			this.facing = this.movePattern[this.moveNext];
			this.moveAnimStop();
		},

		justMoved: function() {
			this.moveNext++;
			if (this.moveNext >= this.movePattern.length) this.moveNext = 0; // cycle pattern
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

		goAgain: function()
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

			// create a name entity to follow this one
			ig.game.spawnEntity(
			EntityName, this.pos.x, this.pos.y, {
				name: this.name + "NameEntity",
				follow: this.name,
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