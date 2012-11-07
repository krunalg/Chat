<?php

set_time_limit(900);
ini_set('memory_limit','1024M'); // and use a lot of memory


require_once('inc.globals.php');
require_once('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms

if(!isset($automate)) $automate = false;


if( !isset($_POST['dump']) && !$automate)
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
else if(isset($_POST['dump']) || $automate)
{
    /*
     * Second Page: dump one or all of maps tiles into the dump directory
     *
     */

    $maps = array();

    // dump them all if process=='all'
    if( (isset($_POST['dump']) && $_POST['dump']=='all') || $automate)
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

                        // Create folder if doesn't exist.
                        createDirIfNotExist($globalTileDumpDir);

                        // attempt to write new tile to disk
                        if(!imagepng($newimg, $tileDestination))
                            die( "".$map[$i].' <b>failed</b>. '.
                                'Could not write tile ('.$x.','.$y.') to: '.
                                $tileDestination );

                        // frees image from memory
                        imagedestroy($newimg);

                        $dumped++; // successfully dumped a tile
                    }
                    else $skipped++; // not dumping existing tile
                }
            }

            // frees image from memory
            imagedestroy($map);

            // reporting before possible next map
            echo "Done dumping ".$maps[$i].
                 " (<b>skipped ".$skipped."</b> existing tiles".
                 " and <b>dumped ".$dumped."</b> new tiles)...<br>\n\n";
        }
        else die( "" . $maps[$i] . " does not exist.");
    }
}

?>