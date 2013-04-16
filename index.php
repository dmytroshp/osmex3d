<?php
global $array;
$db = mysql_connect('localhost', 'root', '');
if (!$db) {
    die('Ошибка соединения: ' . mysql_error());
}
mysql_select_db('3d_schema',$db) or die('Could not select database.');
$sql = "SELECT * FROM figuretype
        INNER JOIN figureinst 
        ON figuretype.idFigureType = figureinst.idFigureType
        ORDER BY nameFigureInst, nameFigureType ASC";
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    $test['name'] = $row['nameFigureInst'];
    $test['previewFileName'] = $row['idFigureInst'].'_'.$row['nameFigureInst'];
    $array[$row['nameFigureType']][]=$test;
}
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
            $(document).ready(function(){
                $();
            });
            var bigImg;
            var isToggled;
            var isShown;
            function showBigImg(image){
                if(isToggled)
                return;
                var mask = image.src;
                mask=mask.substring(0, mask.length-9);
                mask+=".png";
                //bigImg = document.createElement('div');
                //bigImg.style.display='block';
                //bigImg.className="previewDiv";
                //bigImg.innerHTML="<img src='"+mask+"'></div>";
                image.parentElement.parentElement.children[image.parentElement.parentElement.children.length-1].innerHTML="<img src='"+mask+"'>";
                image.parentElement.parentElement.children[image.parentElement.parentElement.children.length-1].style.display='block';
            }
            function hideBigImg(image){
                    image.parentElement.parentElement.children[image.parentElement.parentElement.children.length-1].style.display='none';
                    image.parentElement.parentElement.children.removeChild(image.parentElement.parentElement.children.length-1);
            }
            function show(image){
                if(isShown){
                    image.style.opacity=1.0;
                    isShown=false;
                    isToggled=false;
                    return;
                }
                for(var i=0;i<image.parentElement.parentElement.children.length-1;i++)
                image.parentElement.parentElement.children[i].children[0].style.opacity=1.0;
                image.style.opacity=0.5;
                isShown=true;
                isToggled=true;
            }
            $(function ()
            {
                $("#accordion").accordion({
                    heightStyle: "content",
                    collapsible: true
                });
            });
        </script>
    </head>
        <body>
            <div id="mainContainer">
                <div id="content">
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
                </div>
                <div id="sidebar">
                    <div id="searchDivc" style="margin-right: 10px; padding-right: 10px;padding-left: 5px;padding-bottom: 10px;">
                        Search: <input type="search" style="width:86%">
                    </div>
                    <div id ="accordionContainer">
                    <div id="accordion">
                        <?php
                        global $array;
                        foreach ($array as $nameFigureType => $instances) {
                            echo '<h3>'.$nameFigureType.'('.sizeof($instances).')</h3>';                           
                            echo '<div class="contentContainer">';
                            for($i=0;$i<sizeof($instances);$i++)
                            {
                                echo '<div class=imgContainer>';
                                echo '<img src="previews/'.$instances[$i]['previewFileName'].'_mini.png" onmouseout="hideBigImg(this)" onmouseover="showBigImg(this)" onclick="show(this)">';
                                echo '<div class=desc>';
                                echo $instances[$i]['name'];
                                echo '</div></div>';
                            }
                            
                            echo'<div class="previewDiv"></div>';
                            echo '</div>';   
                        }
                        ?>
                    </div>
                </div>
        </div>
            </div>
    </body>
</html>
