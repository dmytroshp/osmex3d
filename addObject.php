<?php

    $login_db = 'root';
    $password_db = 'vertrigo';

    try {
        $db = new PDO('mysql:host=localhost;dbname=osmex3d', $login_db, $password_db);
    } catch (PDOException $e) {
        echo $e->getMessage();
    }

    $object_uid = $_GET['uid'];
    $object_preview = $_GET['preview'];
    $object_vertexes = $_GET['vertexes'];
    $object_indexes = $_GET['indexes'];

    if ($object_uid == 0){
        $INSERT_OBJECT = "INSERT INTO objectType VALUE (NULL, '".$object_preview."', '"
            .$object_vertexes."', '".$object_indexes."');";
        $db->exec($INSERT_OBJECT);
    } else {
        $db->exec("UPDATE objectType SET preview='".$object_preview."', vertexes='".$object_vertexes."', indexes='"
            .$object_indexes."' WHERE id=".$object_uid.";");
    }

    $db = NULL;
?>
