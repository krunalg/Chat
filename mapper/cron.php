<?php

require_once('inc.globals.php');
require_once('inc.functions.php');

# used to calculate time elapsed
function getTime() { 
	$a = explode (' ',microtime()); 
	return(double) $a[0] + $a[1]; 
} 





$automate = true;

// Empty the build directory.
if(is_dir($buildDir)) rrmdir($buildDir);
mkdir($buildDir);

$StartTotal = $Start = getTime();



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

$Start = getTime();
require('merge-map-tiles.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('get-collision-types.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('generate-map.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('border-change.php');
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('animations.php');
$End = getTime();
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";

$Start = getTime();
require('require-maps.php');
$End = getTime();
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs";



$EndTotal = getTime(); 
echo "<script>alert('Success! Total time taken = ".number_format(($EndTotal - $StartTotal),2)." secs');</script>";


?>
