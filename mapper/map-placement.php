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
echo '<script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>';


if( !isset($_POST['save']) )
{
    /*
     * First Page: Display all maps and their placement state
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    // check if each map has placement data already
    for($i=0; $i<count($maps); $i++)
    {
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
        
        echo $pathToPlacementFile . "... X: ";
        echo '<input name="x-'.$i.'" type="text value="" />';
        echo 'Y: ';
        echo '<input name="y" type="text value="" />';
        
        // if a JSON file is present, the map has been processed
        if(file_exists($pathToPlacementFile))
        {
            // GET THE PLACEMENT DATA FROM JSON FILE
        }
        
        // CREATE FORM FOR ADDING PLACEMENT DATA
        
            // IF WE HAVE PLACEMENT DATA AUTOFILL IN, ELSE USE BLANK
            
        echo "<br>\n\n";  
        
    }
    
    if(count($maps)>=1) {
        echo '<br><input type="button" '.
            'value="Save All" '.
            'onClick="saveAll('.count($maps).')" /> ';
    }
}
else if( isset($_POST['save']) && $_POST['save']=='all' )
{
    /*
     * Second Page: Save placement data to file(s)
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    
    // parse data getting ready to save
    $dataToParse = $_POST['data'];
    $dataByMap = explode(';', $dataToParse);
    
    // make sure we have the same amount of data to process
    // as we have maps
    if(count($maps)!=count($dataByMap))
        die("Amount of data does not match amount of maps");
    
    // add data to an array
    $placementByMap = array(); // where we'll keep placement data until we write files
    for($i=0; $i<count($dataByMap); $i++)
    {
        $placementParts = explode(':', $dataByMap[$i]);
        $placementByMap[$i] = array();
        $placementByMap[$i]['x'] = $placementParts[1];
        $placementByMap[$i]['y'] = $placementParts[2];
    }
    
    // write files
    for($i=0; $i<count($maps); $i++)
    {
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
            
        if( is_numeric($placementByMap[$i]['x']) &&
                    is_numeric($placementByMap[$i]['y']) )
        {
            // write file paying no regard to
            // whether it exists already or not
            $xAndY = $placementByMap[$i]['x'] . ':' . $placementByMap[$i]['y'];
            
            // i still need to write the file
            // *****
        }
        else
        {
            // no valid data found for placement
            // either delete existing file, or
            // do nothing
            if(file_exists($pathToPlacementFile))
                if(!unlink($pathToPlacementFile)) // deletes
                    die("Failed to delete ". $pathToPlacementFile);
            else
                echo $pathToPlacementFile . 'does not exist, and '.
                     'will not be created.';
        }
    }
    
    
    print_r($placementByMap);
    die();
    
}




?>

<script type="text/javascript">
    var saveAll = function(howManyMaps)
    {
        result = '';
        for(var i=0; i<howManyMaps; i++)
        {
            var x = $('#x-'+i).val();
            var y = $('#y-'+i).val();
            if(i!=0) var divider = ';'; else var divider = '';
            result = '' + result + divider + i + ':' + x + ":" + y;
        }
        
        post_to_url( '',  // post to same file ''
        { 
            'save': 'all',
            'data': result
        } );
        
    }
</script>


<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
