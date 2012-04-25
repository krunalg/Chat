ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.town',
	'game.entities.player',
	'impact.debug.debug',
	'plugins.impact-splash-loader'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font2: new ig.Font( 'media/04b03.font.png' ),
	font: new ig.Font( 'media/04b04.font.png' ),
	debugfont: new ig.Font( 'media/04b04.font.png' ),
	
	// Variables for the chat system
	lastInput: new Date().getTime(),
	messages: new Array(),
	
	
	init: function() {
		// Initialize your game here; bind keys etc.
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.D, 'right' );
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.S, 'down' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.ENTER, 'chat' );
		
		// set up animated map tiles
		var as = new ig.AnimationSheet( 'media/bg-flower.png', 16, 16 );
		this.backgroundAnims = {
		    'media/starter-towna.png': {
			// flower
			4: new ig.Animation( as, 0.9, [0,1,0,2] )
		    }
		};
		
		this.loadLevel (LevelTown);
		
		// set players name to the username provided from url
		var player = this.getEntitiesByType( EntityPlayer )[0];
		player.name = username;
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2 + player.size.x/2;
			this.screen.y = player.pos.y - ig.system.height/2;
		}
		
		// Check for player wanting to chat
		if(ig.input.state('chat'))
		{
			var allowInput = false;
			if(new Date().getTime() - this.lastInput > 200)
			{
				allowInput = true;
			}
			
			if(!$('#input').is(":visible") && allowInput)
			// if input is hidden and allowed to open chat
			{
				
				$('#input').fadeIn(100);
				//$('#input').focus();
				this.lastInput = new Date().getTime();
			}
			else if($('#input').is(":visible") && allowInput)
			// while its showing and allowed to close chat
			{
				// check if anything has been typed
				if($('#input').val()!='')
				{
					// if so
					this.messages.push($('#input').val()); // store in array
					
					// This whole block will later be written into a function
					// so it can be called, something like updateMessageBox
						
						$('#messages').html('');
						var newMessages = '';
						for(var i=0; i<this.messages.length; i++)
						{
							if(i!=0) newMessages += "\n";
							newMessages += player.name + ': ' +this.messages[i];
							
						}
						$('#messages').html(newMessages); // print to sreen
						
						// hack to auto scroll the message box
						$('#messages').scrollTop = 999999;
						setTimeout(function()
						{
						    var textArea = document.getElementById('messages');
						    textArea.scrollTop = textArea.scrollHeight;
						}, 10);
					
					
					
					
				}
				$('#input').val(''); // reset
				$('#input').hide();
				this.lastInput = new Date().getTime();
			}
			
			
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
		
		// put the player name above his head
		this.font2.draw( player.name, ig.system.width/2, ig.system.height/2-16, ig.Font.ALIGN.CENTER);
		
		//this.debugfont.draw( ig.game.backgroundMaps[0], 10, 10);
	}
});

/*
// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 480, 320, 2 );
*/

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
// Use the ig.ImpactSplashLoader class as the preloader
ig.main( '#canvas', MyGame, 60, 480, 320, 2, ig.ImpactSplashLoader );

});
