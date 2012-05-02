/*
This entity calls the triggeredBy( entity, trigger ) method of each of its
targets. #entity# is the entity that triggered this trigger and #trigger# 
is the trigger entity itself.


Keys for Weltmeister:

checks
	Specifies which type of entity can trigger this trigger. A, B or BOTH 
	Default: A

wait
	Time in seconds before this trigger can be triggered again. Set to -1
	to specify "never" - e.g. the trigger can only be triggered once.
	Default: -1
	
target.1, target.2 ... target.n
	Names of the entities whose triggeredBy() method will be called.
*/

ig.module(
	'game.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTrigger = ig.Entity.extend({
	size: {x: 16, y: 16},
	
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(196, 255, 0, 0.7)',
	
	target: null,
	wait: -1,
	waitTimer: null,
	canFire: true,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		if( settings.checks ) {
			this.checkAgainst = ig.Entity.TYPE[settings.checks.toUpperCase()] || ig.Entity.TYPE.A;
			delete settings.check;
		}
		
		this.parent( x, y, settings );
		this.waitTimer = new ig.Timer();
	},
	
	
	check: function( other ) {
		console.debug("Just walked onto the lawn.");
		
		// the very first time this is triggered do...
		
		// find out where the player is headed
		var dx = 0; // destination x
		var dy = 0; // and y
		var mapTilesize = ig.game.collisionMap.tilesize;
		switch(other.facing)
		{
			case 'left':
			case 'right':
				dx = other.destination;
				dy = other.pos.y;
				break;
			case 'up':
			case 'down':
				dx = other.pos.x;
				dy = other.destination;
				break;
		}
		
		// immediately generate a properly timed
		// grass-particle animation
		
		// after the during of the animation has past
		// continue to check if player stays or moves
		
		// if player moves, wait a set time and then
		// kill the last grass particle
		// while at the same time starting a new
		// one if nessesary
		
		
		
		/*if( this.canFire && this.waitTimer.delta() >= 0 ) {
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent && typeof(ent.triggeredBy) == 'function' ) {
						ent.triggeredBy( other, this );
					}
				}
			}
			
			if( this.wait == -1 ) {
				this.canFire = false;
			}
			else {
				this.waitTimer.set( this.wait );
			}
		}*/
	},
	
	
	update: function(){}
});

});