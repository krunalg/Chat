// set up sockets
<?php
        if($_SERVER["SERVER_NAME"]=="192.168.1.95")
                 echo "var socket = io.connect('http://192.168.1.95:8080');\n";
        else
                 echo "var socket = io.connect('http://h.commins.ca:8080');\n";
?>

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
	if(msg!='Welcome')
        {
            document.body.innerHTML = "";
            if(msg=='NameTaken')
            {
                window.alert( "That name is currently being used. Please use another.");
                throw new Error('Halting game due to username being in use.');
            }
            window.alert("Did not receive welcome from server.");
            throw new Error('Halting game because server did not send welcome message.');
        }
        else ig.game.events.push(msg);
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