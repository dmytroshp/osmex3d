var OSMEX = OSMEX || { REVISION: '1' };

function LonToTile(lon,zoom) {
    return (lon+180)/360*Math.pow(2,zoom);
}
function LatToTile(lat,zoom)  { 
    return (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom);
}

OSMEX.OsmArea = function ( minLon, minLat, maxLon, maxLat ) {
    
    THREE.Object3D.call( this );
    
    this.minLon = minLon;
    this.minLat = minLat;
    
    this.maxLon = maxLon;
    this.maxLat = maxLat;
    
    this.tileSizeInMeters = 152.8832; // 18th level tile size in meters
    
    var minLonTile = LonToTile(this.minLon, 18);
    this.tile_x1 = Math.floor(minLonTile);
    this.tile_x1_offset = minLonTile - this.tile_x1;
    
    var maxLonTile = LonToTile(this.maxLon, 18);
    this.tile_x2 = Math.ceil(maxLonTile);
    this.tile_x2_offset = 1 - (this.tile_x2 - maxLonTile);

    var minLatTile = LatToTile(this.minLat, 18);
    this.tile_y1 = Math.floor(minLatTile);
    this.tile_y1_offset = minLatTile - this.tile_y1;
    
    var maxLatTile = LatToTile(this.maxLat, 18);
    this.tile_y2 = Math.ceil(maxLatTile);
    this.tile_y2_offset = 1 - (this.tile_y2 - maxLatTile);

    this.tilesX = this.tile_x2 - this.tile_x1;
    this.tilesY = this.tile_y2 - this.tile_y1;
    
    this.areaWidth = (maxLonTile - minLonTile) * this.tileSizeInMeters;
    this.areaHeight = (maxLatTile - minLatTile) * this.tileSizeInMeters;
    
    this.buildTiles();
};

OSMEX.OsmArea.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.OsmArea.prototype.buildTiles = function () {
    
    var halfAreaWidth = this.areaWidth / 2,
        halfAreaHeight = this.areaHeight / 2;
    
    var maxAnisotropy = renderer.getMaxAnisotropy();
    var normal = new THREE.Vector3( 0, 1, 0 );

    var startY = this.tile_y1_offset;
    
    for ( var y = 0, ty = this.tile_y1; y < this.areaHeight; ty++) {
        
        var endY = (this.areaHeight - y < this.tileSizeInMeters) ? this.tile_y2_offset : 1;
        var height = this.tileSizeInMeters * (endY - startY);
        
        var startX = this.tile_x1_offset;
        
        for ( var x = 0, tx = this.tile_x1; x < this.areaWidth; tx++ ) {
            
            var endX = (this.areaWidth - x < this.tileSizeInMeters) ? this.tile_x2_offset : 1;
            var width = this.tileSizeInMeters * (endX - startX);
            
            var quadGeometry = new THREE.Geometry();
            
            var halfWidth = width / 2;
            var halfHeight = height / 2;
                
            quadGeometry.vertices.push( new THREE.Vector3( -halfWidth, 0.0, -halfHeight ) );
            quadGeometry.vertices.push( new THREE.Vector3(  halfWidth, 0.0, -halfHeight ) );
            quadGeometry.vertices.push( new THREE.Vector3( -halfWidth, 0.0,  halfHeight ) );
            quadGeometry.vertices.push( new THREE.Vector3(  halfWidth, 0.0,  halfHeight ) );

            var face = new THREE.Face4( 0, 2, 3, 1 );
            face.normal.copy(normal);
            face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );

            quadGeometry.faces.push( face );
            quadGeometry.faceVertexUvs[ 0 ].push( [
                new THREE.UV( startX, 1 - startY ),
                new THREE.UV( startX, 1 - endY   ),
                new THREE.UV( endX,   1 - endY   ),
                new THREE.UV( endX,   1 - startY )
                ] );
                
            quadGeometry.computeCentroids();
            
            var texture = THREE.ImageUtils.loadTexture('http://c.tile.openstreetmap.org/18/'+tx+'/'+ty+".png");
            texture.anisotropy = maxAnisotropy;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            var material = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texture } );
            
            var tileMesh = new THREE.Mesh( quadGeometry, material );
            var posX = x + width/2 - halfAreaWidth;
            var posZ = y + height/2 - halfAreaHeight;
            tileMesh.position = new THREE.Vector3( posX, 0, posZ );
            tileMesh.receiveShadow = true;
            
            this.add(tileMesh);
            
            startX = 0;
            x += width;
        }
        
        startY = 0;
        y += height;
    }
};

OSMEX.OsmArea.prototype.LonLatHeightToXyz = function (lon, lat, height) {
    
    var x = ((lon - this.minLon) / (this.maxLon - this.minLon)) * this.areaWidth - this.areaWidth / 2;
    var z = ((lat - this.minLat) / (this.maxLat - this.minLat)) * this.areaHeight - this.areaHeight / 2;
    
    return new THREE.Vector3(x, height, z);
}

OSMEX.OsmArea.prototype.XyzToLonLatHeight = function (pos) {
    
    var lon = ((pos.x + this.areaWidth / 2) / this.areaWidth) * (this.maxLon - this.minLon) + this.minLon;
    var lat = ((pos.z + this.areaHeight / 2) / this.areaHeight) * (this.maxLat - this.minLat) + this.minLat;
    
    return {longitude: lon, latitude: lat, height: pos.y};
}
