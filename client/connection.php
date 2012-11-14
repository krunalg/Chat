<?php


if( $_SERVER["SERVER_NAME"]!="commins.ca"
	&& $_SERVER["SERVER_NAME"]!="pixelfuse.net"
	&& $_SERVER["SERVER_NAME"]!="joncom.no-ip.org"
	)
{
  $socketHost = '192.168.1.65';
  $socketPort = 9090;
}
else
{
  $socketHost = 'joncom.no-ip.org';
  $socketPort = 9090;
}


?>