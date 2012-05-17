<?php

include('inc.globals.php');
require('required.php');

?>

<html>
    <head>
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
    </head>
    <body>
        
<?php

if($_GET['ts']=='')
{ 
    /*
     * First Page: Select a tilesheet
     *
     */
    
    // get a list of all tilesheets
    $tilesheets = findTilesheets($globalMapDir);
    
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
else
{
    /*
     * Second Page: Display tilesheet
     *
     */
    
    $ts = $_GET['ts'];
    
    $size = getimagesize($ts);
    $width = $size[0]; // width in px of tilesheet
    $height = $size[1]; // height in px of tilesheet
    
    echo "Width: " . $width . "<br>";
    echo "Height: " . $height . "<br>";
    
    // comment slashes so background image loads
    $ts = str_replace('\\', "\\\\", $ts);
    echo "Tilesheet: " . $ts;
    
    // create main tilesheet div w/ bg
    echo '<div style="'.
        'background: url(\''.$ts.'\'); '.
        'position: absolute; '.
        'left: 0px; '.
        'top: 0px; '.
        'width: '.$width.'px;'.
        'height: '.$height.'px;'.
        '">' ."\n";
    
        // fill with many tile-sized divs
        $widthInTiles = $width/$globalTilesize;
        $heightInTiles = $height/$globalTilesize;
        
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
                            '$(\'#x'.$x.'y'.$y.'\').css(\'background-image\', \'url(images/solid.gif)\');'.
                            
                        '" onmouseover="'.
                            '$(\'#x'.$x.'y'.$y.'\').css(\'background-image\', \'url(images/mouseover.png)\');'.
                            
                        '" onmouseout="'.
                            '$(\'#x'.$x.'y'.$y.'\').css(\'background\', \'none\');'.
                        
                        '"></div>' . "\n";
            }
        }
    
    
    echo '</div>'; // close main tilesheet div
    
}

?>


        
    </body>
</html>

