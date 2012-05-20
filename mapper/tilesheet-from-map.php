<?php 
function getTime() 
    { 
    $a = explode (' ',microtime()); 
    return(double) $a[0] + $a[1]; 
    } 
$Start = getTime(); 
?>


<?php

set_time_limit(300); // because processing maps can take a while
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['map']) )
{
    /*
     * First Page: Display maps which have been processed only
     *
     */
    
    // get a list of all maps which have been processed
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
    for($i=0; $i<count($maps); $i++)
    {
        $postSafePath = // needed to not lose slashes on next page
            str_replace('\\', "\\\\", $maps[$i]);
            
        echo $maps[$i].' found... ';
        echo '<input type="button" '.
             'value="Create tilesheet" '.
             'onClick="post_to_url( \'\', '. // post to same file ''
                '{ '.
                   '\'map\': \''.$postSafePath.'\' '.
             '} );"/> ';
        echo "<br>\n\n";
    }
    
    if(count($maps)>=1) // only offer to compile list if there are maps to read
    {
        echo '<br><input type="button" '.
            'value="Create tilesheets for all of the above" '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'map\': \'all\' '.
               '} );"/> ';
    }
}
else if(isset($_POST['map']))
{
    /*
     * Second Page: Create single or all mini-tilesheets from map JSON's
     *
     */
    
    $maps = array();
    
    // dump them all if map=='all'
    if(isset($_POST['map']) && $_POST['map']=='all')
        $maps = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
    // or just do one map if one is specified
    else if(isset($_POST['map']))
        array_push($maps, $_POST['map']);
    
    // load master tilesheet to copy tiles from
    $master = LoadPNG($globalMasterTilesheetFile);
    $masterSize = getimagesize($globalMasterTilesheetFile);
    $masterWidth = $masterSize[0];
    $masterHeight = $masterSize[1];
    // load master JSON containing hashes
    $masterJSON = file_get_contents($globalMasterTilesheetJSON);
    $masterJSON = json_decode($masterJSON);
    // convert object into hash-indexed array
    $masterTiles = array();
    foreach($masterJSON as $key => $tile)
    {
        // using hash for the index
        // and old int index as new value
        $masterTiles[$tile] = $key; 
    }
    
    // for each map JSON
    for($i=0; $i<count($maps); $i++)
    {
        // open json file
        if(file_exists($maps[$i]))
        {
            $mapJSON = file_get_contents($maps[$i]);
            if(!$mapJSON) die("Problem with ".$maps[$i]);
            
            $mapJSON = json_decode($mapJSON); // convert JSON into PHP
            
            // read through all tiles, adding them to an array
            foreach($mapJSON as $couldBeTiles) // traverse the stdClass Object
            {
                if(is_array($couldBeTiles)) // found tiles within map JSON!
                {
                    for($j=0; $j<count($couldBeTiles); $j++)
                    {
                        // using hash for index so there are no duplicates
                        $tileIsUsed[ $couldBeTiles[$j] ] = true;
                        echo $maps[$i] . " contains ".count($couldBeTiles)." tiles... ";
                    }
                }
                    
                // prepare array for writing tilesheet
                $tilesToWrite = array(); // stores unique tiles
                if(count($tileIsUsed)>=1) // array of used-tiles is populated
                {
                    // fetch hashes from index
                    foreach($tileIsUsed as $key => $value)
                        array_push($tilesToWrite, $key); // key is the tile's hash
                    
                    // get new tilesheet dimensions
                    $tilesheetWidthInTiles =
                        $globalMasterTilesheetWidth / $globalTilesize;
                    $tilesheetHeightInTiles =
                        ceil(count($tilesToWrite) / $tilesheetWidthInTiles);
                    
                    $newimg = // create empty tilesheet image
                        imagecreatetruecolor(
                            $tilesheetWidthInTiles * $globalTilesize,
                            $tilesheetHeightInTiles * $globalTilesize );
                        
                    
                    // copy all unique tiles into a new tilesheet image
                    $nextTile = 0; // used to traverse index of tiles array
                    for($y=0; $y<$tilesheetHeightInTiles; $y++)
                    {
                        for($x=0; $x<$tilesheetWidthInTiles; $x++)
                        {
                            // get current tiles pos in master tilesheet
                            $currTileHash = $tilesToWrite[$nextTile];
                            $currTilePosInMaster = $masterTiles[$currTileHash];
                            $currTilePosXYInMaster = 
                                tilePosToXY( $currTilePosInMaster,
                                             $masterWidth/$globalTilesize);
                            
                            // attempt to copy tile into new tilesheet
                            if(!imagecopy( 
                                $newimg, // destination image
                                $master, // source image
                                $x*$globalTilesize, // x destination
                                $y*$globalTilesize, // and y
                                // x, y source
                                $currTilePosXYInMaster[0] * $globalTilesize,
                                $currTilePosXYInMaster[1] * $globalTilesize,
                                $globalTilesize, // copy width
                                $globalTilesize // copy height
                            )) die( "".$tilesToWrite[$nextTile].' <b>failed</b>. '.
                                    'Could not copy tile.'  );
                            
                            // break cycle if just wrote last tile
                            if($nextTile==count($tilesToWrite)-1) break;
                            $nextTile++; // otherwise select next in array
                        }
                    }
                    
                    // attempt to write new tilesheet to disk
                    $writeTilesheetWhere =
                        dirname($maps[$i]) . DIRECTORY_SEPARATOR .
                            $globalTilesheetFile;
                    if(!file_exists($writeTilesheetWhere)) // make sure not overwriting file
                    {
                        if(!imagepng($newimg, $writeTilesheetWhere))
                                die( '<b style="color:red">Failed</b> writing file: '.
                                     $writeTilesheetWhere );
                        else
                            echo "<b>Success</b> writing file: " .
                                 $writeTilesheetWhere."<br>\n";
                    }
                    else
                        echo $writeTilesheetWhere . " already exists. ".
                             '<b style="color:red">Skipping</b>...'."<br>\n";
                            
                    
                }
                else die("Array of tiles in ".$maps[$i]." is empty.");     
            }
        }
        else die("".$maps[$i]." does not exist."); // map JSON file doesn't exist
    }
}




?>



<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
