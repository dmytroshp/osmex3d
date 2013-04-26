<?php
include './server_scripts/config.php';
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

global $landscapeMode,$minlon,$minlat,$maxlon,$maxlat,$mlat,$mlon,$zoom;
if(!isset($_GET['zoom']))
{
    $landscapeMode='boundary';
    $zoom=0;
}
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
<!--        <link rel="stylesheet" href="css/jqueryui.css" />-->
        <script type="text/javascript" src="jquery/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="jquery/jquery-ui-1.10.2.custom.min.js"></script>
        <script type="text/javascript" src="jquery/jquery.color.js"></script>
        <script type="text/javascript" src="jquery/jquery.Jcrop.min.js"></script>
        
        <script type="text/javascript" src="scripts/TextureBuilder.prototypes.js"></script>
        <script type="text/javascript" src="scripts/TextureBuilder.js"></script>
        
        <link type="text/css" href="css/smoothness/jquery-ui-1.10.2.custom.min.css" rel="stylesheet" />
        <link type="text/css" href="css/jcrop/jquery.Jcrop.min.css" rel="stylesheet" />
        <link type="text/css" href="css/TextureBuilder.css" rel="stylesheet" />
        <link rel="stylesheet" href="css/main.css" />
        
        <script type="text/javascript">
            <?php
                global $landscapeMode,$minlon,$minlat,$maxlon,$maxlat,$mlat,$mlon,$zoom;
                echo<<<HERE
                    landscapeMode='$landscapeMode';
                    minlon=$minlon;
                    minlat=$minlat;
                    maxlon=$maxlon;
                    maxlat=$maxlat;
                    mlon=$mlon;
                    mlat=$mlat;
                    zoom=$zoom;
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
                $(document).tooltip({
                    items: ".prev",
                    content: function(){
                        var src = $(this).attr("src");
                        var res = src.substring(0, src.length-9);
                        var ending = ".png";
                        res+=ending;
                        return "<img class='fullPicture' src='"+res+"'>";
                    },
                    position: {
                        my: "center+150 bottom",
                        at: "center top"
                    }
                });
//         Making tabs from containers                                              
                $(".accordionContainer").tabs();
                //$("#objectEditor").tabs();
//         Calculating height for containers                         
                var heightObj = $(window).height()*0.95;
                $("#sidebar").css("height", heightObj);
                $("#content").css("height", heightObj);
                $(".accordionContainer").css("height", heightObj-100);
                $("#objectEditor").height($("#content").height() - 8);
//         EVENT HANDLERS
//            1. Event handler for flip
                $(".flip").click(function(){
                    $(this).next(".slidingPanel").slideToggle(500);
                });
//            2. Event handler for search input (sketches tab)
                
                // Work area tabs
                var initializator={
                    tabMap:{
                        url:'ajax/landscapeEditor.html',
                        activator:function(){}
                    },
                    tabGeo:{
                        url:'ajax/objectEditor.html',
                        activator:function(){}
                    },
                    tabTxt:{
                        url:'ajax/textureBuilder.html',
                        activator:function(){prepareTextureBuilder();}
                    }
                };
                function forceRefreshPanel(index)
                {
                    var key=$('#objectEditor ul li:eq('+index+')').attr('id');
                    var panel=$('#objectEditor').children('div:eq('+index+')');
                    panel.load(initializator[key].url,'',function(){
                                initializator[key].activator.call(this,index);
                    });
                    $("#objectEditor").tabs({active:index});
                }
                $("#objectEditor").tabs({
                    beforeActivate:function(event, ui){
                        if(ui.newPanel.is(':empty'))
                        {
                            var key=ui.newTab.attr('id');
                            ui.newPanel.load(initializator[key].url,'',function(){
                                initializator[key].activator.call(this,event,ui);
                            });
                        }
                    }
                });
                
                $("#accSearch").keyup(function (){
                    $.ajax({
                        url:"server_scripts/objSearch.php?q="+$("#accSearch").val(),
                        async: true,
                        cache: false,
                        success:function(result)
                        {
                            $(".accordion").empty();
                            $(".accordion").html(result);
                  //    !  Handlers don't work after clearing the accordion, we need to assign it again
                            $(".flip").click(function(){
                                $(this).next(".slidingPanel").slideToggle(500);
                            });          
                        }
                    }); //end of ajax
                }); //end of search input handler
//            3. Event handler for button "Collapse All"  
                $("#collapseImg").click(function (){
                    $(".slidingPanel").slideUp("fast");
                });
