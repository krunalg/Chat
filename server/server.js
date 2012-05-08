var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
 

server.listen(8080);

var onlinePlayers = new Array(); // an array of objects




function handler (req, res)
{
    fs.readFile(__dirname + '/index.html',
    function (err, data)
    {
        if (err)
        {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
    
        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function (socket)
{
    console.log('** Client ' + socket.id + ' connected');
    
    socket.on('init', function (user)
    {
	socket.clientname = user;
	console.log("Performing first time setup of " + user);
	socket.emit('welcome', 'Welcome to the world.');
        
	// set up user info object with defaults
        var player = new Object();
        player.name = user;
        player.pos = new Object();
        player.pos.x = 0;
        player.pos.y = 0;
        player.facing = 'down';
	player.state = 'state'; // every player is idle on first connect
	player.skin = 'boy';
        player.session = socket.id;
	player.room = 'limbo';
        onlinePlayers.push(player);
    });
    
    socket.on('hereIAm', function (x, y, direction, mapname, skin)
    {
        socket.roomname = mapname;
	socket.join(socket.roomname);
	console.log("Player " + socket.clientname + " joined zone: " + socket.roomname);
	 
        for(var i=0; i<onlinePlayers.length; i++)
	{
	    if(onlinePlayers[i].name==socket.clientname)
	    {
		// update server records
		onlinePlayers[i].pos.x = x;
		onlinePlayers[i].pos.y = y;
		onlinePlayers[i].facing = direction;
		onlinePlayers[i].skin = skin;
		onlinePlayers[i].room = socket.roomname;
		break; // because names are unique
	    }
	}
	
	var playersToGiveSocket = new Array();
	for(var i=0; i<onlinePlayers.length; i++)
	{
	    if(onlinePlayers[i].room==mapname && onlinePlayers[i].name!=socket.clientname)
		playersToGiveSocket.push(onlinePlayers[i]);
	}
        socket.broadcast.to(mapname).emit('addPlayer', socket.clientname, x, y, direction, skin);
        
	if(playersToGiveSocket.length>=1)
	    socket.emit('addAllPlayers', playersToGiveSocket);    
    });
    
    socket.on('playerLeaveZone', function ()
    {
	// instruct others to drop this player
	socket.broadcast.to(socket.roomname).emit('dropPlayer', socket.clientname);
	socket.leave(socket.roomname);
	// stop listening
	socket.roomname = 'limbo'; 
	socket.join(socket.roomname);
    });
    
    
    socket.on('receiveReskin', function (skin) {
        socket.broadcast.to(socket.roomname).emit('reskinOtherPlayer', socket.clientname, skin);
        for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name==socket.clientname)
            {
                onlinePlayers[i].skin = skin; // update server record
                break;
            }
        }
    });
      
    socket.on('receiveUpdateMoveState', function (x, y, direction, state) {
        socket.broadcast.to(socket.roomname).emit('moveUpdateOtherPlayer', x, y, direction, socket.clientname, state);
        
	// update players known info on server
	for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name==socket.clientname)
            {
                onlinePlayers[i].pos.x = x;
                onlinePlayers[i].pos.y = y;
                onlinePlayers[i].facing = direction;
		onlinePlayers[i].state = state;
                break;
            }
        }
    });
    
    socket.on('receiveMove', function (currX, currY, direction, moveState) {
        socket.broadcast.to(socket.roomname).emit('moveOtherPlayer', currX, currY, direction, socket.clientname, moveState);
        
	// update players known position on server
	for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name==socket.clientname)
            {
                var newX = currX;
                var newY = currY;
                switch(direction)
                {
                    
                    case 'left':
                        newX = currX - 16; // !! magic numbers, not cool !!
                        break;
                    case 'right':
                        newX = currX + 16; // !! magic numbers, not cool !!
                        break;
                    case 'up':
                        newY = currY - 16; // !! magic numbers, not cool !!
                        break;
                    case 'down':
                        newY = currY + 16; // !! magic numbers, not cool !!
                        break;
                };
                onlinePlayers[i].pos.x = newX;
                onlinePlayers[i].pos.y = newY;
                onlinePlayers[i].facing = direction;
                
                // this would be the place to update players positions to mySQL db
                
                break; // no need to search for other players with same name
            }
        }
    });
    
    socket.on('receiveDirection', function (client, direction) {
        socket.broadcast.to(socket.roomname).emit('updateOtherPlayer', client, direction);
        for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name==client)
            {
                onlinePlayers[i].facing = direction;
                break; // client names are unique
            }
        }
    });
    
    socket.on('receiveSay', function (client, msg) {
        socket.broadcast.to(socket.roomname).emit('newMsg', client, msg);
    });
    
    socket.on('receiveTell', function (to, msg) {
        // find recipients session id
        for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name==to)
            {
                //console.log("Tell going to: " + to + " has session: " + onlinePlayers[i].session);
                io.sockets.socket(onlinePlayers[i].session).emit('incomingTell', socket.clientname, msg); // send tell
                return;
            }
        }
        console.log("** Tell received but recipient does not exist.");
    });

    socket.on('disconnect', function()
    {
        // remove client from onlinePlayers array
        for(var i in onlinePlayers)
        {
            if(onlinePlayers[i].name == socket.clientname)
            {
                onlinePlayers.splice(i, 1);
            }
        }

        socket.broadcast.to(socket.roomname).emit('dropPlayer',socket.clientname);
        
    });
 
 
});