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

$automate = true;

// Empty the build directory.
if(is_dir($buildDir)) rrmdir($buildDir);
mkdir($buildDir);

include('dump-map-tiles.php');


?>
