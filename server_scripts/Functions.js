
var req;
var div;
 
function loadXMLDoc(url,params)
{
    req = null;
    if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
                req = new ActiveXObject('Microsoft.XMLHTTP');
        }
 
    if (req) {	 
        req.open("GET", url + '?r='+Math.random()+'&'+params, true);
        req.setRequestHeader("Content-Type", "text/xml"); //application/x-www-form-urlencoded
        req.setRequestHeader("Accept-Charset", "UTF-8"); 
        req.setRequestHeader("Accept-Language", "ru, en");
		if(params.indexOf("id")>-1)div=document.getElementById('cont');
		if(params.indexOf("minlon")>-1){
		div=document.getElementById('build');
		//alert("build");
		}
        req.onreadystatechange = processReqChange;
        req.send(null);
    }
	
}

function processReqChange()
{

    // "complete"
    if (req.readyState == 4) {
        // "OK"
        if (req.status == 200) {
            div.innerHTML=req.responseText;
			div.ongetdata(div.innerHTML);
        } else {
            alert("Сервер занят:\n" +
                req.statusText);
        }
    }
	
	req = null;
	div = null;
}

function land_func(id){
var params = 'id=' + encodeURIComponent(id);
loadXMLDoc('server_scripts/get_land.php', params);	
}

function build_func(tile_id,minlon,minlat,maxlon,maxlat){
//var params = 'x=' + encodeURIComponent(tile_x)+'&'+'z=' + encodeURIComponent(tile_z);
var params = 'tile_id=' + encodeURIComponent(tile_id)+'&'+'minlon=' + encodeURIComponent(minlon)+'&'+'minlat=' + encodeURIComponent(minlat)+'&'+'maxlon=' + encodeURIComponent(maxlon)+'&'+'maxlat=' + encodeURIComponent(maxlat);
loadXMLDoc('server_scripts/getBuildings.php', params);	
}