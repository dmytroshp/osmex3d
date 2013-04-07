import MySQLdb

db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
connection = db.cursor()
CREATE_DATABASE = "CREATE DATABASE IF NOT EXISTS osmex3d;"
CREATE_TABLE_TYPE = "CREATE TABLE IF NOT EXISTS objectType (" \
                    "   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," \
                    "   preview TEXT," \
                    "   vertexes TEXT," \
                    "   indexes TEXT" \
                    ");"
CREATE_TABLE_INSTANCE = "CREATE TABLE IF NOT EXISTS instance (" \
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
CUBE_VERTEXES = "-1.0 -1.0 1.0 1.0 -1.0 1.0 1.0 1.0 1.0 -1.0 1.0 1.0 -1.0 -1.0 -1.0 \
-1.0 1.0 -1.0 1.0 1.0 -1.0 1.0 -1.0 -1.0 -1.0 1.0 -1.0 -1.0 1.0 1.0 1.0 1.0 1.0 1.0 \
1.0 -1.0 -1.0 -1.0 -1.0 1.0 -1.0 -1.0 1.0 -1.0 1.0 -1.0 -1.0 1.0 1.0 -1.0 -1.0 1.0 \
1.0 -1.0 1.0 1.0 1.0 1.0 -1.0 1.0 -1.0 -1.0 -1.0 -1.0 -1.0 1.0 -1.0 1.0 1.0 -1.0 1.0 -1.0"
CUBE_INDEXES = "0 1 2 0 2 3 4 5 6 4 6 7 8 9 10 8 10 11 12 13 14 12 14 15 16 17 18 \
16 18 19 20 21 22 20 22 23"
CUBE_PREVIEW = "/default/path/image.png"

INSERT_CUBE_GEOMETRY = "INSERT INTO objectType VALUES (null, '%s', '%s', '%s');" %\
                       (CUBE_PREVIEW, CUBE_VERTEXES, CUBE_INDEXES)

connection.execute(CREATE_DATABASE)
db.commit()
connection.execute("USE osmex3d;")
connection.execute(CREATE_TABLE_TYPE)
db.commit()
connection.execute(INSERT_CUBE_GEOMETRY)
connection.execute(CREATE_TABLE_INSTANCE)
db.commit()
db.close()
