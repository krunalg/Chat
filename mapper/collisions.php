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

if( !isset($_GET['ts']) && !isset($_POST['tiles']) )
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
    echo '<select name="ts" multiple="multiple" style="height: 400px">' . "\n";
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
else if( isset($_GET['ts']) )
{
    /*
     * Second Page: Display map
     *
     */
    
    // previously saved collisions will be needed later
    $collisions = getCollisionsFromFile($globalCollisionsFile); // read from file
    $collisions = buildHashIndexCollisions($collisions); // use hashes as indexes
    
    // create save button
    echo '<input type="button" value="Save" onclick="save();" '.
         'style="position: absolute; top: 0; left: 0;" />';
    
    $ts = $_GET['ts'];
    
    $size = getimagesize($ts);
    $width = $size[0]; // width in px of map
    $height = $size[1]; // height in px of map
    $widthInTiles = $width/$globalTilesize;
    $heightInTiles = $height/$globalTilesize;
    
    // load map for grabbing hashes
    $map = LoadPNG($ts);
    
    // comment slashes so background image loads
    $ts = str_replace('\\', "\\\\", $ts);
    
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
            $collision = 0;
            if(isset($collisions[$hash])) $collision = $collisions[$hash];
            echo 'tiles['.$x.']['.$y.'] = new Object();'."\n";
            echo 'tiles['.$x.']['.$y.'].hash = "'.$hash.'";'."\n";
            echo 'tiles['.$x.']['.$y.'].collision = '.$collision.';';
        }
    }
    echo '</script>' ."\n";
    echo '<!-- ending tile hash values -->' ."\n\n";
    
    // create main map div w/ bg
    echo '<div style="'.
        'background: url(\''.$ts.'\'); '.
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
     * Third Page: Write tile hashes and collision data to file
     *
     */
    
    // create array of old collisions
    $oldCollisions = getCollisionsFromFile($globalCollisionsFile);
    
    // build collisions array with hashes as indexes
    $collisions = buildHashIndexCollisions($oldCollisions);
    
    // create array of new collisions
    $newCollisions = prepCollisions($_POST['tiles']);
    
    // update collisions array
    for($i=0; $i<count($newCollisions); $i++)
    {
        // use hash for index so no duplicates
        $collisions[ $newCollisions[$i][0] ] = $newCollisions[$i][1];
    }
    
    $fileDump = ' '; // at the very least we will write a space
                     // we don't want to write nothing because then it appears
                     // that the file_put_contents failed
                     
    foreach($collisions as $key => $value)
        if($value!=0) // ignore regular walkable tiles (magic numbers are bad!)
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
    <?php
    $stateIndex = 0;
    for($i=0; $i<count($globalCollisions); $i++)
    {
        echo 'tileStates.push('.$i.');';
    }
    ?>
    
    var save = function()
    {
        var dump = '';
        for(var x in tiles)
        {
            for(var y in tiles[x])
            {
                //if(tiles[x][y].collision!=0)
                    // dump even the walkable tiles because we need to be able to convert tiles to walkable
                    dump = dump + tiles[x][y].hash + ":" + tileStates[tiles[x][y].collision] + "\n";
                //else
                    ;//dump = dump + "Added the following dummy data instead: " + tiles[i][j].collision + "\n";
            }
        }
        post_to_url('collisions.php', {'tiles': dump} );
    }
    
    var tileClicked = function(x, y)
    {
        tiles[x][y].collision++; // next collision in cycle
        if(tiles[x][y].collision>=tileStates.length)
            tiles[x][y].collision = 0; // restart cycle if need be
        
        tileOver(x,y); // update displayed image
        
        // update others with same hash
        var othersCollision = tiles[x][y].collision;
        var othersHash = tiles[x][y].hash;
        for(var othersX in tiles)
        {
            for(var othersY in tiles[x])
            {
                if(tiles[othersX][othersY].hash==othersHash)
                {
                    tiles[othersX][othersY].collision = othersCollision;
                    tileOut(othersX, othersY);
                }
            }
        }
    }
    
    var tileOver = function(x, y)
    {
        var img = '';
        switch(tileStates[tiles[x][y].collision])
        {
            <?php
            $stateIndex = 0;
            foreach($globalCollisions as $state)
            {
                echo 'case ' . $stateIndex . ':' . "\n" .
                        'img = \''.$state['mouseoverImg'].'\';' . "\n" .
                        'break;' . "\n";
                $stateIndex++;
            }
            ?>
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper collision type: " + tiles[x][y].collision);
    }
    
    var tileOut = function(x, y)
    {
        var img = '';
        switch(tileStates[tiles[x][y].collision])
        {
            <?php
            $stateIndex = 0;
            foreach($globalCollisions as $state)
            {
                echo 'case ' . $stateIndex . ':' . "\n" .
                        'img = \''.$state['mouseoutImg'].'\';' . "\n" .
                        'break;' . "\n";
                $stateIndex++;
            }
            ?>
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper collision type: " + tiles[x][y].collision);
    }
</script>
        
    </body>
</html>

