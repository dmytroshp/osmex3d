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
        
        console.log("LOADED");
        
        this.currentObject.setVisibility(true);
        if (!$("#BBox").prop("checked"))  this.currentObject.bbox.setVisibility(false);
        
        var intersectPoint = null;
        
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        
        var intersects = raycaster.intersectObjects(objectScene.children);

        if (intersects.length > 0) {

            for (i = 0; i < intersects.length; i++) {

                var intersector = intersects[i];

                if (intersector.object instanceof OSMEX.Block && intersector.object.visible) {
                    
                    console.log("intersector.object.name=", intersector.object.name);

                    intersectPoint = intersector.point;
                    break;
                }
            }
        }
        
        if (intersectPoint === null) {
            
            vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            projector.unprojectVector(vector, camera);
            var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
            intersectPoint = ray.intersectPlane(groundPlane);
        }
        
        if (intersectPoint) {
            
            this.currentObject.position.copy(intersectPoint);
            this.currentObject.position.y += this.currentObject.scale.y / 2; // to place the object above the ground
        }
    }
}

OSMEX.SketchFactory.prototype.isBuilding = function () {
    
    return this.currentObject !== null;
};

OSMEX.SketchFactory.prototype.startBuild = function( objectTypeId ) {
    
    if (this.currentObject !== null) {
        
        this.remove(this.currentObject);
        this.currentObject = null;
    }
    
    arrowMode = "building";
    
    var _this = this;
    
    this.makeGeometry(objectTypeId, function(geometry)
    {
        _this.currentObject = new OSMEX.Block( geometry, _this.buildMaterial );
        _this.currentObject.pickable = false;
        _this.currentObject.setVisibility(false);
        _this.currentObject.name = _this.name;
        _this.currentObject.scale = new THREE.Vector3(_this.DEFAULT_SCALE, _this.DEFAULT_SCALE, _this.DEFAULT_SCALE);
        _this.add(_this.currentObject);
    });
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
        
        this.parent.add(this.currentObject);
        arrowMode = null;
        this.currentObject = null;
        this.name = null;
        this.typeId = null;
    }
};

OSMEX.SketchFactory.prototype.makeGeometry = function( objectTypeId, onGeometryMade ) {
    
    // checking geometries cache and request geometry from the server if necessary
    
    var objGeometry = this.getCachedGeometry(objectTypeId);
    
    if (!objGeometry) {
        
        var _this = this;

        getCustomGeometry(objectTypeId, function(json)
        {  
            objGeometry = getUnpackedGeometry(json);

            objGeometry.computeCentroids();
            objGeometry.computeFaceNormals();

            _this.geometriesCache[objectTypeId] = objGeometry;

            onGeometryMade(objGeometry);
        });
    }
    else {
        
        onGeometryMade(objGeometry);
    }
};

OSMEX.SketchFactory.prototype.getCachedGeometry = function( objectTypeId ) {
    
    var objGeometry;
    
    this.typeId = objectTypeId;
    
    // Cube
    if (objectTypeId == 1) {
        
        objGeometry = new THREE.CubeGeometry( 1, 1, 1 );
        this.name = "cube";
    }
    // Sphere
    else if (objectTypeId == 2) {
        
        objGeometry = new THREE.SphereGeometry( 0.5, 15, 15 );
        this.name = "sphere";
    }
    // Cylinder
    else if (objectTypeId == 3) {
        
        objGeometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 15, 15 );
        this.name = "cylinder";
    }
    // Cone
    else if (objectTypeId == 4) {
        
        objGeometry = new THREE.CylinderGeometry( 0, 0.5, 1, 15, 15 );
        this.name = "cone";
    }
    // Torus
    else if (objectTypeId == 5) {
        
        objGeometry = new THREE.TorusGeometry( 0.5, 0.2, 30, 30);
        this.name = "torus";
    }
    // Tetrahedron
    else if (objectTypeId == 6) {
        
        objGeometry = new THREE.TetrahedronGeometry (0.5, 0.1);
        this.name = "tetrahedron";
    }
    else {

        objGeometry = this.geometriesCache[objectTypeId];
        this.name = "undef";
    }
    
    return objGeometry;
}

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

OSMEX.SketchFactory.prototype.createObject = function( objectTypeId, onObjectCreated ) {
    
    var _this = this;
    
    var _this = this;
    
    this.makeGeometry(objectTypeId, function(geometry)
    {
        var obj = new OSMEX.Block( geometry, _this.usualMaterial.clone() );

        obj.scale = new THREE.Vector3(_this.DEFAULT_SCALE, _this.DEFAULT_SCALE, _this.DEFAULT_SCALE);
        
        onObjectCreated(obj);
    });
};
