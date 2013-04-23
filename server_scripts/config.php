<?php
// Соединение, выбор базы данных
$link = @mysql_connect("localhost","root","") or die("Could not connect: " . mysql_error());
$dbname = 'osmex3d';
mysql_select_db($dbname);
?>
