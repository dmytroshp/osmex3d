from lxml import etree
from random import *
from datetime import *
from math import *
from time import *

def parseNodes(file):
    tree = etree.parse(file)
    nodes = tree.xpath('/osm/node')
    node_list = []
    for node in nodes:
        id = node.get('id')
        lat = float(node.get('lat'))
        lon = float(node.get('lon'))
        tmp_list = [id, lat, lon]
        node_list.append(tmp_list)
    return node_list

def parseWays(file):
    tree = etree.parse(file)
    ways = tree.xpath('/osm/way')
    way_list = []
    for way in ways:
        id = way.get('id')
        nodes = tree.xpath('/osm/way[@id=%s]/nd' % id)
        way_nodes = []
        for node in nodes:
            way_nodes.append(node.get('ref'))
        tags = tree.xpath('/osm/way[@id=%s]/tag' % id)
        for tag in tags:
            k = tag.get('k')
            if k == 'building' or k == 'amenity':
                way_list.append([id, way_nodes])
                break
    return way_list

def searchNode(node_id, nodes):
    for node in nodes:
        if node[0] == node_id:
            #print "node:   %s" % node
            return node
    return 0

def setThirdDimension(nodes, ways):
    point_list = []
    j = 0;
    for point in ways:
        count_nodes = len(point[1])
        points_3d = []
        j += 1
        lastgrad = - 200
        if j == 1:
            print len(point[1])
            i = 0
            k = 2
            while i <= (count_nodes-k):
                point_in_3d = []
                node_id = point[1][i]
                node = searchNode(node_id, nodes)
                print node
                node_id2 = point[1][i+1]
                node_2 = searchNode(node_id2, nodes)
                print node_2
                if node != 0 and node_2 != 0:
                    point_one = [node[1], node[2]]
                    point_two = [node_2[1], node_2[2]]
                    a = point_two[1] - point_one[1]
                    b = point_two[0] - point_one[0]
                    c = sqrt(a*a+b*b)
                    angle = asin(a/c)
                    grad = 180 - (90 +fabs((angle * 180) / pi))
                    print "angle: %s, grad: %s, another: %s\n" % (angle, grad, (angle * 180) / pi)
                    if fabs(lastgrad - grad) < 30:
                        del point[1][i]
                        k += 1
                    else:
                        i += 1
                        lastgrad = grad
                    #points_3d.append(point_in_3d)
                else:
                    print "FATAL ERROR! Node not found [id = %s]\n" % node_id
            print len(point[1])
        point_list.append(points_3d)
    return point_list

