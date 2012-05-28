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
ini_set('memory_limit','512M');


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['process']) )
{
    /*
     * First Page: List the animation files found
     *
     */
    
    $imagesInDir = scanFileNameRecursivly($globalAnimationsDir);
    
    for($i=0; $i<count($imagesInDir); $i++)
    {
        $last4chars = substr($imagesInDir[$i], -4, 4);
        if($last4chars!='.png')
            die("Problem: I found a non-png file... ".$imagesInDir[$i]);
        else echo $imagesInDir[$i].' found...<br>'."\n\n";
    }
    
    if(count($imagesInDir)>=1)
    {
        echo '<br><input type="button" '.
                'value="Process All" '.
                'onClick="post_to_url( \'\', '. // post to same file ''
                   '{ '.
                       '\'process\': \'all\' '.
                   '} );"/> ';
        echo "<br>\n\n";
    }
}
else if( isset($_POST['process']) && $_POST['process']=='all')
{
    /*
     * Second Page: 
     *
     */
    
    $imagesInDir = scanFileNameRecursivly($globalAnimationsDir);
    $animationExists = array();
        
    for($i=0; $i<count($imagesInDir); $i++)
    {
        if(file_exists($imagesInDir[$i]))
        {
            // load image
            $imageSize = getimagesize($imagesInDir[$i]);
            $imageWidth = $imageSize[0];
            $imageHeight = $imageSize[1];
            $image = LoadPNG($imagesInDir[$i]);
            
            for($y=0; $y<$imageHeight/$globalTilesize; $y++)
            {
                $x = 0;
                $tileHash = getTile($image, $globalTilesize, $x, $y);
                $path_parts = pathinfo($imagesInDir[$i]);
                $filename = $path_parts['basename'];

                if(!isset($animationExists[$filename]))
                    $animationExists[$filename] = array();
                
                $animationExists[$filename][$tileHash] = $y;
            }
        }
        else die( "" . $imagesInDir[$i] . " does not exist.");
    }

    if(count($animationExists)>=1)
    {
        // we are going to need to look up certain tile positions
        // within the master tilesheet so lets build the lookup array
        $tilesheetJSON = $globalMasterTilesheetJSON;
        $tilesheetJSON = file_get_contents($tilesheetJSON);
        $tilesheetJSON = json_decode($tilesheetJSON);
        $masterTilesheetByHash = array();
        foreach($tilesheetJSON as $key => $hash)
        {
            // key is position in tilesheet where tile can be found
            $masterTilesheetByHash[$hash] = $key;
        }

        // generate impact code for adding animations
        $export = '';
        $fileCount = 0;
        $animationSheetName = "animationSheet";
        foreach($animationExists as $filename => $tiles)
        {
            $export .=  "var " . $animationSheetName . $fileCount . 
                        " = new ig.AnimationSheet( ".
                            "'media/" . $filename . "', " . $globalTilesize . 
                            ", " . $globalTilesize . 
                        " );\n";
            $fileCount++;
        }
        $export .=  "this.backgroundAnims = { " .
                        "'media/".$globalMasterTilesheetFile."': {";
        
        $fileCount = 0;
        $animationSheetWidthInTiles = 9;
        foreach($animationExists as $filename => $tiles)
        {
            $skipCommaFirstTime = '';
            foreach($tiles as $hash => $y)
            {
                if(!isset($masterTilesheetByHash[$hash]))
                {
                    die( "Tile " . $hash . " from animation file " . $filename .
                         " not found in " . $globalMasterTilesheetJSON );
                }
                else
                {
                    $export .=  $skipCommaFirstTime . "\n" .
                        ( $masterTilesheetByHash[$hash] ) . 
                    ": new ig.Animation( " . $animationSheetName . $fileCount .
                    ", 0.26667, " .
                    "[" .
                        (1 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (2 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (3 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (4 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (5 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (6 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (7 + ($animationSheetWidthInTiles*$y)) . "," . 
                        (8 + ($animationSheetWidthInTiles*$y)) . 
                    "] " .
                    ") ";
                }
                $skipCommaFirstTime = ','; // from now on inject comma
            }
            $fileCount++;
        }
        
        $export .=      "} " .
                    "}; ";

        echo "Use the following code in Impact to set up animations:<br><br>\n\n";
        echo $export;
        echo "\n\n<br><br>";
        echo "And make sure you copy the files in " . $globalAnimationsDir .
             " to the media directory.";

    }
}

?>



<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
