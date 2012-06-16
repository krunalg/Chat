var server = require('http').createServer(handler),
    io = require('socket.io').listen(server),
    fs = require('fs')


    server.listen(9090);

var onlinePlayers = new Array(); // an array of objects

// Most users seen online since server started.
var mostOnline = 0;

io.set('log level', 1);

var playersReport = function() {
    var players = '';
    for (var i = 0; i < onlinePlayers.length; i++) {
        //if(i!=0) players += "\n";
        players += "\n-- " + onlinePlayers[i].name;
    }
    if (players == '') console.log("\nWHO IS ONLINE: \n--\n");
    else console.log("\nWHO IS ONLINE: " + players + "\n");
    console.log("MOST SEEN ONLINE: " + mostOnline);
}

// Records the most users seen online.
function recordMostOnline() {

    var currentOnline = onlinePlayers.length;

    if(currentOnline > mostOnline) mostOnline = currentOnline;
}

// Get the time as a string.
function getTime() {

    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var amOrPm = (hours > 11 ? 'PM':'AM');
    return hours + ':' + minutes + amOrPm;
}

function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

// Removes HTML characters from messages that could allow players to phish.
function cleanMessage(message) {
    return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
}

io.sockets.on('connection', function(socket) {

    socket.on('init', function(user) {
        var welcome = 'Welcome';

        var maxNameLength = 20;

        // check that username is not too long
        if(user.length > maxNameLength) {

            // Request user to drop from game.
            socket.emit('error', 'Your name cannot be greater than ' + maxNameLength + ' characters.');
            
            // Disconnect user.
            socket.disconnect();
            
            return;
        }

        // check if username is already taken
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name == user) welcome = 'NameTaken';
        }

        // set up new player
        if (welcome == 'Welcome') {
            console.log(getTime() + ' ' + "ADDING " + user);
            socket.clientname = user;

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
        }

        socket.emit('welcome', welcome);

        if (welcome == 'NameTaken') {
            console.log(getTime() + ' ' + "DROPPING " + user + "FOR NAME INFRINGEMENT");
            socket.disconnect();
        }

        playersReport();

        // Update most seen.
        recordMostOnline();

    });

    socket.on('hereIAm', function(x, y, direction, mapname, skin) {
        socket.roomname = mapname;
        socket.join(socket.roomname);
        console.log(getTime() + ' ' + socket.clientname + " ENTERED " + socket.roomname);

        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name == socket.clientname) {
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
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].room == mapname && onlinePlayers[i].name != socket.clientname) playersToGiveSocket.push(onlinePlayers[i]);
        }
        socket.broadcast.to(mapname).emit('addPlayer', socket.clientname, x, y, direction, skin);

        if (playersToGiveSocket.length >= 1) socket.emit('addAllPlayers', playersToGiveSocket);
    });

    socket.on('playerLeaveZone', function() {
        // instruct others to drop this player
        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname);
        socket.leave(socket.roomname);
        // stop listening
        socket.roomname = 'limbo';
        socket.join(socket.roomname);
    });


    socket.on('receiveReskin', function(skin) {
        console.log(getTime() + ' ' + "Player " + socket.clientname + " changed skin: " + skin);
        socket.broadcast.to(socket.roomname).emit('reskinOtherPlayer-' + socket.clientname, skin);
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name == socket.clientname) {
                onlinePlayers[i].skin = skin; // update server record
                break;
            }
        }
    });

    socket.on('receiveUpdateMoveState', function(x, y, direction, state) {
        socket.broadcast.to(socket.roomname).emit('moveUpdateOtherPlayer-' + socket.clientname, x, y, direction, state);

        // update players known info on server
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name == socket.clientname) {
                onlinePlayers[i].pos.x = x;
                onlinePlayers[i].pos.y = y;
                onlinePlayers[i].facing = direction;
                onlinePlayers[i].state = state;
                break;
            }
        }
    });

    socket.on('receiveSay', function(client, msg) {
        
        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {
            
            socket.broadcast.to(socket.roomname).emit('newMsg', client, cleanMessage(msg));
            console.log(getTime() + ' ' + "[" + socket.roomname + "][" + socket.clientname + "] " + msg);
        }
    });

    socket.on('receiveTell', function(to, msg) {
        
        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {

            // Debug message.
            console.log(getTime() + ' ' + "Contents of tell: '" + msg + "'");

            // find recipients session id
            for (var i = 0; i < onlinePlayers.length; i++) {
                if (onlinePlayers[i].name == to) {
                    //console.log("Tell going to: " + to + " has session: " + onlinePlayers[i].session);
                    io.sockets.socket(onlinePlayers[i].session).emit('incomingTell', socket.clientname, cleanMessage(msg)); // send tell
                    console.log("[" + socket.clientname + ">>" + to + "] " + msg);
                    return;
                }
            }
            console.log(getTime() + ' ' + "** Tell received but recipient does not exist.");
        }
    });

    socket.on('disconnect', function() {
        console.log(getTime() + ' ' + socket.clientname + " DISCONNECTED");

        // remove client from onlinePlayers array
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name == socket.clientname) {
                onlinePlayers.splice(i, 1);
            }
        }

        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname, socket.clientname);

        playersReport();

    });


});