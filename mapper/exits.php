<?php

require_once('inc.globals.php');
require_once('inc.functions.php');

?>

<html>
    <head>
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
        <script type="text/javascript" src="inc.functions.js" ></script>
    </head>
    <body>
     

        
<?php

$currentPage = $_SERVER['QUERY_STRING'];
$page1 = '';
$page2 = 'edit';

// Page 1: Select a map
if( $currentPage === $page1 ) {

    // Get list of all maps.
    $maps = scanFileNameRecursivly($globalMapDir, $globalMapFilename);
    
    // Create selection list.
    echo '<form method="post" action="?'.$page2.'">' .
            '<select name="map" multiple="multiple" style="height: 400px">' . "\n";

    for($i=0; $i<count($maps); $i++)
    {
        $dirPath = dirname($maps[$i]);
        $dirName = basename($dirPath);
        $selected = ($i==0 ? 'selected="selected" ' : '');
        
        echo    '<option '.$selected.'value="'.$dirName.'">'.$dirName.'</option>' . "\n";
    }
    
    echo    '</select>' . "\n" . '<br>' . "\n" .
            '<input type="submit">' . "\n" .
        '</form>';

}

?>


        
    </body>
</html>

