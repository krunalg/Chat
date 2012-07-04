<?php

set_time_limit(900); // because processing maps can take a while
ini_set('memory_limit','1024M'); // 512M was not enough


require_once('inc.globals.php');
require_once('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms

if(!isset($automate)) $automate = false;

if( !isset($_GET['build']) && !$automate)
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
else if( (isset($_GET['build']) && ($_GET['build']=='yes')) || $automate)
{
    /*
     * Second Page: Build a series of if statements
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    $mapImageInfo = array(); // array of image dimensions and position
    
    // get master tilesheet info
    if(file_exists($globalMasterTilesheetJSON)) {

        $masterTilesheetByHash = getTilesheetHashTable($globalMasterTilesheetJSON);    
    
    } else {

        die("Master tilesheet not found.");
    }

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

            // frees image from memory
            imagedestroy($border);
            
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
        }
    }
    
    $module = 'game.border-check';
    $moduleName = 'BorderCheck';
    $filename = 'border-check.js';

    // Output collision checks for each map
    $export = "ig.module('".$module."')\n\n.requires()\n\n.defines(function() {\n\n" .
              "    ".$moduleName." = function(player) {\n\n";
    $tab = '        ';


    for($i=0; $i<count($mapImageInfo); $i++)
    {
        $mapWidthInTiles = $mapImageInfo[$i]['width'] / $globalTilesize;
        $mapHeightInTiles = $mapImageInfo[$i]['height'] / $globalTilesize;
        $borderWidthInTiles = $mapImageInfo[$i]['borderWidth'] / $globalTilesize;
        $borderHeightInTiles = $mapImageInfo[$i]['borderHeight'] / $globalTilesize;
        $export .= 
            $tab . ($i!=0 ? 'else ':'') . 'if( player.pos.x >= ' . $mapImageInfo[$i]['x'] . ' && ' . 
                'player.pos.x <  ' . ($mapImageInfo[$i]['x'] + $mapImageInfo[$i]['width']) . ' && ' . 
                'player.pos.y <  ' . ($mapImageInfo[$i]['y'] + $mapImageInfo[$i]['height']) . ' && ' .
                'player.pos.y >= ' . $mapImageInfo[$i]['y'] . ' ) ';
        $export.= // issue new border graphics
            "{ \n";
            for($y=0; $y<$borderHeightInTiles; $y++)
            {
                for($x=0; $x<$borderWidthInTiles; $x++)
                {
                    $currentHash = $mapImageInfo[$i]['borderTiles'][$x][$y];
                    $currentTile = $masterTilesheetByHash[$currentHash] + 1; // +1 for weltmeister
                    $export .= $tab . "    ig.game.backgroundMaps[0]['data'][".$y."][".$x."] = " . $currentTile . "; \n";
                }
            }
            $export .= $tab . "    return true; \n";


        $export .= // end issue command
            $tab . "}\n\n";
    }

    $export .= "    }\n\n})";

    // write to file
    writeTextToFile(($impactLibDir . $filename), $export);
    
}
else
{
    echo "You should not be seeing this page... ever.";
}




?>