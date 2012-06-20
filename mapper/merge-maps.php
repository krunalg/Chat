<?php

set_time_limit(300);
ini_set('memory_limit','1024M'); // 512M was not enough


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if(!isset($automate)) $automate = false;


if( !isset($_GET['merge']) && !$automate )
{
    /*
     * First Page: Display maps which have placement data and confirm
     *             and merging of maps
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
                   '\'merge\': \'yes\' '.
               '}, \'get\' );"/> ';
    }
}
else if( (isset($_GET['merge']) && ($_GET['merge']=='yes')) || $automate)
{
    /*
     * Second Page: Merge maps, adding borders
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    $mapImageInfo = array(); // array of image dimensions and position
    
    // populate the above arrays with map image information and resouces
    for($i=0; $i<count($maps); $i++)
    {
        
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
        
        // only deal with maps that have placement data
        if(file_exists($pathToPlacementFile))
        {
            // get placement data
            $placementData = file_get_contents($pathToPlacementFile);
            $placementDataParts = explode(':', $placementData);
            $placementX = trim($placementDataParts[0]);
            $placementY = trim($placementDataParts[1]);
            $mapName    = trim($placementDataParts[2]);
            
            // load map
            $map = LoadPNG($maps[$i]);
            
            // get map dimensions
            $mapSize = getimagesize($maps[$i]);
            $mapWidth = $mapSize[0];
            $mapHeight = $mapSize[1];
            
            // push map stuff to arrays
            $mapInfo = array();
            $mapInfo['x'] = $placementX;
            $mapInfo['y'] = $placementY;
            $mapInfo['width'] = $mapWidth;
            $mapInfo['height'] = $mapHeight;
            $mapInfo['image'] = $map;

            if(!isset($mapImageInfo[$mapName])) $mapImageInfo[$mapName] = array();
            array_push($mapImageInfo[$mapName], $mapInfo);
        }
    }
    
    // now that we have all we need to know about the maps
    // let's find start putting them all together
    
    foreach($mapImageInfo as $mapName => $mapChunks) {

        //  first we'll find the absolute width and height
        $maxWidth = 0;
        $maxHeight = 0;
        for($i=0; $i<count($mapChunks); $i++)
        {
            // the furthest point that a map extends over the x-axis
            // after accounting for the border on left and right side
            $extendsX = $mapChunks[$i]['x'] +
                        $mapChunks[$i]['width'];
            $extendsY = $mapChunks[$i]['y'] +
                        $mapChunks[$i]['height'];
                        
            if($extendsX > $maxWidth) $maxWidth = $extendsX;
            if($extendsY > $maxHeight) $maxHeight = $extendsY;
        }
        
        // now that we know how big the entire map is, let's create it
        $finalMapImage = imagecreatetruecolor($maxWidth, $maxHeight);
        
        // and finally we can add the maps themselves
        for($i=0; $i<count($mapChunks); $i++)
        {
            if(!imagecopy( 
                $finalMapImage, // destination image
                $mapChunks[$i]['image'], // source image
                $mapChunks[$i]['x'], // x destination
                $mapChunks[$i]['y'], // and y
                0, 0, // x, y source
                $mapChunks[$i]['width'], // copy width
                $mapChunks[$i]['height'] // copy height
            )) die( "Writing of map ".$i.
                    ' <b style="color: red">failed</b>. ');

            // frees image from memory
            imagedestroy($mapChunks[$i]['image']);
        }
        
        // Where to write new map file to?
        $file_dir = $mergedMapDir . DIRECTORY_SEPARATOR . $mapName;
        $write_path = $file_dir . DIRECTORY_SEPARATOR . $globalMapFilename;

        if(!is_dir($buildDir)) mkdir($buildDir);
        if(!is_dir($mergedMapDir)) mkdir($mergedMapDir);
        if(!is_dir($file_dir)) mkdir($file_dir);

        if(!imagepng($finalMapImage, $write_path ))
            die( 'Write attempt <b style="color:red">failed</b>. '.
                 'Could not write final map.');
        else {

            echo "<b>Successfully</b> wrote $write_path...<br>\n";

            // frees image from memory
            imagedestroy($finalMapImage);
        }
    }  
}
else
{
    echo "You should not be seeing this page... ever.";
}




?>