var server = require('http').createServer(handler)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
 

server.listen(8080);

//var playerlocation = 0;
//var playerlist = [];
var players = new Array(); // an array of objects

/*
  At some point I plan to have the server cycle
  through all the maps (when starting up) and
  read all the NPC names, which map they came
  from, and the movement pattern.
  
  The server will then set up a series of
  timers (one for each NPC).
  
  Before ever moving an NPC, the server will
  check if the move is legal.
  
  If a PC tells the server it is moving to
  position an NPC just went to (illegal), the
  server will correct the PC. 


npcPos = new Object();
	 
// manually add npc
// be sure to add checks so that
// npc's don't overwrite each other
npcPos['town'] = new Object();
npcPos['town'][256] = new Object();
npcPos['town'][256][256] = new Object();
npcPos['town'][256][256].pattern = ['left','up','right','down'];
npcPos['town'][256][256].next = 0;
npcPos['town'][256][256].last = new Date().getTime();
npcPos['town'][256][256].delay = 2000;
npcPos['town'][256][256].x = 256; // current x
npcPos['town'][256][256].y = 256; // current y
if(npcPos['town'][256][256]==undefined) console.debug("Should not happen.");
if(npcPos['town'][256][255]==undefined) console.debug("Should happen.");
// ^^^ a one time thing when server starts up^^^

// basically what this does is it tells all clients
// that an npc has moved, every time it does
for(var level in npcPos)
{
         for(var x in npcPos[level])
         {
                  for(var y in npcPos[level][x])
                  {
                           if(new Date().getTime() - npcPos[level][x][y].last > npcPos[level][x][y].delay)
                           {
                                // time to move
                                io.sockets.emit('npcMove',
                                      npcPos[level][x][y].x, // x before move
                                      npcPos[level][x][y].y, // y before move
                                      npcPos[level][x][y].pattern[  npcPos[level][x][y].next  ] // direction
                                      );
                                
                                switch(npcPos[level][x][y].pattern[next])
                                {
                                  case 'left':
                                    npcPos[level][x][y].x += -16; // magic numbers = bad!
                                    break;
                                  case 'right':
                                    npcPos[level][x][y].x += 16; // magic numbers = bad!
                                    break;
                                  case 'up':
                                    npcPos[level][x][y].y += -16; // magic numbers = bad!
                                    break;
                                  case 'down':
                                    npcPos[level][x][y].y += 16; // magic numbers = bad!
                                    break;
                                }
                                
                                npcPos[level][x][y].next++;
                                if(npcPos[level][x][y].next >
                                      npcPos[level][x][y].pattern.length)
                                {
                                    npcPos[level][x][y].next = 0; // reset
                                }
                           }
                  }
         }
}

*/


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
    console.log('** client connected');
    
      
    socket.on('receiveMove', function (currX, currY, direction, client) {
        socket.broadcast.emit('moveOtherPlayer', currX, currY, direction, client);
        for(var i in players)
        {
            if(players[i].name==client)
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
                players[i].pos.x = newX;
                players[i].pos.y = newY;
                players[i].facing = direction;
                
                // update positions on database
                /*var url = "login.php?do=writePosition&user=" + client +
                          "&x=" + newX + "&y=" + newY +
                          "&facing=" + direction;
                var xmlhttp;
                if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp = new XMLHttpRequest();
                }
                else { // code for IE6, IE5
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
                    }
                }
                xmlhttp.open("GET", url, true);
                xmlhttp.send();*/
                
                break; // no need to search for other players with same name
            }
        }
    });
    
    
    socket.on('receiveDirection', function (client, direction) {
        socket.broadcast.emit('updateOtherPlayer', client, direction);
        for(var i in players)
        {
            if(players[i].name==client)
            {
                players[i].facing = direction;
                break; // client names are unique
            }
        }
    });
    
    socket.on('receiveSay', function (client, msg) {
        socket.broadcast.emit('newMsg', client, msg);
    });
    
    socket.on('receiveTell', function (to, msg) {
        // find recipients session id
        for(var i in players)
        {
            if(players[i].name==to)
            {
                //console.log("Tell going to: " + to + " has session: " + players[i].session);
                io.sockets.socket(players[i].session).emit('incomingTell', socket.clientname, msg); // send tell
                return;
            }
        }
        console.log("** Tell received but recipient does not exist.");
    });
    
      
    
    socket.on('initializePlayer', function (x, y, direction, newplayername)
    {
    
        socket.clientname = newplayername;
        console.log('** initiating player: '+ newplayername
                    + ' with session id: ' + socket.id);
         
        // going to replace playerlist
        var player = new Object();
        player.name = newplayername;
        player.pos = new Object();
        player.pos.x = x;
        player.pos.y = y;
        player.facing = direction;
        player.session = socket.id;
        players.push(player);
                
        //io.sockets.emit('addPlayer', player.name, x, y, direction);
        socket.broadcast.emit('addPlayer', player.name, x, y, direction);
        
        // here is where i will send back to the origin x and y coordinates
        // of all nearby players
        
        socket.emit('addAllPlayers', players);
        //socket.emit('playerPositions',players);
    
    });
    
    
    socket.on('disconnect', function()
    {
        // soon to be unneeded
        /*
            delete playerlist[socket.clientname];
            for(var i in playerlist)
            {
                if(playerlist[i] == socket.clientname)
                {
                    playerlist.splice(i, 1);
                }
            }
        */
        
        // remove client from players array
        for(var i in players)
        {
            if(players[i].name == socket.clientname)
            {
                players.splice(i, 1);
            }
        }
        
        socket.broadcast.emit('message',socket.clientname);
        //socket.broadcast.emit('netreplayer',playerlist);
        
        socket.broadcast.emit('dropPlayer',socket.clientname);
        
    });
 
 
});