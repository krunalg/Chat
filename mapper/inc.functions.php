<?php

/**
 * Loads an image to be further used in PHP.
 *
 * @param   $image Path to image file.
 * @return  an image resource identifier.
 */
function LoadPNG($image)
{
    $im = imagecreatefrompng($image); // Attempt to open
    if(!$im) // See if it failed
        die("Could not load image: " . $image);
    return $im;
}

/**
 * Analyzes a tile and outputs a unique MD5 hash to be used as an idendifier.
 *
 * @param   $image Image to read from.
 * @param   $tilesize Base tile size in pixels.
 * @param   $tileX X position of tile to read.
 * @param   $tileY Y position of tile to read.
 * @return  string containing an MD5 hash value.
 */
function getTile($image, $tilesize, $tileX, $tileY)
{
    $tileColors = "";
    for($y=0; $y<$tilesize; $y++)
    {
        for($x=0; $x<$tilesize; $x++)
        {
            $rgb = imagecolorat( $image,
                $x + $tileX * $tilesize,
                $y + $tileY * $tilesize );
            $tileColors = $tileColors . $rgb;
        }
    }
    return md5($tileColors);
}

/**
 * Finds a tile within a tilesheet that has a matching hash value
 * and returns an array containing the tiles x and y position (not pixels).
 *
 * @param   $tsImg The tilesheet image to read from.
 * @param   $tsWidth Width of tilesheet in pixels.
 * @param   $tsHeight Height of tilsheet in pixels.
 * @param   $tilesize Base tile size in pixels.
 * @param   $tileHash MD5 hash value to search for.
 * @return  one-dimensional array where index 0 holds x, 1 holds y.
 */
function findMatchingTile($tsImg, $tsWidth, $tsHeight, $tilesize, $tileHash)
// returns the x and y position of the
// matching tile within the tilesheet
{
    $position = array();
    $width = $tsWidth/$tilesize; // need map width-in-tiles for loop
    $height = $tsHeight/$tilesize; // and height
    for($y=0; $y<$height; $y++)
    {
        for($x=0; $x<$width; $x++)
        {
            $currTile = getTile($tsImg, $tilesize, $x, $y);
            if($currTile==$tileHash)
            {
                // found match!
                array_push($position, $x, $y);
                return $position;
            }
        }
    }
    // not found
    array_push($position, -1, -1);
    return $position;
}

/**
 * Finds all MD5 hash values for the tiles in a tilesheet.
 *
 * @param   $tsImg The tilesheet image to read from.
 * @param   $tsWidth Width of tilesheet in pixels.
 * @param   $tsHeight Height of tilsheet in pixels.
 * @param   $tilesize Base tile size in pixels.
 * @return  one-dimensional array containing the hashes for all tiles. 
 */
function buildHashTableFromImage($image, $imageWidth, $imageHeight, $tilesize)
{
    $result = array();
    $width = $imageWidth/$tilesize; // need map width-in-tiles for loop
    $height = $imageHeight/$tilesize; // and height
    for($y=0; $y<$height; $y++)
    {
        for($x=0; $x<$width; $x++)
        {
            $currTile = getTile($image, $tilesize, $x, $y);
            array_push($result, $currTile);
        }
    }
    return $result;
}

/**
 * Analyzes an image of a map and recreates it using tiles from a tilesheet.
 *
 * @param   $mapImg The map image to copy.
 * @param   $mapWidthPx Width of map in pixels.
 * @param   $mapHeightPx Height of map in pixels.
 * @param   $tsImg The tilesheet image to search for matching tiles.
 * @param   $tsWidthPx Width of tilesheet in pixels.
 * @param   $tsHeightPx Height of tilesheet in pixels.
 * @param   $tilesize Base tile size in pixels.
 * @param   $collisions Array of collision preferences for tiles (indexes are
 *          MD5 hashes representing the tile).
 * @return  two-dimentional array in the form $map[$x][$y][$n] where
 *          n==0 is tilesheet-tiles x, n==1 is y
 */
function buildMapFromImage( $mapImg, $mapWidthPx, $mapHeightPx, $tsImg,
                            $tsWidthPx, $tsHeightPx, $tilesize, $collisions )
{
    $mapWidth = $mapWidthPx/$tilesize; // need map width-in-tiles for loop
    $mapHeight = $mapHeightPx/$tilesize; // and height
    for($y=0; $y<$mapHeight; $y++)
    {
        for($x=0; $x<$mapWidth; $x++)
        {
            $currTile = getTile($mapImg, $tilesize, $x, $y);
            $tsPos = findMatchingTile( $tsImg, $tsWidthPx,
                                       $tsHeightPx, $tilesize, $currTile);
            $map[$x][$y] = $tsPos;
            
            // add collision data
            if(isset($collisions[$currTile]))
            {
                $collision = getWeltmeisterEquivalent($collisions[$currTile]);
                array_push($map[$x][$y], $collision);
            }
            else array_push($map[$x][$y], 0); // magic numbers are bad
        }
    }
    return $map;
}

