<?php

// MEASUREMENTS / DIMENSIONS
$globalTilesize = 16;
$globalMasterTilesheetWidth = 256;
$globalWMTileOffset = 1; // because Weltmeister considers 1, not 0 to be the first tile

// DIRECTORIES
$buildDir = './build/';
$mergedMapDir = $buildDir . 'merged-maps/';
$processedMapDir = $buildDir . 'processed-maps/';
$impactLibDir = '../client/lib/game/';
$impactMediaDir = '../client/media/';
$impactAnimationDir = $impactMediaDir . 'animations/';
$impactLevelDir = '../client/lib/game/levels/';
$globalTileDumpDir = $buildDir . 'original-tiles/';
$globalMapDir =
    "." . DIRECTORY_SEPARATOR .
    "maps";

$globalAboveDumpDir =
    "." . DIRECTORY_SEPARATOR .
    "above-tiles";
$globalBelowDumpDir =
    "." . DIRECTORY_SEPARATOR .
    "below-tiles";
$globalAnimationsDir =
    "." . DIRECTORY_SEPARATOR .
    "animations";
    
// FILE NAMES

/* Don't prefix the first few with paths because they are either:
    - used as search terms when scanning folders
    - used to create relative paths that differ between mapper and client
*/
$globalMapFilename = 'map.png';
$globalMapJSON = 'map.js';
$globalPlacementFile = 'placement.txt';
$globalBorderFile = 'border.png';
$globalMasterTilesheetFile = 'master.png';

$globalCollisionsFile = 'collisions.txt';
$globalMasterTilesheetJSON = $buildDir . 'master-tilesheet.js';
$globalSpecialTilesJSON = 'special-tiles.js';
$globalCameraDodgeJSON = $impactLibDir . 'saved-camera-dodges.js';



// its important that if you add a new tile state to this
// array, you add it to the end, not the middle, otherwise
// you may break existing tiles that have already been
// assigned to a specific state. if your state file is
// currently empty, this won't matter.
$globalCollisions =
    array( 'walkable' =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/spacer.png',
               'mouseoverImg' => 'images/mouseover.png'
        ),
        'nowalk'   => 
        array( 'collision'    => 1,
               'mouseoutImg'  => 'images/solid.gif',
               'mouseoverImg' => 'images/solid-mouseover.png'
        ),
        'left'     => 
        array( 'collision'    => 45,
               'mouseoutImg'  => 'images/left.gif',
               'mouseoverImg' => 'images/left-mouseover.png'
        ),
        'right'    => 
        array( 'collision'    => 34,
               'mouseoutImg'  => 'images/right.gif',
               'mouseoverImg' => 'images/right-mouseover.png'
        ),
        'up'       => 
        array( 'collision'    => 12,
               'mouseoutImg'  => 'images/up.gif',
               'mouseoverImg' => 'images/up-mouseover.png'
        ),
        'down'     => 
        array( 'collision'    => 23,
               'mouseoutImg'  => 'images/down.gif',
               'mouseoverImg' => 'images/down-mouseover.png'
        ),
        'noleft'   => 
        array( 'collision'    => 999,
               'mouseoutImg'  => 'images/noleft.gif',
               'mouseoverImg' => 'images/noleft-mouseover.png'
        ),
        'noright'  => 
        array( 'collision'    => 999,
               'mouseoutImg'  => 'images/noright.gif',
               'mouseoverImg' => 'images/noright-mouseover.png'
        ),
        'noup'     => 
        array( 'collision'    => 999,
               'mouseoutImg'  => 'images/noup.gif',
               'mouseoverImg' => 'images/noup-mouseover.png'
        ),
        'nodown'   => 
        array( 'collision'    => 999,
               'mouseoutImg'  => 'images/nodown.gif',
               'mouseoverImg' => 'images/nodown-mouseover.png'
        ),
        'above'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/above-player.gif',
               'mouseoverImg' => 'images/above-player-mouseover.png'
        ),
        'grass'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/grass.gif',
               'mouseoverImg' => 'images/grass-mouseover.png'
        ),
        'water'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/water.gif',
               'mouseoverImg' => 'images/water-mouseover.png'
        ),
        'sandtrack'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/sand-track.gif',
               'mouseoverImg' => 'images/sand-track-mouseover.png'
        ),
        'reflection'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/reflection.gif',
               'mouseoverImg' => 'images/reflection-mouseover.png'
        ),
        'splash'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/splash.gif',
               'mouseoverImg' => 'images/splash-mouseover.png'
        ),
        'ashgrass'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/ash-grass.gif',
               'mouseoverImg' => 'images/ash-grass-mouseover.png'
        ),
        'tallgrass'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/tall-grass.gif',
               'mouseoverImg' => 'images/tall-grass-mouseover.png'
        ),
        'deepsand'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/deep-sand.gif',
               'mouseoverImg' => 'images/deep-sand-mouseover.png'
        )
    );

?>