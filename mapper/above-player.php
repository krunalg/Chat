<?php

include('inc.globals.php');
require('inc.functions.php');

?>

<html>
    <head>
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
        <script type="text/javascript" src="inc.functions.js" ></script>
    </head>
    <body onload="initTiles()">
        
<?php

if( !isset($_GET['map']) && !isset($_POST['tiles']) )
{ 
    /*
     * First Page: Select a map
     *
     */
    
    // get a list of all maps
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    // start html form
    echo '<form method="get">';
    
    // echo html form element
    echo '<select name="map" multiple="multiple" style="height: 400px">' . "\n";
        for($i=0; $i<count($maps); $i++)
        {
            $dirName = dirname($maps[$i]);
            if($i==0) $selected = 'selected="selected" '; else $selected = '';
            echo '<option '.$selected.'value="'.$maps[$i].'">'.$dirName.'</option>' . "\n";
        }
        echo '</select>';
    
    // echo load button
    echo '<br>';
    echo '<input type="submit">';
    
    // end html form
    echo '</form>';
}
else if( isset($_GET['map']) )
{
    /*
     * Second Page: Display map
     *
     */
    
    // we need to know which 'above-tiles' were previously saved
    $previouslySavedTiles = getCollisionsFromFile($globalAbovePlayerFile); // read from file
    $previouslySavedTiles = buildHashIndexCollisions($previouslySavedTiles); // use hashes as indexes
    
    // create save button
    echo '<input type="button" value="Save" onclick="save();" '.
         'style="position: absolute; top: 0; left: 0;" />';
    
    $mapPath = $_GET['map'];
    
    $size = getimagesize($mapPath);
    $width = $size[0]; // width in px of map
    $height = $size[1]; // height in px of map
    $widthInTiles = $width/$globalTilesize;
    $heightInTiles = $height/$globalTilesize;
    
    // load map for grabbing hashes
    $map = LoadPNG($mapPath);
    
    // comment slashes so background image loads
    $mapPath = str_replace('\\', "\\\\", $mapPath);
    
    // create tiles javascript object
    echo "\n\n" . '<!-- creating tile hash values -->' ."\n";
    echo '<script type="text/javascript">' ."\n";
    echo 'var tiles = new Object();'."\n";
    for($x=0; $x<$widthInTiles; $x++)
    {
        echo 'tiles['.$x.'] = new Object();'."\n";
        for($y=0; $y<$heightInTiles; $y++)
        {
            $hash = getTile($map, $globalTilesize, $x, $y);
            $previouslySavedTile = 0;
            if(isset($previouslySavedTiles[$hash])) $previouslySavedTile = $previouslySavedTiles[$hash];
            echo 'tiles['.$x.']['.$y.'] = new Object();'."\n";
            echo 'tiles['.$x.']['.$y.'].hash = "'.$hash.'";'."\n";
            echo 'tiles['.$x.']['.$y.'].state = '.$previouslySavedTile.';';
        }
    }
    echo '</script>' ."\n";
    echo '<!-- ending tile hash values -->' ."\n\n";
    
    // create main map div w/ bg
    echo '<div style="'.
        'background: url(\''.$mapPath.'\'); '.
        'position: absolute; '.
        'left: 0px; '.
        'top: 28px; '.
        'width: '.$width.'px;'.
        'height: '.$height.'px;'.
        '">' ."\n";
    
        // fill with many tile-sized divs
        for($y=0; $y<$heightInTiles; $y++)
        {
            for($x=0; $x<$widthInTiles; $x++)
            {
                echo '<div '.
                        'style="'.
                            'background: none; '.
                            'width: '.$globalTilesize.'px; '.
                            'height: '.$globalTilesize.'px; '.
                            'position: absolute; '.
                            'left: '.($x*$globalTilesize).'px; '.
                            'top: '.($y*$globalTilesize).'px; '.
                        
                        '" id="x'.$x.'y'.$y.'"'.
                            
                        /*'" onClick="'.
                            'window.alert(\'You clicked '.$x.', '.$y.'\');'.*/
                        
                        '" onClick="'.
                            'tileClicked('.$x.','.$y.');'.
                            
                        '" onmouseover="'.
                            'tileOver('.$x.','.$y.');'.
                            //'$(\'#x'.$x.'y'.$y.'\').css(\'background-image\', \'url(images/mouseover.png)\');'.
                            
                        '" onmouseout="'.
                            'tileOut('.$x.','.$y.');'.
                            //'$(\'#x'.$x.'y'.$y.'\').css(\'background\', \'none\');'.
                        
                        '"></div>' . "\n";
            }
        }
    
    
    echo '</div>'; // close main map div
    
    
}
else if( isset($_POST['tiles']) )
{
    /*
     * Third Page: Write tile hashes and previouslySavedTile data to file
     *
     */
    
    // create array of old previouslySavedTiles
    $oldCollisions = getCollisionsFromFile($globalCollisionsFile);
    
    // build previouslySavedTiles array with hashes as indexes
    $previouslySavedTiles = buildHashIndexCollisions($oldCollisions);
    
    // create array of new previouslySavedTiles
    $newCollisions = prepCollisions($_POST['tiles']);
    
    // update previouslySavedTiles array
    for($i=0; $i<count($newCollisions); $i++)
    {
        // use hash for index so no duplicates
        $previouslySavedTiles[ $newCollisions[$i][0] ] = $newCollisions[$i][1];
    }
    
    $fileDump = ' '; // at the very least we will write a space
                     // we don't want to write nothing because then it appears
                     // that the file_put_contents failed
                     
    foreach($previouslySavedTiles as $key => $value)
        if($value!=$collisionWalkable) // ignore regular walkable tiles
            $fileDump = $fileDump . $key . ':' . $value . "\n";

    //if($fileDump!='')
    //{
        if(!file_put_contents($globalCollisionsFile, $fileDump))
            die("Failed writing file: " . $globalCollisionsFile);
        else
            echo "Success writing file: " . $globalCollisionsFile;
    //}
    //else echo "Nothing to write to file.";
    echo '<br /><a href="">Edit another map</a>';
    
    //echo "I found the following data: \n" . $_POST['tiles'];
}
else
{
    /*
     * Something went wrong
     *
     */
    
    die("Something went wrong.");
}

