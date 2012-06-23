<?php

set_time_limit(60);

require_once('inc.globals.php');
require_once('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms

if(!isset($automate)) $automate = false;

if( !isset($_POST['require']) && !$automate )
{
    /*
     * First Page: List all maps which will be used.
     *
     */
    
    $levels = scanFileNameRecursivly($impactLevelDir);
    
    echo "\n\n";
    
    for($i=0; $i<count($levels); $i++)
    {
        $postSafeMapPath = str_replace('\\', "\\\\", $levels[$i]); // needed to not lose slashes on next page
        echo $levels[$i]."<br>\n\n";
    }
    
    if(count($levels)>=1) { // only offer to process if some need processing
        echo '<br><input type="button" '.
            'value="Require all." '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'require\': \'all\' '.
               '} );"/> ';
    }
}
else if( isset($_POST['require']) || $automate )
{
    /*
     * Second Page: Generate module to require all maps.
     *
     */
    
    $requiredModules = array();
    $mapPaths = array();
    $mapPaths = scanFileNameRecursivly($impactLevelDir);

    echo 'Requiring ' . count($mapPaths) . ' maps...<br><br>'."\n\n";

    for($i=0; $i<count($mapPaths); $i++)
    {
        $filename = basename($mapPaths[$i], '.js');
        $moduleName = $impactLevelModule . $filename;

        if(!array_push($requiredModules, $moduleName)) {
            
            die('Could not add module to array.');
        }

        echo $moduleName . " will be required.<br>\n";
    }

    // Build an Impact module.
    $moduleName = 'game.levels';
    $moduleFilename = 'levels.js';
    $output = "ig.module('".$moduleName."')\n\n.requires(\n\n";

    for($i=0; $i<count($requiredModules); $i++) {

        $comma = ($i != count($requiredModules) - 1 ? ',' : '');
        $output .= "'".$requiredModules[$i]."'".$comma."\n\n"; 
    }

    $output .= ")\n\n.defines(function() {});";

    // attempt to write weltmeister map
    $putDir = $impactLibDir;
    $putPath = $putDir.DIRECTORY_SEPARATOR.$moduleFilename;
    writeTextToFile($putPath, $output);

}

?>