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
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">

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
            var tabSelected = 1;
            var showButton = 1;
            
            function activateAndRefreshPanel(index)
            {
                var panel=$('#objectEditor > div:not(#searchbar)').eq(index);
                panel.empty();

                $("#objectEditor").tabs("option", "active", -1); // first switching to dummy tab
                $("#objectEditor").tabs("option", "active", index);
            }
            
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
                var heightObj = $(window).height()*0.97;
                $("#sidebar").css("height", heightObj);
                $("#content").css("height", heightObj);
                $(".accordionContainer").css("height", heightObj-180);
                $("#objectEditor").height($("#content").height() - 8);
//         EVENT HANDLERS
//            1. Event handler for flip
                $(".flip").click(function(){
                    $(this).next(".slidingPanel").slideToggle(500, function(){
                        $(this).next().toggleClass("closed");
                    });
                });
//            2. Event handler for search input (sketches tab)
             
                // Work area tabs
                var initializator={
                    tabMap:{
                        url:'ajax/mapView.html',
                        activator:function(){
                            var iframe=this.find('iframe');

                            if(landscapeMode=='zoom') 
                                iframe.attr('src','landscape.php?zoom='+zoom+'&mlon='+mlon+'&mlat='+mlat+'&rnd='+Math.random());
                            else
                                iframe.attr('src','landscape.php?minlon='+minlon+'&minlat='+minlat+'&maxlon='+maxlon+'&maxlat='+maxlat+'&rnd='+Math.random());
                        }
                    },
                    tabArea:{
                        url:'ajax/areaEditor.html',
                        activator:function(){
                        }
                    },
                    tabSketch:{
                        url:'ajax/sketchBuilder.html',
                        activator:function(){
                        }
                    },
                    tabTxt:{
                        url:'ajax/textureBuilder.html',
                        activator:function(){
                            prepareTextureBuilder();
                            $(document).on("addTexture", function(e){
                                for(var i=0;i<e.textures.length;i++)
                                {
                                    $('#txt').append("<div class='imgContainer'>\n\
                                    <img class='prev' src='"+e.textures[i].thumbnail+"'>\
                                    <div class='desc'>"+e.textures[i].name+"</div></div>");
                                }
                            });
                        }
                    }
                };
                $("#objectEditor").tabs({
                    active: -1,   // to trigger beforeActivate for the first tab
                    beforeActivate:function(event, ui){
                        if(ui.newPanel.is(':empty'))
                        {
                            var key=ui.newTab.attr('id');
                            
                            if (key === "dummy") return;
                            
                            $('#loading').show();
                            
                            ui.newPanel.load(initializator[key].url, '', function() {
                                
                                var iframe = ui.newPanel.find('iframe');
                                
                                if (iframe.length) {
                                    
                                    iframe.css("visibility", "hidden");
                                    
                                    iframe.css('width', ui.newPanel.width());
                                    iframe.css('height', ui.newPanel.height());
                                }
                                
                                initializator[key].activator.call(ui.newPanel, event, ui);       
                                
                                if (iframe.length) {

                                    iframe.load(function() {

                                        iframe.css("visibility", "visible");
                                        $('#loading').hide();
                                    });
                                }
                                else {
 
                                    $('#loading').hide();
                                }
                            });
                        }
                    }
                });
                window.refreshAccordion=function()
                {
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
                };
                $("#accSearch").keyup(function (){
                    if(tabSelected===1){
                        window.refreshAccordion();
                    }
                    if(tabSelected===2){
                        $.ajax({
                            url:"server_scripts/getTexture.php?mode=search&from=0&to=15&qw="+$("#accSearch").val(),
                            async: true,
                            cache: false,
                            dataType:'json',
                            success:function(result)
                            {
                                var str="";
                                for (i in result){
                                    str+="<div class='imgContainer'>";
                                    str+="<img class='prev' src='"+result[i].thumbnail+"'>";
                                    str+="<div class='desc'>"+result[i].name+"</div></div>";
                                }
                                if(str==="")
                                {
                                    $("#txt").html("<p style='font-size: 1.1em;'>no textures found</p>");
                                }
                                else
                                {
                                    $("#txt").html(str);
                                }
                            }
                        });
                        $("#txt").children(".imgContainer").click(function(){
                            if(!$(this).hasClass("clicked"))
                            {
                                $(this).css("border", "1px solid red");
                                $(this).unbind("mouseleave");
                                $(this).unbind("mouseenter");
                            }
                            else
                            {
                                $(this).css("border", "1px solid white");
                                $(this).bind("mouseleave");
                                $(this).bind("mouseenter");
                            }
                            $(this).toggleClass("clicked");
                        });
                        $("#txt").children(".imgContainer").mouseenter(function(){
                            $(this).css("cursor", "pointer");
                            $(this).css("border", "1px solid red");
                        });
                        $("#txt").children(".imgContainer").mouseleave(function(){
                            $(this).css("cursor", "default");
                            $(this).css("border", "1px solid white");
                        });
                    }
                    
                }); //end of search input handler
