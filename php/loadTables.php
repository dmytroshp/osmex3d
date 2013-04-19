<?php
global $array;
$db = mysql_connect('localhost', 'root', '');
if (!$db) {
    die('Ошибка соединения: ' . mysql_error());
}
echo 'Success';
echo "<br>";
mysql_select_db('3d_schema',$db) or die('Could not select database.');
$sql = "SELECT * FROM figuretype";
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    echo $row['nameFigureType'];
    echo "<br>";
}
$sql = "SELECT COUNT(*) FROM figuretype";
$query = mysql_query($sql, $db);
$row = mysql_fetch_array($query);
echo $row[0];
mysql_close($db);
?>
