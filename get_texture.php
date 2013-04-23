<?php
define("TEXTURE_PATH","/textures");
$db=  mysql_connect('localhost', 'root', 'root');
$r=mysql_select_db("osmex3d");
$mode=$_GET['mode'];
$response=array();
if($db===FALSE || $r===FALSE)
{
    echo json_encode($response);
    exit;
}
switch($mode)
{
    case 'thumbnails':
        $from=(isset($_GET['from']))?intval($_GET['from']):0;
        $to=(isset($_GET['to']))?intval($_GET['to']):0;
        $query='SELECT UID,TextureName FROM textures LIMIT '.$from.','.$to;
        $res=  mysql_query($query);
        if($res===FALSE) break;
        while($row=  mysql_fetch_array($res))
        {
            $temp=array();
            $temp['uid']=$row['UID'];
            $temp['name']=$row['TextureName'];
            $temp['thumbnail']=TEXTURE_PATH.'/'.$row['UID'].'_'.$row['TextureName'].'_mini.png';
            $temp['image']=TEXTURE_PATH.'/'.$row['UID'].'_'.$row['TextureName'].'.png';
            $response[]=$temp;
        }
        break;
    case 'detail':
        $uid=(isset($_GET['uid']))?intval($_GET['uid']):0;
        $query="SELECT * FROM textures WHERE UID=$uid";
        $res=  mysql_query($query);
        if($res===FALSE) break;
        $row=  mysql_fetch_array($res);
        $response['uid']=$row['UID'];
        $response['name']=$row['TextureName'];
        $response['thumbnail']=TEXTURE_PATH.'/'.$row['UID'].'_'.$row['TextureName'].'_mini.png';
        $response['image']=TEXTURE_PATH.'/'.$row['UID'].'_'.$row['TextureName'].'.png';
        $response['points']=  unserialize($row['TexturePoints']);
        break;
    default:
}
echo json_encode($response);
?>
