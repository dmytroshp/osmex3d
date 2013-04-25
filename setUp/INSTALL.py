import subprocess

path = "D:\osmScript"
python_path = "D:\Python27\python.exe"
cmd1 = "%s %s\setUp\createDataBase.py" % (python_path, path)
cmd2 = "%s %s\setUp\OSMSAXParser[OPTIMIZED].py ukraine-latest.osm" % (python_path, path)
PIPE = subprocess.PIPE
p = subprocess.Popen(cmd1, shell = True)
p.wait()
print "Creating database...DONE!"
p = subprocess.Popen(cmd2, shell = True)
p.wait()
print "Parsing osm files...DONE!"
