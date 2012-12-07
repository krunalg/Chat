<?php

/*
 *  This whole file is kind of stupid. Consider reworking its contents into other
 *  class files, even main.js would be better.
 */

    header("Content-type: text/javascript");
?>

// Keep the connection alive when user is idle.
socket.on('ping', function(data){
  	socket.emit('pong', {beat: 1});
});

// Receive /say message from server.
socket.on('newMsg', function(from, msg) {
	var showMessageHowLong = 2; // how long to hide name and show message
	// Get reference to player which name will follow.
	var player = ig.game.getEntityByName(from);

	// Does the player who sent us a message exist?
	if (player) {

		// Kill existing chat bubble.
		if(typeof player.chatBubble != 'undefined') {
			player.chatBubble.kill();
			player.chatBubble = undefined;
		}

		// Create new chat bubble.
		player.chatBubble = chatBubble = ig.game.spawnEntity(EntityChatBubble, 0, 0, {
			follow: player,
			msg: msg,
		});

		// hide name briefly
		var nameEntity = ig.game.getEntityByName(from + "NameEntity");
		if (nameEntity != undefined) nameEntity.hideTimer.set(chatBubble.lifespan);
	}

	// Write to chat log.
	ig.game.chatLog.push('<div class="say">[' + ig.game.chatNameHTML(from) + '] says: ' + msg + '</div>');
});

// Receive /tell message from server.
socket.on('incomingTell', function(from, msg) {

	// Remember the last person who sent us a /tell.
	ig.game.chatLog.lastTellFrom = from;

	// Write to chat log.
	ig.game.chatLog.push('<div class="tell">[' + ig.game.chatNameHTML(from) + '] whispers: ' + msg + '</div>');
});

// Define ThrowError, which shuts down the game and alerts the player.
function ThrowError(message) {

	// Erase game content.
	document.body.innerHTML = "";

	// Alert the player.
	window.alert('Server reported the following error: ' + message);

	// Write console message.
	throw new Error('Server reported the following error: ' + message);
}

// Write an error message to the log.
socket.on('logError', function(message) {

	ig.game.chatLog.push('<div class="error">' + message + '</div>');
});

// Receive error message from the server.
socket.on('error', function(message) {

	// End the game.
	ThrowError(message);
});

// Server welcomed the user, else kill the application.
socket.on('announcement', function(message) {

	// Write to chat log.
	ig.game.chatLog.push('<div class="announce">' + message + '</div>');
});

// Add a new player to the game.
socket.on('addPlayer', function(user, x, y, direction, skin) {
	var player = ig.game.getEntitiesByType(EntityLocalPlayer)[0]; // !! is it needed?

	// Write to chat log.
	ig.game.chatLog.push('<div class="info">[' + ig.game.chatNameHTML(user) + '] entered the area.</div>');

	ig.game.spawnEntity(EntityNetworkPlayer, x, y, {
		name: user,
		skin: skin,
		facing: direction,
	});
});

// Spawns entities for all players in the area.
socket.on('addAllPlayers', function(players) {
	var localPlayer = ig.game.getEntitiesByType(EntityLocalPlayer)[0];

	for (i = 0; i < players.length; i++) {
		if (localPlayer.name != players[i].name) {
			ig.game.spawnEntity(EntityNetworkPlayer, players[i].pos.x, players[i].pos.y, {
				name: players[i].name,
				facing: players[i].facing,
				skin: players[i].skin,
				animation: 6
			});
		}
	}
});

socket.on('playerPositions', function(players)
// updates all **currently existing**
// Otherplayer entity positions and directions
{
	// Debug message.
	console.debug("Socket event: playerPositions was called.");

	// Debug counter.
	var countWork = 0;
	var netplayers = ig.game.getEntitiesByType(EntityNetworkPlayer);
	if (netplayers) {
		for (var i = 0; i < netplayers.length; i++) {
			for (var j in players) {
				// if names match, update position
				if (netplayers[i].name == players[j].name) {

					// Record that we've done work.
					countWork++;

					netplayers[i].pos.x = players[j].pos.x;
					netplayers[i].pos.y = players[j].pos.y;
					var sw = players[j].facing;
					switch (sw) {
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
	console.debug("Work was done " + countWork + " times.");
});