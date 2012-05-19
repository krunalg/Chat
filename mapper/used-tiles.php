<?php

set_time_limit(300); // because processing maps can take a while
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('required.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['compile']) )
{
    /*
     * First Page: Display maps which have been processed only
     *
     */
    
    // get a list of all maps which have been processed
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
    for($i=0; $i<count($maps); $i++)
    {
        echo $maps[$i].' found...<br>'."\n\n";
    }
    
    if(count($maps)>=1) // only offer to compile list if there are maps to read
    {
        echo '<input type="button" '.
            'value="Create JSON using maps above" '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'compile\': \'all\' '.
               '} );"/> ';
    }
}
else if(isset($_POST['compile']))
{
    /*
     * Second Page: Create an array of unique tiles and write to file
     *
     */
    
    $tileIsUsed = array(); // record of all used tiles
    
    // get a list of all maps which have been processed
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapJSON);
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
                if(is_array($couldBeTiles)) // the tiles field, not the width/height fields
                {
                    for($j=0; $j<count($couldBeTiles); $j++)
                        // using hash for index so there are no duplicates
                        $tileIsUsed[ $couldBeTiles[$j] ] = true;
                    
                    // reporting
                    echo $maps[$i] . " contained ".count($couldBeTiles)." tiles... ";
                    echo "unique tiles so far: <b>".count($tileIsUsed)."</b><br>\n\n";
                }       
            }
        }
        else die("".$maps[$i]." does not exist."); // map JSON file doesn't exist
    }
    
    if(count($tileIsUsed)>=1) // array of used-tiles is populated
    {
        $beforeJSON = array(); // to be converted to JSON
        
        // convert hash-index array to standard array
        foreach($tileIsUsed as $key => $value)
        {
            array_push($beforeJSON, $key); // key is the tile's hash
        }
        
        $afterJSON = json_encode($beforeJSON); // must be JSON before writing
        
        // write to file
        if(!file_put_contents($globalUsedTilesFile, $afterJSON))
            die('<br><b style="color:red">Failed</b> writing file: ' . $globalUsedTilesFile);
        else
            echo "<br><b>Success</b> writing file: " . $globalUsedTilesFile;
    }
    else die("Array of tiles used is empty.");
}




?>