from xml.sax.handler import ContentHandler
from xml.sax import make_parser
from datetime import *
from math import *
from copy import *
import MySQLdb
import sys


db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
connection = db.cursor()
db.autocommit(False)
connection.execute("USE osmex3d;")

def checkNodeAngle(firstNode, secondNode):
    a = secondNode[1] - firstNode[1]
    b = secondNode[0] - firstNode[0]
    c = sqrt(a*a+b*b)
    if c == 0:
        angle = 0
    else:
        angle = asin(a/c)
        #grad = 180 - (90 +fabs((angle * 180) / pi))
    return (angle * 180) / pi

def calculateDistance(firstNode, secondNode):
    return (111.2 * sqrt(pow((firstNode[0]-secondNode[0]),2)
                         + pow((firstNode[1]-secondNode[1])*cos(pi*firstNode[0]/180),2))*1000)

def searchLeftVector(rectangle):
    index = 0
    #print "rectangle: ",rectangle
    for i in range(0, len(rectangle) - 1):
        if rectangle[i][1] < rectangle[index][1]:
            index = i
    last_index = 0
    rectangle_n = copy(rectangle)
    del rectangle_n[index]
    for i in range(0, len(rectangle_n) ): #MAGIC! why not for len(rectangle_n) -1
        if (rectangle_n[i][1] < rectangle_n[last_index][1]):
            last_index = i
    if rectangle[index][0] < rectangle_n[last_index][0]:
        return [rectangle[index], rectangle_n[last_index]]
    else:
        return [rectangle_n[last_index], rectangle[index]]

def searchRightVector(rectangle):
    index = 0
    #print "rectangle: ",rectangle
    for i in range(0, len(rectangle) - 1):
        if rectangle[i][1] > rectangle[index][1]:
            index = i
    last_index = 0
    rectangle_n = copy(rectangle)
    del rectangle_n[index]
    for i in range(0, len(rectangle_n) ): #MAGIC! why not for len(rectangle_n) -1
        if (rectangle_n[i][1] > rectangle_n[last_index][1]):
            last_index = i
    if rectangle[index][0] < rectangle_n[last_index][0]:
        return [rectangle[index], rectangle_n[last_index]]
    else:
        return [rectangle_n[last_index], rectangle[index]]

def searchLongVector(rectangle):
    vector = [rectangle[0], rectangle[1]]
    lenvect = calculateDistance(vector[0], vector[1])
    for i in range(0, len(rectangle)-1):
        if (lenvect < calculateDistance(rectangle[i], rectangle[i+1])):
            vector = [rectangle[i], rectangle[i+1]]
            lenvect = calculateDistance(rectangle[i], rectangle[i+1])
    if vector[0][1] > vector[1][1]:
        return [vector[1], vector[0]]
    else:
        return [vector[0], vector[1]]

def calculateAngleOffset(boundbox, rectangle):
    bottomLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[0]), float(boundbox[3])] ]
    bottomLine[0][0] -= 0.003
    bottomLine[1][0] -= 0.003
    xx = searchLeftVector(rectangle)
    yy = searchRightVector(rectangle)
    center_left = [ (xx[0][0] + xx[1][0]) / 2 , (xx[0][1] + xx[1][1]) / 2 ]
    center_right = [ (yy[0][0] + yy[1][0]) / 2 , (yy[0][1] + yy[1][1]) / 2 ]
    if center_left[0] > center_right[0]:
        center_line = [center_right, center_left]
    else:
        center_line = [center_left, center_right]
        #print "CENTER LINE: ", [center_right, center_left]
    #print "bottomLine: ", bottomLine
    #print "building: ", buildingLine
    v1x = bottomLine[1][0] - bottomLine[0][0]
    v1y = bottomLine[1][1] - bottomLine[0][1]
    v2x = center_line[1][0] - center_line[0][0]
    v2y = center_line[1][1] - center_line[0][1]
    #print "vectors: ", v1x, v1y, v2x, v2y
    angle = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    horizontalAngle = ((angle*180)/pi)
    #print "horizontal angle1", horizontalAngle
    angle =  (((horizontalAngle)*pi)/180)
    return angle

