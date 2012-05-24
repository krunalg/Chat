<?php 
function getTime() 
    { 
    $a = explode (' ',microtime()); 
    return(double) $a[0] + $a[1]; 
    } 
$Start = getTime(); 
?>


<?php

set_time_limit(30); // should only take a few seconds
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['build']) )
{
    /*
     * First Page: Displays statistics and offer to merge
     *
     */
    
    // get a list of all dumped tiles
    $tiles = scanFileNameRecursivly($globalTileDumpDir);
    
    // report
    echo 'Found <b>'.count($tiles).'</b> tiles in '.$globalTileDumpDir.'...<br>';
    echo 'To-do: also list how many "above-player" tiles will be included...<br>'
    
    if(count($tiles)>=2) // only offer to merge if some exist
    {
        echo "<br>\n\n";
        echo '<input type="button" '.
                'value="Merge all into single image" '.
                'onClick="post_to_url( \'\', '. // post to same file ''
                   '{ '.
                       '\'build\': \'all\' '.
                   '} );"/> ';
    }
    else echo "Cannot perform a merge on so few tiles.";
    die(); // prevent execution time from displaying
    
}
else if( isset($_POST['build']) && $_POST['build']=='all' )
{
    /*
     * Second Page: Merges all tiles in dumped tiles folder into one image
     *
     */
    
    // get a list of all dumped tiles
    $tiles = scanFileNameRecursivly($globalTileDumpDir);
    
    // only perform a merge if there is more than one file
    if(count($tiles>1))
    {
        // build array of important collision types
        // for special cases such as tiles which need to be above player
        $collisionIndex = 0;
        $indexOfCollision = array(); // holds special cases
        foreach($globalCollisions as $index => $collision)
        {
            if($index=='above')
                $indexOfCollision[$index] = $collisionIndex;
            $collisionIndex++;
        }
        
        // we need to open the tile states file and find out which
        // tiles have been marked as "above" the player
        $savedCollisions = getCollisionsFromFile($globalCollisionsFile);
        $savedCollisions = buildHashIndexCollisions($savedCollisions);
        foreach($savedCollisions as $hash => $collision)
        {
            if($collision == $indexOfCollision['above'])
            {
                // remember that we md5 the name of the "above" tile because
                // it has to be a different name than the original tile,
                // and still be easily findable.
                $collisionTilePath = $globalAboveDumpDir .
                    DIRECTORY_SEPARATOR . md5($hash) . '.png';
                array_push($tiles, $collisionTilePath);
            }
        }
        
        // calculate master tilesheet dimensions
        $tilesheetWidthInTiles = $globalMasterTilesheetWidth/$globalTilesize;
        $tilesheetHeightInTiles = ceil(count($tiles)/$tilesheetWidthInTiles);
            //echo "w: $tilesheetWidthInTiles ... h: $tilesheetHeightInTiles ";
        
        // create new image
        $newimg = // create empty tilesheet image
            imagecreatetruecolor(
                $tilesheetWidthInTiles * $globalTilesize,
                $tilesheetHeightInTiles * $globalTilesize );
        
        // we want to save alpha channel
        imagealphablending($newimg, false);
        imagesavealpha($newimg, true);
        
        // adding tiles to master tilesheet
        $nextTile = 0; // progresses through tiles array index
        for($y=0; $y<$tilesheetHeightInTiles; $y++)
        {
            for($x=0; $x<$tilesheetWidthInTiles; $x++)
            {
                $tile = LoadPNG($tiles[$nextTile]);
                
                // regardless of tile's real size (which should always match
                // the global tilesize) we will use global tilesize
                
                // attempt to copy current tile into master tilesheet
                if(!imagecopy( 
                    $newimg, // destination image
                    $tile, // source image
                    $x*$globalTilesize, $y*$globalTilesize, // x, y destination
                    0, 0, // x, y source
                    $globalTilesize, // copy width
                    $globalTilesize // copy height
                )) die( "".$tiles[$nextTile].' <b>failed</b>. '.
                        'Could not copy tile.'  );
                
                // stop copy tiles when there are none left to write
                if($nextTile==count($tiles)-1)
                {
                    break;
                }
                $nextTile++; // otherwise next tile
            }
        }
        
        // attempt to write master tilesheet to disk
        if(!imagepng($newimg, $globalMasterTilesheetFile))
            die( '<b style="color:red">Failed</b> writing file: '.
                 $globalMasterTilesheetFile );
        else
            echo "<b>Success</b> writing file: ".$globalMasterTilesheetFile."<br>\n";
            
        
        $justHashes = array();
        for($i=0; $i<count($tiles); $i++)
        {
            $splitAtSlashes = explode(DIRECTORY_SEPARATOR, $tiles[$i]);
            $justFilename = $splitAtSlashes[ count($splitAtSlashes)-1 ];
            $justHash = substr($justFilename, 0, count($justFilename)-5 ); // cuts off '.png'
            array_push($justHashes, $justHash);
        }
        $afterJSON = json_encode($justHashes); // need to save this
        
        // write to file
        if(!file_put_contents($globalMasterTilesheetJSON, $afterJSON))
            die( '<b style="color:red">Failed</b> writing file: '.
                 $globalMasterTilesheetJSON );
        else
            echo "<b>Success</b> writing file: " . $globalMasterTilesheetJSON;
        
    }
    else die("Not enough tiles to perform a merge.");
}

?>

<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
