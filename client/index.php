<!DOCTYPE html>
<html>
<head>
	 <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
	 <script type="text/javascript" src="getUsernameFromURL.js" ></script>
	 <?php
		  if($_SERVER["SERVER_NAME"]=="192.168.1.95")
			   echo "<script type=\"text/javascript\" src=\"http://192.168.1.95:8080/socket.io/socket.io.js\"></script>\n";
		  else
			   echo "<script type=\"text/javascript\" src=\"http://h.commins.ca:8080/socket.io/socket.io.js\"></script>\n";
	 ?>
	 <script type="text/javascript" src="lib/impact/impact.js"></script>
	 <script type="text/javascript" src="lib/game/main.js"></script>
	 <script type="text/javascript" src="socketClient.php"></script>
	 
	 <title>flaming-sansa</title>
	 <link rel="stylesheet" href="style.css" type="text/css" media="screen" />
</head>
<body>
	<canvas id="canvas"></canvas>
	<div id="chat">
		  <div>
			   <input type="text" id="input"></input>
		  </div>
	</div>
</body>
</html>
