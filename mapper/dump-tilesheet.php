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
     * Second Page: dump one or all of tilesheets tiles into the dump directory
     *
     */
    
    $tilesheets = array();
    
    // dump them all if process=='all'
    if(isset($_POST['dump']) && $_POST['dump']=='all')
        $tilesheets = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    // or just do one map if one is specified
    else if(isset($_POST['dump']))
        array_push($tilesheets, $_POST['dump']);
        
    // dump tilesheets
    for($i=0; $i<count($tilesheets); $i++)
    {
        // make sure tilesheet exists
        if(file_exists($tilesheets[$i]))
        {
            $skipped = 0;
            $dumped = 0;
            
            // load tilesheet
            $tilesheetSize = getimagesize($tilesheets[$i]);
            $tilesheetWidth = $tilesheetSize[0];
            $tilesheetHeight = $tilesheetSize[1];
            $tilesheet = LoadPNG($tilesheets[$i]);
            
            // copy individual tiles from tilesheet
            for($y=0; $y<$tilesheetHeight/$globalTilesize; $y++)
            {
                for($x=0; $x<$tilesheetWidth/$globalTilesize; $x++)
                {
                    $tileHash = // used in naming tile file
                        getTile($tilesheet, $globalTilesize, $x, $y);
                   
                    $tileDestination = // path and filename of tile to write
                            $globalTileDumpDir.DIRECTORY_SEPARATOR.$tileHash.'.png';
                            
                    // only dump tile to disk if it does not exist
                    if(!file_exists($tileDestination))
                    {
                        $newimg = // create empty tile image
                            imagecreatetruecolor($globalTilesize, $globalTilesize);
                        
                        // attempt to copy current tile into empty tile
                        if(!imagecopy( 
                            $newimg, // destination image
                            $tilesheet, // source image
                            0, 0, // x, y destination
                            $x*$globalTilesize, $y*$globalTilesize, // x, y source
                            $globalTilesize, // copy width
                            $globalTilesize // copy height
                        )) die( "".$tilesheet[$i].' <b>failed</b>. '.
                                'Could not copy tile: '.$x.','.$y   );

                        // create folder if does not exist
                        if(!is_dir($globalTileDumpDir))
                        {
                            if(mkdir($globalTileDumpDir)) // try creating it
                                echo $globalTileDumpDir. // success
                                     " did not exist. <b>Created</b>.".
                                     "<br><br>\n\n";
                            else
                                die( "Could not create directory ". // fail
                                    $globalTileDumpDir );
                        }
                            
                        // attempt to write new tile to disk
                        if(!imagepng($newimg, $tileDestination))
                            die( "".$tilesheet[$i].' <b>failed</b>. '.
                                'Could not write tile ('.$x.','.$y.') to: '.
                                $tileDestination );
                        
                        $dumped++; // successfully dumped a tile
                    }
                    else $skipped++; // not dumping existing tile
                }
            }
            // reporting before possible next tilesheet
            echo "Done dumping ".$tilesheets[$i].
                 " (<b>skipped ".$skipped."</b> existing tiles".
                 " and <b>dumped ".$dumped."</b> new tiles)...<br>\n\n";
        }
        else die( "" . $tilesheets[$i] . " does not exist.");
    } 
}




?>