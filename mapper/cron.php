<?php

require('inc.globals.php');

# recursively remove a directory
function rrmdir($dir) {
    foreach(glob($dir . '/*') as $file) {
        if(is_dir($file))
            rrmdir($file);
        else
            unlink($file);
    }
    rmdir($dir);
}

# used to calculate time elapsed
function getTime() { 
	$a = explode (' ',microtime()); 
	return(double) $a[0] + $a[1]; 
} 





$automate = true;

// Empty the build directory.
if(is_dir($buildDir)) rrmdir($buildDir);
mkdir($buildDir);

$Start = getTime();
require('dump-map-tiles.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('merge-maps.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('process-map.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";


?>
