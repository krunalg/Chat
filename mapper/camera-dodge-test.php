<?php

set_time_limit(300); // 5 minutes
ini_set('memory_limit','512M'); 


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms


$tests = array(

    0 => array(         'x'     => 128,
                        'y'     => 256,
                        'state' => 'left'
    ),
    1 => array(         'x'     => 256,
                        'y'     => 512,
                        'state' => 'down'
    ),
    2 => array(         'x'     => 512,
                        'y'     => 1024,
                        'state' => 'right'
    ),
);

$testTypes = array('write', 'delete');

for($t=0; $t<count($testTypes); $t++) {

    for($i=0; $i<count($tests); $i++) {

        echo "<a href=\"javascript:post_to_url( 'camera-dodge.php',
            { 
                'action': '".$testTypes[$t]."',
                'x': " . $tests[$i]['x'] .",
                'y': " . $tests[$i]['y'] .",
                'state': '" . $tests[$i]['state'] ."'
            } );\" >Try to " . $testTypes[$t] . " " . $i ."</a><br>";        
    }

    echo "<br>";
}   

?>