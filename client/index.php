<!DOCTYPE html>
<html>
<head>
	 <script type="text/javascript" src="http://code.jquery.com/jquery-1.4.2.js" ></script>
	 <script type="text/javascript" src="getUsernameFromURL.js" ></script>
	 <?php
		  if($_SERVER["SERVER_NAME"]!="commins.ca")
		  {
			  $socketHost = '192.168.1.70';
			  $socketPort = 9090;
		  }
		  else
		  {
			  $socketHost = 'h.commins.ca';
			  $socketPort = 9090;
		  }
		  
		  echo "<script type=\"text/javascript\" src=\"http://".$socketHost.":".$socketPort."/socket.io/socket.io.js\"></script>\n";
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
			   <input type="text" id="input" autocomplete="off"></input>
		  </div>
	</div>
</body>
</html>
