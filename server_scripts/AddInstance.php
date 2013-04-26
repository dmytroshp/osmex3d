<?php
require_once 'config.php';

if($connection===FALSE || $select_db===FALSE)
    die("MySQL error.");

$object_uid = $_POST['uid'];
$object_scaleX = $_POST['scaleX'];
$object_scaleY = $_POST['scaleY'];
$object_scaleZ = $_POST['scaleZ'];
$object_rotationX = $_POST['rotationX'];
$object_rotationY = $_POST['rotationY'];
$object_rotationZ = $_POST['rotationZ'];
$object_positionLat = $_POST['positionLat'];
$object_positionLon = $_POST['positionLon'];
$object_positionHeight = $_POST['positionHeight'];
$object_referID = $_POST['objectType'];
$object_isDeleted = $_POST['isDeleted'];

if ($object_uid == 0) {
    $INSERT_OBJECT = "INSERT INTO objectInstance VALUE (NULL, " . $object_scaleX . ", "
            . $object_scaleY . ", " . $object_scaleZ . ", " . $object_rotationX . ", " . $object_rotationY . ", "
            . $object_rotationZ . ", " . $object_positionLat . ", " . $object_positionLon . ", " . $object_positionHeight .
             ", " . $object_referID . ");";
    mysql_query($INSERT_OBJECT);
    //$db->exec($INSERT_OBJECT);
} else if ($object_isDeleted == True) {
    mysql_query("DELETE FROM objectInstance WHERE id = " . $object_uid . ";");
    //$db->exec("DELETE FROM objectInstance WHERE id = " . $object_uid . ";");
} else {
    mysql_query("UPDATE objectInstance SET scaleX=" . $object_scaleX . ", scaleY=" . $object_scaleY . ", scaleZ="
            . $object_scaleZ . ", rotationX=" . $object_rotationX . ", rotationY=" . $object_rotationY . ", rotationZ="
            . $object_rotationZ . ", positionLat=" . $object_positionLat . ", positionLon=" . $object_positionLon
            . ", ObjectID=" . $object_referID . ", positionHeight=" . $object_positionHeight . " WHERE id=" 
            . $object_uid . ";");
    /*$db->exec("UPDATE objectInstance SET scaleX=" . $object_scaleX . ", scaleY=" . $object_scaleY . ", scaleZ="
            . $object_scaleZ . ", rotationX=" . $object_rotationX . ", rotationY=" . $object_rotationY . ", rotationZ="
            . $object_rotationZ . ", positionLat=" . $object_positionLat . ", positionLon=" . $object_positionLon
            . ", ObjectID=" . $object_referID . " WHERE id=" . $object_uid . ";");*/
}
echo "Success!";
?>