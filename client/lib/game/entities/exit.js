/*
This entity calls ig.game.loadLevel() when its triggeredBy() method is called -
usually through an EntityTrigger entity.


Keys for Weltmeister:

level
	Name of the level to load. E.g. "LevelTest1" or just "test1" will load the 
	'LevelTest1' level.
*/

ig.module(
	'game.entities.exit'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityExit = ig.Entity.extend({
	//_wmDrawBox: true,
	//_wmBoxColor: 'rgba(0, 0, 255, 0.7)',
	
	size: {x: 16, y: 16},
	zIndex: 0,
	
	map: null,
	goTo: null,
	direction: null, // direction that triggers exit
	type: null, // floor or door
	
	animSheet: new ig.AnimationSheet( 'media/entity-icons.png', 16, 16 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// add the animations
		this.addAnim( 'weltmeister', 0.1, [0] );
		this.currentAnim = this.anims.weltmeister;
	},
	
	ready: function()
	{
		switch(this.type)
		{
			// set up floor exits
			case 'floor':
				var tilesize = ig.game.collisionMap.tilesize;
				this.animSheet = new ig.AnimationSheet( 'media/entities/exit/arrows.png', 16, 16 );
				switch(this.direction)
				{
					case 'left':
						this.addAnim( 'arrow', 0.5333, [2,3] );
						this.offset = { x: tilesize, y: 0 };
						break;
					case 'right':
						this.addAnim( 'arrow', 0.5333, [2,3] );
						this.anims.arrow.flip.x = true;
						this.offset = { x: -tilesize, y: 0 };
						break;
					case 'up':
						this.addAnim( 'arrow', 0.5333, [0,1] );
						this.anims.arrow.flip.y = true;
						this.offset = { x: 0, y: tilesize };
						break;
					case 'down':
						this.addAnim( 'arrow', 0.5333, [0,1] );
						this.offset = { x: 0, y: -tilesize };
						break;
					default:
						console.debug("Exit at " + this.pos.x + "," + this.pos.y + " was not given proper 'direction' and will now kill() itself.");
						this.kill();
						break;
				}
				break;
			
			// set up doors
			case 'door':
				this.offset.y = 4;		
				this.animSheet = new ig.AnimationSheet( 'media/door-animations.png', 16, 20 );
				this.addAnim( 'open', 0.0167, [0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,3], true );
				this.addAnim( 'opened', 0.0167, [3] );
				this.addAnim( 'close', 0.0167, [3,3,3,3,3,2,2,2,2,2,1,1,1,1,1,1,0], true );
				this.addAnim( 'closed', 0.0167, [0] );
				//this.currentAnim = this.anims.closed; // default state
				break;
			
			// kill exit if not properly set up
			default:
				console.debug("Exit at " + this.pos.x + "," + this.pos.y + " was not given proper 'type' and will now kill() itself.");
				this.kill();
				break;
		}
		
		this.currentAnim = null; // no weltmeister icon in-game
	},
	
	startAnim: function()
	{
		switch(this.type)
		{
			case 'door':
				console.debug('Opening door.');
				this.currentAnim = this.anims.open;
				break;
			case 'floor':
				console.debug('Turning on exit arrow.');
				this.currentAnim = this.anims.arrow;
				break;
		}
	},
	
	stopAnim: function()
	{
		if(this.currentAnim!=null)
		{
			console.debug('Turning off exit arrow.');
			this.currentAnim = null;
		}
	},
	
	trigger: function()
	{
		console.debug('Changing to map: ' + this.map);
		ig.game.zone(this.map, this.goTo);
	},
	
	update: function()
	{
		/*if( this.player.pos.x == this.pos.x &&
		    this.player.pos.y == this.pos.y)
		{
			console.debug("You're stepping on me.");
			// if all values not null
			if( !(this.map==null || this.goTo==null) )
			{
				console.debug("Gonna load the map.");
				ig.game.zone(this.map, this.goTo);
			}
		}
		*/
		this.parent();
	}
});

});