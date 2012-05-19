<?php

include('inc.globals.php');
require('required.php');

// are we allowed to change files?
if( isset($_GET['trim']) && $_GET['trim'] == 'yes' ) $allowTrimming = true;
else $allowTrimming = false;

// get a list of all tilesheets
$tilesheets = findTilesheets($globalMapDir, $globalTilesheetFile);

// check if tilesheets need trimming or not
for($i=0; $i<count($tilesheets); $i++)
{
    $size  = getimagesize($tilesheets[$i]);
    $width = $size[0];
    
    if( ($width - 1) % $globalTilesize == 0)
    // trimming would make tilesheet eveningly
    // divisible by tilesize... a good thing!
    {
        echo $tilesheets[$i] . ' <b style="color: red">needs trimming</b>... ';
        if($allowTrimming) trim1px($tilesheets[$i]);
    }
    else echo $tilesheets[$i] . " does not need trimming... ";
    echo "\n<br />";
}

if(!$allowTrimming) // if trimming disabled, give the option to enable it
  echo "\n<br />" . 'Click <a href="?trim=yes">here</a> to enable trimming.';

?>