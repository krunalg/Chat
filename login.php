<?php

/////////////////////////////////
// MySQL
/////////////////////////////////
$host = 'localhost';
$user = 'flame';
$pw = 'sansa';
$db = 'flame';

mysql_connect($host, $user, $pw) or die(mysql_error());
if(!isset($_GET['do'])) echo "Connected to MySQL<br />";
mysql_select_db($db) or die(mysql_error());
if(!isset($_GET['do'])) echo "Connected to Database";




// return a list of all players as JSON
if($_GET['do']=="listOfUsers")
{
    // start creation of JSON
    echo '{';
    echo '"users": [';
    
    $query = "SELECT user FROM `users`";
    $result = mysql_query($query);
    $count = 0;
    while ($row = mysql_fetch_array($result))
    {
        if($count!=0) echo ", ";
        echo '{';
        echo '"name": "';
        echo $row['user'];
        echo '"}';
        $count++;
    }
    
    // end creation of JSON
    echo ']}';
    die();

    /* example output
    {
        "users": [
            {
                "name": "joncom"
            },
            {
                "name": "kitti"
            }
        ]
    }
    */
}






// write a player's position & the
// direction he's facing to the database
if($_GET['do']=="writePosition")
{
    // needs to be validated
        $user = $_GET['user'];
        $x = $_GET['x'];
        $y = $_GET['y'];
        $facing = $_GET['facing'];
        
    $query = "UPDATE `users` SET x = $x, y = $y, facing = '$facing' WHERE user = '$user' LIMIT 1";
    $result = mysql_query($query);
    // will return 1 if an entry was updated, 0 otherwise
    die (mysql_affected_rows());
}

// read player's position & the
// direction he's facing from the database
if($_GET['do']=="readPosition")
{
    // needs to be validated
        $user = $_GET['user'];
    
    /*$query = "SELECT user FROM `users`";
    $result = mysql_query($query);
    $count = 0;
    while ($row = mysql_fetch_array($result))
    */
}




// rec


?>