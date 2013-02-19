import MySQLdb

db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
cursor = db.cursor()
CREATE_DATABASE = "CREATE DATABASE IF NOT EXISTS osmex3d;"
CREATE_TABLE_TYPE = "CREATE TABLE IF NOT EXISTS type (" \
                    "   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY," \
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
                        "   typeObject INT," \
                        "   FOREIGN KEY (typeObject) REFERENCES type (id)" \
                        ");"

cursor.execute(CREATE_DATABASE)
db.commit()
cursor.execute("USE osmex3d;")
cursor.execute(CREATE_TABLE_TYPE)
db.commit()
cursor.execute(CREATE_TABLE_INSTANCE)
db.commit()
db.close()
