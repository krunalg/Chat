<?php

set_time_limit(300);
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('required.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['dump']) )
{
    /*
     * First Page: Display all tilesheets in the maps folder
     *
     */
    
    // get a list of all tilesheets
    $tilesheets = scanFileNameRecursivly($globalMapDir, $globalTilesheetFile);
    for($i=0; $i<count($tilesheets); $i++)
    {
        $postSafePath = // needed to not lose slashes on next page
            str_replace('\\', "\\\\", $tilesheets[$i]);
            
        echo $tilesheets[$i].' found...';
        echo '<input type="button" '.
                     'value="Dump" '.
                     'onClick="post_to_url( \'\', '. // post to same file ''
                        '{ '.
                            '\'dump\': \''.$postSafePath.'\' '.
                        '} );"/> ';
        echo "<br>\n\n";
    }
    
    if(count($tilesheets)>=1) // only give dump option if something to dump
    {
        echo '<br>Dump a specific tilesheet above or... ';
        echo '<input type="button" '.
                'value="Dump All" '.
                'onClick="post_to_url( \'\', '. // post to same file ''
                   '{ '.
                       '\'dump\': \'all\' '.
                   '} );"/> ';
    }
}
else if(isset($_POST['dump']))
{
    /*
     * Second Page: 
     *
     */
    
    echo "Perform dump here.";
}




?>