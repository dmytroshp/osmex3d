import MySQLdb

db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
connection = db.cursor()
CREATE_DATABASE = "CREATE DATABASE IF NOT EXISTS osmex3d;"
CREATE_TABLE_TYPE = "CREATE TABLE IF NOT EXISTS objectType (" \
                    "   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," \
                    "   preview TEXT," \
                    "   geometry TEXT" \
                    ");"
CREATE_TABLE_INSTANCE = "CREATE TABLE IF NOT EXISTS objectInstance (" \
                        "   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," \
                        "   scaleX DOUBLE," \
                        "   scaleY DOUBLE," \
                        "   scaleZ DOUBLE," \
                        "   rotationX DOUBLE," \
                        "   rotationY DOUBLE," \
                        "   rotationZ DOUBLE," \
                        "   positionLat DOUBLE," \
                        "   positionLon DOUBLE," \
                        "   ObjectID INT," \
                        "   FOREIGN KEY (ObjectID) REFERENCES objectType (id)" \
                        ");"
CUBE_PREVIEW = "/default/path/image.png"

CREATE_TABLE_BUILDINGS = "CREATE TABLE IF NOT EXISTS buildings ("\
                        "   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,"\
                        "   idNode CHAR(10),"\
                        "   idWay CHAR(12),"\
                        "   lat DOUBLE,"\
                        "   lon DOUBLE"\
                        ");"

connection.execute("DROP DATABASE osmex3d;")
connection.execute(CREATE_DATABASE)
db.commit()
connection.execute("USE osmex3d;")
connection.execute(CREATE_TABLE_TYPE)
connection.execute(CREATE_TABLE_INSTANCE)
connection.execute(CREATE_TABLE_BUILDINGS)
connection.execute("ALTER TABLE buildings ADD INDEX (idNode);")
db.commit()
db.close()
