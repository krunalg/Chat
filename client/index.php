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
	 <script type="text/javascript" src="socketClient.js"></script>
	 
	 <title>flaming-sansa</title>
	 <style type="text/css">
		html,body {
			background-color: #000;
			color: #fff;
			font-family: helvetica, arial, sans-serif;
			margin: 0;
			padding: 0;
			font-size: 12pt;
		}
		
		#canvas {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
			border: 1px solid #555;
		}
		#chat {
			position: absolute;
			left: 0;
			/*right: 0;*/
			top: 0;
			/*bottom: 0;*/
			width:300;
			height:300;
			margin: auto;
			border: 1px solid red;
		}
		#input {
		        display: none;
		}
	 </style>
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
