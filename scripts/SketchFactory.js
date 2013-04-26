var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SketchFactory = function (  ) { 
    
    THREE.Object3D.call( this );
    
    this.DEFAULT_SCALE = 10.0;
    
    this.geometriesCache = {};
    
    this.buildMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, shading: THREE.SmoothShading } );
    
    this.usualMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } );
    
    this.currentObject = null;
};

OSMEX.SketchFactory.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.SketchFactory.prototype.onLeftClick = function ( mouse ) {
    
    if (this.currentObject !== null) {
        
        this.finishBuild();
    }
}

OSMEX.SketchFactory.prototype.onMouseMove = function ( mouse ) {
    
    if (this.currentObject !== null) {
        
        this.currentObject.setVisibility(true);
        
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
        var intersectPoint = ray.intersectPlane(groundPlane);

        if (intersectPoint !== undefined) {

            this.currentObject.position.copy(intersectPoint);
        }
    }
}

OSMEX.SketchFactory.prototype.isBuilding = function () {
    
    return this.currentObject !== null;
};

OSMEX.SketchFactory.prototype.startBuild = function( objectTypeId ) {
    
    if (this.currentObject !== null) {
        
        this.remove(this.currentObject);
    }
    
    var geometry = this.makeGeometry(objectTypeId);
    
    this.currentObject = new OSMEX.Block( geometry, this.buildMaterial );
    this.currentObject.scale = new THREE.Vector3(this.DEFAULT_SCALE, this.DEFAULT_SCALE, this.DEFAULT_SCALE);
    this.currentObject.pickable = false;
    this.currentObject.setVisibility(false);
    this.add(this.currentObject);
};

OSMEX.SketchFactory.prototype.stopBuild = function() {
    
    if (this.currentObject !== null) {
        
        this.remove(this.currentObject);
        this.currentObject = null;
    }
};

OSMEX.SketchFactory.prototype.finishBuild = function() {
    
    if (this.currentObject !== null) {
        
        this.currentObject.material = this.usualMaterial.clone();
        this.currentObject.pickable = true;
        this.currentObject.bbox.setVisibility(false);
        
        this.parent.add(this.currentObject);
        this.currentObject = null;
    }
};

OSMEX.SketchFactory.prototype.makeGeometry = function( objectTypeId ) {
    
    var objGeometry;
    
    console.log("objectTypeId=", objectTypeId);
    
    // Cube
    if (objectTypeId == 1) {
        
        objGeometry = new THREE.CubeGeometry( 1, 1, 1 );
    }
    // Sphere
    else if (objectTypeId == 2) {
        
        objGeometry = new THREE.SphereGeometry( 0.6, 15, 15 );
    }
    // Cylinder
    else if (objectTypeId == 3) {
        
        objGeometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 15, 15 );
    }
    // Cone
    else if (objectTypeId == 4) {
        
        objGeometry = new THREE.CylinderGeometry( 0, 0.5, 1, 15, 15 );
    }
    // Torus
    else if (objectTypeId == 5) {
        
        objGeometry = new THREE.TorusGeometry( 1, 0.2, 30, 30);
    }
    // Tetrahedron
    else if (objectTypeId == 6) {
        
        objGeometry = new THREE.TetrahedronGeometry (1, 0.1);
    }
    // checking geometries cache and request geometry from the server if necessary
    else {

        objGeometry = this.geometriesCache[objectTypeId];

        if (objGeometry === null) {

            // HERE objGeometryStr SHOULD BE OBTAINED FROM THE SERVER BY AJAX REQUEST

            objGeometry = getUnpackedGeometry(objGeometryStr);

            objGeometry.computeCentroids();
            objGeometry.computeFaceNormals();

            this.geometriesCache[objectTypeId] = objGeometry;

        }
    }

    return objGeometry;
};

