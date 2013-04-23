<?php
include 'include/connect_db.php';
global $array;
$sql = "SELECT Cat.name as 'nameCat', Type.name as 'nameType', Type.id as idType FROM objectcategory Cat
        INNER JOIN objecttype Type
        ON Type.CategoryID = Cat.id
        ORDER BY Cat.name, Type.name ASC";
$query = mysql_query($sql, $connection);
while ($row = mysql_fetch_array($query)) {
    $test['name'] = $row['nameType'];
    $test['previewFileName'] = $row['idType'].'_'.$row['nameType'];
    $array[$row['nameCat']][]=$test;
}
mysql_close($connection);
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
                var flag=1;
                $(".accordionContainer").tabs();
                var heightObj = $(window).height()*0.95;
                $("#sidebar").css("height", heightObj);
                $(".accordionContainer").css("height", heightObj-100);
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
                $("#accSearch").keyup(function (){
                    $.ajax({
                        url:"php/search.php?q="+$("#accSearch").val(),
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
                $("#tabGeo").css("display","none");
                            $("#tabTxt").css("display","none");
                            $("#backBtn").css("display","none");
                            $("#editBtn").val("Edit");
                            $(".accordionContainer").css("display", "none");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width-150);
                            $("#sidebar").width(width-150);
                            $("#content").css("width", "75%");
                            flag=0;
                $("#collapseImg").click(function (){
                    $(".slidingPanel").slideUp("fast");
                });
                $("#backBtn").click(function (){
                    if(flag){
                            $("#tabGeo").css("display","none");
                            $("#tabTxt").css("display","none");
                            $(this).css("display","none");
                            $("#editBtn").val("Edit");
                            $(".accordionContainer").css("display", "none");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width-150);
                            $("#sidebar").width(width-150);
                            $("#content").css("width", "75%");
                            flag=0;
                    }

                });
                $("#editBtn").click(function (){
                    if(!flag){
                        flag=1;
                    $("#tabGeo").css("display","block");
                            $("#tabTxt").css("display","block");
                            $("#backBtn").css("display","block");
                            $("#editBtn").val("Save");
                            $(".accordionContainer").css("display", "block");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width+150);
                            $("#sidebar").width(width+150);
                            $("#content").css("width", "62%");
                    }
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
                    <div class="accordionContainer">
                        <ul>
                        <li><a href="#acc">Sketches</a></li>
                        <li><a href="#txt">Textures</a></li>
                        </ul>
                        <img id="collapseImg" src="img/collapse.png">
                        <input id="accSearch" type="search">
                        <div id="acc" class="accordion ui-widget ui-widget-content ui-corner-all">
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
                                echo '<div class="scrollHelper"></div>';
                            }
                            ?>
                        </div>
                    </div>
                </div>
                <div id="content">
                    <div id="objectEditor">
                        <ul>
                            <li id="tabMap"><a href="#map">Map</a></li>
                            <li id="tabGeo"><a href="#geoBuilder">Geometry Builder</a></li>
                            <li id="tabTxt"><a href="#txtBuilder">Texture Builder</a></li>
                        </ul>
                        <input id="editBtn" type="button" value="Save">
                         <input id="backBtn" type="button" value="Simple View">
                        <div id="map"></div>
                        <div id="geoBuilder"></div>
                        <div id="txtBuilder"></div>
                    </div>
                </div>
            </div>
    </body>
</html>
