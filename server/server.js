/*
 * Load modules and start server.
 */

var http = require('http');

var server = http.createServer(handler);

var io = require('socket.io').listen(server);

var fs = require('fs');

function handler(req, res) {

    fs.readFile(__dirname + '/index.html', function(err, data) {

        if(err) {

            res.writeHead(500);

            return res.end('Error loading index.html');

        }

        res.writeHead(200);

        res.end(data);

    });

}

server.listen(9090);



var api = {

    host: 'localhost',

    port: 80,

    path: '/Chat/api/'

};




var onlinePlayers = [];

// Most users seen online since server started.
var mostOnline = 0;

io.set('log level', 1);

// Log message to file.

function logToFile(message) {

    var line = getTime() + ' ' + message + "\r\n";

    //fs = require('fs');
    fs.appendFile('chat.log', line, function(err) {

        if(err) console.log(err);

        else console.log("The file was saved!");

    });

}

// Report how many players online.

function playersReport() {

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

    var amOrPm = (hours > 11 ? 'PM' : 'AM');

    if(hours === 0) hours = 12;

    else if(hours > 12) hours = hours - 12;

    minutes = (minutes < 10 ? '0' + minutes : minutes);

    return hours + ':' + minutes + amOrPm;

}

function initializePlayer(id, name, x, y, facing, skin, state, map, sessionID) {

    console.log(getTime() + " ADDING PLAYER " + name);

    // Create live player object.
    var player = {};

    player.id = id;

    player.name = name;

    player.pos = {};

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

            var player = onlinePlayers[i];

            io.sockets.sockets[sessionID].broadcast.to(roomname).emit('addPlayer', username, player.pos.x, player.pos.y, player.facing, player.skin);

        }

    }

}

// Instruct client to load a map.

function loadMap(sessionID, map) {

    io.sockets.sockets[sessionID].emit('loadMap', map);

}

// Removes HTML characters from messages that could allow players to phish.

function deHTML(message) {

    return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");

}

// Dump the contents of an object.

function dump(obj) {

    var out = '';

    for(var i in obj) {

        out += i + ": " + obj[i] + "\n";

    }

    console.log(out);

}

function sendHeartbeat() {

    io.sockets.emit('ping', {

        beat: 1

    });

    //console.log(getTime() + " Pinging all sockets.");
}

setInterval(sendHeartbeat, 8000);

