var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
 

app.listen(8080);

//var playerlocation = 0;
var playerlist = [];
var players = new Array(); // an array of objects


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
  
    socket.on('recievedata', function (positionx,positiony,currentanimation,gamename)
    {
        socket.broadcast.emit('playermove', positionx,positiony,currentanimation,gamename);
    });

    
    socket.on('receiveMove', function (xstart, ystart, direction, client) {
        socket.broadcast.emit('moveOtherPlayer', xstart, ystart, direction, client);
    });
      
    
    socket.on('initializePlayer', function (x, y, direction, newplayername)
    {
    
        socket.clientname = newplayername;
        playerlist.push(newplayername);
         
        // going to replace playerlist
        var player = new Object();
        player.name = newplayername;
        player.pos = new Object();
        player.pos.x = x;
        player.pos.y = y;
        players.push(player);
        io.sockets.emit('addPlayer',playerlist,newplayername,x,y,direction);
        
        // here is where i will send back to the origin x and y coordinates
        // of all nearby players
    
    });
    
    
    socket.on('disconnect', function()
    {
        // soon to be unneeded
            delete playerlist[socket.clientname];
            for(var i in playerlist)
            {
                if(playerlist[i] == socket.clientname)
                {
                    playerlist.splice(i, 1);
                }
            }
        
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