def calculateAngleOffsetBottom(boundbox, rectangle):
    bottomLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[0]), float(boundbox[3])] ]
    bottomLine[0][0] -= 0.003
    bottomLine[1][0] -= 0.003
    xx = searchLeftVector(rectangle)
    yy = searchRightVector(rectangle)
    #print "WARNING! ", xx, "!!!!!!!!!", yy
    buildingLine = [ yy[0], xx[0] ]
    #print "CENTER LINE: ", [center_right, center_left]
    #print "bottomLine: ", bottomLine
    #print "building: ", buildingLine
    v1x = bottomLine[1][0] - bottomLine[0][0]
    v1y = bottomLine[1][1] - bottomLine[0][1]
    v2x = buildingLine[1][0] - buildingLine[0][0]
    v2y = buildingLine[1][1] - buildingLine[0][1]
    #print "vectors: ", v1x, v1y, v2x, v2y
    angle = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    horizontalAngle = 180 - ((angle*180)/pi)
    #print "horizontal angle1", horizontalAngle
    angle =  (((horizontalAngle)*pi)/180)
    return angle

def calculateAngleOffsetSecond(boundbox, rectangle):
    bottomLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[0]), float(boundbox[3])] ]
    bottomLine[0][0] -= 0.003
    bottomLine[1][0] -= 0.003
    buildingLine = searchLeftVector(rectangle)
    #print "bottomLine: ", bottomLine
    #print "building: ", buildingLine
    v1x = bottomLine[1][0] - bottomLine[0][0]
    v1y = bottomLine[1][1] - bottomLine[0][1]
    v2x = buildingLine[1][0] - buildingLine[0][0]
    v2y = buildingLine[1][1] - buildingLine[0][1]
    #print "vectors: ", v1x, v1y, v2x, v2y
    angle = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    horizontalAngle = (angle*180)/pi
    #print "horizontal angle2", horizontalAngle
    verticalLine = [ [float(boundbox[0]), float(boundbox[2])], [float(boundbox[1]), float(boundbox[2])] ]
    verticalLine[0][1] -= 0.003
    verticalLine[1][1] -= 0.003
    #print "verticalLine: ", verticalLine
    v1x = verticalLine[1][0] - verticalLine[0][0]
    v1y = verticalLine[1][1] - verticalLine[0][1]
    v2x = buildingLine[1][0] - buildingLine[0][0]
    v2y = buildingLine[1][1] - buildingLine[0][1]
    #print "vectors: ", v1x, v1y, v2x, v2y
    angleNew = acos((v1x*v2x + v1y*v2y) / (sqrt(pow (v1x,2) + pow (v1y,2)) * sqrt(pow (v2x,2) + pow (v2y,2))))
    if horizontalAngle < 90:
        angleNew *= -1
    verticalAngle = (angleNew*180)/pi
    #print "vertical angle", verticalAngle
    return angleNew

def createRectangle(boundBox, building, database):
    #print building
    leftLine = searchLeftVector(building)
    rightLine = searchRightVector(building)
    topLine = [leftLine[1], rightLine[1]]
    bottomLine = [leftLine[0], rightLine[0]]
    BGN = leftLine[1]
    END = rightLine[0]
    center_x = BGN[0] + ((END[0] - BGN[0]) / 2)
    center_y = BGN[1] + ((END[1] - BGN[1]) / 2)
    #print "%f , %f," % (center_x, center_y)
    if calculateDistance(leftLine[0], leftLine[1]) > calculateDistance(rightLine[0], rightLine[1]):
        Z_COORD = calculateDistance(leftLine[0], leftLine[1]) / 2
    else:
        Z_COORD = calculateDistance(rightLine[0], rightLine[1]) / 2

    Y_COORD = 20

    if calculateDistance(topLine[0], topLine[1]) > calculateDistance(bottomLine[0], bottomLine[1]):
        X_COORD = calculateDistance(topLine[0], topLine[1]) / 2
    else:
        X_COORD = calculateDistance(bottomLine[0], bottomLine[1]) / 2

    angle1 = calculateAngleOffsetBottom(boundBox, building)
    angle2 = calculateAngleOffsetSecond(boundBox, building)
    #print "angle ", angle1, " angle2 ", angle2
    constant = 1
    if angle2 < 0:
        constant *= -1
    angleOffset = ((abs(angle1) + abs(angle2))/2) * constant
    INSERT_RECTANGLE = "INSERT INTO objectInstance VALUES (null, %f, %f, %f, \
    %f, %f, %f, %f, %f, %d);" % (X_COORD, Y_COORD, Z_COORD, 0.0, angleOffset, 0.0,
                                 center_x, center_y, 1)
    database.execute(INSERT_RECTANGLE)
    return [center_x, center_y]

