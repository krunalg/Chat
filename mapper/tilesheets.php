<?php

include('inc.globals.php');
require('required.php');


/*
 * create an array containing path of every tilesheet
 *
 */ 
$tilesheets = findTilesheets($globalMapDir, $globalTilesheetFile);
echo "<pre>"; var_dump($tilesheets); echo "</pre>";



/*
 * for each tilesheet, trim 1px if nessesary
 *
 */ 
/*for($i=0; $i<count($tilesheets); $i++)
{
    $size  = getimagesize($tilesheets[$i]);
    $width = $size[0];
    if( ($width - 1) % $globalTilesize == 0) // if subtracting 1px is helpful
    {
        echo "Needs trimming.<br>";
        trim1px($tilesheets[$i]);
    }
    else
        echo "No trimming needed.<br>";
}*/



/*
 * generates hash values for each tilesheet
 *
 */ 
/*for($i=0; $i<count($tilesheets); $i++)
{
    $size   = getimagesize($tilesheets[$i]);
    $width  = $size[0];
    $height = $size[1];
    $hashes = "";
    for($y=0; $y<$height/$globalTilesize; $y++)
    {
        for($x=0; $x<$width/$globalTilesize; $x++)
        {
            $img    = LoadPNG($tilesheets[$i]);
            $hashes = $hashes . getTile($img, $globalTilesize, $x, $y);
        }
    }
    echo "Hash for $tilesheets[$i] is: " . md5($hashes) ."<br>\n";
}*/












?>