//            3. Event handler for button "Collapse All"  
                $("#collapseImg").click(function (){
                    var i=0;
                    $(".slidingPanel").each(function(index){
                        if($(this).css("display")==="block")
                            i++;
                    });
                    if(i)
                        $(".slidingPanel").slideUp("fast");
                    else
                        $(".slidingPanel").slideDown("fast");
                });
//            4. Event handler for mode selector            
                $("#mode").change(function (){
                    if($("#mode :selected").val()==="Edit mode")
                        {
                            showButton = 1;
                            $("#tabSketch").css("display","block");
                            $("#tabTxt").css("display","block");
                            $(".accordionContainer").css("display", "block");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width+150);
                            $("#sidebar").width(width+150);
                            $("#content").css("width", "64%");
                            $("#description").css("display", "none");
                            $('iframe').css('width',$('iframe').parent().width());
                            $('iframe').css('height',$('iframe').parent().height());
                        }
                    if($("#mode :selected").val()==="View mode")
                        {
                            showButton = 0;
                            $("#tabArea").css("display", "none");
                            $("#tabMap").css("display", "block");
                            $("#tabSketch").css("display","none");
                            $("#tabTxt").css("display","none");
                            $(".accordionContainer").css("display", "none");
                            width=$("#searchDivc").width();
                            $("#searchDivc").width(width-150);
                            $("#sidebar").width(width-150);
                            $("#content").css("width", "75%");
                            $("#description").css("display", "block");
                            $('iframe').css('width',$('iframe').parent().width());
                            $('iframe').css('height',$('iframe').parent().height());
                        }
                        
                        activateAndRefreshPanel(0);
                });
//            5. Submit OSM Search Handler
                $("#osmSearchForm").submit(function(){
                    if($('#searchbar').size()==0)
                    {
                        $("#objectEditor").children('div').css({'margin-left':'250px'});
                        var searchbar=$(searchbar_template);
                        searchbar.insertAfter('#objectEditor ul');
                        $('iframe')[0].contentWindow.onWindowResize();
                        //$('#searchbar').next().css({'margin-left':'250px'});
                        $(".close_link").click(function(){
                            //$('#searchbar').next().css({'margin-left':'0px'});
                            $("#objectEditor").children('div').css({'margin-left':'0px'});
                            $('#searchbar').remove();
                            $('iframe').css('width',$('iframe').parent().width());
                            $('iframe').css('height',$('iframe').parent().height());
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
                            
                            $("#nominatium ul").next().remove();
                            $("#nominatium ul").next().remove();
                            $("#geonames").html(result['geonames']);
                            $("#geonames ul").next().remove();
                            $("#geonames ul").next().remove();
                            $('.set_position').click(function(){
                                
                                var confirmed = true;
                                
                                //if($("#mode :selected").val()!=="View mode")
                                if ($("#tabArea").is(':visible'))
                                {
                                    confirmed = false;
                                    
                                    var mydialog=$(dialog_template).attr('title','Switch to search result');
                                    mydialog.find('p').append('Are you sure you want to cancel editing and switch to the search result?');
                                    mydialog.dialog({
                                          resizable: false,
                                          height:200,
                                          modal: true,
                                          buttons: {
                                            "Yes": function() {
                                              $( this ).dialog( "close" );
                                              confirmed = true;
                                            },
                                            "No": function() {
                                              $( this ).dialog( "close" );
                                            }
                                        }
                                    });
                                }
                                
                                if (confirmed) {

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

                                    activateAndRefreshPanel(0);
                                }
                                
                                return false;
                            });
                            //$(result).appendTo('#nominatium');
                        }
                     });
                     return false;
                });
//           6. Image Container handlers                
                $(".imgContainer").mouseenter(function(){
                    $(this).css("cursor", "pointer");
                    $(this).css("border", "1px solid red");
                });
                $(".imgContainer").mouseleave(function(){
                    $(this).css("cursor", "default");
                    $(this).css("border", "1px solid white");
                });
                $(".imgContainer").click(function(){
                    if(!$(this).hasClass("clicked"))
                    {
                        $(this).css("border", "1px solid red");
                        $(this).unbind("mouseleave");
                        $(this).unbind("mouseenter");
                    }
                    else
                    {
                        $(this).css("border", "1px solid white");
                        $(this).bind("mouseleave");
                        $(this).bind("mouseenter");
                    }
                    $(this).toggleClass("clicked");
                });
