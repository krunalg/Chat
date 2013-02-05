This is an experimental game/chat I created entirely in HTML5 and JavaScript
using the ImpactJS framework, with Socket.IO and NodeJS for the network
component, and a little bit of jQuery for the chat.

To run the server yourself, you must have NodeJS installed. If server.bat does
not work, you can drag server.js onto node.exe instead (does the same thing).


Installation:
----------------------------

1. Clone or download this repository.
2. Extract your licensed ImapctJS files/folders into `client`.
3. In Git Bash type `git checkout client/lib/game/main.js` and hit enter.
4. Create a new MySQL database.
5. On the newly created database, run `database.sql`.
6. Open `mapper/mysql-connection-template.js` and follow the instructions.
7. In a web browser, open `mapper/cron.php`. Be patient (this takes about 30 minutes).

### Then to play:
6. Run `server/server.bat`.
7. In a web browser, open `client/index.php?user=Joncom`.


To-do:
----------------------------

Day 1 - Select a map; Map shows up
Day 2 - Click tile and manually specify two fields: map and position.
Day 3 - Automate two fields by loading second map and clicking tile.
Day 4 - Generated maps include exit entities.
Day 5 - Generate server exit-list; server tells player what map to load.
Day 6 - Water ripple effect.
Day 7 - Collision editor supports multiple types.
Day 8 - Single side tile restrictions.

### Server:
- Handle unexpected mySQL database disconnections gracefully.

### Reflection:
- Add: brightness/fading effect to reflections.

### Weather:
- Add: Triggered by player walking in certain areas.
- Fix: Sand-screen and ash-screen follow the player as he moves.

### Water:
- Fix: Player does 'slow-walk' animation trying to swim against a wall.
- Add: Player shows 'bobbing' animation when swimming.
- Add: Initial hop on to surf-entity animation.
- Add: Water ripple effect.

### World:
- Fix: Mountain tops can be walked on to from above.
- Fix: Fence in the 'flower' town is walkable from above.
- Tree-tip over water just to the right and up from DEWFORD TOWN.
- Reflective water should be swimmable intead of walkable.
- Fix: Tree-tips over reflective water hide reflection.
- LAVENDER TOWN overhead banner is not overhead.

### Grass:
- Fix: Not all grass entities spawned by network players disappear.
- Add: Despawning of persistent-grass entities when off-screen.

### Effects:
- Overhead smoke-effect in LAVARIDGE TOWN.
- Smashable rocks, and cuttable trees (low priority).
- Sinking logs in PACIFIDLOG TOWN (low priority).

### Bicycle:
- Add: 'curvy' tire tracks when turning corners in sand.
- Add: bike sprites for MAY (girl).
- Add: 'Mach' bicycle which has variable speed (low priority).

### Chat:
- Prohibit the use of certain characters in names.
- Restrict message length.

### Movement:
- Fix: NO-CLIP mode doesn't work when walking up ledges.
- Changing directions plays a step animation.
- A* pathfinding (low priority).

### Optimizations:
- When processing a merged map, don't process the areas known to be black empty space.
- Integrate animation frames into master tilesheet and drop ID-tiles.

### Code Improvements:
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


Useful curl example:
----------------------------

### curl -X PUT http://www.foo.com/bar/1 -d "some=var" -d "other=var2"

-H "Accept: text/json" -I

-X [METHOD] Specify the HTTP method.

-d “name=value” Set a POST/PUT field name and value.

-H [HEADER] Set a header.

-I Only display response’s headers.

### Display Body
curl -X POST http://localhost/Chat/api/user/ -d "user=Joncom2" -d "x=0" -d "y=16" -d "facing=left" -d "skin=boy" -d "state=idle" -d "map=RsWorld"

### Display Header
curl -s -X POST -D- http://localhost/Chat/api/user/ -o/dev/null