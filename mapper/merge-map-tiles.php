<?php 
function getTime() 
    { 
    $a = explode (' ',microtime()); 
    return(double) $a[0] + $a[1]; 
    } 
$Start = getTime(); 
?>


<?php

set_time_limit(300);
ini_set('memory_limit','512M'); // and use a lot of memory


include('inc.globals.php');
require('required.php');
echo '<script type="text/javascript" src="inc.functions.js" ></script>'; // used for submitting forms






<?php 
$End = getTime(); 
echo "<br><br>Time taken = ".number_format(($End - $Start),2)." secs"; 
?>
