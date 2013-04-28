<?php
header('Content-Type: application/json; utf-8');
require_once("config.php");
$rID = $_POST['id'];
$query =  sprintf("SELECT geometryStr FROM objecttype WHERE id=".$rID."");
$result = mysql_query($query);
$str = mysql_fetch_array($result);
mysql_free_result($result);
$geometry = $str['geometryStr'];
$response = unserialize($geometry);
mysql_close($link);
echo json_encode($response);
mysql_close($connection);
?>
