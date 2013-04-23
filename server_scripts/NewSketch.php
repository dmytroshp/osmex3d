<?php
//$body=  file_get_contents('php://input');
//echo $body."<br>";
//$phpObject=  json_decode($body);
//print_r($_POST);
$name = $_POST['name'];
$category = $_POST['category'];
$serializedGeometry = $_POST['geometry'];
$url = $_POST['dataUrl'];
//echo serialize($serializedGeometry);
//print_r($serializedGeometry);

$link = mysql_connect('127.0.0.1', 'root', '');
if (!$link) {
    echo "Error";
    die('РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ: ' . mysql_error());
}

$db_selected = mysql_select_db('osmex3d', $link);
if (!$db_selected) {
    echo "Die!";
    die('РќРµ СѓРґР°Р»РѕСЃСЊ РІС‹Р±СЂР°С‚СЊ Р±Р°Р·Сѓ osmex3d: ' . mysql_error());
}

$q = sprintf("SELECT COUNT(*) FROM objecttype WHERE name='%s'", mysql_real_escape_string($name));
$result = mysql_query($q);
$count = mysql_fetch_array($result);
mysql_free_result($result);

if ($count[0] == 0) {
    $query = sprintf("INSERT INTO objectcategory ( id, name ) VALUES(NULL, '%s')", mysql_real_escape_string($category));
    mysql_query($query);

    $q = sprintf("SELECT id FROM objectcategory WHERE name='%s'", mysql_real_escape_string($category));
    $result = mysql_query($q);
    $id = mysql_fetch_array($result);
    mysql_free_result($result);
    $i = $id['id'];
    
    $query = sprintf("INSERT INTO objecttype ( name, CategoryID, geometryStr ) VALUES('%s', ".$i.", '%s')", mysql_real_escape_string($name), mysql_real_escape_string(serialize($serializedGeometry)));
    mysql_query($query);
    echo "Success";
    
} else {
    echo "Error.\nYou need to change figure's name.";
}

mysql_close($link);
?>
