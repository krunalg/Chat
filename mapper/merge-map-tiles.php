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
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


if( !isset($_POST['build']) )
{
    /*
     * First Page: Displays statistics and offer to merge
     *
     */
    
    // get a list of all dumped tiles
    $tiles = scanFileNameRecursivly($globalTileDumpDir);
    
    // report
    echo 'Found <b>'.count($tiles).'</b> in '.$globalTileDumpDir.'...';
    
    if(count($tiles)>=2) // only offer to merge if some exist
    {
        echo "<br><br>\n\n";
        echo '<input type="button" '.
                'value="Merge all into single image" '.
                'onClick="post_to_url( \'\', '. // post to same file ''
                   '{ '.
                       '\'build\': \'all\' '.
                   '} );"/> ';
    }
    else echo "Cannot perform a merge on so few tiles.";
    die(); // prevent execution time from displaying
    
}
else if( isset($_POST['build']) && $_POST['build']=='all' )
{
    /*
     * Second Page: Merges all tiles in dumped tiles folder into one image
     *
     */
    
    die("Merge tiles here.");
}

?>

<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
