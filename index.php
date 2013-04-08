<?php
global $array;
$db = mysql_connect('localhost', 'root', '');
if (!$db) {
    die('Ошибка соединения: ' . mysql_error());
}
//echo 'Success';
//echo "<br>";
mysql_select_db('3d_schema',$db) or die('Could not select database.');
$sql = "SELECT * FROM figuretype
        INNER JOIN figureinst 
        ON figuretype.idFigureType = figureinst.idFigureType
        ORDER BY nameFigureInst, nameFigureType ASC";
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    //echo $row['nameFigureType'];
    //echo "<br>";
    $array[$row['nameFigureType']][] = $row['nameFigureInst'];
}
//print_r($array);
//$sql = "SELECT COUNT(*) FROM figuretype";
//$query = mysql_query($sql, $db);
//$row = mysql_fetch_array($query);
//echo $row[0];
mysql_close($db);
?>
<!DOCTYPE html>
<html>
    <head>
        <title>OSMEX3D</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/jqueryui.css" />
        <link rel="stylesheet" href="css/main.css" />
        <script src="jquery/jquery-1.9.1.js"></script>
        <script src="jquery/jquery-ui.js"></script>
        <script>
            $(function()
            {
                $("#accordion").accordion({
                    heightStyle: "content",
                    collapsible: true
                });
            });
        </script>
    </head>
    <body>
        <table width="100%">
            <tr>
                <td id="acctd">
                    <div id="searchDivc" style="margin-right: 10px; padding-right: 10px;padding-left: 5px;padding-bottom: 10px;">
                        <input type="search" style="width: 100%; ">
                    </div>
                    <div id ="accordionContainer">
                        <div id="accordion">
                            <?php
                            global $array;
                            foreach ($array as $nameFigureType => $instances) {
                                echo '<h3>'.$nameFigureType.'('.sizeof($instances).')</h3>';
                                echo '<div class="contentContainer">
                                      <div class="content">
                                      <ul>';
                                for($i=0;$i<sizeof($instances);$i++)
                                {
                                    echo '<img src="img/facebook.png">';
                                    echo '<li>'.$instances[$i].'</li>';
                                }
                                echo '</ul>
                                      </div>
                                      </div>';     
                            }
                            ?>
                        </div>
                    </div>
                    
                </td>
                <td>
                    <div id="objectEditor">
                        Developing GUI for 3D-Editor
                        I develop GUI using HTML, CSS, jQuery, AJAX. Main idea is to select some instances and drag them to editor.
                        Content consists of three parts:
                        <ol>
                            <li>Search</li>
                            <li>Left menu</li>
                            <li>Editor field</li>
                        </ol>
                        User can search different instances. Content (types and instances) will be filtered in a real-time by the word typed in search field.
                        Left menu will contain different types of objects, if you choose some object, first 20 instances of this objects will be shown, if you scroll down, next 20 instances will be shown (AJAX). 
                        After selecting the instance, user can drag and drop it to editor field.
                    </div>
                </td>
            </tr>
        </table>
        <!--<div id="searchDiv">
            <input id="search" type="search" placeholder="Search...">
        </div> -->
    </body>
</html>
