<?php

$socketHost = $_GET['host'];
$socketPort = $_GET['port'];

?>
<!DOCTYPE html>
<html>
<head>
	 <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.2.min.js" ></script>
	 <script type="text/javascript" src="http://<?php echo $socketHost . ':' . $socketPort; ?>/socket.io/socket.io.js"></script>
	 <script type="text/javascript" src="lib/impact/impact.js"></script>
	 <script type="text/javascript" src="lib/game/main.js"></script>
	 <script type="text/javascript">
	 	ig.socket = io.connect('http://<?php echo $socketHost . ':' . $socketPort; ?>');
	 </script>
	 <script type="text/javascript" src="socketClient.js"></script>

	 <title>flaming-sansa</title>
	 <link rel="stylesheet" href="style.css" type="text/css" media="screen" />
</head>
<body>
	<canvas id="canvas"></canvas>
	<div id="chat">
		  <div>
			   <input type="text" id="input" autocomplete="off"></input>
		  </div>
	</div>
</body>
</html>
