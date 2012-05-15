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
// returns an array with the color of each
// pixel in the tile
{
    $tile = array();
    
    for($y=0; $y<$tilesize; $y++)
    {
        for($x=0; $x<$tilesize; $x++)
        {
            $rgb = imagecolorat($im, $x+$tx*$tilesize, $y+$ty*$tilesize);
            //$colors = imagecolorsforindex($im, $rgb);
            array_push($tile, $rgb);
        }
    }
    
    return $tile;
}

function findMatchingTile($tilesheet, $w, $h, $tilesize, $tile)
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
            if($currTile==$tile)
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

$testTile = getTile($map, 16, 0, 0);
print_r( findMatchingTile($tilesheet, $tilesheetWidth, $tilesheetHeight, $tileSize, $testTile) );








//$tilesheet =    LoadPNG('maps/oldale-town/tilesheet.png');

?>