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
                var heightObj = $(window).height()*0.95;
                $("#sidebar").css("height", heightObj);
                $("#content").css("height", heightObj);
                $(".accordion").css("font-family", "verdana");
                $(".flip").click(function(){
                    $(this).next(".slidingPanel").slideToggle(500);
                });
                $("#objectEditor").tabs();
                $("#objectEditor").height($("#content").height() - 8);
                $(".prev").mouseenter(function (){
                    var position = $(this).position();
                    var src = $(this).attr("src");
                    var res = src.substring(0, src.length-9);
                    var ending = ".png";
                    res+=ending;
                    $("#sidebar").append('<div id="fullPic"><img src='+res+' height=128 width=128></div>');
                    $("#fullPic").css("top", position.top+"px").css("left", (position.left+60)+"px").fadeIn("slow");
                    
                });
                $(".prev").mouseleave(function (){
                  $("#fullPic").remove();
                });
                $("#searchInput").keypress(function (){
                    $.ajax({
                        url:"php/search.php?q="+$("#searchInput").val(),
                        async: true,
                        cache: false,
                        success:function(result){
                            $(".accordion").empty();
                            $(".accordion").html(result);
                            $(".flip").click(function(){
                    $(this).next(".slidingPanel").slideToggle(500);
                });
                $(".prev").mouseenter(function (){
                    var position = $(this).position();
                    var src = $(this).attr("src");
                    var res = src.substring(0, src.length-9);
                    var ending = ".png";
                    res+=ending;
                    $("#sidebar").append('<div id="fullPic"><img src='+res+' height=128 width=128></div>');
                    $("#fullPic").css("top", position.top+"px").css("left", (position.left+60)+"px").fadeIn("slow");
                    
                });
                $(".prev").mouseleave(function (){
                  $("#fullPic").remove();
                });
                        }
                    });
                });
                
            });
        </script>
    </head>
        <body>
            <div id="mainContainer">
                <div id="sidebar">
		    <div id="logo"><img src="img/logo.jpg" height="50" width="100"></div>
                    <div id="searchDivc">
                        <img src="img/searchIcon.png"> <form><input id="searchInput" type="search"></form>
                    </div>
                    <div id="accordionContainer">
                    <div class="accordion ui-widget ui-widget-content ui-corner-all">
                        <?php
                        global $array;
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
                    </div>
                    </div>
        </div>
                <div id="content">
                    <div id="objectEditor">
                        <ul>
                            <li><a href="#map">Map</a></li>
                            <li><a href="#geoBuilder">Geometry Builder</a></li>
                            <li><a href="#txtBuilder">Texture Builder</a></li>
                        </ul>
                        <div id="map"></div>
                        <div id="geoBuilder"></div>
                        <div id="txtBuilder"></div>
                    </div>
                </div>
            </div>
    </body>
</html>
