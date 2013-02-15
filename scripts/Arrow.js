var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Arrow = function ( dir, origin, length, hex ) {
    
   
    
    THREE.Object3D.call( this );
    this.name = "Arrow";
    
    this.pickable = false;
    
    this.dir = null;
    this.setDirection( dir );
    
    angle1 = null;
    angle2 = null;
    axis = null;
    this.setAngle(axis, angle1, angle2);

    if ( hex === undefined ) hex = 0xffff00;
    if ( length === undefined ) length = 20;
    
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    lineGeometry.vertices.push( new THREE.Vector3( 0, 1, 0 ) );

    this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( {color: hex} ) );
    this.add( this.line );

    var meshMaterial = new THREE.MeshPhongMaterial( {
        color: hex, 
        shading: THREE.SmoothShading, 
        ambient: 0xffffff
    } );
    

    var coneGeometry = new THREE.CylinderGeometry( 0, 1.5, 7.5, 5, 1 );
    this.cone = new THREE.Mesh( coneGeometry, meshMaterial );
    this.cone.position.set( 0, 1, 0 );
    this.add( this.cone );
    
    if ( origin instanceof THREE.Vector3 ) this.position = origin;
	
    this.len = 0;
    this.setLength( length );
    this.setBasicArrowLength( );
 
};

OSMEX.Arrow.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.Arrow.prototype.setDirection = function ( dir ) {
    
    this.dir = dir.clone().normalize();
    
    var upVector = new THREE.Vector3( 0, 1, 0 );
	
    var cosa = upVector.dot( this.dir );
	
    var axis;
	
    if ( ( cosa < -0.99 ) || ( cosa > 0.99 ) )
    {
        axis = new THREE.Vector3( 1, 0, 0 );
    }
    else
    {
        axis = upVector.crossSelf( this.dir );
    }
	
    var radians = Math.acos( cosa );
	
    this.matrix = new THREE.Matrix4().makeRotationAxis( axis, radians );
    this.rotation.setEulerFromRotationMatrix( this.matrix, this.eulerOrder );
};

OSMEX.Arrow.prototype.setLength = function ( length ) {
    
    this.len = length;
    this.line.scale.y = length;
    this.cone.position.y = length;    
    
};

OSMEX.Arrow.prototype.setBasicArrowLength = function ( ) {
    
    this.len = 30;
    this.line.scale.y = 30;
    this.cone.position.y = 30;    
    
};

OSMEX.Arrow.prototype.setAngle = function ( axis, angle1, angle2 ) {
    
    if (axis === "x") { this.line.rotation.x = -angle1; this.cone.rotation.x = -angle1;    this.line.rotation.z = angle2; this.cone.rotation.z = angle2; }
    if (axis === "y") { this.line.rotation.x = angle1; this.cone.rotation.y = angle2;}
    if (axis === "z") this.torus.rotation.z = angle; 
    
};

OSMEX.Arrow.prototype.setColor = function ( hex ) {
    
    this.line.material.color.setHex( hex );
    this.cone.material.color.setHex( hex );
}; 