def writeStatisticInformationXML(node_count, building_count, way_list_3d, building_list_3d):
    file = open("result.xml", "w")
    file.write("<map node_count=%s building_count = %s>\n" % (node_count, building_count))
    for building_index in range(0, len(building_list_3d)):
        file.write("\t<building id=%s way_count=%s triangle_count=%s>\n" % (building_index, \
                                                                            len(way_list_3d[building_index]), \
                                                                            len(building_list_3d[building_index])))
        for point_index in range(0, len(building_list_3d[building_index])):
            file.write("\t\t<triangle index=%s>\n" % point_index)
            for ind in range(len(building_list_3d[building_index][point_index])):
                index_way = building_list_3d[building_index][point_index][ind]
                file.write("\t\t\t<point3d index=%s> %s </point3d>\n" %(ind, way_list_3d[building_index][index_way]))
            file.write("\t\t</triangle>\n")
        file.write("\t</building>\n")
    file.write("</map>")

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
        var zoom           = 15;

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
	for ( i = 0; i < 128; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(s_x[i+1], s_x[i]).transform( fromProjection, toProjection),icon_start.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 128; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(t_x[i+1], t_x[i]).transform( fromProjection, toProjection),icon_second.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 128; i+=2){
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

      function disp_coords(){
        document.getElementById("hide").innerHTML="";
        for (j = 0; j<i; j++){
          var pos = ""+lat[j]+" "+lon[j];
          document.getElementById("hide").innerHTML+=pos+"<br>";
        }
      }

      function disp_html(){
        document.getElementById("hide").innerHTML="";
        for (j = 0; j<i; j++){
          var pos = "x["+x+"]="+lat[j]+";y["+y+"]="+lon[j]+";";
          document.getElementById("hide").innerHTML+=pos+"<br>";
          x++;y++;
        }
        x=0;y=0;
      }

  </script>
  </head>
  <body onLoad="init();">
      <div id="basicMap"></div>
      <div>
          <input type="radio" name="gen" value="1" onClick="disp_coords();">  <br>
          <input type="radio" name="gen" value="2" onClick="disp_html();">
      </div>
      <p id="hide"></p>
  </body>
</html>"""
print "Please, enter file name: "
FILE_NAME = raw_input()
print("\n[%s] Start parsing...Please wait!\n" % datetime.today().strftime('%H:%M:%S'))
node_list = parseNodes(FILE_NAME)
print("[%s] Parse nodes...Done!\n" % datetime.today().strftime('%H:%M:%S'))
way_list = parseWays(FILE_NAME)
print("[%s] Parse ways...Done!\n" % datetime.today().strftime('%H:%M:%S'))


coord_start = []
coord_second = []
some = 0
file = open("before.html", "w")
file.write("%s" % HTML_FILE_BEGIN)
file.write("x=[")
for j in range(0, len(way_list)):
    for i in range(0, len(way_list[j][1])-1):
        node = searchNode(way_list[j][1][i], node_list)
        if i == 0:
            coord_start.append(node[1])
            coord_start.append(node[2])
        elif i == 1:
            coord_second.append(node[1])
            coord_second.append(node[2])
        elif i == 2 and j == 0:
            file.write("%s, %s" % (node[1], node[2]))
        else:
            file.write(",\n%s, %s" % (node[1], node[2]))
            some += 1
file.write("];\n")
t = 2
file.write("s_x = [%s, %s " % (coord_start[0], coord_start[1]))
while t < len(coord_start):
    file.write(",\n%s, %s" % (coord_start[t], coord_start[t+1]))
    t += 2
file.write("];\n")
t = 2
file.write("t_x = [%s, %s " % (coord_second[0], coord_second[1]))
while t < len(coord_second):
    file.write(",\n%s, %s" % (coord_second[t], coord_second[t+1]))
    t += 2
file.write("];\n")
file.write("%s" % HTML_FILE_END)
file.close()






#print node_list[0]
way_list_3d = setThirdDimension(node_list, way_list)
#print way_list[0]
coord_start = []
coord_second = []
some = 0
file = open("result.html", "w")
file.write("%s" % HTML_FILE_BEGIN)
file.write("x=[")
for j in range(0, len(way_list)):
    for i in range(0, len(way_list[j][1])-1):
        node = searchNode(way_list[j][1][i], node_list)
        if i == 0:
            coord_start.append(node[1])
            coord_start.append(node[2])
        elif i == 1:
            coord_second.append(node[1])
            coord_second.append(node[2])
        elif i == 2 and j == 0:
            file.write("%s, %s" % (node[1], node[2]))
        else:
            file.write(",\n%s, %s" % (node[1], node[2]))
            some += 1
file.write("];\n")
t = 2
file.write("s_x = [%s, %s " % (coord_start[0], coord_start[1]))
while t < len(coord_start):
    file.write(",\n%s, %s" % (coord_start[t], coord_start[t+1]))
    t += 2
file.write("];\n")
t = 2
file.write("t_x = [%s, %s " % (coord_second[0], coord_second[1]))
while t < len(coord_second):
    file.write(",\n%s, %s" % (coord_second[t], coord_second[t+1]))
    t += 2
file.write("];\n")
file.write("%s" % HTML_FILE_END)
file.close()
print "some %i\n" % some
print("[%s] Add 3D data...Done!\n" % datetime.today().strftime('%H:%M:%S'))
print "Count of nodes:", len(node_list)
print "Count of buildings:", len(way_list)
print "\n\n[%s] Finished!" % datetime.today().strftime('%H:%M:%S')