?>


<script type="text/javascript">
    
    var initTiles = function()
    {
        if(typeof tiles === 'undefined')
        {
            // do nothing
        }
        else   
        {
            for(var x=0; x < <?php if(isset($widthInTiles)) echo $widthInTiles; else echo 0; ?> ; x++)
                for(var y=0; y < <?php if(isset($widthInTiles)) echo $heightInTiles; else echo 0; ?> ; y++)
                    tileOut(x,y);
        }
    }
    
    var tileStates = new Array();
    tileStates.push(0); // none
    tileStates.push(1); // above-player
    
    var save = function()
    {
        var dump = '';
        for(var x in tiles)
        {
            for(var y in tiles[x])
            {
                    // dump even the walkable tiles because we need to be able to convert tiles to walkable
                    dump = dump + tiles[x][y].hash + ":" + tileStates[tiles[x][y].state] + "\n";
            }
        }
        post_to_url('', {'tiles': dump} );
    }
    
    var tileClicked = function(x, y)
    {
        tiles[x][y].state++; // next state in cycle
        if(tiles[x][y].state>=tileStates.length)
            tiles[x][y].state = 0; // restart cycle if need be
        
        tileOver(x,y); // update displayed image
        
        // update others with same hash
        var othersState = tiles[x][y].state;
        var othersHash = tiles[x][y].hash;
        for(var othersX in tiles)
        {
            for(var othersY in tiles[x])
            {
                if(tiles[othersX][othersY].hash==othersHash)
                {
                    tiles[othersX][othersY].state = othersState;
                    tileOut(othersX, othersY);
                }
            }
        }
    }
    
    var tileOver = function(x, y)
    {
        var img = '';
        switch(tileStates[tiles[x][y].state])
        {
            case 0:
                img = '<?php echo $collisionWalkableMouseoverImg ?>';
                break;
            case 1:
                img = '<?php echo $abovePlayerMouseoverImg ?>';
                break;
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper state type: " + tiles[x][y].state);
    }
    
    var tileOut = function(x, y)
    {
        var img = '';
        switch(tileStates[tiles[x][y].state])
        {
            case 0:
                img = '<?php echo $collisionWalkableMouseoutImg ?>';
                break;
            case 1:
                img = '<?php echo $abovePlayerMouseoutImg ?>';
                break;
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper state type: " + tiles[x][y].state);
    }
</script>
        
    </body>
</html>

