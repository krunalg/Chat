<?php

ini_set('memory_limit','512M');
set_time_limit(300);

include('inc.globals.php');
require('required.php');

// get a list of all maps
$tilesheets = scanFileNameRecursivly($globalMapDir, $globalTilesheetFile);





?>