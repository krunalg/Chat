var server = require('http').createServer(handler);
var io = require('socket.io').listen(server);
var fs = require('fs');
server.listen(9090);

// Set up mySQL connection.

var mysql = require('mysql');

var login = require('./mysql-connection');

var connection = mysql.createConnection({
  host     : login.hostname(),
  user     : login.username(),
  password : login.password(),
  database : login.database(),
});

connection.connect(function(err) {
  if(err) console.log('mysql connection problem - error code: ' + err.code + ' fatal: ' + err.fatal);
});

// I am Chuck Noris:
//connection.on('error', function() {});



var onlinePlayers = new Array();

// Most users seen online since server started.
var mostOnline = 0;

io.set('log level', 1);

// Report how many players online.
var playersReport = function() {
    
    var online = onlinePlayers.length;
    console.log(getTime() + " PLAYERS ONLINE: " + online + " MOST ONLINE: " + mostOnline);
}

// Records the most users seen online.
function recordMostOnline() {

    var currentOnline = onlinePlayers.length;

    if(currentOnline > mostOnline) mostOnline = currentOnline;
}

// Boots user with undefined name.
function bootUnauthorized(socket) {

    if(typeof socket.clientname === 'undefined') {

        socket.emit('error', 'You are not authenticated to the server. The server may have rebooted.');
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
    
    if(hours===0) hours = 12;
    if(hours>12)  hours = hours - 12;

    return hours + ':' + minutes + amOrPm;
}

function initializePlayer( name, x, y, facing, skin, state, map, sessionID ) {
    
    console.log(getTime() + " ADDING PLAYER " + name);

    // Create live player object.
    var player = new Object();
    player.name = name;
    player.pos = new Object();
    player.pos.x = x;
    player.pos.y = y;
    player.facing = facing;
    player.state = state;
    player.skin = skin;
    player.session = sessionID;
    player.room = map;
    onlinePlayers.push(player);
    
    sendAnnouncement(name, "Welcome.");
    
    io.sockets.sockets[sessionID].roomname = map;

    joinChatRoom(name, map); 

    introducePlayerToRoom(name, map);

    loadMap(sessionID, map);

    // Update most seen.
    recordMostOnline();

    // List online players.
    playersReport();
}

// Send a message from the server.
function sendAnnouncement(username, message) {

    for(var i = 0; i < onlinePlayers.length; i++) {

        if(onlinePlayers[i].name === username) {

            var sessionID = onlinePlayers[i].session;
            io.sockets.sockets[sessionID].emit('announcement', message);
            return;
        }
    }
}

// Joins a user to a chat room.
function joinChatRoom(username, roomname) {

    for(var i = 0; i < onlinePlayers.length; i++) {

        if(onlinePlayers[i].name === username) {

            var sessionID = onlinePlayers[i].session;
            var room = onlinePlayers[i].room;

            io.sockets.sockets[sessionID].join(room);
            console.log(getTime() + ' ' + username + " ENTERED " + room);
        }
    }
}

// Tell users in a room to add a new player.
function introducePlayerToRoom(username, roomname) {

    for(var i = 0; i < onlinePlayers.length; i++) {

        if(onlinePlayers[i].name === username) {

            var sessionID = onlinePlayers[i].session;
            var player    = onlinePlayers[i];

            io.sockets.sockets[sessionID].broadcast.to(roomname).emit('addPlayer', username, player.pos.x, player.pos.y, player.facing, player.skin);
        }
    }
}

// Instruct client to load a map.
function loadMap(sessionID, map) {

    io.sockets.sockets[sessionID].emit('loadMap', map);
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
function deHTML(message) { return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;"); }

// Dump the contents of an object.
function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    console.log(out);
}

io.sockets.on('connection', function(socket) {

    socket.on('init', function(user) {
        
        socket.clientname = user;

        // Check that user not already online.
        for (var i = 0; i < onlinePlayers.length; i++) {
           
            if (onlinePlayers[i].name === socket.clientname) {
                
                console.log(getTime() + ' ' + "DROPPING " + socket.clientname + " FOR USING ALREADY IN-USE NAME.");
                socket.emit('error', 'The username ' + socket.clientname + ' is already in use. Please use another.');
                socket.disconnect();
                return;
            }
        }

        connection.query("SELECT * FROM users WHERE user = '" + socket.clientname + "'", function(err, rows) {
            
            if (err) {

                console.log(err.code);
                console.log(err.fatal);
            
            } else {

                if(rows.length==0) {
                    
                    socket.emit('error', 'No such user in database.');
                    socket.disconnect();
                    return;

                } else {

                    // Found user.
                    var name   = rows[0].user;
                    var x      = rows[0].x;
                    var y      = rows[0].y;
                    var facing = rows[0].facing;
                    var skin   = rows[0].skin;
                    var state  = rows[0].state;
                    var map    = rows[0].map;

                    initializePlayer( name, x, y, facing, skin, state, map, socket.id );
                }
            }   
        });
    });

    socket.on('getNearbyPlayers', function() {

        if(bootUnauthorized(socket)) return;

        nearbyPlayers = new Array();

        for (var i = 0; i < onlinePlayers.length; i++ ) {
            
            if (onlinePlayers[i].room === socket.roomname) {
                
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
            
            socket.broadcast.to(socket.roomname).emit('newMsg', socket.clientname, deHTML(msg));
            console.log(getTime() + ' ' + "[" + socket.roomname + "][" + socket.clientname + "] " + msg);
        }
    });

    socket.on('receiveTell', function(to, msg) {

        if(bootUnauthorized(socket)) return;
        
        // Checks that message contains non-whitespace.
        if (msg.trim().length > 0) {

            // find recipients session id
            for (var i = 0; i < onlinePlayers.length; i++) {
                if (onlinePlayers[i].name == to) {
                    //console.log("Tell going to: " + to + " has session: " + onlinePlayers[i].session);
                    io.sockets.socket(onlinePlayers[i].session).emit('incomingTell', socket.clientname, deHTML(msg)); // send tell
                    console.log(getTime() + " [" + socket.clientname + "][" + to + "] " + msg);
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
                
                onlinePlayers.splice(i, 1);
            }
        }

        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname, socket.clientname);

        playersReport();

    });


});