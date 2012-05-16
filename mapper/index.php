<?php

require('required.php');

set_time_limit(300);

$tileSize = 16;

$mapFilename = 'maps/oldale-town/map.png';
$mapSize = getimagesize($mapFilename);
$mapWidth = $mapSize[0];
$mapHeight = $mapSize[1];
$map = LoadPNG($mapFilename);

$tilesheetFilename = 'maps/oldale-town/tilesheet.png';
$tilesheetSize = getimagesize($tilesheetFilename);
$tilesheetWidth = $tilesheetSize[0];
if($tilesheetWidth==257) $tilesheetWidth = 256;
$tilesheetHeight = $tilesheetSize[1];
$tilesheet = LoadPNG($tilesheetFilename);

//$tilesheetHeight = 16;
//$mapHeight = 32;


//$im = $map;
//$rgb = imagecolorat($im, 0, 0);
//$colors = imagecolorsforindex($im, $rgb);
//var_dump($colors);

//print_r(getTile($map, 16, 10, 1));

//$testTile = getTile($map, 16, 0, 0);
//print_r( findMatchingTile($tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize, $testTile) );

// print out a hash table of all the tiles within tilesheet
//print_r(buildTilesheetHashTable($tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize));

// print out an array with x, y, and hash of all tiles in map
//print_r(buildMapFromImage($map, $mapWidth, $mapHeight, $tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize));

//echo tilePosToInt(10, 1, 16);



$testmap = buildMapFromImage($map, $mapWidth, $mapHeight, $tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize);
mapToJSON("test", $testmap, $tilesheetWidth/$tileSize, $tilesheetFilename, $tileSize);

//print_r($testmap);




?>