<?php

set_time_limit(300); // 5 minutes
ini_set('memory_limit','512M'); 


include('inc.globals.php');
require('inc.functions.php');

function jsonToArray($filepath) {

    $file_contents = file_get_contents($filepath);
    $file_as_object = json_decode($file_contents);

    $tiles = array();

    // Convert into 2D array.
    foreach ($file_as_object as $currentX => $object) {
        foreach ($object as $currentY => $state) {
            $tiles[$currentX][$currentY] = $state;
        }
    }

    return $tiles;
}

$action = $_POST['action'];
$addAction = 'write';
$removeAction = 'delete';

// Read all tiles.
if($action=='read') {

    if(file_exists($globalCameraDodgeJSON)) {

        $file_contents = file_get_contents($globalCameraDodgeJSON);
        echo $file_contents;
    }

    // No JSON file.
    else die('{}');
}

// Add or remove tile.
else if($action=='delete' || $action=='write') {

    $x = $_POST['x'];
    $y = $_POST['y'];
    $state = strtolower( trim( $_POST['state'] ) );

    // Validate data.
    if(!is_numeric($x) || !is_numeric($y)) die('X and Y must both be numerical.');
    if($action==$removeAction) {
        if($state!='left' && $state!='up' && $state!='right' && $state!='down') {
            die('Not a valid state.');
        }
    }

    // Get existing tiles.
    if(file_exists($globalCameraDodgeJSON)) $tiles = jsonToArray($globalCameraDodgeJSON);

    if($action==$addAction) {

        // Add new state.
        $tiles[$x][$y] = $state;
    }

    else if($action==$removeAction) {

        // Remove state from array.
        if(isset($tiles[$x])) {

            unset ($tiles[$x][$y]);

            // Prune empty arrays.
            if(count($tiles[$x])==0) unset($tiles[$x]);
        }
    }
        
    // Write new JSON.
    $new_file_contents = json_encode($tiles);
    writeTextToFile($globalCameraDodgeJSON, $new_file_contents);
}

// Invalid selection.
else die('You must either read, write, or delete.');

?>
