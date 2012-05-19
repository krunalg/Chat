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


if( !isset($_POST['build']) )
{
    /*
     * First Page: Displays statistics and offer to merge
     *
     */
    
    // get a list of all dumped tiles
    $tiles = scanFileNameRecursivly($globalTileDumpDir);
    
    // report
    echo 'Found <b>'.count($tiles).'</b> in '.$globalTileDumpDir.'...';
    
    if(count($tiles)>=2) // only offer to merge if some exist
    {
        echo "<br><br>\n\n";
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
        // calculate master tilesheet dimensions
        $tilesheetWidthInTiles = $globalMasterTilesheetWidth/$globalTilesize;
        $tilesheetHeightInTiles = ceil(count($tiles)/$tilesheetWidthInTiles);
            //echo "w: $tilesheetWidthInTiles ... h: $tilesheetHeightInTiles ";
        
        // create new image
        $newimg = // create empty tilesheet image
            imagecreatetruecolor(
                $tilesheetWidthInTiles * $globalTilesize,
                $tilesheetHeightInTiles * $globalTilesize );
        
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
            
        
        $afterJSON = json_encode($tiles); // need to save this
        
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
