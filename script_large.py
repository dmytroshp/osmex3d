from lxml import etree
from math import *
from datetime import *
import MySQLdb

print "Please, enter file name:"
filen = raw_input()

db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
connection = db.cursor()
connection.execute("USE osmex3d;")
db.autocommit(False)
print("[%s] Start processing data" % datetime.today().strftime('%H:%M:%S'))
content = etree.iterparse(filen, events=('end',), tag='bounds')

for event, elem in content:
    print float(elem.attrib['minlat']), float(elem.attrib['minlon']), \
    float(elem.attrib['maxlat']), float(elem.attrib['maxlon'])
    elem.clear()
    while elem.getprevious() is not None:
        del elem.getparent()[0]

print("[%s] Start processing ways" % datetime.today().strftime('%H:%M:%S'))

content = etree.iterparse(filen, events=('start',), tag='way')

i = 0
for event, elem in content:
    id_way = elem.attrib['id']
    for item in elem:
        if item.tag == 'nd':
            i+=1
            connection.execute("INSERT INTO buildings VALUES(null, '%s', '%s', 0, 0)"
                               % (item.attrib['ref'], id_way))
            if i > 100:
                i = 0
                db.commit()
        item.clear()
    db.commit()
    elem.clear()
    while elem.getprevious() is not None:
        del elem.getparent()[0]
del content
print("[%s] Start processing nodes" % datetime.today().strftime('%H:%M:%S'))
content = etree.iterparse(filen, events=('end',), tag='node')

j = 0
for event, elem in content:
    j += 1
    id_node = elem.attrib['id']
    connection.execute("UPDATE buildings SET lat=%f, lon=%f WHERE idNode='%s'"
                      % (float(elem.attrib['lat']), float(elem.attrib['lon']), id_node))
    if (j > 400):
        db.commit()
        j = 0
    elem.clear()
    while elem.getprevious() is not None:
        del elem.getparent()[0]
del content
db.commit()
print("[%s] End processing data" % datetime.today().strftime('%H:%M:%S'))
db.close()