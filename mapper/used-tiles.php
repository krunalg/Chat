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
     * Second Page: Process an unprocessed map
     *
     */
    
    echo "compile here...";
}




?>