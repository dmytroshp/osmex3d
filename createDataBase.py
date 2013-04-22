import MySQLdb

db = MySQLdb.connect(host="127.0.0.1", user="root", port = 3306, passwd="vertrigo", charset='utf8')
connection = db.cursor()

CREATE_DATABASE = """CREATE TABLE IF NOT EXISTS ar_verts (
  ID bigint(25) unsigned NOT NULL,
  verts text NOT NULL,
  PRIMARY KEY  (ID)
);"""

CREATE_DATABASE_1 = """CREATE TABLE IF NOT EXISTS objectCategory (
  id INT NOT NULL auto_increment,
  name varchar(50) NOT NULL,
  PRIMARY KEY  (id)
);"""

CREATE_DATABASE_2 = """CREATE TABLE IF NOT EXISTS objectInstance (
  id INT NOT NULL auto_increment,
  ObjectID INT NOT NULL,
  scaleX DOUBLE,
  scaleY DOUBLE,
  scaleZ DOUBLE,
  rotationX DOUBLE,
  rotationY DOUBLE,
  rotationZ DOUBLE,
  positionLat DOUBLE,
  positionLon DOUBLE,
  PRIMARY KEY  (id)
);"""

CREATE_DATABASE_3 = """CREATE TABLE IF NOT EXISTS objectType (
  id INT NOT NULL auto_increment,
  name varchar(255) NOT NULL,
  CategoryID int(11) NOT NULL,
  geometryStr TEXT  NOT NULL,
  PRIMARY KEY  (id)
);"""

CREATE_DATABASE_4 = """CREATE TABLE IF NOT EXISTS textures (
  UID int(11) NOT NULL auto_increment,
  TextureName varchar(255) NOT NULL,
  TexturePoints text NOT NULL,
  PRIMARY KEY  (UID),
  UNIQUE KEY TextureName (TextureName)
);"""

CREATE_DATABASE_5 = """CREATE TABLE IF NOT EXISTS tile (
  ID bigint(25) unsigned NOT NULL,
  lvl tinyint(4) NOT NULL,
  id_av bigint(25) unsigned NOT NULL,
  PRIMARY KEY  (ID)
);"""

CREATE_DATABASE_6 = """CREATE TABLE IF NOT EXISTS buildings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  idNode CHAR(10),
  idWay CHAR(12),
  lat DOUBLE,
  lon DOUBLE
);"""

connection.execute("CREATE DATABASE IF NOT EXISTS osmex3d;")
connection.execute("USE osmex3d;")
connection.execute(CREATE_DATABASE)
connection.execute(CREATE_DATABASE_1)
connection.execute(CREATE_DATABASE_2)
connection.execute(CREATE_DATABASE_3)
connection.execute(CREATE_DATABASE_4)
connection.execute(CREATE_DATABASE_5)
connection.execute(CREATE_DATABASE_6)
connection.execute("ALTER TABLE buildings ADD INDEX (idNode);")
db.commit()
db.close()
