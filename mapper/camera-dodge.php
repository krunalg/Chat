<?php

set_time_limit(300); // 5 minutes
ini_set('memory_limit','512M'); 


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms

// Get all camera-dodges.
if($_POST['action']=='read') {

    if(file_exists($globalCameraDodgeJSON)) {

        $file_contents = file_get_contents($globalCameraDodgeJSON);
        echo $file_contents;
    }

    // No JSON file.
    else die('{}');
}

// Save new state.
else if($_POST['action']=='write') {

    $x = $_POST['x'];
    $y = $_POST['y'];
    $state =  strtolower( trim( $_POST['state'] ) );

    // Validate data.
    if(!is_numeric($x) || !is_numeric($y)) die('X and Y must both be numerical.');
    if($state!='left' && $state!='up' && $state!='right' && $state!='down') die('Not a valid state.');

    if(file_exists($globalCameraDodgeJSON)) {

        $file_contents = file_get_contents($globalCameraDodgeJSON);
        $file_as_object = json_decode($file_contents);

        // Add new information.
        $file_as_object[$x][$y] = $state;

        // Write new JSON.
        $new_file_contents = json_encode($file_as_object);
        writeTextToFile($globalCameraDodgeJSON, $new_file_contents);
    }
}

// Remove a camera dodge.
else if($_POST['action']=='delete') {

    $x = $_POST['x'];
    $y = $_POST['y'];

    // Validate data.
    if(!is_numeric($x) || !is_numeric($y)) die('X and Y must both be numerical.');

    if(file_exists($globalCameraDodgeJSON)) {

        $file_contents = file_get_contents($globalCameraDodgeJSON);
        $file_as_object = json_decode($file_contents);

        unset ($file_as_object[$x][$y]);

        // Write new JSON.
        $new_file_contents = json_encode($file_as_object);
        writeTextToFile($globalCameraDodgeJSON, $new_file_contents);
    }
}

// Invalid selection.
else die('You must either read, write, or delete.');

?>