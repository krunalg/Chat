<?php


if($_SERVER["SERVER_NAME"]!="commins.ca" && $_SERVER["SERVER_NAME"]!="pixelfuse.net")
{
  $socketHost = '127.0.0.1';
  $socketPort = 9090;
}
else
{
  $socketHost = 'h.commins.ca';
  $socketPort = 9090;
}


?>