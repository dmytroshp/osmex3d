<?php
include 'include/image_thumbnail.php';
define("TEXTURE_PATH","./textures");
define("TWIDTH",96);
define("THEIGHT",96);

$db=  mysql_connect('localhost', 'root', 'root');
$r=mysql_select_db("osmex3d");

$body = file_get_contents('php://input');
$pack=  json_decode($body,true);
if($pack===FALSE || $pack===NULL)
{
    $response['success']=false;
    $response['message']="Error: can't decode data.";
    echo json_encode($response);
    exit;
}
if($db===FALSE || $r===FALSE)
{
    $response['success']=false;
    $response['message']="Database error.";
    echo json_encode($response);
    exit;
}
if(count($pack)==0)
{
    $response['success']=false;
    $response['message']="Nothing to save.";
    echo json_encode($response);
    exit;
}
foreach ($pack as $region) {
    $textureName=  mysql_real_escape_string($region['name']);
    $texturePoints=  mysql_real_escape_string(serialize($region['points']));
    $query="INSERT INTO textures (TextureName,TexturePoints) VALUES ('$textureName','$texturePoints')";
    $r=mysql_query($query);
    if($r===FALSE)
    {
        $response['success']=false;
        $response['message']="Error: can't add textures to database. ".mysql_error();
        echo json_encode($response);
        exit;
    }
    $uid=  mysql_insert_id();
    $prefix=TEXTURE_PATH."/".$uid."_".$region['name'];
    $pattern="/data:image\/(png|jpeg|jpg|gif|tiff|tif);base64,(.*)/i";
    if(preg_match($pattern, $region['dataurl'],$match))
    {
        $type=$match[1];
        $data=base64_decode($match[2]);
        $handle=  fopen($prefix.".".$type, "w");
        if(!$handle)
        {
            $response['success']=false;
            $response['message']="Error: can't save texture files.";
            echo json_encode($response);
            exit;
        }
        fwrite($handle, $data);
        fclose($handle);
        $image=imagecreatefromstring($data);
        if($image!==FALSE)
        {
            $thumbnail=  image_resize($image, TWIDTH, THEIGHT);
            imagepng($thumbnail, $prefix.'_mini.png');
        }
            
    }
    else
    {
        $response['success']=false;
        $response['message']="Error: unknown data url format.";
        echo json_encode($response);
        exit;
    }
}
$response['success']=true;
$response['message']="Saving completed.";
echo json_encode($response);
?>