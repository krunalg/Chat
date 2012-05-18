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
                        //echo $mapTiles[$x][$y][3];
                        echo 0;
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
// takes an x and y value and returns
// a single int equivalency
{
    $result = 0;
    $result += $y * $widthInTiles;
    $result += $x;
    return $result;
}


/**
 * Scan all files recursively in the sub-folder and folder for tilesheets.
 *
 * @param   $path String containing the path of which to scan.
 * @param   $name Not initially set; used for recursion.
 * @return  array $result where $result[$n][0] is an MD5 hash
 *          and $result[$n][1] is an int.
 
 * @author  Fazle Elahee (modified by Jonathan Commins)
 *          Originally called scanFileNameRecursivly
 */
function findTilesheets($path = '', $filename, &$name = array() )
{
  $path = $path == ''? dirname(__FILE__) : $path;
  $lists = @scandir($path);
  
  if(!empty($lists))
  {
      foreach($lists as $f)
      { 
    
      if(is_dir($path.DIRECTORY_SEPARATOR.$f) && $f != ".." && $f != ".")
      {
          findTilesheets($path.DIRECTORY_SEPARATOR.$f, $filename, &$name); 
      }
      else
      {
          if($f==$filename) $name[] = $path.DIRECTORY_SEPARATOR.$f;
      }
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
        $result[$i][0] = trim($result[$i][0]);
        $result[$i][1] = trim($result[$i][1]);
    }
    return $result;
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
    $contents = file_get_contents($file);
    $result = prepCollisions($contents);
    return $result;
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
    for($i=0; $i<count($collisions); $i++)
        $result[ $collisions[$i][0] ] = $collisions[$i][1];
    return $result;
}

?>