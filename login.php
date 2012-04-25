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





// return JSON of all user names
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

?>