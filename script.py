from lxml import etree
from datetime import *
from math import *
from copy import *
import MySQLdb

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
	for ( i = 0; i < 500; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(s_x[i+1], s_x[i]).transform( fromProjection, toProjection),icon_start.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 500; i+=2){
		marker_tmp = new OpenLayers.Marker(new OpenLayers.LonLat(t_x[i+1], t_x[i]).transform( fromProjection, toProjection),icon_second.clone());
		markers.addMarker(marker_tmp);
	}
	for ( i = 0; i < 500; i+=2){
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
    bounds = tree.xpath('/osm/bounds')
    boundsArray = []
    boundsArray.append(bounds[0].get('minlat'))
    boundsArray.append(bounds[0].get('maxlat'))
    boundsArray.append(bounds[0].get('minlon'))
    boundsArray.append(bounds[0].get('maxlon'))
    way_list = []
    way_list.append(boundsArray)
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
            return node
    return 0

def checkNodeAngle(firstNode, secondNode):
    a = secondNode[2] - firstNode[2]
    b = secondNode[1] - firstNode[1]
    c = sqrt(a*a+b*b)
    if c == 0:
        angle = 0
    else:
        angle = asin(a/c)
    #grad = 180 - (90 +fabs((angle * 180) / pi))
    return (angle * 180) / pi

def calculateDistance(firstNode, secondNode):
    return round(111.2 * sqrt(pow((firstNode[1]-secondNode[1]),2)\
                         + pow((firstNode[2]-secondNode[2])*cos(pi*firstNode[1]/180),2))*1000)

def searchLeftVector(rectangle):
    index = 0
    print "rectangle: ",rectangle
    for i in range(0, len(rectangle) - 1):
        if rectangle[i][2] < rectangle[index][2]:
            index = i
    last_index = 0
    rectangle_n = copy(rectangle)
    del rectangle_n[index]
    for i in range(0, len(rectangle_n) ): #MAGIC! why not for len(rectangle_n) -1 ????? its very strange
        if (rectangle_n[i][2] < rectangle_n[last_index][2]):
            last_index = i
    if rectangle[index][1] < rectangle_n[last_index][1]:
        return [rectangle[index], rectangle_n[last_index]]
    else:
        return [rectangle_n[last_index], rectangle[index]]

def calculateAngleOffset(boundbox, rectangle):
    bottomLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[0]), float(boundbox[3])] ]
    bottomLine[0][0] -= 0.003
    bottomLine[1][0] -= 0.003
    buildingLine = searchLeftVector(rectangle)
    print "bottomLine: ", bottomLine
    print "building: ", buildingLine
    v1x = bottomLine[1][0] - bottomLine[0][0]
    v1y = bottomLine[1][1] - bottomLine[0][1]
    v2x = buildingLine[1][1] - buildingLine[0][1]
    v2y = buildingLine[1][2] - buildingLine[0][2]
    print "vectors: ", v1x, v1y, v2x, v2y
    angle = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    horizontalAngle = (angle*180)/pi
    print "horizontal angle", horizontalAngle
    verticalLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[1]), float(boundbox[2])] ]
    verticalLine[0][1] -= 0.003
    verticalLine[1][1] -= 0.003
    print "verticalLine: ", verticalLine
    v1x = verticalLine[1][0] - verticalLine[0][0]
    v1y = verticalLine[1][1] - verticalLine[0][1]
    v2x = buildingLine[1][1] - buildingLine[0][1]
    v2y = buildingLine[1][2] - buildingLine[0][2]
    print "vectors: ", v1x, v1y, v2x, v2y
    angleNew = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    if horizontalAngle < 90:
        angleNew *= -1
    verticalAngle = (angleNew*180)/pi
    print "vertical angle", verticalAngle

def createRectangle(boundbox, building):
    print building
    BGN = building[0]
    END = building[2]
    cx = BGN[1] + ((END[1] - BGN[1]) / 2)
    cy = BGN[2] + ((END[2] - BGN[2]) / 2)
    print calculateDistance(building[0], building[1])
    calculateAngleOffset(boundbox, building)

def parseBuildingsData(nodes, ways):
    buildingArray = []
    counter = 0
    for building in ways:
        count_nodes = len(building[1])
        node_index = 0
        counter += 1
        print "parsing %d of %d" % (counter, len(ways))
        nodesArray = []
        previousAngle = -200
        while node_index < count_nodes:
            if (node_index == count_nodes - 1) and (building[1][0] == building[1][node_index]):
                break
            node_id = building[1][node_index]
            node = searchNode(node_id, nodes)
            if node_index != 0 and count_nodes > 4 and (building[1][0] != building[1][4]):
                angle = checkNodeAngle(searchNode(building[1][node_index - 1], nodes), node)
                if fabs(previousAngle - angle) > 15:
                    nodesArray.append(node)
                    previousAngle = angle
                else:
                    del nodesArray[len(nodesArray) - 1]
                    nodesArray.append(node)
                    previousAngle = checkNodeAngle(nodesArray[len(nodesArray) - 2], node)
            else:
                nodesArray.append(node)
            node_index += 1
        buildingArray.append(nodesArray)
    return buildingArray

print "Please, enter file name: "
FILE_NAME = raw_input()
print("\n[%s] Start parsing...Please wait!\n" % datetime.today().strftime('%H:%M:%S'))
node_list = parseNodes(FILE_NAME)
print("[%s] Parse nodes...Done!\n" % datetime.today().strftime('%H:%M:%S'))
way_list = parseWays(FILE_NAME)
bounds = way_list[0]
del way_list[0]
print("[%s] Parse ways...Done!\n" % datetime.today().strftime('%H:%M:%S'))
print("[%s] Start parsing file" % datetime.today().strftime('%H:%M:%S'))
buildingArray = parseBuildingsData(node_list, way_list)
print("[%s] End parsing file" % datetime.today().strftime('%H:%M:%S'))
createRectangle(bounds, buildingArray[14])

coord_start = []
coord_second = []
some = 0
file = open("./OpenLayers/openlayers/before.html", "w")
file.write("%s" % HTML_FILE_BEGIN)
file.write("x=[")
for j in range(0, len(way_list)):
    for i in range(0, len(way_list[j][1])):
        node = searchNode(way_list[j][1][i], node_list)
        if (i == len(way_list[j][1])-1) and (way_list[j][1][0] == way_list[j][1][i]):
            continue
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


coord_start = []
coord_second = []
some = 0
file = open("./OpenLayers/openlayers/result.html", "w")
file.write("%s" % HTML_FILE_BEGIN)
file.write("x=[")
for j in range(0, len(buildingArray)):
    for i in range(0, len(buildingArray[j])):
        node = buildingArray[j][i]
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
#print way_list[0]
#way_list_3d = setThirdDimension(node_list, way_list)


#print "some %i\n" % some
#print("[%s] Add 3D data...Done!\n" % datetime.today().strftime('%H:%M:%S'))
#print "Count of nodes:", len(node_list)
#print "Count of buildings:", len(way_list)
#print "\n\n[%s] Finished!" % datetime.today().strftime('%H:%M:%S')