//           7. Search handler
                $("#sketchTab").click(function (){
                    tabSelected = 1;
                     $("#collapseImg").css("display","block");
                });
                $("#txtTab").click(function(){
                    tabSelected = 2;
                    $("#collapseImg").css("display","none");
                    $.ajax({
                            url:"server_scripts/getTexture.php?mode=thumbnails&from=0&to=15&qw=f",
                            async: false,
                            cache: false,
                            dataType:'json',
                            success:function(result)
                            {
                                var str="";
                                for (i in result){
                                    str+="<div class='imgContainer'>";
                                    str+="<img class='prev' src='"+result[i].thumbnail+"'>";
                                    str+="<div class='desc'>"+result[i].name+"</div></div>";
                                }
                                $("#txt").html(str);
                                
                            }
                        });
                        $("#txt").children(".imgContainer").click(function(){
                            if(!$(this).hasClass("clicked"))
                            {
                                $(this).css("border", "1px solid red");
                                $(this).unbind("mouseleave");
                                $(this).unbind("mouseenter");
                            }
                            else
                            {
                                $(this).css("border", "1px solid white");
                                $(this).bind("mouseleave");
                                $(this).bind("mouseenter");
                            }
                            $(this).toggleClass("clicked");
                        });
                        $("#txt").children(".imgContainer").mouseenter(function(){
                            $(this).css("cursor", "pointer");
                            $(this).css("border", "1px solid red");
                        });
                        $("#txt").children(".imgContainer").mouseleave(function(){
                            $(this).css("cursor", "default");
                            $(this).css("border", "1px solid white");
                        });
                });    
//               END OF EVENT HANDLERS   
//            Setting default mode to view mode 

                $("#tabArea").css("display", "none");
                
                $("#tabSketch").css("display","block");
                $("#tabTxt").css("display","block");
                $(".accordionContainer").css("display", "block");
                //width=$("#searchDivc").width();
                //$("#searchDivc").width(width+150);
                //$("#sidebar").width(width+150);
                $("#content").css("width", "64%");
                //var searchbar=$(searchbar_template);
                //searchbar.insertAfter('#objectEditor ul');
                activateAndRefreshPanel(0);
                //
                //$("#objectEditor").tabs({active:0});
            });
            function disableMapEditing() {
            
                parent.$("#tabArea").css("display", "none");
                parent.$("#tabMap").css("display", "block");
                
                parent.activateAndRefreshPanel(0);
            }
            function enableMapEditing() {
                                
                parent.$("#tabArea").css("display", "block");                
                parent.$("#tabMap").css("display", "none");
                
                parent.activateAndRefreshPanel(1);
            }
        </script>
    </head>
        <body>
            <div id="mainContainer">
                <div id="sidebar">
		    <div id="logo"><p align="center"><img src="img/logo.png" height="87" width="265"></p></div>
                    <div id="searchDivc">
                    <div id="osmSearch">
                        <form id="osmSearchForm">
                            <input name="commit" type="submit" value="Go">
                            <input autofocus="autofocus" id="query" name="query" placeholder="Search" tabindex="1" type="text" value="">
                        </form>
                    </div>
                    </div>
                        <p id="description">Here is some description...You can add here what you want (height of this text - 80px maximum)</p>
                    <div class="accordionContainer">
                        <ul>
                        <li><a id="sketchTab" href="#acc">Sketches</a></li>
                        <li><a id="txtTab" href="#txt">Textures</a></li>
                        </ul>
                        <img id="collapseImg" src="img/collapse.png">
                        <input id="accSearch" type="search" placeholder="Start typing a name here...">
                        <div id="acc" class="accordion ui-widget ui-widget-content ui-corner-all">
                            <?php
                            global $array;
                            foreach ($array as $nameFigureType => $instances) {
                                echo '<div class="flip ui-widget ui-widget-header ui-corner-all">'.$nameFigureType.'('.sizeof($instances).')</div>';                           
                                echo '<div class="slidingPanel ui-widget ui-widget-content ui-corner-all">';
                                
                                for($i=0;$i<sizeof($instances);$i++)
                                {
                                    echo '<div class="imgContainer">';
                                    echo '<img class="prev" src="previews/'.$instances[$i]['previewFileName'].'_mini.png">';
                                    echo '<div class="desc">';
                                    echo $instances[$i]['name'];
                                    echo '</div></div>';
                                }
                                echo '</div>';   
                                echo '<div class="scrollHelper"></div>';
                            }
                            ?>
                        </div>
                        <div id="txt" class="accordion ui-widget ui-widget-content ui-corner-all">
                            <?php
                            
                            ?>
                        </div>
                    </div>
                </div>
                <div id="content">
                    <div id="objectEditor">
                        <ul>
                            <li id="tabMap"><a href="#map">Map</a></li>
                            <li id="tabArea"><a href="#areaEditor">Map(EDIT)</a></li>
                            <li id="tabSketch"><a href="#sketchBuilder">Sketch Builder</a></li>
                            <li id="tabTxt"><a href="#txtBuilder">Texture Builder</a></li>
                            <li id="dummy" style="display:none;"><a href="#txtBuilder">dummy</a></li>
                        </ul>
                        <select id="mode" size="1">
                            <option value="View mode">
                                View Mode
                            </option>
                            <option selected value="Edit mode">
                                Edit Mode
                            </option>
                        </select>
                        <div class="panel_body" id="map"></div>
                        <div class="panel_body" id="areaEditor"></div>
                        <div class="panel_body" id="sketchBuilder"></div>
                        <div class="panel_body" id="txtBuilder"></div>
                        <div id="loading" style="display:none;"><img src="img/loading.gif" style="position:absolute;top:50%;left:50%;margin-left:-16px;margin-top:-16px;width:32px;height:32px;"/></div>
                    </div>
                </div>
            </div>
    </body>
</html>
