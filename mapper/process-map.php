<?php

set_time_limit(300); // because processing maps can take a while
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('required.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if(!isset($_POST['mapPath']))
{
    /*
     * First Page: Display status of maps, whether they are processed or not
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    // check if the map has been processed yet or not
    for($i=0; $i<count($maps); $i++)
    {
        $reconstructedPath = removeFilenameFromPath($maps[$i]);
        
        // if a JSON file is present, the map has been processed
        if(file_exists($reconstructedPath . $globalMapJSON))
            echo $maps[$i]." has been processed... <br>\n";
        else
        {
            $postSafeMapPath = str_replace('\\', "\\\\", $maps[$i]); // needed to not lose slashes on next page
            echo $maps[$i].' <b style="color: red">requires processing</b>...';
            echo '<input type="button" '.
                         'value="Process" '.
                         'onClick="post_to_url( \'\', '. // post to same file ''
                            '{ '.
                                '\'mapPath\': \''.$postSafeMapPath.'\' '.
                            '} );"/> ';
            echo "<br>\n";
        }
    }
    
}
else
{
    /*
     * Second Page: Process an unprocessed map
     *
     */
    
    $mapPath = $_POST['mapPath'];
    
    // check that map exists
    if(file_exists($mapPath))
    {
        $reconstructedPath = removeFilenameFromPath($mapPath);
        // if a JSON file is present, the map has been processed
        if(!file_exists($reconstructedPath . $globalMapJSON))
        {
            // load map
            $mapSize = getimagesize($mapPath);
            $mapWidth = $mapSize[0];
            $mapHeight = $mapSize[1];
            $map = LoadPNG($mapPath);
            
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
            //echo $afterJSON;
            $afterAfterJSON = json_decode($afterJSON);
            print_r($afterAfterJSON);
        }
        // JSON file exists
        else die( "" . $mapPath . " has already been processed." .
                  "<br>\nYou must first delete it to do this."   );

    }
    else die( "" . $mapPath . " does not exist.");
}




?>