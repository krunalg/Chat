<?php

ini_set('memory_limit','512M');
set_time_limit(300);

include('inc.globals.php');
require('required.php');


$mapFilename = 'maps/rs-oldale-town/map.png';
$mapSize = getimagesize($mapFilename);
$mapWidth = $mapSize[0];
$mapHeight = $mapSize[1];
$map = LoadPNG($mapFilename);

$tilesheetFilename = 'maps/rs-oldale-town/tilesheet.png';
$tilesheetSize = getimagesize($tilesheetFilename);
$tilesheetWidth = $tilesheetSize[0];
if($tilesheetWidth==257) $tilesheetWidth = 256;
$tilesheetHeight = $tilesheetSize[1];
$tilesheet = LoadPNG($tilesheetFilename);

//$tilesheetHeight = 16;
$mapHeight = 32;


//$im = $map;
//$rgb = imagecolorat($im, 0, 0);
//$colors = imagecolorsforindex($im, $rgb);
//var_dump($colors);

//print_r(getTile($map, 16, 10, 1));

//$testTile = getTile($map, 16, 0, 0);
//print_r( findMatchingTile($tilesheet, $tilesheetWidth, $tilesheetHeight, $globalTilesize, $testTile) );

// print out a hash table of all the tiles within tilesheet
//print_r(buildHashTableFromImage($tilesheet, $tilesheetWidth, $tilesheetHeight, $globalTilesize));

// print out an array with x, y, and hash of all tiles in map
//print_r(buildMapFromImage($map, $mapWidth, $mapHeight, $tilesheet, $tilesheetWidth, $tilesheetHeight, $globalTilesize));

//echo tilePosToInt(10, 1, 16);


// previously saved collisions will be needed to build map data
$collisions = getCollisionsFromFile($globalCollisionsFile); // read from file
$collisions = buildHashIndexCollisions($collisions); // use hashes as indexes

$testmap = buildMapFromImage($map, $mapWidth, $mapHeight, $tilesheet, $tilesheetWidth, $tilesheetHeight, $globalTilesize, $collisions);
mapToJSON("test", $testmap, $tilesheetWidth/$globalTilesize, $tilesheetFilename, $globalTilesize);

//print_r($testmap);




?>