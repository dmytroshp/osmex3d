var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Torus = function ( dir, origin, hex ) {
    
    THREE.Object3D.call( this );
    this.name = "Torus";
	
    this.pickable = false;
    
    this.dir = null;
    this.setDirection( dir );

    if ( hex === undefined ) hex = 0xffff00;
    
  

    var meshMaterial = new THREE.MeshPhongMaterial( {
        color: hex, 
        shading: THREE.SmoothShading, 
        ambient: 0xffffff,
        opacity: 0.6
    } );    
   
    var torusGeometry = new THREE.TorusGeometry( 15, 0.5, 20, 20);
    this.torus = new THREE.Mesh ( torusGeometry, meshMaterial );
    this.torus.position.set ( 0, 0, 0 );
    this.torus.rotation.set ( 1.5, 0, 0 );
    this.add( this.torus );

    if ( origin instanceof THREE.Vector3 ) this.position = origin;
};

OSMEX.Torus.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.Torus.prototype.setDirection = function ( dir ) {
    
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


OSMEX.Torus.prototype.setColor = function ( hex ) {
    
    this.torus.material.color.setHex( hex );
}; 