io.sockets.on('connection', function(socket) {

    // The expected response sent from users when "pinged".
    socket.on('pong', function(data) {});

    socket.on('init', function(user) {

        socket.clientname = user;

        // Check that user not already online.
        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name === socket.clientname) {

                console.log(getTime() + ' ' + "DROPPING " + socket.clientname + " FOR USING ALREADY IN-USE NAME.");

                socket.emit('error', 'The username ' + socket.clientname + ' is already in use. Please use another.');

                socket.disconnect();

                return;

            }

        }

        // Get user data via API.

        var path = 'user/?username=' + user;

        var callback = function(jsonObj) {

            if(jsonObj.data.length > 0) {

                var id = parseInt(jsonObj.data[0].id);

                var name = jsonObj.data[0].username;

                var x = parseInt(jsonObj.data[0].x);

                var y = parseInt(jsonObj.data[0].y);

                var facing = jsonObj.data[0].direction;

                var skin = jsonObj.data[0].skin;

                var state = jsonObj.data[0].state;

                var map = jsonObj.data[0].zone;

                initializePlayer( id, name, x, y, facing, skin, state, map, socket.id );

            } else {

                socket.emit('error', 'No such user in database.');

                socket.disconnect();

            }

        };

        httpRequest('GET', path, callback);

        /*
        http.get("http://localhost/Chat/api/user/?user=" + user, function(res) {

            res.setEncoding('utf8');

            res.on('data', function(chunk) {

                var jsonObj = JSON.parse(chunk);

                if(jsonObj.data.length > 0) {

                    var id = parseInt(jsonObj.data[0].id);

                    var name = jsonObj.data[0].user;

                    var x = parseInt(jsonObj.data[0].x);

                    var y = parseInt(jsonObj.data[0].y);

                    var facing = jsonObj.data[0].facing;

                    var skin = jsonObj.data[0].skin;

                    var state = jsonObj.data[0].state;

                    var map = jsonObj.data[0].map;

                    initializePlayer( id, name, x, y, facing, skin, state, map, socket.id );

                } else {

                    socket.emit('error', 'No such user in database.');

                    socket.disconnect();

                }

            });

        }).on('error', function(e) {

            console.log("Got error: " + e.message);

        });

        //*/

    });

    socket.on('getNearbyPlayers', function() {

        if(bootUnauthorized(socket)) return;

        nearbyPlayers = [];

        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].room === socket.roomname) {

                var player = {};

                player.name = onlinePlayers[i].name;

                player.pos = {};

                player.pos.x = onlinePlayers[i].pos.x;

                player.pos.y = onlinePlayers[i].pos.y;

                player.facing = onlinePlayers[i].facing;

                player.skin = onlinePlayers[i].skin;

                player.moveState = onlinePlayers[i].state;

                nearbyPlayers.push(player);

            }

        }

        if(nearbyPlayers.length > 0) socket.emit('addNearbyPlayers', nearbyPlayers);

    });

    socket.on('playerStart', function() {

        if(bootUnauthorized(socket)) return;

        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name == socket.clientname) {

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

        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name == socket.clientname) {

                onlinePlayers[i].skin = skin; // update server record
                break;

            }

        }

    });

    socket.on('receiveUpdateMoveState', function(x, y, direction, state) {

        if(bootUnauthorized(socket)) return;

        socket.broadcast.to(socket.roomname).emit('moveUpdateOtherPlayer-' + socket.clientname, x, y, direction, state);

        // update players known info on server
        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name == socket.clientname) {

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
        if(msg.trim().length > 0) {

            socket.broadcast.to(socket.roomname).emit('newMsg', socket.clientname, deHTML(msg));

            console.log(getTime() + ' ' + "[" + socket.roomname + "][" + socket.clientname + "] " + msg);

            logToFile("[" + socket.roomname + "][" + socket.clientname + "] " + msg);

        }

    });

    socket.on('receiveTell', function(to, msg) {

        if(bootUnauthorized(socket)) return;

        // Checks that message contains non-whitespace.
        if(msg.trim().length > 0) {

            // Find recipient.
            for(var i = 0; i < onlinePlayers.length; i++) {

                if(onlinePlayers[i].name.toLowerCase() == to.toLowerCase()) {

                    io.sockets.socket(onlinePlayers[i].session).emit('incomingTell', socket.clientname, deHTML(msg));

                    console.log(getTime() + " [" + socket.clientname + "][" + to + "] " + msg);

                    logToFile("[" + socket.clientname + "][" + to + "] " + msg);

                    return;

                }

            }

            socket.emit('logError', "Player not found.");

        }

    });

    socket.on('disconnect', function() {

        if(typeof socket.clientname === 'undefined') return;

        console.log(getTime() + ' ' + socket.clientname + " DISCONNECTED");

        // Update player records in database via the API.

        var player = {};

        // First find the player.
        for(var i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name == socket.clientname) {

                player = onlinePlayers[i];

                break;

            }

        }

        // Save user data via API.

        var data = 'x=' + player.pos.x + '&y=' + player.pos.y + '&direction=' + player.facing + '&state=' + player.state;

        var path = 'user/' + player.id;

        httpRequest('POST', path, function(jsonObj){console.log(jsonObj.message);}, data);

        // remove client from onlinePlayers array
        for(i = 0; i < onlinePlayers.length; i++) {

            if(onlinePlayers[i].name === socket.clientname) {

                onlinePlayers.splice(i, 1);

            }

        }

        socket.broadcast.to(socket.roomname).emit('dropPlayer-' + socket.clientname, socket.clientname);

        playersReport();

    });

});

/**
 * Sends an HTTP Request which expects a JSON response
 * and upon success triggers a callback function
 * with the fetched JSON object as an argument.
 *
 * @access  public
 * @param   method     string
 * @param   path       string
 * @param   callback   function
 * @param   data       string
 * @return  undefined
 */
function httpRequest( method, path, callback, data ) {

    var options = {

        hostname: api.host,

        port: api.port,

        path: api.path + path,

        method: method

    };

    if( typeof data === 'string' ) {

        options.headers = {

            'Content-Type': 'application/x-www-form-urlencoded',

            'Content-Length': data.length

        };

    }

    var req = http.request(options, function(res) {

        res.setEncoding('utf8');

        res.on('data', function (chunk) {

            var jsonObj = JSON.parse(chunk);

            callback( jsonObj );

        });

    });

    req.on('error', function(e) {

        console.log('problem with request: ' + e.message);

    });

    // write data to request body
    if( typeof data === 'string' ) req.write(data);

    req.end();

};