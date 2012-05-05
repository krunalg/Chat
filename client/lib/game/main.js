ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	// levels
	'game.levels.town',
	'game.levels.route101',
	'game.levels.lab',
	
	'game.entities.player',
	'game.entities.grass',
	'game.entities.jump',
	
	//debug
	'impact.debug.debug',
	'plugins.astar-for-entities-debug',
	
	// plugins
	'plugins.astar-for-entities',
	'plugins.impact-splash-loader'
)
.defines(function(){




MyGame = ig.Game.extend({
	
	autoSort: true,
	
	// set up actionbox
	actionBox: {
		font: new ig.Font( 'media/rs.font.png' ),
		bg: { img: new ig.Image( 'media/rs.actionbox.png' ), pos: { x: 3, y: 115 } },
		visible: true,
		rate: 3, // chars per second
		text: { body: '', width: 208, pos: { x: 16, y: 122 } },
		blurps: new Array(),
		timer: null,
		nextChar: function(game) // starts printing chars
			{
				if(!game.actionBox.visible)
				{
					game.actionBox.visible = true;
					game.actionBox.started = new ig.Timer();
				}
			},
		process: function(game)
			{
				var currString = '';
				var space = '';
				var blurps = game.actionBox.text.body.split('\n');
				for(var i=0; i<blurps.length; i++)
				{
					game.actionBox.blurps[i] = new Array();
					
					var words = blurps[i].split(' ');
					for(var j=0; j<words.length; j++)
					{
						if(currString=='') space = ''; else space = ' ';
						if( game.actionBox.font.widthForString(
							currString + space + words[j] )
							< game.actionBox.text.width )
						{
							currString += space + words[j];
						}
						else
						{
							game.actionBox.blurps[i].push(currString);
							currString = words[j];
						}
					}
					
					if(currString!='')
					{
						game.actionBox.blurps[i].push(currString);
						currString = '';
					}
				}
			},
		sayHi: function(game)
			{
				var text = 'Hello there.';
				var show = '';
				if(game.actionBox.timer==null) game.actionBox.timer = new ig.Timer();
				for(var i=0; i<game.actionBox.timer.delta(); i++)
				{
					if(i>=text.length) break;
					show += text.charAt(i);
				}
				game.actionBox.font.draw(
					show,
					game.actionBox.text.pos.x,
					game.actionBox.text.pos.y
					);
			},
		draw: function(game)
			{
				if(game.actionBox.visible)
				{
					// draw bg
					game.actionBox.bg.img.draw(game.actionBox.bg.pos.x, game.actionBox.bg.pos.y);
					
					/*
					 // draw chars
					var line = '';
					var depth = Math.floor(game.actionBox.timer * game.actionBox.rate);
					for(var i=0; i<depth; i++)
					{
						if(i>=game.actionBox.text.blurps[0])
					}
					game.actionBox.font.draw(line, game.actionBox.text.pos.x, game.actionBox.text.pos.y)
					*/
				}
			}
	},
	
	
	defaultLevel: LevelTown,
	lastSkin: 'boy', // used when rebuilding the player
	goTo: null, // used to know where to place player when zoning
	mapName: 'Town', // must capitalize first letter
	//playerFirstBuild: true, // false after initial position is read from database
	zone: function(map, goTo) // used to change maps
	{
		this.goTo = goTo;
		this.mapName = map;
		this.leaveZone();
		this.loadLevelDeferred( ig.global['Level'+map] );
	},
	leaveZone: function ()
	{
		socket.emit('playerLeaveZone');	
	},
	buildPlayer: function()
	{
		var x = 0
		var y = 0
		var direction = 'right'; // should never stay this way in-game
		var exitAnimation = false;
		
		if(this.goTo==null)
		{
			console.debug("First time building player. Using database coordinates.");
			// first time drawing player, use database
			if( (jsonPos.x!=-1) && (jsonPos.y!=-1) )
			{
				x = jsonPos.x;
				y = jsonPos.y;
				direction = jsonPos.facing;
			}
		}
		else
		{
			console.debug("Rebuilding player using map exit values.");
			// find coordinates from goTo
			var exits = ig.game.getEntitiesByType( EntityExit );
			if(EntityExit)
			{
			    for(var i=0; i<exits.length; i++)
			    {
				if(exits[i].me==this.goTo)
				{
				    if(exits[i].isDoor == '1')
				    {
					 exitAnimation = true;
					 direction = 'down';
				    }
				    else direction = 'up';
				    x = exits[i].pos.x;
				    y = exits[i].pos.y;
				}
			    }
			}
			this.goTo = null; // reset
		    
		}
		
		if(exitAnimation) // walking out the door
		{
			return ig.game.spawnEntity( EntityPlayer, x, y, // magic numbers = bad
			{
				 name: username,
				 facing: direction,
				 moveWaiting: true,
				 moveWhen: 336.7 + new Date().getTime(),
				 animation: 6,
				 skin: this.lastSkin
			} );
		}
		else
		{
			return ig.game.spawnEntity( EntityPlayer, x, y, // magic numbers = bad
			{
				 name: username,
				 facing: direction,
				 animation: 6,
				 skin: this.lastSkin
			} );
		}
		
	},
	
	// Chat system
		// html elements
		messageBoxId: 'messages', // id of HTML element
		inputFieldId: 'input', // id of HTML element
		
		//allowInput: true,
		inputActive: false,
		//lastInput: new Date().getTime(),
		messages: new Array(),
		emitSay: function(client, msg) { socket.emit('receiveSay',client,msg); },
		emitTell: function(to, msg) { socket.emit('receiveTell',to,msg); },
		emitReskin: function(skin) { socket.emit('receiveReskin',skin); },
		messageBoxPrint: function(game,msg)
		{
			game.messages.push(msg);
			game.rebuildMessageBox(game);
			game.scrollMessageBox(game);
		},
		rebuildMessageBox: function(game)
		{
			$('#' + game.messageBoxId).html('');
			var newMessages = '';
			
			for(var i=0; i<game.messages.length; i++)
			{
				if(i!=0) newMessages += "\n";
				newMessages += game.messages[i];
				
			}
			$('#' + game.messageBoxId).html(newMessages); // print to sreen
			game.scrollMessageBox(game); // scroll to bottom
		},
		scrollMessageBox: function(game)
		// scroll messagebox to the bottom
		{
			$('#' + game.messageBoxId).scrollTop = 999999;
			//setTimeout(function()
			//{
			    var textArea = document.getElementById(game.messageBoxId);
			    textArea.scrollTop = textArea.scrollHeight;
			//}, 10);
		},
		chatInputOff: function(game)
		{
			// check if anything has been typed
			var inputVal = $('#'+game.inputFieldId).val();
			if(inputVal!='')
			{
				// if so
				var player = this.getEntitiesByType( EntityPlayer )[0];
				
				// check for command flag
				if(inputVal.substr(0,1)=='/')
				{
					var explodeInput = inputVal.split(' ');
					
					// check for private message /tell or /t
					if(explodeInput[0]=='/tell'
					   || explodeInput[0]=='/t')
					{
						var to = explodeInput[1]; // send to who
						var msg = ''; // message to send
						for(i=2; i<explodeInput.length; i++) msg += explodeInput[i];
						game.messages.push('>>' + to + ': ' + msg); // add to array for history
						game.emitTell( to, msg ); // send message to other players
						game.rebuildMessageBox(ig.game);
					}
					else if(explodeInput[0]=='/say'
					   || explodeInput[0]=='/s')
					{
						// strip away the command and space
						if(inputVal.substr(0,4)=='/say') inputVal = inputVal.substr(5, inputVal.length-5); // either remove '/say '
						else inputVal = inputVal.substr(3, inputVal.length-3); // or remove '/s '
						game.messages.push(player.name + ': ' + inputVal); // add to array for history
						game.emitSay( player.name, inputVal ); // send message to other players
						game.rebuildMessageBox(ig.game);
						//game.scrollMessageBox(ig.game); // now happens automatically
					
					}
					else if(explodeInput[0]=='/skin')
					{
						var skin = explodeInput[1]; // name of skin
						game.messages.push('Changing skin to: ' + skin);
						game.emitReskin(skin);
						game.rebuildMessageBox(ig.game);
						player.skin = skin;
						player.reskin();
						game.lastSkin = skin;
					
					}
					
					// regular message /say or /s
				}
				
								
			}
			$('#'+game.inputFieldId).val(''); // reset
			$('#'+game.inputFieldId).hide();
			//$('#canvas').focus();
			//game.lastInput = new Date().getTime();
			//game.allowInput = false;
			game.inputActive = false;
		},
		
		
	
	
	init: function() {
		
		this.actionBox.text.body = "Hello.\nI'm PROF. OAK, and this is my laboratory!";
		this.actionBox.process(this);
		//window.alert(this.actionBox.font.widthForString("Hello there."));
		
		// start talking with network
		socket.emit('init',username);
		
		// controls
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.D, 'right' );
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.S, 'down' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.ENTER, 'chatToggle' );
		ig.input.bind( ig.KEY.R, 'chatReply' );
		ig.input.bind( ig.KEY.Z, 'action' );
		ig.input.bind( ig.KEY.MOUSE1, 'leftClick');
		
		
		// set up animated map tiles
		var as = new ig.AnimationSheet( 'media/bg-flower.png', 16, 16 );
		this.backgroundAnims = {
		    'media/starter-towna.png': {
			// flower
			4: new ig.Animation( as, 0.26667, [0,1,0,2] ) // 16 frames out of 60 per
		    }
		};
		
		// director
		//this.myDirector = new ig.Director(this, [LevelTown,  LevelRoute101, LevelLab]);
		//this.myDirector.firstLevel();
		//this.myDirector.jumpTo(LevelLab);
		
		this.loadLevel (this.defaultLevel);
		
		// build player
		this.buildPlayer();
		// set players name to the username provided from url
		//var player = this.getEntitiesByType( EntityPlayer )[0];
		//player.name = username;
		
		
		// set up chat functionality
		$('#'+this.inputFieldId).bind('keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
				ig.game.chatInputOff(ig.game);
				$('#canvas').focus();
			}
		});
		
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// rebuild player when loadLevel deletes it
		if(!this.getEntitiesByType( EntityPlayer )[0])
		{
			var player = this.buildPlayer();
			console.debug("Player does not exist. Adding one.");
		}
		
		// Add your own, additional update code here
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2 + player.size.x/2;
			this.screen.y = player.pos.y - ig.system.height/2;
			
			// all player to approach the edge of the map
			// without exposing where no tiles exists
			
			if(ig.system.width / this.collisionMap.tilesize <= this.collisionMap.width)
			{
				var howCloseLeft = 7; // how close player can go to left of map without seeing past
				if(player.pos.x <= (howCloseLeft*16)) this.screen.x = 0;
				if(player.pos.x >= this.collisionMap.width * this.collisionMap.tilesize - (howCloseLeft+1)*this.collisionMap.tilesize )
					this.screen.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
			}
			if(ig.system.height / this.collisionMap.tilesize <= this.collisionMap.width)
			{
				var howCloseTop = 5; // how close player can get to top of map without seeing past
				if(player.pos.y <= (howCloseTop*16)) this.screen.y = 0; 
				if(player.pos.y >= this.collisionMap.height * this.collisionMap.tilesize - howCloseTop*this.collisionMap.tilesize )
					this.screen.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;
			}
			
			
		}
		
		// Check for player wanting to chat
		if(ig.input.pressed('chatToggle'))
		{
			//if(new Date().getTime() - this.lastInput > 200) this.allowInput = true;
			//this.allowInput = true;
			if(!this.inputActive)
			//if(!$('#input').is(":visible") && this.allowInput)
			// if input is hidden and allowed to open chat
			{
				
				$('#input').fadeIn(100);
				$('#input').focus();
				//this.lastInput = new Date().getTime();
				this.inputActive = true;
			}
			/*
			else
			//else if($('#input').is(":visible") && this.allowInput)
			// while its showing and allowed to close chat
			{
				this.chatInputOff(this);
			}
			*/
		}
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		this.actionBox.draw(this); // shows box
		this.actionBox.sayHi(this);
	}
});

// Start the Game with 60fps, a resolution of 240x160, scaled
// up by a factor of 2
// Use the ig.ImpactSplashLoader class as the preloader
ig.main( '#canvas', MyGame, 60, 240, 160, 2, ig.ImpactSplashLoader );

});
