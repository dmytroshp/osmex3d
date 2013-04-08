<?php

    $login_db = 'root';
    $password_db = 'vertrigo';

    try {
        $db = new PDO('mysql:host=localhost;dbname=osmex3d', $login_db, $password_db);
    } catch (PDOException $e) {
        echo $e->getMessage();
    }

    $object_uid = $_GET['uid'];
    $object_scaleX = $_GET['scaleX'];
    $object_scaleY = $_GET['scaleY'];
    $object_scaleZ = $_GET['scaleZ'];
    $object_rotationX = $_GET['rotationX'];
    $object_rotationY = $_GET['rotationY'];
    $object_rotationZ = $_GET['rotationZ'];
    $object_positionLat = $_GET['positionLat'];
    $object_positionLon = $_GET['positionLon'];
    $object_referID = $_GET['objectType'];

    if ($object_uid == 0){
        $INSERT_OBJECT = "INSERT INTO objectInstance VALUE (NULL, ".$object_scaleX.", "
            .$object_scaleY.", ".$object_scaleZ.", ".$object_rotationX.", ".$object_rotationY.", "
            .$object_rotationZ.", ".$object_positionLat.", ".$object_positionLon.", ".$object_referID.");";
        $db->exec($INSERT_OBJECT);
    } else {
        $x = "UPDATE objectInstance SET scaleX=".$object_scaleX.", scaleY=".$object_scaleY.", scaleZ="
            .$object_scaleZ.", rotationX=".$object_rotationX.", rotationY=".$object_rotationY.", rotationZ="
            .$object_rotationZ.", positionLat=".$object_positionLat.", positionLon=".$object_positionLon
            .", ObjectID=".$object_referID." WHERE id=".$object_uid.";";
        echo $x;
        $db->exec($x);
    }

    $db = NULL;
?>
