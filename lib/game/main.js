ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.level1',
	'game.entities.player'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	//font: new ig.Font( 'media/04b03.font.png' ),
	font: new ig.Font( 'media/04b04.font.png' ),
	
	
	init: function() {
		// Initialize your game here; bind keys etc.
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.D, 'right' );
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.S, 'down' );
		this.loadLevel (LevelLevel1);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2;
			this.screen.y = player.pos.y - ig.system.height/2;
		}
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		var player = this.getEntitiesByType( EntityPlayer )[0];
		// Add your own drawing code here
		player.messageboxtimer = player.messageboxtimer - 1;
		
		if(player.messageboxtimer < 1)
		{
			player.messageboxtimer = 100;
			var newtext = "";
			var newsplit = player.messagebox.split("\n");
			for(var i = 0;i < newsplit.length; i++)
			{
				if(i > 1)
				{
					newtext = newtext + "\n" + newsplit[i];
				}
			}
		
		player.messagebox = newtext;
		}
		
		
		this.font.draw( player.messagebox, 350, 10);
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 640, 480, 1 );

});
