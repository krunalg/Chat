<?php

set_time_limit(300); // 5 minutes
ini_set('memory_limit','512M'); 


include('inc.globals.php');
require('inc.functions.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms

?>


<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'write',
            'x': 256,
            'y': 1024,
            'state': 'left'
        } );" >Try writing 1.</a><br>

<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'write',
            'x': 256,
            'y': 512,
            'state': 'right'
        } );" >Try writing 2.</a><br>

<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'delete',
            'x': 128,
            'y': 1024,
            'state': 'down'
        } );" >Try writing 3.</a><br>

<br>

<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'delete',
            'x': 256,
            'y': 1024
        } );" >Try deleting 1.</a><br>

<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'delete',
            'x': 256,
            'y': 512
        } );" >Try deleting 2.</a><br>

<a href="javascript:post_to_url( 'camera-dodge.php',
        { 
            'action': 'delete',
            'x': 128,
            'y': 1024
        } );" >Try deleting 3.</a><br>