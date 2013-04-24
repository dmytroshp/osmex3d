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
    $sql = "SELECT * FROM figurecategory
        INNER JOIN figuretype 
        ON figuretype.id_figurecategory = figurecategory.id_figurecategory
        ORDER BY name_figurecategory, name_figuretype ASC";
}
else
{
    $sql = "SELECT * FROM figurecategory
            INNER JOIN figuretype 
            ON figuretype.id_figurecategory = figurecategory.id_figurecategory
            WHERE name_figuretype LIKE '%".  mysql_real_escape_string($req)."%';";
}
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    $test['name'] = $row['name_figuretype'];
    $test['previewFileName'] = $row['id_figuretype'].'_'.$row['name_figuretype'];
    $array[$row['name_figurecategory']][]=$test;
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
