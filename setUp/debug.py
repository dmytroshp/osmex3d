import MySQLdb, mysql_config

HTML_FILE_BEGIN = """<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>GPS track Editor v.1.0</title>
    <script src="OpenLayers.js"></script>
    <script type="text/javascript">
      var map;
      var mapnik;
      var fromProjection;
      var toProjection;
      var markers;
      var x,s_x, t_x, y,i;
      var lon=[];
      var lat=[];
      function init() {
        x=0;y=0;i=0;
        map = new OpenLayers.Map({
          div: "basicMap",
          allOverlays: true
        });
        mapnik         = new OpenLayers.Layer.OSM();
        fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position       = new OpenLayers.LonLat(30.6977847,46.4409529).transform( fromProjection, toProjection);
        var zoom           = 10;

        map.addLayer(mapnik);
        map.setCenter(position, zoom );
        map.addControl(new OpenLayers.Control.LayerSwitcher());

        markers = new OpenLayers.Layer.Markers( "Markers" );
        map.addLayer(markers);

        var size = new OpenLayers.Size(20,20);
        var offset = new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
        var icon = new OpenLayers.Icon('http://i062.radikal.ru/1209/58/9d99454e85d0.png',size,offset);
		var icon_start = new OpenLayers.Icon('http://s09.radikal.ru/i182/1212/ad/590aa0e89cae.png',size,offset);
		var icon_second = new OpenLayers.Icon('http://s45.radikal.ru/i108/1212/0d/b2cbfeb346ac.png',size,offset);
		"""
HTML_FILE_END = """
	for ( i = 0; i < 1500; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(s_x[i+1], s_x[i]).transform( fromProjection, toProjection),icon_start.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 0; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(t_x[i+1], t_x[i]).transform( fromProjection, toProjection),icon_second.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 0; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(x[i+1], x[i]).transform( fromProjection, toProjection),icon.clone());
		markers.addMarker(marker_tmp);
	}
      map.events.register("click", map , function(e){
        marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(map.getLonLatFromPixel(e.xy).lon, map.getLonLatFromPixel(e.xy).lat),icon.clone());
        markers.addMarker(marker_tmp);
        var lonlat = new OpenLayers.LonLat(map.getLonLatFromPixel(e.xy).lon, map.getLonLatFromPixel(e.xy).lat).transform( toProjection, fromProjection);
        lon[i] = lonlat.lon;
        lat[i] = lonlat.lat;
        i++;
      });

      }

  </script>
  </head>
  <body onLoad="init();">
      <div id="basicMap"></div>
  </body>
</html>"""

conf = mysql_config.MySQLConfig()
db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd=conf.password, charset='utf8')
connection = db.cursor()
connection.execute("USE osmex3d;")

connection.execute("SELECT positionLat, positionLon FROM objectInstance;")
data = connection.fetchall()
file = open("./OpenLayers/openlayers/result.html", "w")
file.write("%s" % HTML_FILE_BEGIN)
file.write("x=[")
file.write("];\n")
t = 1
print len(data)
file.write("\t\ts_x = [%s, %s " % (data[0][0], data[0][1]))
while t < len(data):
    file.write(",\n\t\t%s, %s" % (data[t][0], data[t][1]))
    t += 1
file.write("];\n\t\tt_x = [];")
file.write("%s" % HTML_FILE_END)
file.close()