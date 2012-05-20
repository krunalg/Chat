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
     * First Page: Select a tilesheet
     *
     */
    
    // get a list of all tilesheets
    $tilesheets = scanFileNameRecursivly($globalMapDir, $globalTilesheetFile);
    
    // start html form
    echo '<form method="get">';
    
    // echo html form element
    echo '<select name="ts" multiple="multiple">' . "\n";
        for($i=0; $i<count($tilesheets); $i++)
        {
            $explode = explode('\\', $tilesheets[$i]);
            $fileName = $explode[count($explode)-1];
            $dirName = $explode[count($explode)-2];
            if($i==0) $selected = 'selected="selected" '; else $selected = '';
            echo '<option '.$selected.'value="'.$tilesheets[$i].'">'.$dirName.'</option>' . "\n";
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
     * Second Page: Make changes
     *
     */
      
    
}
else if( isset($_POST['tiles']) )
{
    /*
     * Third Page: Write changes
     *
     */
    
    
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
    
    var collisionTypes = new Array();
    collisionTypes.push(<?php echo $collisionWalkable ?>);
    collisionTypes.push(<?php echo $collisionNoWalk ?>); 
    collisionTypes.push(<?php echo $collisionLeft ?>); 
    collisionTypes.push(<?php echo $collisionRight ?>); 
    collisionTypes.push(<?php echo $collisionUp ?>); 
    collisionTypes.push(<?php echo $collisionDown ?>);
    
    var save = function()
    {
        var dump = '';
        for(var x in tiles)
        {
            for(var y in tiles[x])
            {
                if(tiles[x][y].collision!=0)
                    dump = dump + tiles[x][y].hash + ":" + collisionTypes[tiles[x][y].collision] + "\n";
                else
                    ;//dump = dump + "Added the following dummy data instead: " + tiles[i][j].collision + "\n";
            }
        }
        post_to_url('collisions.php', {'tiles': dump} );
    }
    
    var tileClicked = function(x, y)
    {
        tiles[x][y].collision++; // next collision in cycle
        if(tiles[x][y].collision>=collisionTypes.length)
            tiles[x][y].collision = 0; // restart cycle if need be
        
        tileOver(x,y); // update displayed image
    }
    
    var tileOver = function(x, y)
    {
        var img = '';
        switch(collisionTypes[tiles[x][y].collision])
        {
            case <?php echo $collisionWalkable ?>:
                img = '<?php echo $collisionWalkableMouseoverImg ?>';
                break;
            case <?php echo $collisionNoWalk ?>:
                img = '<?php echo $collisionNoWalkMouseoverImg ?>';
                break;
            case <?php echo $collisionLeft ?>:
                img = '<?php echo $collisionLeftMouseoverImg ?>';
                break;
            case <?php echo $collisionRight ?>:
                img = '<?php echo $collisionRightMouseoverImg ?>';
                break;
            case <?php echo $collisionUp ?>:
                img = '<?php echo $collisionUpMouseoverImg ?>';
                break;
            case <?php echo $collisionDown ?>:
                img = '<?php echo $collisionDownMouseoverImg ?>';
                break;
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper collision type: " + tiles[x][y].collision);
    }
    
    var tileOut = function(x, y)
    {
        var img = '';
        switch(collisionTypes[tiles[x][y].collision])
        {
            case <?php echo $collisionWalkable ?>:
                img = '<?php echo $collisionWalkableMouseoutImg ?>';
                break;
            case <?php echo $collisionNoWalk ?>:
                img = '<?php echo $collisionNoWalkMouseoutImg ?>';
                break;
            case <?php echo $collisionLeft ?>:
                img = '<?php echo $collisionLeftMouseoutImg ?>';
                break;
            case <?php echo $collisionRight ?>:
                img = '<?php echo $collisionRightMouseoutImg ?>';
                break;
            case <?php echo $collisionUp ?>:
                img = '<?php echo $collisionUpMouseoutImg ?>';
                break;
            case <?php echo $collisionDown ?>:
                img = '<?php echo $collisionDownMouseoutImg ?>';
                break;
        }
        if(img!='') $('#x'+x+'y'+y).css('background-image', 'url("'+img+'")');
        else window.alert("Tile " + x + "," + y + " has improper collision type: " + tiles[x][y].collision);
    }
</script>
        
    </body>
</html>

