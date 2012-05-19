<?php

$globalTilesize = 16;
$globalMapDir = ".\maps";
$globalTileDumpDir = ".\dumptiles";
$globalCollisionsFile = 'collisions.txt';
$globalTilesheetFile = 'tilesheet.png';
$globalMapFilename = 'map.png';
$globalMapJSON = 'map.js';
$globalUsedTilesFile = 'used-tiles.js';

// used later to map collision types
// to a Weltmeister collision value.
// the _first value_ is the internal
// collision value used by the code
// generator. the _second value_ is
// used at the very end when we
// generate a map.
$collisionWalkable = 0;
$collisionWalkableWM = 0;
$collisionNoWalk = 1;
$collisionNoWalkWM = 1;
$collisionLeft = 2;
$collisionLeftWM = 45;
$collisionRight = 3;
$collisionRightWM = 34;
$collisionUp = 4;
$collisionUpWM = 12;
$collisionDown = 5;
$collisionDownWM = 23;

$collisionWalkableMouseoutImg = 'images/spacer.png';
$collisionNoWalkMouseoutImg = 'images/solid.gif';
$collisionLeftMouseoutImg = 'images/left.gif';
$collisionRightMouseoutImg = 'images/right.gif';
$collisionUpMouseoutImg = 'images/up.gif';
$collisionDownMouseoutImg = 'images/down.gif';

$collisionWalkableMouseoverImg = 'images/mouseover.png';
$collisionNoWalkMouseoverImg = 'images/solid-mouseover.png';
$collisionLeftMouseoverImg = 'images/left-mouseover.png';
$collisionRightMouseoverImg = 'images/right-mouseover.png';
$collisionUpMouseoverImg = 'images/up-mouseover.png';
$collisionDownMouseoverImg = 'images/down-mouseover.png';



?>     