class OSMHandler(ContentHandler):
    def startElement(self, name, attrs):
        if name == "bounds" :
            self.minlatN = attrs.get("minlat")
            self.minlonN = attrs.get("minlon")
            self.maxlatN = attrs.get("maxlat")
            self.maxlonN = attrs.get("maxlon")
            self.i = 0
            self.tmp = 0
            self.rm = []
        if name == "way":
            if self.i > 0 and self.i < 200 :
                db.commit()
                self.i = 0
            self.idway = attrs.get("id")
            self.buildmas = []
            #print "WAY ID: %s" % self.idway
        if name == "nd":
            self.idnd = attrs.get("ref")
            self.buildmas.append(self.idnd)
            #connection.execute("UPDATE buildings SET idWay='%s' WHERE idNode='%s'"
            #                   % (self.idway, self.idnd))
        if name == "tag":
            tagname = attrs.get("k")
            if tagname == "building" or tagname == "amenity":
                self.accept = True
            else:
                self.accept = False
    def endElement(self,name):
        if name == "way":
            try:
                x = len(self.buildmas)
                if self.accept == False:
                    for ik in range(0, len(self.buildmas)):
                        self.rm.append(self.buildmas[ik])
                if x > 3 and x <= 5 and self.accept == True:
                    if self.buildmas[x-1] == self.buildmas[0]: #remove unused node
                        del self.buildmas[x-1] #remove unused node
                    if len(self.buildmas) < 4:
                        pass
                    for j in range(0, len(self.buildmas)):
                        ss += "%s ," % self.buildmas[j]
                        connection.execute("INSERT INTO buildings VALUES(null, '%s', '%s', %s)"
                                           % (self.idnd, self.lat, self.lon))
                    connection.execute(str)
                    db.commit()
                    data = connection.fetchall()
                    newbuild = []
                    for j in range(0,4):
                        newbuild.append([data[j][0], data[j][1]])
                    createRectangle([float(self.minlatN), float(self.minlonN),
                                     float(self.maxlatN), float(self.maxlonN)], newbuild, connection)
                if self.tmp > 200:
                    str = "DELETE FROM buildings WHERE idNode in ("
                    for ik in range(0, len(self.rm)-51):
                        str += "%s, " % self.rm[ik]
                    str += "%s);" % self.rm[len(self.rm)-51]
                    self.tmp = 0
                    connection.execute(str)
                    db.commit()
                    self.rm = []
                else:
                    self.tmp += 1
            except IndexError as errw:
                print "[%s] ERROR in way [%s]: %s" % ( datetime.today().strftime('%H:%M:%S'),
                                                       self.idway, errw)
            except Exception as errw:
                print "[%s] Unexpected error! %s" % (datetime.today().strftime('%H:%M:%S'), errw)

class OSMHandler_Node(ContentHandler):
    def startElement(self, name, attrs):
        if name == "node" :
            self.id = attrs.get("id")
            self.lat = attrs.get("lat")
            self.lon = attrs.get("lon")
            connection.execute("INSERT INTO buildings VALUES(null, '%s', %s, %s)"
                               % (self.id, self.lat, self.lon))
            if self.i > 200:
                self.i = 0
                db.commit()
            else:
                self.i += 1
    def endElement(self,name):
        if (name == "node") :
            self.id = 0
            self.lat = 0.0
            self.lon = 0.0

osm = OSMHandler()
saxparser = make_parser()
saxparser.setContentHandler(osm)
print "Please, enter file name:"
filename = raw_input()

print("[%s] Start processing data" % datetime.today().strftime('%H:%M:%S'))
datasource = open(filename,"r")
saxparser.parse(datasource)
db.close()
print("[%s] End processing data" % datetime.today().strftime('%H:%M:%S'))
