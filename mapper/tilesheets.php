<?php

include('inc.globals.php');
require('required.php');





function trim1px($file)
/*
 * This function trims 1px from the width of the file supplied in param
 * 
 */
{
    $size = getimagesize($file);
    $oldWidth = $size[0];
    $oldHeight = $size[1];
    $newWidth = $oldWidth-1;
    $newHeight = $oldHeight;
    
    $img = LoadPNG($file);
    $newimg = imagecreatetruecolor($newWidth, $newHeight);
    imagecopy($newimg, $img, 0, 0, 0, 0, $newWidth, $newHeight);
    
    if(rename($file, $file.".backup"))
    {
        // renamed file, now write new one
        if(!imagepng($newimg, $file)) die("Could not write new image: $file");
    }
    else die("Could not rename image: $file");
}



/*
 * create an array containing path of every tilesheet
 *
 */ 
$tilesheets = findTilesheets($globalMapDir);
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