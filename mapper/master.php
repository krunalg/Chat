<?php

ini_set('memory_limit','512M');
set_time_limit(300);

include('inc.globals.php');
require('required.php');

// get a list of all maps
$maps = scanFileNameRecursivly($globalMapDir, $globalTilesheetFile);

// check if the map has been processed yet or not
for($i=0; $i<count($maps); $i++)
{
    $mapPath = explode(DIRECTORY_SEPARATOR, $maps[$i]);
    $mapDirectory = '';
    // remove just the filename, leaving us with files directory
    for($j=0; $j < (count($mapPath) - 1) ; $j++)
        $mapDirectory = $mapDirectory . $mapPath[$j] . DIRECTORY_SEPARATOR;
    echo $mapDirectory . "<br>\n";
}



?>