var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Arrow = function ( dir, origin, length, hex, type ) {
    
    THREE.Object3D.call( this );
    this.name = "Arrow";
    
    this.pickable = false;
    
    this.dir = null;
    this.setDirection( dir );

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
    
    this.type = type;
    
    if (this.type == "moving"){
        var coneGeometry = new THREE.CylinderGeometry( 0, 1.5, 7.5, 5, 1 );
        this.cone = new THREE.Mesh( coneGeometry, meshMaterial );
        this.cone.position.set( 0, 30, 0 );
        this.add( this.cone );
    }else if (this.type == "sizing"){
         var cubeGeometry = new THREE.CubeGeometry( 4, 4, 4 );;
         this.cube = new THREE.Mesh( cubeGeometry, meshMaterial );
         this.cube.position.set( 0, 30, 0 );
         this.add( this.cube );
     }

    
    if ( origin instanceof THREE.Vector3 ) this.position = origin;
	
    this.len = 0;
    this.defaultLength = length;
    this.setLength( length );
 
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
        axis = new THREE.Vector3().cross( upVector, this.dir );
    }
	
    var radians = Math.acos( cosa );
	
    this.matrix = new THREE.Matrix4().makeRotationAxis( axis, radians );
    this.rotation.setEulerFromRotationMatrix( this.matrix, this.eulerOrder );
};

OSMEX.Arrow.prototype.setLength = function ( length ) {
    
    this.len = length;
    this.line.scale.y = length;
    if (this.type == "sizing")this.cube.position.y = length; 
    
};

OSMEX.Arrow.prototype.restoreDefaultLength = function ( ) {
    
    this.setLength(this.defaultLength);
};

OSMEX.Arrow.prototype.setColor = function ( hex ) {
    
    this.line.material.color.setHex( hex );
    if (this.type == "sizing")this.cube.material.color.setHex( hex );
        else this.cube.material.color.setHex( hex );
}; 
