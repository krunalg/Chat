This is an experimental game/chat I created entirely in HTML5 and JavaScript
using the ImpactJS framework, with Socket.IO and NodeJS for the network
component, and a little bit of jQuery for the chat.

To run the server yourself, you must have NodeJS installed. If server.bat does
not work, you can drag server.js onto node.exe instead (does the same thing).


Change-Log:
----------------------------

June
- Grass entities spawn only as needed and self-prune after use. (June 2, 2012)
- Repeating borders update according to player's position in the world. (June 2, 2012)
- Player can travel over water. (June 3, 2012)
- Chat log with auto-scrolling text, multi-colored messages, and clicking names or pressing R to private message. (June 7, 2012)
- As the player walks over sand tiles, foot prints are left behind him. (June 8, 2012)
- Player reflection is shown with animation in certain types of water. (June 11, 2012)
- Player can now ride a bicycle by pressing C. The bicycle leaves tracks in sand tiles. (June 12, 2012)
- Weather effects for 'raining', 'sandstorm' and 'falling ashes' can be spawned using the weather-controller entity. (June 14, 2012)
- Auto-generated map borders on no longer walkable. (June 15, 2012)
- Duration which a chat bubbles lives for is based on message length. (June 15, 2012)
- Removed extra pixel between character in chat bubbles. (June 15, 2012)
- Server will no longer accept names longer than 20 characters. (June 15, 2012)
- Server converts special HTML characters in messages to safe strings. (June 15, 2012)
- Players can no longer have more than one chat bubble visible at any given moment. (June 16, 2012)
- Walking in shallow water produced a splash effect at the players feet. (June 17, 2012)
- Walking through ash-covered grass spawns a cloud/puff of ash and the grass turns (and then stays) green. (June 17, 2012)
- Fixed: Ash puff only spawn if persistent-grass has not yet spawned. (June 18, 2012)
- Fixed: Grass entities spawned along-side persistent grass entities now self-despawn. (June 18, 2012)
- Added tall-grass with animations. (June 18, 2012)
- Added deep-sand effect which covers players feet in sand in certain areas. (June 18, 2012)
- Camera restrictions can be added to prevent unsightly areas from being seen by the player. (June 18, 2012)
- Automated generation of levels from image sources; just run cron.php (June 20, 2012)
- Added 319 maps (all areas and interiors). (June 23, 2012)
- Fixed bug where player reflections could sometimes be see over trees. (June 24, 2012)
- Fixed bug causing reflection animation to not fully animate when facing right. (June 24, 2012)
- Fixed bug that allowed players to walk along a ledge if approached from the side. (June 24, 2012)
- Up and down arrows are given precedence over left and right when moving. (June 24, 2012)
- Fixed bug which caused the bike to not show during ledge hops. (June 24, 2012)
- Server will disconnect any user that tries sending data without being authenticated. (June 27, 2012)
- Server remembers player location, skin, faced direction, state, and map when reconnecting. (June 27, 2012)
- Server console timestamps everything with a 12-hour clock instead of 24-hour. (June 27, 2012)
- Server informs client when his private message goes undelivered. (June 28, 2012)
- Recipient name when sending a private message is no longer case-sensitive. (June 28, 2012)
- User is informed when he types an invalid command. (June 28, 2012)
- Added map borders for interiors with repeating backgrounds, such as caves. (June 30, 2012)
- Server sends heartbeat to keep connection alive when user is idle. (June 30, 2012)

July
- Framerate improvement by not drawing repeating border in areas where it will be covered up. (July 4, 2012)


To-do:
----------------------------

Server:
- Handle unexpected mySQL database disconnections gracefully.

Reflection:
- Add: brightness/fading effect to reflections.

Weather:
- Add: Triggered by player walking in certain areas.
- Fix: Sand-screen and ash-screen follow the player as he moves.

Water:
- Fix: Player does 'slow-walk' animation trying to swim against a wall.
- Add: Player shows 'bobbing' animation when swimming.
- Add: Initial hop on to surf-entity animation.
- Add: Water ripple effect.

World:
- Fix: Mountain tops can be walked on to from above.
- Fix: Fence in the 'flower' town is walkable from above.
- Tree-tip over water just to the right and up from DEWFORD TOWN.
- Reflective water should be swimmable intead of walkable.
- Fix: Tree-tips over reflective water hide reflection.
- LAVENDER TOWN overhead banner is not overhead.

Grass:
- Fix: Not all grass entities spawned by network players disappear.
- Add: Despawning of persistent-grass entities when off-screen.

Effects:
- Overhead smoke-effect in LAVARIDGE TOWN.
- Smashable rocks, and cuttable trees (low priority).
- Sinking logs in PACIFIDLOG TOWN (low priority).

Bicycle:
- Add: 'curvy' tire tracks when turning corners in sand.
- Add: bike sprites for MAY (girl).
- Add: 'Mach' bicycle which has variable speed (low priority).

Chat:
- Prohibit the use of certain characters in names.
- Restrict message length.

Movement:
- Fix: NO-CLIP mode doesn't work when walking up ledges.
- Changing directions plays a step animation.
- A* pathfinding (low priority).

Optimizations:
- When processing a merged map, don't process the areas known to be black empty space.
- Integrate animation frames into master tilesheet and drop ID-tiles.

Code Improvements:
- Splash, jump, and deep-sand entities can all likely share a single parent class.
- Add all entities that follow player into player.followers (such as chat bubble, name, etc.)
- Have the initial camera-dodge-factory load entities from a module, not AJAX (low priority).


Known Issues:
----------------------------

- Network players can trigger grass to 'rustle' on other players screens by
  running up to one and stopping just before it.

- Network players will appear to teleport slightly when they stop or change
  directions if their framerate and yours differ significantly.

- Chat system does not support accented characters.

- Player can walk through a door, and keep going without being
  zoned until they let go of the movement key.

- Minimizing the game and coming back to it after some time will spawn all at
  once every chat bubble that had been missed.

- Player appears to run faster on sand-tiles than on regular land tiles.

- It is possible to get from a high to a low point or vice versa in some areas,
  such as from below a bridge to being on the bridge, by walking over certain tiles.

- Tall-grass entities appear darker than they should be.


Useful Commands:
----------------------------

	// for 20fps
	ig.system.stopRunLoop();
	window.setInterval( ig.system.run.bind(ig.system), 1000/20 );

	// Ash-grass.
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 2624;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 144;

	// Tall-grass.
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 4640;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 1072;

	// Shallow water.
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 10528;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 1296;

	// Deep-sand
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 3600;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 944;

	// Reflections
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 416;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 2960;

	// EVER-GRANDE CITY
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.x = 12448;
	ig.game.getEntitiesByType(EntityLocalPlayer)[0].pos.y = 3024;


Links:
----------------------------

ImpactJS
http://impactjs.com/

NodeJS
http://nodejs.org/

Socket.IO
http://socket.io/
https://github.com/LearnBoost/socket.io/blob/master/Readme.md

node-mysql
https://github.com/felixge/node-mysql

jQuery
http://jquery.com/