/**
 * Translates local collision value into one that can be understood by
 * Weltmeister.
 *
 * @param   $collisionIn Input integer to be mapped to another value.
 * @return  integer representing a collision tile type in Weltmeister
 */
function getWeltmeisterEquivalent($collisionIn)
{
    switch($collisionIn)
    {
        case $GLOBALS['collisionNoWalk']:
            $collisionOut = $GLOBALS['collisionNoWalkWM'];
            break;
        case $GLOBALS['collisionLeft']:
            $collisionOut = $GLOBALS['collisionLeftWM'];
            break;
        case $GLOBALS['collisionRight']:
            $collisionOut = $GLOBALS['collisionRightWM'];
            break;
        case $GLOBALS['collisionUp']:
            $collisionOut = $GLOBALS['collisionUpWM'];
            break;
        case $GLOBALS['collisionDown']:
            $collisionOut = $GLOBALS['collisionDownWM'];
            break;
        default:
            $collisionOut = $GLOBALS['collisionWalkableWM'];
            break;
    }
    return $collisionOut;
}

/**
 * Echoes a Weltmeister map file as text on to the screen.
 *
 * @param   $mapName Name of the map, which is also used to generate a filename.
 * @param   $mapTiles 2D-array in the form $mapTiles[$x][$y][$n] where
 *          $n==0 is the tilesheet-tiles x, and $n==1 is the y.
 * @param   $tsWidthInTiles The width in tiles (not px) of the tilesheet.
 * @param   $tsFilename The path to the tilesheet file.
 * @param   $tilesize The size (in px) of each tile.
 * @return  null
 */
function mapToJSON($mapName, $mapTiles, $tsWidthInTiles, $tsFilename, $tilesize)
{
    $mapWidth = count($mapTiles);
    $mapHeight = count($mapTiles[0]);
    
    echo "ig.module( 'game.levels.".$mapName."' )\n";
    echo ".requires('impact.image')\n";
    echo ".defines(function(){\n";
    echo "Level".ucfirst($mapName)."=/*JSON[*/";
    
    // JSON HERE
    echo
    "{".
        "\"entities\": [],".
        "\"layer\": [ ".
            "{".
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
                        $tileInt = tilePosToInt($tileX, $tileY, $tsWidthInTiles) + 1; // +1 because WM starts at 1, not 0
                        echo $tileInt;
                        if($x!=$mapWidth-1) echo ", "; else echo " ";
                    }
                    if($y==$mapHeight-1) echo "] "; else echo "], ";
                } 
        
    echo        "] ".
            "},".
            "{".
                "\"name\": \"collision\", ".
                "\"width\": ".$mapWidth.", ".
                "\"height\": ".$mapHeight.", ".
                "\"linkWithCollision\": false, ".
                "\"visible\": 0, ".
                "\"tilesetName\": \"\", ".
                "\"repeat\": false, ".
                "\"preRender\": false, ".
                "\"distance\": \"1\", ".
                "\"tilesize\": ".$tilesize.", ".
                "\"foreground\": true, ".
                "\"data\": [ ";
                
                for($y=0; $y<$mapHeight; $y++)
                {
                    echo "[ ";
                    for($x=0; $x<$mapWidth; $x++)
                    {
                        echo $mapTiles[$x][$y][2];
                        if($x!=$mapWidth-1) echo ", "; else echo " ";
                    }
                    if($y==$mapHeight-1) echo "] "; else echo "], ";
                } 
        
    echo        "] ".
            "}";
    
    echo
        "] ".
    "} ";
    // END JSON
    
    echo "/*]JSON*/;\n";
    echo "Level".ucfirst($mapName)."Resources=[new ig.Image('media/".$tsFilename."')];\n";
    echo "});";
}

/**
 * Finds the absolute tile position, given its x and y positions.
 *
 * @param   $x Integer representing the tiles position on the x-axis.
 * @param   $y Integer representing the tiles position on the y-axis.
 * @param   $widthInTiles Integer representing the width (in tiles) before a
 *          new row of tiles begins.
 * @return  integer representing the tile's x/y equivalent.
 */
function tilePosToInt($x, $y, $widthInTiles)
{
    $result = 0;
    $result += $y * $widthInTiles;
    $result += $x;
    return $result;
}

/**
 * Finds the x, y position, given its absolute position.
 *
 * @param   $int Integer representing the absolute tile value.
 * @param   $widthInTiles Integer representing the width (in tiles) before a
 *          new row of tiles begins.
 * @return  array where index 0 holds x, and index 1 holds y.
 */
function tilePosToXY($int, $widthInTiles)
{
    $result = array();
    $y = floor($int/$widthInTiles);
    $x = $int - ($y*$widthInTiles);
    array_push($result, $x, $y);
    return $result;
}

/**
 * Scan all folders and sub-folders recursively for matching files.
 *
 * @param   $path String containing the path of which to scan.
 * @param   $name Not initially set; used for recursion.
 * @param   $filename File name to search for.
 * @return  array $result where $result[$n][0] is an MD5 hash
 *          and $result[$n][1] is an int.
 *
 * @author  Fazle Elahee (modified by Jonathan Commins)
 */
