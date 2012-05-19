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
            echo $maps[$i].' <b style="color: red">requires processing</b>...';
            echo '<input type="button" '.
                         'value="Process" '.
                         'onClick="post_to_url( \'\', '. // post to same file ''
                            '{ '.
                                '\'mapPath\': \''.$maps[$i].'\' '.
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
        
    }
    
    // if it exists, make sure it has not been processed, aborting if it has
    
    // if map has not been processed, load tilesheet, aborting if it fails
    
    // if tilesheet load ok, load map also
    
    // if map loads ok, begin
}




?>