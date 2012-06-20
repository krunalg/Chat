<?php

set_time_limit(900); // because processing maps can take a while
ini_set('memory_limit','1024M'); // 512M was not enough


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['mapPath']) && !isset($_POST['process']) )
{
    /*
     * First Page: Display status of maps, whether they are processed or not
     *
     */
    
    $processingNeeded = false; // only offer to process if its possible
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    echo "\n\n";
    
    // check if the map has been processed yet or not
    for($i=0; $i<count($maps); $i++)
    {
        $reconstructedPath = removeFilenameFromPath($maps[$i]);
        $mapName = basename($reconstructedPath);
        $jsonDir = $processedMapDir . DIRECTORY_SEPARATOR . $mapName;
        $jsonPath = $jsonDir . DIRECTORY_SEPARATOR . $globalMapJSON; 

        // if a JSON file is present, the map has been processed
        if(file_exists($jsonPath)) {

            echo $maps[$i]." has been processed... <br>\n\n";
        }
            
        else {
            
            $processingNeeded = true; // only needed once to activate
            $postSafeMapPath = str_replace('\\', "\\\\", $maps[$i]); // needed to not lose slashes on next page
            echo $maps[$i].' <b style="color: red">requires processing</b>...';
            echo '<input type="button" '.
                         'value="Process" '.
                         'onClick="post_to_url( \'\', '. // post to same file ''
                            '{ '.
                                '\'mapPath\': \''.$postSafeMapPath.'\' '.
                            '} );"/> ';
            echo "<br>\n\n";
        }
    }
    
    if($processingNeeded) { // only offer to process if some need processing
        echo '<input type="button" '.
            'value="Process All" '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'process\': \'all\' '.
               '} );"/> ';
    }
}
else if( isset($_POST['mapPath']) || isset($_POST['process']) )
{
    /*
     * Second Page: Process an unprocessed map
     *
     */
    
    $mapPaths = array();
    
    // Only process one map.
    if(isset($_POST['mapPath'])) {

        array_push($mapPaths, $_POST['mapPath']);
    }
    
    // Process all maps.
    else if(isset($_POST['process']) && $_POST['process']=='all') {

        $mapPaths = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    }
        
    echo 'Will now process ' . count($mapPaths) . ' maps...<br><br>'."\n\n";
    
    for($i=0; $i<count($mapPaths); $i++)
    {
        // check that map exists
        if(file_exists($mapPaths[$i]))
        {
            $reconstructedPath = removeFilenameFromPath($mapPaths[$i]);
            $mapName = basename($reconstructedPath);
            $jsonDir = $processedMapDir . DIRECTORY_SEPARATOR . $mapName;
            $jsonPath = $jsonDir . DIRECTORY_SEPARATOR . $globalMapJSON; 
            
            // if a JSON file is present, the map has been processed
            if(!file_exists($jsonPath))
            {
                // load map
                $mapSize = getimagesize($mapPaths[$i]);
                $mapWidth = $mapSize[0];
                $mapHeight = $mapSize[1];
                $map = LoadPNG($mapPaths[$i]);
                
                // build array of hashes from tiles
                $hashes = buildHashTableFromImage($map, $mapWidth, $mapHeight, $globalTilesize);
                
                // build JSON
                $mapWidthInTiles = $mapWidth/$globalTilesize;
                $mapHeightInTiles = $mapHeight/$globalTilesize;
                $beforeJSON = array (
                                'width' => $mapWidthInTiles,
                                'height' => $mapHeightInTiles,
                                'tiles' => $hashes
                              );
                $afterJSON = json_encode($beforeJSON);
                
                // Make sure directories exist before writing.
                if(!is_dir($buildDir)) mkdir($buildDir);
                if(!is_dir($processedMapDir)) mkdir($processedMapDir);
                if(!is_dir($jsonDir)) mkdir($jsonDir);

                // write to file
                if(!file_put_contents($jsonPath, $afterJSON))
                    die( '<b style="color:red">Failed writing file: ' . $jsonPath);
                else
                    echo "<b>Success</b> writing file: " . $jsonPath;
            }
            
            // JSON file exists
            else echo "" . $mapPaths[$i] . " has already been processed. " .
                      "Skipping...";    
        }
        else die( "" . $mapPaths[$i] . " does not exist.");
        echo "<br>\n"; // new line between each process attempt
    }
}


?>