function scanFileNameRecursivly($path = '', $filename = '', &$name = array() )
{
    $path = $path == ''? dirname(__FILE__) : $path;
    $lists = @scandir($path);
    
    if(!empty($lists))
    {
        foreach($lists as $f)
        { 
            if(is_dir($path.DIRECTORY_SEPARATOR.$f) && $f != ".." && $f != ".")
                scanFileNameRecursivly($path.DIRECTORY_SEPARATOR.$f, $filename, $name); 
            else
                if($f!= ".." && $f != ".") // don't report these
                    if($f==$filename || $filename=='') // if found what we want
                        $name[] = $path.DIRECTORY_SEPARATOR.$f; // add to results
        }
    }
    return $name;
}

/**
 * Parse a single string of collision data into an array.
 *
 * @param   $collisions String of lines where each line contains an MD5 hash,
 *          a colon (:), and integer, and a new line (\n).
 * @return  array $result where $result[$n][0] is an MD5 hash
 *          and $result[$n][1] is an int.
 */
function prepCollisions($collisions)
{
    $result = trim($collisions);
    $result = explode("\n", $result);
    for($i=0; $i<count($result); $i++)
    {
        $result[$i] = trim($result[$i]);
        $result[$i] = explode(":", $result[$i]);
        for($j=0; $j<count($result[$i]); $j++)
            $result[$i][$j] = trim($result[$i][$j]);
    }
    if(count($result[0])!=2) return array(); // if no data, return empty array
    else return $result;
}

/**
 * Reads the collision data from a file and preps it for use.
 *
 * @param   $file Path of file to be read.
 * @return  array of collisions where $result[$n][0] is an MD5 hash
 *          and $result[$n][1] is an int.
 */
function getCollisionsFromFile($file)
{
    if(file_exists($file))
    {
        $contents = file_get_contents($file);
        $result = prepCollisions($contents);
        return $result;
    }
    else return array();
}

/**
 * Converts an array of collisions with numerical indexes to
 * an array of MD5 hash indexes.
 *
 * @param   $collisions Array of collisions where $collisions[$n][0] is
 *          an MD5 hash, and $collisions[$n][1] is an integer.
 * @return  array of collisions where the indexes are now MD5 hashes and the
 *          values are integers.
 */
function buildHashIndexCollisions($collisions)
{
    $result = array();
    for($i=0; $i<count($collisions); $i++)
        $result[ $collisions[$i][0] ] = $collisions[$i][1];
    if(count($result)!=0) return $result;
    else return array();
}

/**
 * For each item in an array, swaps the index with the value.
 *
 * @param   $array Array of values to be swapped with indexes.
 * @return  array
 */
function valToIndexAndIndexToVal($array)
{
    $result = array();
    foreach($array as $index => $value)
        $result[ $value ] = $index;
    if(count($result)!=0) return $result;
    else return array();
}

/**
 * Trims the last single pixel off the x-axis of an image, replacing
 * the original, but also generating a backup.
 *
 * @param   $filename Path to file to be trimmed.
 * @return  null
 */
function trim1px($filename)
{
    $size = getimagesize($filename);
    $oldWidth = $size[0];
    $oldHeight = $size[1];
    $newWidth = $oldWidth-1;
    $newHeight = $oldHeight;
    
    $img = LoadPNG($filename);
    $newimg = imagecreatetruecolor($newWidth, $newHeight);
    imagecopy($newimg, $img, 0, 0, 0, 0, $newWidth, $newHeight);
    
    if(rename($filename, $filename.".backup"))
    {
        // renamed file, now write new one
        if(!imagepng($newimg, $filename)) die("Could not write new image: $filename");
        else echo "Done!";
    }
    else die("Could not rename image: $filename");
}

/**
 * Removes the filename at the end of a path, resulting in file's directory.
 *
 * @param   $path Path to file.
 * @return  string containing a directory path.
 */
function removeFilenameFromPath($path)
{
    $pathParts = explode(DIRECTORY_SEPARATOR, $path);
    $reconstructedPath = '';
    
    // remove just the filename, leaving us with files directory
    for($j=0; $j < (count($pathParts) - 1) ; $j++)
        $reconstructedPath = $reconstructedPath . $pathParts[$j] . DIRECTORY_SEPARATOR;
    
    return $reconstructedPath;
}

// we can now use a hash to find where in the tilesheet any tile is
/**
 * Builds an array containing all positions of tiles within the a 
 * tilesheet, with hashes for indexes.
 *
 * @param   $json Path to tilesheet JSON file.
 * @return  array with MD5 hash indexes and integer values representing 
 *          the location of each tile within the tilesheet.
 */
function getTilesheetHashTable($json)
{
    $tilesheetJSON          = $json; 
    $tilesheetJSON          = file_get_contents($tilesheetJSON);
    $tilesheetJSON          = json_decode($tilesheetJSON);
    $masterTilesheetByHash  = array();
    foreach($tilesheetJSON as $key => $hash)
        $masterTilesheetByHash[$hash] = $key; // key is tile position in tilesheet
    return $masterTilesheetByHash;
}

?>