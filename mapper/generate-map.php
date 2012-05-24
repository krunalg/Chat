<?php

set_time_limit(300); // 5 minutes
ini_set('memory_limit','512M'); 


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['generate']) )
{
    /*
     * First Page: List all maps which have JSON files
     *
     */
    
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
    
    echo "\n\n";
    
    for($i=0; $i<count($maps); $i++)
    {
        $postSafeMapPath = str_replace('\\', "\\\\", $maps[$i]); // needed to not lose slashes on next page
        echo $maps[$i].' ';
        echo '<input type="button" '.
                     'value="Generate map" '.
                     'onClick="post_to_url( \'\', '. // post to same file ''
                        '{ '.
                            '\'generate\': \''.$postSafeMapPath.'\' '.
                        '} );"/> ';
        echo "<br>\n\n";
    }
    
    if(count($maps)>=1) { // only offer to process if some need processing
        echo '<br><input type="button" '.
            'value="Generate all" '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'generate\': \'all\' '.
               '} );"/> ';
    }
}
else if( isset($_POST['generate']) )
{
    /*
     * Second Page: Generate map(s) from JSON files using master tilesheet
     *
     */
    
    $jsonMapPaths = array();
    
    // do them all if process=='all'
    if(isset($_POST['generate']) && $_POST['generate']=='all')
        $jsonMapPaths = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
    // just do one map if one is specified
    else if(isset($_POST['generate'])) array_push($jsonMapPaths, $_POST['generate']);
    // otherwise leave array empty
    
    echo 'Will now generate ' . count($jsonMapPaths) . ' maps...<br><br>'."\n\n";
    
    // get details about the master tilesheet
    if(count($jsonMapPaths)>=1)
    {
        $tilesheetJSON = $globalMasterTilesheetJSON;
        $tilesheetJSON = file_get_contents($tilesheetJSON);
        $tilesheetJSON = json_decode($tilesheetJSON);
        $masterTilesheetByHash = array();
        foreach($tilesheetJSON as $key => $hash)
        {
            // key is position in tilesheet where tile can be found
            $masterTilesheetByHash[$hash] = $key;
        }
    } // we can now use a hash to find where in the tilesheet any tile is
    
    // get collision details about all tiles
    $collisions = getCollisionsFromFile($globalCollisionsFile); // read from file
    $collisions = buildHashIndexCollisions($collisions); // use hashes as indexes
    
    for($i=0; $i<count($jsonMapPaths); $i++)
    {
        if(file_exists($jsonMapPaths[$i]))
        {
            // build array of important collision types
            // for special cases such as tiles which need to be above player
            $collisionIndex = 0;
            $indexOfCollision = array(); // holds special cases
            foreach($globalCollisions as $index => $collision)
            {
                if($index=='above')
                    $indexOfCollision[$index] = $collisionIndex;
                $collisionIndex++;
            }
            
            // we need to know all the tiles which will be placed
            // above the player so that we can add the upper layer
            $abovePlayerTiles = array();
            foreach($collisions as $hash => $collision)
                if($collision == $indexOfCollision['above'])
                    $abovePlayerTiles[$hash] = md5($hash);            
            
            // map specific data
            $mapName = dirname($jsonMapPaths[$i]);
                $mapName = 'test';
            $mapJSON = $jsonMapPaths[$i];
            $mapJSON = file_get_contents($mapJSON);
            $mapJSON = json_decode($mapJSON);
            $mapTiles = array(); // a bunch of hashes
            foreach($mapJSON as $key => $value)
            {
                if($key=='width') $mapWidth = $value;
                else if($key=='height') $mapHeight = $value;
                else if($key=='tiles' && is_array($value))
                {
                    for($tileIndex=0; $tileIndex<count($value); $tileIndex++)
                        array_push($mapTiles, $value[$tileIndex]);
                }
            }
            
         
         
         
         
            /*
             * Building Weltmeister compatible level 
             *
             */
            
            $export = ''; // file contents of map file readable by weltmeister
            $export .= "ig.module( 'game.levels.".$mapName."' )\n".
                      ".requires('impact.image')\n".
                      ".defines(function(){\n".
                      "Level".ucfirst($mapName)."=/*JSON[*/";
            
            // JSON HERE
            $export .=
            "{".
                "\"entities\": [],".
                "\"layer\": [ ".
                    "{".
                        "\"name\": \"lower\", ".
                        "\"width\": ".$mapWidth.", ".
                        "\"height\": ".$mapHeight.", ".
                        "\"linkWithCollision\": false, ".
                        "\"visible\": 1, ".
                        "\"tilesetName\": \"media/".$globalMasterTilesheetFile."\", ".
                        "\"repeat\": false, ".
                        "\"preRender\": false, ".
                        "\"distance\": \"1\", ".
                        "\"tilesize\": ".$globalTilesize.", ".
                        "\"foreground\": false, ".
                        "\"data\": [ ";
                        
                        $mapTilesIndex = 0; // used to traverse all tiles in map
                        for($y=0; $y<$mapHeight; $y++)
                        {
                            $export .= "[ ";
                            for($x=0; $x<$mapWidth; $x++)
                            {
                                $currTileHash = $mapTiles[$mapTilesIndex];
                                
                                // use no tile (which is 0 in weltmeister)
                                // when tile can't be found in tilesheet
                                if(!isset($masterTilesheetByHash[$currTileHash]))
                                    $currTilePosInTilesheet = 0;
                                else
                                {
                                    $currTilePosInTilesheet =
                                        $masterTilesheetByHash[$currTileHash];
                                        $currTilePosInTilesheet++; // weltmeister starts at 1, not 0
                                }
                                
                                $export .= $currTilePosInTilesheet;
                                if($x!=$mapWidth-1) $export .= ", "; else $export .= " ";
                                $mapTilesIndex++; // next tile in the map
                            }
                            if($y==$mapHeight-1) $export .= "] "; else $export .= "], ";
                        } 
                
            $export .=  "] ". // close off data
                    "},".
                    "{".
                        "\"name\": \"upper\", ".
                        "\"width\": ".$mapWidth.", ".
                        "\"height\": ".$mapHeight.", ".
                        "\"linkWithCollision\": false, ".
                        "\"visible\": 1, ".
                        "\"tilesetName\": \"media/".$globalMasterTilesheetFile."\", ".
                        "\"repeat\": false, ".
                        "\"preRender\": true, ".
                        "\"distance\": \"1\", ".
                        "\"tilesize\": ".$globalTilesize.", ".
                        "\"foreground\": true, ".
                        "\"data\": [ ";
                        
                        $mapTilesIndex = 0; // used to traverse all tiles in map
                        for($y=0; $y<$mapHeight; $y++)
                        {
                            $export .= "[ ";
                            for($x=0; $x<$mapWidth; $x++)
                            {
                                $currTileHash = $mapTiles[$mapTilesIndex];
                                
                                // use no tile (which is 0 in weltmeister)
                                // when no found in "above" player tiles array
                                if(!isset($abovePlayerTiles[$currTileHash]))
                                    $currTilePosInTilesheet = 0;
                                else
                                {
                                    $currTilePosInTilesheet =
                                        $masterTilesheetByHash[md5($currTileHash)];
                                        $currTilePosInTilesheet++; // weltmeister starts at 1, not 0
                                }
                                
                                $export .= $currTilePosInTilesheet;
                                if($x!=$mapWidth-1) $export .= ", "; else $export .= " ";
                                $mapTilesIndex++; // next tile in the map
                            }
                            if($y==$mapHeight-1) $export .= "] "; else $export .= "], ";
                        } 
                
            $export .=  "] ".
                    "}, ".
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
                        "\"tilesize\": ".$globalTilesize.", ".
                        "\"foreground\": true, ".
                        "\"data\": [ ";
                        
                        $mapTilesIndex = 0; // used to traverse all tiles in map
                        for($y=0; $y<$mapHeight; $y++)
                        {
                            $export .= "[ ";
                            for($x=0; $x<$mapWidth; $x++)
                            {
                                if(isset($currTileCollision)) unset($currTileCollision);
                                if(isset($collisions[$mapTiles[$mapTilesIndex]]))
                                {
                                    $currTileCollision = // set preference
                                        $collisions[$mapTiles[$mapTilesIndex]];
                                }
                                
                                $currTileCollisionWM =
                                    $globalCollisions['walkable']['collision']; // default
                                    
                                // if there's a collision preference, find out
                                // what it in in terms of weltmeister
                                if(isset($currTileCollision)) 
                                {
                                    $collisionIndex = 0; // position in master collisions array
                                    foreach($globalCollisions as $collision)
                                    {
                                        if($collisionIndex==$currTileCollision)
                                        {
                                            $currTileCollisionWM = $collision['collision'];
                                            break;
                                        }
                                        $collisionIndex++;
                                    }
                                }
                                
                                $export .= $currTileCollisionWM;
                                if($x!=$mapWidth-1) $export .= ", "; else $export .= " ";
                                
                                $mapTilesIndex++; // next tile in the map
                            }
                            if($y==$mapHeight-1) $export .= "] "; else $export .= "], ";
                        } 
                
            $export .=        "] ".
                    "}";
            
            $export .=
                "] ".
            "} ";
            // END JSON
            
            $export .= "/*]JSON*/;\n";
            $export .= "Level".ucfirst($mapName)."Resources=[new ig.Image('media/".$globalMasterTilesheetFile."')];\n";
            $export .= "});";

            
            
            
            
            
            // attempt to write weltmeister map
            $putDir = dirname($jsonMapPaths[$i]);
            $putFile = $mapName.".js";
            $putPath = $putDir.DIRECTORY_SEPARATOR.$putFile;
            if(!file_put_contents($putPath, $export))
                die("Failed writing file: " . $putPath);
            else
                echo "Success writing file: " . $putPath;
        }
        else die( "" . $jsonMapPaths[$i] . " does not exist.");
        echo "<br>\n"; // new line between each attempt
    }
}




?>