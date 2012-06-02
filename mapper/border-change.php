<?php 
function getTime() 
    { 
    $a = explode (' ',microtime()); 
    return(double) $a[0] + $a[1]; 
    } 
$Start = getTime(); 
?>


<?php

set_time_limit(900); // because processing maps can take a while
ini_set('memory_limit','1024M'); // 512M was not enough


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_GET['build']) )
{
    /*
     * First Page: Display maps which have placement data and confirm
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    $howManyToMerge = 0;
    
    for($i=0; $i<count($maps); $i++)
    {
        
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
        
        // list only maps which have placement data
        if(file_exists($pathToPlacementFile))
        {
            $howManyToMerge++;
            echo $maps[$i] . ' has placement data. <b>Will</b> be included...<br>';
        }
        else
        {
            echo $maps[$i] . ' has no placement data. <b style="color:red">Will '.
                             'NOT</b> be included...<br>';
        }
    }
    
    if($howManyToMerge>=2) { // only offer if its worth doing
        echo '<input type="button" '.
            'value="Merge Now" '.
            'onClick="post_to_url( \'\', '. // post to same file ''
               '{ '.
                   '\'build\': \'yes\' '.
               '}, \'get\' );"/> ';
    }
}
else if( isset($_GET['build']) && ($_GET['build']=='yes') )
{
    /*
     * Second Page: Build a series of if statements
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    $mapImageResources = array(); // array of image resources
    $mapBorderImageResources = array(); // array of border image resources
    $mapImageInfo = array(); // array of image dimensions and position
    $countMaps = 0; // increases as we decide to use more maps
    
    // get master tilesheet info
    $masterTilesheetByHash = getTilesheetHashTable($globalMasterTilesheetJSON);

    // populate the above arrays with map image information and resouces
    for($i=0; $i<count($maps); $i++)
    {
        
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
        $pathToBorderFile =
            $dirName . DIRECTORY_SEPARATOR . $globalBorderFile;
        
        // only deal with maps that have placement data
        if(file_exists($pathToPlacementFile))
        {
            // get placement data
            $placementData = file_get_contents($pathToPlacementFile);
            $placementDataParts = explode(':', $placementData);
            $placementX = trim($placementDataParts[0]);
            $placementY = trim($placementDataParts[1]);
            
            // load map
            $map = LoadPNG($maps[$i]);
            
            // load border
            if(!file_exists($pathToBorderFile))
                die($pathToBorderFile . " not found.");
            $border = LoadPNG($pathToBorderFile);
            
            // get map dimensions
            $mapSize = getimagesize($maps[$i]);
            $mapWidth = $mapSize[0];
            $mapHeight = $mapSize[1];
            
            // get border dimensions
            $borderSize = getimagesize($pathToBorderFile);
            $borderWidth = $borderSize[0];
            $borderHeight = $borderSize[1];

            // get border tile hashes
            for($y=0; $y<$borderHeight/$globalTilesize; $y++)
            {
                for($x=0; $x<$borderWidth/$globalTilesize; $x++)
                {    
                    $borderTiles[$x][$y] = getTile($border, 
                        $globalTilesize, $x, $y);
                }
            }
            
            // push map stuff to arrays
            $mapInfo = array();
            $mapInfo['x'] = $placementX;
            $mapInfo['y'] = $placementY;
            $mapInfo['width'] = $mapWidth;
            $mapInfo['height'] = $mapHeight;
            $mapInfo['borderWidth'] = $borderWidth;
            $mapInfo['borderHeight'] = $borderHeight;
            $mapInfo['borderTiles'] = $borderTiles;
            array_push($mapImageInfo, $mapInfo);
            array_push($mapImageResources, $map);
            array_push($mapBorderImageResources, $border);
            
            $countMaps++;
        }
    }
    
    // Output collision checks for each map
    for($i=0; $i<$countMaps; $i++)
    {
        $mapWidthInTiles = $mapImageInfo[$i]['width'] / $globalTilesize;
        $mapHeightInTiles = $mapImageInfo[$i]['height'] / $globalTilesize;
        $borderWidthInTiles = $mapImageInfo[$i]['borderWidth'] / $globalTilesize;
        $borderHeightInTiles = $mapImageInfo[$i]['borderHeight'] / $globalTilesize;
        if($i!=0) echo 'else ';
        echo 
            'if( player.pos.x >= ' . $mapImageInfo[$i]['x'] . ' && ' . 
                'player.pos.x <  ' . ($mapImageInfo[$i]['x'] + $mapImageInfo[$i]['width']) . ' && ' . 
                'player.pos.y <  ' . ($mapImageInfo[$i]['y'] + $mapImageInfo[$i]['height']) . ' && ' .
                'player.pos.y >= ' . $mapImageInfo[$i]['y'] . ' ) ';
        echo // issue new border graphics
            "{ <br>\n";
            for($y=0; $y<$borderHeightInTiles; $y++)
            {
                for($x=0; $x<$borderWidthInTiles; $x++)
                {
                    $currentHash = $mapImageInfo[$i]['borderTiles'][$x][$y];
                    $currentTile = $masterTilesheetByHash[$currentHash] + 1; // +1 for weltmeister
                    echo "ig.game.backgroundMaps[0]['data'][".$x."][".$y."] = " . $currentTile . "; <br>\n";
                }
            }


        echo // end issue command
            "} <br><br>\n\n";
    }

    die();


    // now that we have all we need to know about the maps
    // let's find start putting them all together
    
    //  first we'll find the absolute width and height
    $maxWidth = 0;
    $maxHeight = 0;
    for($i=0; $i<$countMaps; $i++)
    {
        // the furthest point that a map extends over the x-axis
        // after accounting for the border on left and right side
        $extendsX = $mapImageInfo[$i]['x'] +
                    $mapImageInfo[$i]['width'] +
                    ($mapImageInfo[$i]['borderWidth'] * $globalBorderRepeatX * 2);
        $extendsY = $mapImageInfo[$i]['y'] +
                    $mapImageInfo[$i]['height'] +
                    ($mapImageInfo[$i]['borderHeight'] * $globalBorderRepeatY * 2);
                    
        if($extendsX > $maxWidth) $maxWidth = $extendsX;
        if($extendsY > $maxHeight) $maxHeight = $extendsY;
        
        // and update each maps position to account for its border
        $mapImageInfo[$i]['x'] +=
            $mapImageInfo[$i]['borderWidth'] * $globalBorderRepeatX;
        $mapImageInfo[$i]['y'] +=
            $mapImageInfo[$i]['borderHeight'] * $globalBorderRepeatY;
    }
    
    // now that we know how big the entire map is, let's create it
    $finalMapImage = imagecreatetruecolor($maxWidth, $maxHeight);

    // now we can begin adding the borders
    for($i=0; $i<$countMaps; $i++)
    {
        $xStart =           $mapImageInfo[$i]['x'] -
                            ($mapImageInfo[$i]['borderWidth'] *
                            $globalBorderRepeatX);
        $yStart =           $mapImageInfo[$i]['y'] -
                            ($mapImageInfo[$i]['borderHeight'] *
                            $globalBorderRepeatY);
        $borderFillWidth =  $mapImageInfo[$i]['width'] +
                            ($mapImageInfo[$i]['borderWidth'] *
                            $globalBorderRepeatX * 2);
        $borderFillHeight = $mapImageInfo[$i]['height'] +
                            ($mapImageInfo[$i]['borderHeight'] *
                            $globalBorderRepeatY * 2);
           
        // tile the border to fill the area
        $borderFillWidthInChunks = $borderFillWidth / $mapImageInfo[$i]['borderWidth'];
        $borderFillHeightInChunks = $borderFillHeight / $mapImageInfo[$i]['borderHeight'];
        for($y=0; $y<$borderFillHeightInChunks; $y++)
        {
            for($x=0; $x<$borderFillWidthInChunks; $x++)
            {
                if(!imagecopy( 
                    $finalMapImage, // destination image
                    $mapBorderImageResources[$i], // source image
                    $xStart + ( $x * $mapImageInfo[$i]['borderWidth'] ), // x destination
                    $yStart + ( $y * $mapImageInfo[$i]['borderHeight'] ), // and y
                    0, 0, // x, y source
                    $mapImageInfo[$i]['borderWidth'], // copy width
                    $mapImageInfo[$i]['borderHeight'] // copy height
                )) die( "Writing of border in map ".$i.
                        ' <b style="color: red">failed</b>. '.
                        'Could not copy tile: '.$x.','.$y   );
            }
        }
    }
    
    // and finally we can add the maps themselves
    for($i=0; $i<$countMaps; $i++)
    {
        if(!imagecopy( 
            $finalMapImage, // destination image
            $mapImageResources[$i], // source image
            $mapImageInfo[$i]['x'], // x destination
            $mapImageInfo[$i]['y'], // and y
            0, 0, // x, y source
            $mapImageInfo[$i]['width'], // copy width
            $mapImageInfo[$i]['height'] // copy height
        )) die( "Writing of map ".$i.
                ' <b style="color: red">failed</b>. ');
    }
    
    if(!imagepng($finalMapImage, '.'.DIRECTORY_SEPARATOR.'test-merge.png' ))
        die( 'Write attempt <b style="color:red">failed</b>. '.
             'Could not write final map.');
    else echo "<b>Successfully</b> wrote test-merge.png... Pick a better name.";

    
}
else
{
    echo "You should not be seeing this page... ever.";
}




?>



<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
