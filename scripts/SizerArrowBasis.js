var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SizerArrowBasis = function ( ) {
    
    THREE.Object3D.call( this );
    
    //this.pickable = true;
    this.target = null;
	
    this.AxisPositiveX = new OSMEX.SizerArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
    this.AxisNegativeX = new OSMEX.SizerArrow( new THREE.Vector3(-1, 0, 0 ), 0xff0000 );
	
    this.AxisPositiveY = new OSMEX.SizerArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
    this.AxisNegativeY = new OSMEX.SizerArrow( new THREE.Vector3( 0,-1, 0 ), 0x00ff00 );
	
    this.AxisPositiveZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    this.AxisNegativeZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0,-1 ), 0x0000ff );
    
    this.AxisPositiveXR = new OSMEX.Rotation( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
    this.AxisNegativeXR = new OSMEX.Rotation( new THREE.Vector3(-1, 0, 0 ), 0xff0000 );
	
    this.AxisPositiveYR = new OSMEX.Rotation( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
    this.AxisNegativeYR = new OSMEX.Rotation( new THREE.Vector3( 0,-1, 0 ), 0x00ff00 );
	
    this.AxisPositiveZR = new OSMEX.Rotation( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    this.AxisNegativeZR = new OSMEX.Rotation( new THREE.Vector3( 0, 0,-1 ), 0x0000ff );
	
    /*this.AxisPositiveX = new THREE.SizeArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000, function( object, delta ) { object.scale.x += delta } );
	this.AxisNegativeX = new THREE.SizeArrow( new THREE.Vector3(-1, 0, 0 ), 0xff0000, function( object, delta ) { object.scale.x += delta } );
	
	this.AxisPositiveY = new THREE.SizeArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00, function( object, delta ) { object.scale.y += delta } );
	this.AxisNegativeY = new THREE.SizeArrow( new THREE.Vector3( 0,-1, 0 ), 0x00ff00, function( object, delta ) { object.scale.y += delta } );
	
    this.AxisPositiveZ = new THREE.SizeArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff, function( object, delta ) { object.scale.z += delta } );
	this.AxisNegativeZ = new THREE.SizeArrow( new THREE.Vector3( 0, 0,-1 ), 0x0000ff, function( object, delta ) { object.scale.z += delta } );*/
	
    this.add(this.AxisPositiveX);
    this.add(this.AxisNegativeX);
	
    this.add(this.AxisPositiveY);
    this.add(this.AxisNegativeY);
	
    this.add(this.AxisPositiveZ);
    this.add(this.AxisNegativeZ);
    
    this.add(this.AxisPositiveXR);
    this.add(this.AxisNegativeXR);
	
    this.add(this.AxisPositiveYR);
    this.add(this.AxisNegativeYR);
	
    this.add(this.AxisPositiveZR);
    this.add(this.AxisNegativeZR);
    
    this.setTarget(null);
};

OSMEX.SizerArrowBasis.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.SizerArrowBasis.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    if ( target ) {
        
        this.position = target.position;
        this.traverse( function( object ) { object.visible = true } );
        
        this.AxisPositiveX.sizeFunc = function(target) { return function(scale) { target.scale.x = scale } }(this.target);
        this.AxisNegativeX.sizeFunc = function(target) { return function(scale) { target.scale.x = scale } }(this.target);
        
        this.AxisPositiveY.sizeFunc = function(target) { return function(scale) { target.scale.y = scale } }(this.target);
        this.AxisNegativeY.sizeFunc = function(target) { return function(scale) { target.scale.y = scale } }(this.target);
        
        this.AxisPositiveZ.sizeFunc = function(target) { return function(scale) { target.scale.z = scale } }(this.target);
        this.AxisNegativeZ.sizeFunc = function(target) { return function(scale) { target.scale.z = scale } }(this.target);
        
        this.AxisPositiveXR.rotationFunc = function(target) { return function(angle) { target.rotation.x = angle } }(this.target);
        this.AxisNegativeXR.rotationFunc = function(target) { return function(angle) { target.rotation.x = angle } }(this.target);
        
        this.AxisPositiveYR.rotationFunc = function(target) { return function(angle) { target.rotation.y = angle } }(this.target);
        this.AxisNegativeYR.rotationFunc = function(target) { return function(angle) { target.rotation.y = angle } }(this.target);
        
        this.AxisPositiveZR.rotationFunc = function(target) { return function(angle) { target.rotation.z = angle } }(this.target);
        this.AxisNegativeZR.rotationFunc = function(target) { return function(angle) { target.rotation.z = angle } }(this.target);
    }
    else {
        
        this.traverse( function( object ) { object.visible = false } );
        
        this.AxisPositiveX.sizeFunc = null;
        this.AxisNegativeX.sizeFunc = null;
        
        this.AxisPositiveY.sizeFunc = null;
        this.AxisNegativeY.sizeFunc = null;
        
        this.AxisPositiveZ.sizeFunc = null;
        this.AxisNegativeZ.sizeFunc = null;
        
        this.AxisPositiveXR.rotationFunc = null;
        this.AxisNegativeXR.rotationFunc = null;
        
        this.AxisPositiveYR.rotationFunc = null;
        this.AxisNegativeYR.rotationFunc = null;
        
        this.AxisPositiveZR.rotationFunc = null;
        this.AxisNegativeZR.rotationFunc = null;
    }
}
