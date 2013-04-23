<?php
global $array;
$db = mysql_connect('localhost', 'root', 'root');
if (!$db) {
    die('Ошибка соединения: ' . mysql_error());
}
mysql_select_db('osmex3d',$db) or die('Could not select database.');
$sql = "SELECT * FROM figurecategory
        INNER JOIN figuretype 
        ON figuretype.id_figurecategory = figurecategory.id_figurecategory
        ORDER BY name_figurecategory, name_figuretype ASC";
$query = mysql_query($sql, $db);
while ($row = mysql_fetch_array($query)) {
    $test['name'] = $row['name_figuretype'];
    $test['previewFileName'] = $row['id_figuretype'].'_'.$row['name_figuretype'];
    $array[$row['name_figurecategory']][]=$test;
}
mysql_close($db);

global $landscapeMode,$minlon,$minlat,$maxlon,$maxlat,$mlat,$mlon,$zoom;
if(!isset($_GET['zoom']))
    $landscapeMode='boundary';
else
{
    $landscapeMode='zoom';
    $zoom=intval($_GET['zoom']);
}
$minlon=(isset($_GET['minlon'])&& is_numeric($_GET['minlon']))?$_GET['minlon']:-180;
$minlat=(isset($_GET['minlat'])&& is_numeric($_GET['minlat']))?$_GET['minlat']:-90;
$maxlon=(isset($_GET['maxlon'])&& is_numeric($_GET['maxlon']))?$_GET['maxlon']:180;
$maxlat=(isset($_GET['maxlat'])&& is_numeric($_GET['maxlat']))?$_GET['maxlat']:90;
$mlat=(isset($_GET['mlat'])&& is_numeric($_GET['mlat']))?$_GET['mlat']:0;
$mlon=(isset($_GET['mlon'])&& is_numeric($_GET['mlon']))?$_GET['mlon']:0;
?>
<!DOCTYPE html>
<html>
    <head>
        <title>OSMEX3D</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" href="css/jqueryui.css" />
        <link rel="stylesheet" href="css/main.css" />
        <script type="text/javascript" src="jquery/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="jquery/jquery-ui.js"></script>
        <script type="text/javascript">
            <?php
                global $landscapeMode,$minlon,$minlat,$maxlon,$maxlat,$mlat,$mlon,$zoom;
                echo<<<HERE
                    var landscapeMode='$landscapeMode';
                    var minlon=$minlon;
                    var minlat=$minlat;
                    var maxlon=$maxlon;
                    var maxlat=$maxlat;
                    var mlon=$mlon;
                    var mlat=$mlat;
HERE;
            ?>
            var searchbar_template="<div id='searchbar'>\
                <div id='searchbar_header'>\
                    &nbsp;<h6>Search results</h6><a class='close_link' href='#'>Close</a>\
                </div>\
                <div id='searchbar_content'>\
                    <h6>Results from <a href='http://nominatim.openstreetmap.org/'>OpenStreetMap Nominatim</a></h6>\
                    <div id='nominatium'>\
                    </div>\
                    <h6>Results from <a href='http://www.geonames.org/'>GeoNames</a></h6>\
                    <div id='geonames'>\
                    </div>\
                </div>\
             </div>";
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
                $("#searchInput").keyup(function (){
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
                //var searchbar=$(searchbar_template);
                //searchbar.insertAfter('#objectEditor ul');
                $("#osmSearchForm").submit(function(){
                    if($('#searchbar').size()==0)
                    {
                        $("#objectEditor div").css({'margin-left':'250px'});
                        var searchbar=$(searchbar_template);
                        searchbar.insertAfter('#objectEditor ul');
                        //$('#searchbar').next().css({'margin-left':'250px'});
                        $(".close_link").click(function(){
                            //$('#searchbar').next().css({'margin-left':'0px'});
                            $("#objectEditor div").css({'margin-left':'0px'});
                            $('#searchbar').remove();
                        });
                    }
                    $("#nominatium").html('<br><center><img align="center" src="img/searching.gif"/></center>');
                    $("#geonames").html('<br><center><img align="center" src="img/searching.gif"/></center>');
                    $.ajax({
                        url:"search.php?q="+$("#query").val(),
                        async: true,
                        cache: false,
                        dataType:'json',
                        success:function(result){
                            $("#nominatium").html(result['nominatium']);
                            $("#nominatium ul").next().remove();
                            $("#nominatium ul").next().remove();
                            $("#geonames").html(result['geonames']);
                            $("#geonames ul").next().remove();
                            $("#geonames ul").next().remove();
                            //$(result).appendTo('#nominatium');
                        }
                     });
                     return false;
                });
            });
        </script>
    </head>
        <body>
            <div id="mainContainer">
                <div id="sidebar">
		    <div id="logo"><img src="img/logo.jpg" height="50" width="100"></div>
                    <div id="osmSearch">
                        <form id="osmSearchForm">
                            <input name="commit" type="submit" value="Go">
                            <input autofocus="autofocus" id="query" name="query" placeholder="Search" tabindex="1" type="text" value="">
                        </form>
                    </div>
                    <br>
                    <!--<div id="searchDivc">
                        <img src="img/searchIcon.png"> <form><input id="searchInput" type="search"></form>
                    </div>-->
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
