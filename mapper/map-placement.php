<?php

set_time_limit(60);

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
        
        // read old values into form inputs
        $x = $y = $mapName = '';
        if(file_exists($pathToPlacementFile))
        {
            $placementFileData = file_get_contents($pathToPlacementFile);
            $placementDataParts = explode(':', $placementFileData);
            $x = trim($placementDataParts[0]);
            $y = trim($placementDataParts[1]);
            $mapName = trim($placementDataParts[2]);
        }
        
        echo $pathToPlacementFile . "... X: ";
        echo '<input id="x-'.$i.'" type="text" value="'.$x.'" />';
        echo 'Y: ';
        echo '<input id="y-'.$i.'" type="text" value="'.$y.'" />';
        echo 'Map: ';
        echo '<input id="map-'.$i.'" type="text" value="'.$mapName.'" />';
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
    
    // back button
    echo 'Click <a href="">here</a> to edit some more...<br><br>'."\n\n";
    
    // add data to an array
    $placementByMap = array(); // where we'll keep placement data until we write files
    for($i=0; $i<count($dataByMap); $i++)
    {
        $placementParts = explode(':', $dataByMap[$i]);
        $placementByMap[$i] = array();
        $placementByMap[$i]['x'] = $placementParts[1];
        $placementByMap[$i]['y'] = $placementParts[2];
        $placementByMap[$i]['map'] = trim($placementParts[3]);
    }
    
    // write files
    for($i=0; $i<count($maps); $i++)
    {
        $dirName = dirname($maps[$i]);
        $pathToPlacementFile =
            $dirName . DIRECTORY_SEPARATOR . $globalPlacementFile;
         
        if( is_numeric($placementByMap[$i]['x']) &&
                    is_numeric($placementByMap[$i]['y']) &&
                    ($placementByMap[$i]['map']!='') )
        {
            // write file paying no regard to
            // whether it exists already or not
            $file_contents = $placementByMap[$i]['x'] . ':' . $placementByMap[$i]['y'] . ':' . $placementByMap[$i]['map'];
            if(!file_put_contents($pathToPlacementFile, $file_contents))
                die( '<b style="color:red">Failed</b> writing file: ' .
                     $pathToPlacementFile);
            else
                echo "<b>Success</b> writing file: " . $pathToPlacementFile;
        }
        else
        {
            // no valid data found for placement
            // either delete existing file, or
            // do nothing
            if(file_exists($pathToPlacementFile))
            {
                if(unlink($pathToPlacementFile)) // deletes
                {
                    echo 'Removal of unused '. $pathToPlacementFile .
                         ' <b>successful</b>.';
                }
                else die("Failed to delete ". $pathToPlacementFile);
            }
            else
                echo $pathToPlacementFile . ' does not exist, and '.
                     'will not be created.';
        }
        echo "<br>\n\n";
        
    }
    

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
            var mapName = $('#map-'+i).val();
            if(i!=0) var divider = ';'; else var divider = '';
            result = '' + result + divider + i + ':' + x + ":" + y + ':' + mapName;
        }
        
        post_to_url( '',  // post to same file ''
        { 
            'save': 'all',
            'data': result
        } );
        
    }
</script>