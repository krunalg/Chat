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

        <div>

            <label for="user">What is your name?</label><br />

            <input type="text" id="user" name="user" />

            <input type="hidden" id="socketHost" name="socketHost" value="<?php echo $socketHost; ?>" />

            <input type="hidden" id="socketPort" name="socketPort" value="<?php echo $socketPort; ?>" />

        </div>

        <input type="submit" />

    </form>

</body>

</html>
