<?php

$socketHost = "localhost";
$socketPort = 9090;

?>
<!DOCTYPE html>

<html>

<head>

     <title>Login</title>

</head>

<body>

    <form action="play.php">

        <label for="user">What is your name?</label><br />

        <input type="text" id="user" name="user" />

        <input type="hidden" name="host" value="<?php echo $socketHost; ?>" />

        <input type="hidden" name="port" value="<?php echo $socketPort; ?>" />

        <input type="submit" />

    </form>

</body>

</html>
