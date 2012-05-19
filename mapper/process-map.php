<?php

ini_set('memory_limit','512M');
set_time_limit(300);

include('inc.globals.php');
require('required.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if(!isset($_POST['processMap']))
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
        $mapPath = explode(DIRECTORY_SEPARATOR, $maps[$i]);
        $reconstructedPath = '';
        
        // remove just the filename, leaving us with files directory
        for($j=0; $j < (count($mapPath) - 1) ; $j++)
            $reconstructedPath = $reconstructedPath . $mapPath[$j] . DIRECTORY_SEPARATOR;
        
        // if a JSON file is present, the map has been processed
        if(file_exists($reconstructedPath . $globalMapJSON))
            echo $maps[$i]." has been processed... <br>\n";
        else
        {
            echo $maps[$i].' <b style="color: red">requires processing</b>...'
            echo '<input type="button"
                         value="Process"
                         onClick="post_to_url( \'master.php\',
                            {
                                \'processMap\': \''.$maps[$i].'\'
                            } );"/>'
            echo ."<br>\n";
        }
    }
    
}
else
{
    /*
     * Second Page: Process an unprocessed map
     *
     */
    
    // check that map exists
    
    // if it exists, make sure it has not been processed, aborting if it has
    
    // if map has not been processed, load tilesheet, aborting if it fails
    
    // if tilesheet load ok, load map also
    
    // if map loads ok, begin
}




?>