<!DOCTYPE html>
<html>
<head>
	 <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
	 
	 <script type="text/javascript">
	 // ** Use this code to read the _GET variables from the URL
	 // ** All to be done before impact starts up.
	 
		  // Create a global array that will hold the value of each variable,
		  // keyed by the name of the variable.
		  var GETDATA = new Array();
		  
		  // Get the string that follows the "?" in the window's location.
		  var sGet = window.location.search;
		  if (sGet) // if has a value...
		  {
		      // Drop the leading "?"
		      sGet = sGet.substr(1);
		      
		      // Generate a string array of the name value pairs.
		      // Each array element will have the form "foo=bar"
		      var sNVPairs = sGet.split("&");
		      
		      // Now, for each name-value pair, we need to extract
		      // the name and value.
		      for (var i = 0; i < sNVPairs.length; i++)
		      {
			  // So, sNVPairs[i] contains the current element...
			  // Split it at the equals sign.
			  var sNV = sNVPairs[i].split("=");
			  
			  // Assign the pair to the GETDATA array.
			  var sName = sNV[0];
			  var sValue = sNV[1];
			  GETDATA[sName] = sValue;
		      }
		  }
	 
		  // username fetched from url
		  var username = "";
		  username += GETDATA.user;
		  if(username=="undefined") username = 'player' + Math.floor(Math.random()*999);
	 
	 </script>
	 
	 <?php  ?>
	 <?php
		  if($_SERVER["SERVER_NAME"]=="192.168.1.95")
			   echo "<script src=\"http://192.168.1.95:8080/socket.io/socket.io.js\"></script>\n";
		  else
			   echo "<script src=\"http://h.commins.ca:8080/socket.io/socket.io.js\"></script>\n";
	 ?>
	 <title>flaming-sansa</title>
	 <style type="text/css">
		html,body {
			background-color: #000;
			color: #fff;
			font-family: helvetica, arial, sans-serif;
			margin: 0;
			padding: 0;
			font-size: 12pt;
		}
		
		#canvas {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
			border: 1px solid #555;
		}
		#chat {
			position: absolute;
			left: 0;
			/*right: 0;*/
			top: 0;
			/*bottom: 0;*/
			width:300;
			height:300;
			margin: auto;
			border: 1px solid red;
		}
		#input {
		        display: none;
		}
	 </style>
	 
	 
	 <script type="text/javascript" src="lib/impact/impact.js"></script>
	 <script type="text/javascript" src="lib/game/main.js"></script>
</head>
<body>
	 <script type="text/javascript">
	 
	 
	 // set up sockets
	 var socket = io.connect('http://localhost:8080');

socket.on('newMsg', function (from, msg) {
	 var showMessageHowLong = 2; // how long to hide name and show message
	 
	 // hide name briefly
	 var target = ig.game.getEntityByName(from);
	 if(target!=undefined) ig.game.hideName(target.name, showMessageHowLong);
	 
	 ig.game.spawnEntity( EntityBubble, 0, 0,
	 {
		  from: from,
		  msg: msg,
		  lifespan: showMessageHowLong
	 } );
});

socket.on('incomingTell', function (from, msg) {
	 ig.game.events.push("Msg from " + from + ": " + msg);
});

socket.on('welcome', function (msg) {
	 ig.game.events.push(msg);
});
	 
socket.on('otherPlayerJump', function (x, y, direction, client)
{
	 var otherplayer = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(otherplayer)
	 {
		  for(var i=0; i<otherplayer.length; i++)
		  {
			   if(client == otherplayer[i].name)
			   {
				    otherplayer[i].vel.x = 0;
				    otherplayer[i].vel.y = 0;
				    otherplayer[i].pos.x = x;
				    otherplayer[i].pos.y = y;
				    otherplayer[i].facing = direction;
				    otherplayer[i].moveState = 'jump';
				    otherplayer[i].netStartJump();
				    break;
			   }
		  }
	 }
});

