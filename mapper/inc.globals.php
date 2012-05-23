<?php

// MEASUREMENTS / DIMENSIONS
$globalTilesize = 16;
$globalMasterTilesheetWidth = 256;

// DIRECTORIES
$globalMapDir =
    "." . DIRECTORY_SEPARATOR .
    "maps" . DIRECTORY_SEPARATOR .
    "rs-hoenn-outside";
$globalTileDumpDir =
    "." . DIRECTORY_SEPARATOR .
    "dumped-tiles";
    
// FILE NAMES
$globalCollisionsFile = 'collisions.txt';
$globalTilesheetFile = 'tilesheet.png';
$globalMapFilename = 'map.png';
$globalMapJSON = 'map.js';
$globalUsedTilesFile = 'used-tiles.js';
$globalMasterTilesheetFile = 'master.png';
$globalMasterTilesheetJSON = 'master.js';
$globalPlacementFile = 'placement.txt';


// used later to map collision types
// to a Weltmeister collision value.
// the _first value_ is the internal
// collision value used by the code
// generator. the _second value_ is
// used at the very end when we
// generate a map.
$globalCollisions =
    array( 'walkable' => 0,
           'nowalk'   => 1,
           'left'     => 45,
           'right'    => 34,
           'up'       => 12,
           'down'     => 23,
           'noleft'   => 999,
           'noright'  => 999,
           'noup'     => 999,
           'nodown'   => 999
         );
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
$collisionNoLeft = 6;
$collisionNoLeftWM = 999; // 999 is just placeholder number for now
$collisionNoRight = 7;
$collisionNoRightWM = 999;
$collisionNoUp = 8;
$collisionNoUpWM = 999;
$collisionNoDown = 9;
$collisionNoDownWM = 999;

// mouse out
$collisionWalkableMouseoutImg = 'images/spacer.png';
$collisionNoWalkMouseoutImg = 'images/solid.gif';
    $collisionLeftMouseoutImg = 'images/left.gif';
    $collisionRightMouseoutImg = 'images/right.gif';
    $collisionUpMouseoutImg = 'images/up.gif';
    $collisionDownMouseoutImg = 'images/down.gif';
$collisionNoLeftMouseoutImg = 'images/noleft.gif';
$collisionNoRightMouseoutImg = 'images/noright.gif';
$collisionNoUpMouseoutImg = 'images/noup.gif';
$collisionNoDownMouseoutImg = 'images/nodown.gif';

// mouse over
$collisionWalkableMouseoverImg = 'images/mouseover.png';
$collisionNoWalkMouseoverImg = 'images/solid-mouseover.png';
    $collisionLeftMouseoverImg = 'images/left-mouseover.png';
    $collisionRightMouseoverImg = 'images/right-mouseover.png';
    $collisionUpMouseoverImg = 'images/up-mouseover.png';
    $collisionDownMouseoverImg = 'images/down-mouseover.png';
$collisionNoLeftMouseoverImg = 'images/noleft-mouseover.png';
$collisionNoRightMouseoverImg = 'images/noright-mouseover.png';
$collisionNoUpMouseoverImg = 'images/noup-mouseover.png';
$collisionNoDownMouseoverImg = 'images/nodown-mouseover.png';



?>     