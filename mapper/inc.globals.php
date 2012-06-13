<?php

// MEASUREMENTS / DIMENSIONS
$globalTilesize = 16;
$globalMasterTilesheetWidth = 256;
$globalBorderRepeatX = 0; // 4;
$globalBorderRepeatY = 0; // 3;
$globalWMTileOffset = 1; // because Weltmeister considers 1, not 0 to be the first tile

// DIRECTORIES
$globalMapDir =
    "." . DIRECTORY_SEPARATOR .
    "maps" . DIRECTORY_SEPARATOR .
    "rs-hoenn-outside";
$globalTileDumpDir =
    "." . DIRECTORY_SEPARATOR .
    "dumped-tiles";
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
$globalCollisionsFile = 'collisions.txt';
$globalTilesheetFile = 'tilesheet.png';
$globalMapFilename = 'map.png';
$globalMapJSON = 'map.js';
$globalUsedTilesFile = 'used-tiles.js';
$globalMasterTilesheetFile = 'master.png';
$globalMasterTilesheetJSON = 'master.js';
$globalPlacementFile = 'placement.txt';
$globalBorderFile = 'border.png';
$globalSpecialTilesJSON = 'special-tiles.js';



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
            'sandprints'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/sandprints.gif',
               'mouseoverImg' => 'images/sandprints-mouseover.png'
        ),
            'reflection'    =>
        array( 'collision'    => 0,
               'mouseoutImg'  => 'images/reflection.gif',
               'mouseoverImg' => 'images/reflection-mouseover.png'
        )
    );

?>     