socket.on('moveUpdateOtherPlayer', function (x, y, direction, client, state)
{
	 var otherplayer = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(otherplayer)
	 {
		  for(var i=0; i<otherplayer.length; i++)
		  {
			   if(client == otherplayer[i].name)
			   {
				    otherplayer[i].vel.x = 0;
				    otherplayer[i].vel.y = 0;
				    otherplayer[i].pos.x = x;
				    otherplayer[i].pos.y = y;
				    otherplayer[i].facing = direction;
				    otherplayer[i].moveState = state;
				    otherplayer[i].netStartMove();
				    break;
			   }
		  }
	 }
});

socket.on('updateOtherPlayer', function (client, direction) {
	 var otherplayer = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(otherplayer)
	 {
		  for(var i=0; i<otherplayer.length; i++)
		  {
			   if(client == otherplayer[i].name)
			   {
				    otherplayer[i].facing = direction;
				    break; // because client names are unique
			   }
		  }
	 }
});
	  
// the new add player
socket.on('addPlayer', function (user, x, y, direction, skin) {
	 var player = ig.game.getEntitiesByType( EntityPlayer )[0];
	 
	 ig.game.events.push(user + " entered the area.");
	 
	 ig.game.spawnEntity( EntityOtherplayer, x, y,
	 {
		  name: user,
		  skin: skin,
		  facing: direction,
		  animation: 6
	 } );
});

// consider merging this whole thing with playerPositions
socket.on('addAllPlayers', function (players) {
	 var localPlayer = ig.game.getEntitiesByType( EntityPlayer )[0];
	 
	 for(i=0; i<players.length; i++)
	 {
		  if(localPlayer.name!=players[i].name)
		  {
			   ig.game.spawnEntity( EntityOtherplayer, players[i].pos.x, players[i].pos.y,
			   {
				    name: players[i].name,
				    facing: players[i].facing,
				    skin: players[i].skin,
				    animation:6
			   } );
			   break;
		  }
	 }
});


socket.on('reskinOtherPlayer', function (client, skin) {
	 var otherplayer = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(otherplayer)
	 {
		  for(var i=0; i<otherplayer.length; i++)
		  {
			   if(client == otherplayer[i].name)
			   {
				    otherplayer[i].skin = skin;
				    otherplayer[i].reskin();
				    break; // because client names are unique
			   }
		  }
	 }
});

socket.on('dropPlayer', function (client)
{
	 ig.game.events.push(client + " left the area.");
	 
	 var netplayers = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(netplayers)
	 {
		  for(var i=0; i<netplayers.length; i++)
		  {
			   // kill player entity if he exists
			   if(netplayers[i].name==client) netplayers[i].kill();
		  }
	 }
});

socket.on('playerPositions', function (players)
// updates all **currently existing**
// Otherplayer entity positions and directions
{
	 var netplayers = ig.game.getEntitiesByType( EntityOtherplayer );
	 if(netplayers)
	 {
		  for(var i=0; i<netplayers.length; i++)
		  {
			   for(var j in players)
			   {
				    // if names match, update position
				    if(netplayers[i].name==players[j].name)
				    {
					     netplayers[i].pos.x = players[j].pos.x;
					     netplayers[i].pos.y = players[j].pos.y;
					     var sw = players[j].facing;
					     switch(sw)
					     {
						      case 'left':
							       netplayers[i].animation = 7;
							       break;
						      case 'right':
							       netplayers[i].animation = 8;
							       break;
						      case 'up':
							       netplayers[i].animation = 5;
							       break;
						      case 'down':
							       netplayers[i].animation = 6;
							       break;
					     };
				    }
			   }
		  }
	 }
});

	</script>
	
	
	<canvas id="canvas"></canvas>
	<div id="chat">
		  <div>
			   <input type="text" id="input"></input>
		  </div>
	</div>
	
</body>
</html>
