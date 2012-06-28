var server = require('http').createServer(handler),
    io = require('socket.io').listen(server),
    fs = require('fs')


    server.listen(9090);

// Arrays of player objects.
var onlinePlayers = new Array();
var offlinePlayers = new Array();

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

// Boots user with undefined name.
function bootUnauthorized(socket) {

    if(typeof socket.clientname === 'undefined') {

        socket.emit('error', 'You are not properly authenticated to server. This could happen if the server rebooted.');
        socket.disconnect();
        return true;
    }

    return false;
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
            player.state = 'idle'; // every player is idle on first connect
            player.skin = 'boy';
            player.session = socket.id;
            player.room = 'RsWorld';
            onlinePlayers.push(player);
        }

        socket.emit('welcome', welcome);

        if (welcome == 'NameTaken') {
            console.log(getTime() + ' ' + "DROPPING " + user + "FOR NAME INFRINGEMENT");
            socket.disconnect();
        }

        // User joins chat room.
        socket.roomname = player.room;
        socket.join(socket.roomname);
        console.log(getTime() + ' ' + socket.clientname + " ENTERED " + socket.roomname);

        // Tell other players about user.
        socket.broadcast.to(socket.roomname).emit('addPlayer', socket.clientname, player.pos.x, player.pos.y, player.facing, player.skin);

        playersReport();

        // Update most seen.
        recordMostOnline();

    });

    socket.on('getCurrentMap', function() {

        if(bootUnauthorized(socket)) return;

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            if (onlinePlayers[i].name == socket.clientname) {
                
                var map = onlinePlayers[i].room;

                socket.emit('loadCurrentMap', map);

                return;
            }
        }
        
        console.log("  *!*!* A player who is authorized but not in player list requested current map.");
        
    });

    socket.on('getNearbyPlayers', function() {

        if(bootUnauthorized(socket)) return;

        nearbyPlayers = new Array();

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            
            if (onlinePlayers[i].room === socket.roomname && onlinePlayers[i].name !== socket.clientname) {
                
                var player = new Object();
                player.name = onlinePlayers[i].name;
                player.pos = new Object();
                player.pos.x = onlinePlayers[i].pos.x;
                player.pos.y = onlinePlayers[i].pos.y;
                player.facing = onlinePlayers[i].facing;
                player.skin = onlinePlayers[i].skin;
                player.moveState = onlinePlayers[i].state;

                nearbyPlayers.push(player);
            }
        }

        if( nearbyPlayers.length > 0 ) socket.emit('addNearbyPlayers', nearbyPlayers);

    });

    socket.on('playerStart', function() {

        if(bootUnauthorized(socket)) return;

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            
            if (onlinePlayers[i].name == socket.clientname) {
                
                var x = onlinePlayers[i].pos.x;
                var y = onlinePlayers[i].pos.y;
                var facing = onlinePlayers[i].facing;
                var skin = onlinePlayers[i].skin;
                var state = onlinePlayers[i].state;

                socket.emit('playerStart-' + socket.clientname, x, y, facing, state, skin);

                return;
            }
        }
        
        console.log("  *!*!* A player who is authorized but not in player list request details.");
        
    });

    socket.on('playerLeaveZone', function() {

        if(bootUnauthorized(socket)) return;

        // instruct others to drop this player
        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname);
        socket.leave(socket.roomname);
        // stop listening
        socket.roomname = 'limbo';
        socket.join(socket.roomname);
    });


    socket.on('receiveReskin', function(skin) {

        if(bootUnauthorized(socket)) return;

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

        if(bootUnauthorized(socket)) return;

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

    socket.on('receiveSay', function(msg) {
        
        if(bootUnauthorized(socket)) return;

        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {
            
            socket.broadcast.to(socket.roomname).emit('newMsg', socket.clientname, cleanMessage(msg));
            console.log(getTime() + ' ' + "[" + socket.roomname + "][" + socket.clientname + "] " + msg);
        }
    });

    socket.on('receiveTell', function(to, msg) {

        if(bootUnauthorized(socket)) return;
        
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

        if(typeof socket.clientname === 'undefined') return;

        console.log(getTime() + ' ' + socket.clientname + " DISCONNECTED");

        // remove client from onlinePlayers array
        for (var i = 0; i < onlinePlayers.length; i++) {
            if (onlinePlayers[i].name === socket.clientname) {
                
                offlinePlayers.push(onlinePlayers[i]);
                
                onlinePlayers.splice(i, 1);
            }
        }

        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname, socket.clientname);

        playersReport();

    });


});