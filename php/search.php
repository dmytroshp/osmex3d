<?php
$req = $_GET['q'];

global $array;
$db = mysql_connect('localhost', 'root', '');
if (!$db) {
    die('Ошибка соединения: ' . mysql_error());
}
mysql_select_db('3d_schema',$db) or die('Could not select database.');
if($req=="")
{
    $sql = "SELECT * FROM figuretype
        INNER JOIN figureinst 
        ON figuretype.idFigureType = figureinst.idFigureType
        ORDER BY nameFigureInst, nameFigureType ASC";
}
else
{
    $sql = "SELECT * FROM figuretype
        INNER JOIN figureinst 
        ON figuretype.idFigureType = figureinst.idFigureType
        WHERE nameFigureInst LIKE '".$req."%';";
}
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    $test['name'] = $row['nameFigureInst'];
    $test['previewFileName'] = $row['idFigureInst'].'_'.$row['nameFigureInst'];
    $array[$row['nameFigureType']][]=$test;
}
mysql_close($db);
if(sizeof($array)<=0)
{
    echo "no objects found";
    return;
}
foreach ($array as $nameFigureType => $instances) {
echo '<div class="flip ui-widget ui-widget-header ui-corner-all">'.$nameFigureType.'('.sizeof($instances).')</div>';                           
echo '<div class="slidingPanel ui-widget ui-widget-content ui-corner-all" style="display:none;">';
    for($i=0;$i<sizeof($instances);$i++)
    {
        echo '<div class=imgContainer>';
        echo '<img class="prev" src="previews/'.$instances[$i]['previewFileName'].'_mini.png">';
        echo '<div class=desc>';
        echo $instances[$i]['name'];
        echo '</div></div>';
    }
    echo '</div>';   
}

?>
