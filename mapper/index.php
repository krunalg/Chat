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
    $tilecolors = '';
    for($y=0; $y<$tilesize; $y++)
    {
        for($x=0; $x<$tilesize; $x++)
        {
            $rgb = imagecolorat($im, $x+$tx*$tilesize, $y+$ty*$tilesize);
            $tilecolors += $rgb;
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
/*
function buildMapFromImage($mapImg, $mapWidthPx, $mapHeightPx, $tsImg, $tsWidthPx, $tsHeightPx, $tilesize)
// returns a 2D array of the map with
// corresponding tiles from tilesheet
{
    $map = array(array());
    print_r($map);
    
    // divide map into tiles
    $mapWidth = $mapWidthPx/$tilesize;
    $mapHeight = $mapHeightPx/$tilesize;
    
    for($y=0; $y<$mapHeight; $y++)
    {
        for($x=0; $x<$mapWidth; $x++)
        {
            $currTile = getTile($tsImg, $tilesize, $x, $y);
            $tsPos = findMatchingTile($tsImg, $tsWidthPx, $tsHeightPx, $tilesize, $currTile);
            array_push($map[$x][$y], 'hi');
        }
    }
    
    return $map;
}*/


$tileSize = 16;

$mapFile = 'maps/oldale-town/map.png';
$mapSize = getimagesize($mapFile);
$mapWidth = $mapSize[0];
$mapHeight = $mapSize[1];
$map = LoadPNG($mapFile);

$tilesheetFile = 'maps/oldale-town/tilesheet.png';
$tilesheetSize = getimagesize($tilesheetFile);
$tilesheetWidth = $tilesheetSize[0];
if($tilesheetWidth==257) $tilesheetWidth = 256;
$tilesheetHeight = $tilesheetSize[1];
$tilesheet = LoadPNG($tilesheetFile);

//$tilesheetHeight = 16;


//$im = $map;
//$rgb = imagecolorat($im, 0, 0);
//$colors = imagecolorsforindex($im, $rgb);
//var_dump($colors);

//print_r(getTile($map, 16, 0,0));

//$testTile = getTile($map, 16, 0, 0);
//print_r( findMatchingTile($tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize, $testTile) );

//print_r(buildMapFromImage($map, $mapWidth, $mapHeight, $tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize));

// print out a hash table of all the tiles within tilesheet
print_r(buildTilesheetHashTable($tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize));





//$tilesheet =    LoadPNG('maps/oldale-town/tilesheet.png');

?>