function getUnpackedGeometry( packedGeometry ) {

    function isBitSet( value, position ) {

            return value & ( 1 << position );

    }
    
    var geometry = new THREE.Geometry();

    var i, j, fi,

    offset, zLength, nVertices,

    colorIndex, normalIndex, uvIndex, materialIndex,

    type,
    isQuad,
    hasMaterial,
    hasFaceUv, hasFaceVertexUv,
    hasFaceNormal, hasFaceVertexNormal,
    hasFaceColor, hasFaceVertexColor,

    vertex, face, color, normal,

    uvLayer, uvs, u, v,

    faces = packedGeometry.faces,
    vertices = packedGeometry.vertices,
    normals = packedGeometry.normals,
    colors = packedGeometry.colors,

    nUvLayers = 0;

    // disregard empty arrays

    for ( i = 0; i < packedGeometry.uvs.length; i++ ) {

            if ( packedGeometry.uvs[ i ].length ) nUvLayers ++;

    }

    for ( i = 0; i < nUvLayers; i++ ) {

            geometry.faceUvs[ i ] = [];
            geometry.faceVertexUvs[ i ] = [];

    }

    offset = 0;
    zLength = vertices.length;

    while ( offset < zLength ) {

            vertex = new THREE.Vector3();

            vertex.x = vertices[ offset ++ ];
            vertex.y = vertices[ offset ++ ];
            vertex.z = vertices[ offset ++ ];

            geometry.vertices.push( vertex );

    }

    offset = 0;
    zLength = faces.length;

    while ( offset < zLength ) {

            type = faces[ offset ++ ];


            isQuad              = isBitSet( type, 0 );
            hasMaterial         = isBitSet( type, 1 );
            hasFaceUv           = isBitSet( type, 2 );
            hasFaceVertexUv     = isBitSet( type, 3 );
            hasFaceNormal       = isBitSet( type, 4 );
            hasFaceVertexNormal = isBitSet( type, 5 );
            hasFaceColor	    = isBitSet( type, 6 );
            hasFaceVertexColor  = isBitSet( type, 7 );

            //console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

            if ( isQuad ) {

                    face = new THREE.Face4();

                    face.a = faces[ offset ++ ];
                    face.b = faces[ offset ++ ];
                    face.c = faces[ offset ++ ];
                    face.d = faces[ offset ++ ];

                    nVertices = 4;

            } else {

                    face = new THREE.Face3();

                    face.a = faces[ offset ++ ];
                    face.b = faces[ offset ++ ];
                    face.c = faces[ offset ++ ];

                    nVertices = 3;

            }

            if ( hasMaterial ) {

                    materialIndex = faces[ offset ++ ];
                    face.materialIndex = materialIndex;

            }

            // to get face <=> uv index correspondence

            fi = geometry.faces.length;

            if ( hasFaceUv ) {

                    for ( i = 0; i < nUvLayers; i++ ) {

                            uvLayer = packedGeometry.uvs[ i ];

                            uvIndex = faces[ offset ++ ];

                            u = uvLayer[ uvIndex * 2 ];
                            v = uvLayer[ uvIndex * 2 + 1 ];

                            geometry.faceUvs[ i ][ fi ] = new THREE.Vector2( u, v );

                    }

            }

            if ( hasFaceVertexUv ) {

                    for ( i = 0; i < nUvLayers; i++ ) {

                            uvLayer = packedGeometry.uvs[ i ];

                            uvs = [];

                            for ( j = 0; j < nVertices; j ++ ) {

                                    uvIndex = faces[ offset ++ ];

                                    u = uvLayer[ uvIndex * 2 ];
                                    v = uvLayer[ uvIndex * 2 + 1 ];

                                    uvs[ j ] = new THREE.Vector2( u, v );

                            }

                            geometry.faceVertexUvs[ i ][ fi ] = uvs;

                    }

            }

            if ( hasFaceNormal ) {

                    normalIndex = faces[ offset ++ ] * 3;

                    normal = new THREE.Vector3();

                    normal.x = normals[ normalIndex ++ ];
                    normal.y = normals[ normalIndex ++ ];
                    normal.z = normals[ normalIndex ];

                    face.normal = normal;

            }

            if ( hasFaceVertexNormal ) {

                    for ( i = 0; i < nVertices; i++ ) {

                            normalIndex = faces[ offset ++ ] * 3;

                            normal = new THREE.Vector3();

                            normal.x = normals[ normalIndex ++ ];
                            normal.y = normals[ normalIndex ++ ];
                            normal.z = normals[ normalIndex ];

                            face.vertexNormals.push( normal );

                    }

            }


            if ( hasFaceColor ) {

                    colorIndex = faces[ offset ++ ];

                    color = new THREE.Color( colors[ colorIndex ] );
                    face.color = color;

            }


            if ( hasFaceVertexColor ) {

                    for ( i = 0; i < nVertices; i++ ) {

                            colorIndex = faces[ offset ++ ];

                            color = new THREE.Color( colors[ colorIndex ] );
                            face.vertexColors.push( color );

                    }

            }

            geometry.faces.push( face );

    }
    
    return geometry;
}
