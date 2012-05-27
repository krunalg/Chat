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
        $animationExistsToJSON = json_encode($animationExists);
        $putPath = $globalAnimationFile;
        if(!file_put_contents($putPath, $animationExistsToJSON))
            die("Failed writing file: " . $putPath);
        else
            echo "Success writing file: " . $putPath;
    }
}

?>



<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
