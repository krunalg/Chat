<?php
function LoadPNG($imgname)
{
    /* Attempt to open */
    $im = @imagecreatefrompng($imgname);

    /* See if it failed */
    if(!$im)
    {
        die("Could not load image: " . $imgname);
    }

    return $im;
}


function getTile($im, $tilesize, $tx, $ty)
// returns md5 hash of a tile
{
    $tilecolors = "";
    for($y=0; $y<$tilesize; $y++)
    {
        for($x=0; $x<$tilesize; $x++)
        {
            $rgb = imagecolorat($im, $x+$tx*$tilesize, $y+$ty*$tilesize);
            $tilecolors = $tilecolors . $rgb;
        }
    }
    return md5($tilecolors);
}

function findMatchingTile($tilesheet, $w, $h, $tilesize, $tileHash)
// returns the x and y position of the
// matching tile within the tilesheet
{
    $pos = array();
    
    // divide tilesheet into tiles
    $width = $w/$tilesize;
    $height = $h/$tilesize;
    
    // iterate over tilesheet
    for($y=0; $y<$height; $y++)
    {
        for($x=0; $x<$width; $x++)
        {
            $currTile = getTile($tilesheet, $tilesize, $x, $y);
            if($currTile==$tileHash)
            {
                // found match!
                array_push($pos, $x, $y);
                return $pos;
            }
        }
    }
    
    // not found
    array_push($pos, -1, -1);
    return $pos;
}

function buildTilesheetHashTable($tsImg, $tsWidth, $tsHeight, $tilesize)
// returns an array with all the hashes
// that make up its tiles
{
    $res = array();
    
    // divide tilesheet into tiles
    $width = $tsWidth/$tilesize;
    $height = $tsHeight/$tilesize;
    
    // iterate over tilesheet
    for($y=0; $y<$height; $y++)
    {
        for($x=0; $x<$width; $x++)
        {
            $currTile = getTile($tsImg, $tilesize, $x, $y);
            array_push($res, $currTile);
        }
    }
    
    return $res;
}

function buildMapFromImage($mapImg, $mapWidthPx, $mapHeightPx, $tsImg, $tsWidthPx, $tsHeightPx, $tilesize)
// returns a 2D array of the map with
// corresponding tiles from tilesheet
{
    //$map = array();
    
    // divide map into tiles
    $mapWidth = $mapWidthPx/$tilesize;
    $mapHeight = $mapHeightPx/$tilesize;
    
    for($y=0; $y<$mapHeight; $y++)
    {
        for($x=0; $x<$mapWidth; $x++)
        {
            $currTile = getTile($mapImg, $tilesize, $x, $y);
            $tsPos = findMatchingTile($tsImg, $tsWidthPx, $tsHeightPx, $tilesize, $currTile);
            //array_push($map, 'hi');
            $map[$x][$y] = $tsPos;
        }
    }
    
    return $map;
}

function mapToJSON($mapName, $mapTiles, $tsWidthInTiles, $tsFilename, $tilesize)
{
    $mapWidth = count($mapTiles);
    $mapHeight = count($mapTiles[0]);
    
    echo "ig.module( 'game.levels.town' )\n";
    echo ".requires('impact.image')\n";
    echo ".defines(function(){\n";
    echo "Level".ucfirst($mapName)."=/*JSON[*/";
    // JSON HERE
    echo "{" .
         "\"entities\": []," .
         "\"layer\": [ {" .
            "\"name\": \"below\", ".
            "\"width\": ".$mapWidth.", ".
            "\"height\": ".$mapHeight.", ".
            "\"linkWithCollision\": false, ".
            "\"visible\": 1, ".
            "\"tilesetName\": \"media/".$tsFilename."\", ".
            "\"repeat\": false, ".
            "\"preRender\": false, ".
            "\"distance\": \"1\", ".
            "\"tilesize\": ".$tilesize.", ".
            "\"foreground\": false, ".
            "\"data\": [ ";
    
    for($y=0; $y<$mapHeight; $y++)
    {
        echo "[ ";
        for($x=0; $x<$mapWidth; $x++)
        {
            $tileX = $mapTiles[$x][$y][0];
            $tileY = $mapTiles[$x][$y][1];
            $tileInt = tilePosToInt($tileX, $tileY, $tsWidthInTiles);
            echo $tileInt;
            if($x!=$mapWidth-1) echo ", "; else echo " ";
        }
        if($y==$mapHeight-1) echo "] "; else echo "], ";
    }
    
    echo "] } ] }";
    
    echo "/*]JSON*/;\n";
    echo "Level".ucfirst($mapName)."Resources=[new ig.Image('media/".$tsFilename."')];\n";
    echo "});";
}

function tilePosToInt($x, $y, $widthInTiles)
// takes an x and y value and returns
// a single int equivalency
{
    $res = 0;
    $res += $y*$widthInTiles;
    $res += $x;
    return $res + 1;
}

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