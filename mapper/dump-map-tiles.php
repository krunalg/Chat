<?php 
function getTime() 
    { 
    $a = explode (' ',microtime()); 
    return(double) $a[0] + $a[1]; 
    } 
$Start = getTime(); 
?>


<?php

set_time_limit(300);
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['dump']) )
{
    /*
     * First Page: Display all maps in the maps folder
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    for($i=0; $i<count($maps); $i++)
    {
        $postSafePath = // needed to not lose slashes on next page
            str_replace('\\', "\\\\", $maps[$i]);
            
        echo $maps[$i].' found...';
        echo '<input type="button" '.
                     'value="Dump" '.
                     'onClick="post_to_url( \'\', '. // post to same file ''
                        '{ '.
                            '\'dump\': \''.$postSafePath.'\' '.
                        '} );"/> ';
        echo "<br>\n\n";
    }
    
    if(count($maps)>=1) // only give dump option if something to dump
    {
        echo '<br>Dump a specific map above or... ';
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
     * Second Page: dump one or all of maps tiles into the dump directory
     *
     */
    
    $maps = array();
    
    // dump them all if process=='all'
    if(isset($_POST['dump']) && $_POST['dump']=='all')
        $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    // or just do one map if one is specified
    else if(isset($_POST['dump']))
        array_push($maps, $_POST['dump']);
        
    // dump maps
    for($i=0; $i<count($maps); $i++)
    {
        // make sure map exists
        if(file_exists($maps[$i]))
        {
            $skipped = 0;
            $dumped = 0;
            
            // load map
            $mapSize = getimagesize($maps[$i]);
            $mapWidth = $mapSize[0];
            $mapHeight = $mapSize[1];
            $map = LoadPNG($maps[$i]);
            
            // copy individual tiles from map
            for($y=0; $y<$mapHeight/$globalTilesize; $y++)
            {
                for($x=0; $x<$mapWidth/$globalTilesize; $x++)
                {
                    $tileHash = // used in naming tile file
                        getTile($map, $globalTilesize, $x, $y);
                   
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
                            $map, // source image
                            0, 0, // x, y destination
                            $x*$globalTilesize, $y*$globalTilesize, // x, y source
                            $globalTilesize, // copy width
                            $globalTilesize // copy height
                        )) die( "".$map[$i].' <b>failed</b>. '.
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
                            die( "".$map[$i].' <b>failed</b>. '.
                                'Could not write tile ('.$x.','.$y.') to: '.
                                $tileDestination );
                        
                        $dumped++; // successfully dumped a tile
                    }
                    else $skipped++; // not dumping existing tile
                }
            }
            // reporting before possible next map
            echo "Done dumping ".$maps[$i].
                 " (<b>skipped ".$skipped."</b> existing tiles".
                 " and <b>dumped ".$dumped."</b> new tiles)...<br>\n\n";
        }
        else die( "" . $maps[$i] . " does not exist.");
    } 
}

?>



<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