//            4. Event handler for mode selector            
                $("#mode").change(function (){
                    if($("#mode :selected").val()==="Edit mode")
                        {
                            $("#tabGeo").css("display","block");
                            $("#tabTxt").css("display","block");
                            $(".accordionContainer").css("display", "block");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width+150);
                            $("#sidebar").width(width+150);
                            $("#content").css("width", "64%");
                        }
                        else
                        {
                            forceRefreshPanel(0);
                            $("#tabGeo").css("display","none");
                            $("#tabTxt").css("display","none");
                            $(this).css("display","none");
                            $("#editBtn").val("Edit");
                            $(".accordionContainer").css("display", "none");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width-150);
                            $("#sidebar").width(width-150);
                            $("#content").css("width", "75%");
                            //flag=0;
                    }

                });
//            5. Submit OSM Search Handler
                $("#osmSearchForm").submit(function(){
                    if($('#searchbar').size()==0)
                    {
                        $("#objectEditor").children('div').css({'margin-left':'250px'});
                        var searchbar=$(searchbar_template);
                        searchbar.insertAfter('#objectEditor ul');
                        //$('#searchbar').next().css({'margin-left':'250px'});
                        $(".close_link").click(function(){
                            //$('#searchbar').next().css({'margin-left':'0px'});
                            $("#objectEditor").children('div').css({'margin-left':'0px'});
                            $('#searchbar').remove();
                        });
                    }
                    $("#nominatium").html('<br><center><img align="center" src="img/searching.gif"/></center>');
                    $("#geonames").html('<br><center><img align="center" src="img/searching.gif"/></center>');
                    $.ajax({
                        url:"server_scripts/osmSearch.php?q="+$("#query").val(),
                        async: true,
                        cache: false,
                        dataType:'json',
                        success:function(result){
                            $("#nominatium").html(result['nominatium']);
                            $('.set_position').click(function(){
                                var link=$(this);
                                if(link.attr('data-zoom'))
                                {
                                    landscapeMode='zoom';
                                    minlon=0;
                                    minlat=0;
                                    maxlon=0;
                                    maxlat=0;
                                    mlon=Number(link.attr('data-lon'));
                                    mlat=Number(link.attr('data-lat'));
                                    zoom=Number(link.attr('data-zoom'));
                                }
                                else
                                {
                                    landscapeMode='boundary';
                                    minlon=Number(link.attr('data-min-lon'));
                                    minlat=Number(link.attr('data-min-lat'));
                                    maxlon=Number(link.attr('data-max-lon'));
                                    maxlat=Number(link.attr('data-max-lat'));
                                    mlon=0;
                                    mlat=0;
                                    zoom=0;
                                }
                                return false;
                            });
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
//               END OF EVENT HANDLERS   
//            Setting default mode to view mode 
                $("#tabGeo").css("display","none");
                $("#tabTxt").css("display","none");
                $("#backBtn").css("display","none");
                $(".accordionContainer").css("display", "none");
                width=$("#searchDivc").width();
                $("#searchDivc").width(width-150);
                $("#sidebar").width(width-150);
                $("#content").css("width", "75%");
                //var searchbar=$(searchbar_template);
                //searchbar.insertAfter('#objectEditor ul');
                forceRefreshPanel(0);
                //
                //$("#objectEditor").tabs({active:0});
            });
        </script>
    </head>
        <body>
            <div id="mainContainer">
                <div id="sidebar">
		    <div id="logo"><img src="img/logo.jpg" height="50" width="100"></div>
                    <div id="searchDivc">
                    <div id="osmSearch">
                        <form id="osmSearchForm">
                            <input name="commit" type="submit" value="Go">
                            <input autofocus="autofocus" id="query" name="query" placeholder="Search" tabindex="1" type="text" value="">
                        </form>
                    </div>
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
                        <div id="txt" class="ui-widget ui-widget-content ui-corner-all">
                            <?php
                            
                            ?>
                        </div>
                    </div>
                </div>
                <div id="content">
                    <div id="objectEditor">
                        <ul>
                            <li id="tabMap"><a href="#map">Map</a></li>
                            <li id="tabGeo"><a href="#geoBuilder">Sketch Builder</a></li>
                            <li id="tabTxt"><a href="#txtBuilder">Texture Builder</a></li>
                        </ul>
                        <select id="mode" size="1">
                            <option selected value="View mode">
                                View Mode
                            </option>
                            <option value="Edit mode">
                                Edit Mode
                            </option>
                        </select>
                        <div id="map"></div>
                        <div id="geoBuilder"></div>
                        <div id="txtBuilder"></div>
                    </div>
                </div>
            </div>
    </body>
</html>
