var OSMEX = OSMEX || { REVISION: '1' };


OSMEX.RotationGizmo = function ( ) {
    
    THREE.Object3D.call( this );
    
    this.target = null;
	
    this.AxisX = new OSMEX.RotationTorus( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
	
    this.AxisY = new OSMEX.RotationTorus( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
	
    this.AxisZ = new OSMEX.RotationTorus( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
	
    this.add(this.AxisX);	
    this.add(this.AxisY);	
    this.add(this.AxisZ);
    
    this.setTarget(null);
};

OSMEX.RotationGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.RotationGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    if ( target ) {
        
        this.position = target.position;
        this.traverse( function( object ) { object.visible = true } );
        
                
        
        this.AxisX.rotationFunc = function(target) { return function(angle) { target.rotation.x = angle } }(this.target);
        
        this.AxisY.rotationFunc = function(target) { return function(angle) { target.rotation.y = angle } }(this.target);
        
        this.AxisZ.rotationFunc = function(target) { return function(angle) { target.rotation.z = angle } }(this.target);
    }
    else {
        
        
        this.traverse( function( object ) { object.visible = false } );
        
        this.AxisX.rotationFunc = null;
        
        this.AxisY.rotationFunc = null;
        
        this.AxisZ.rotationFunc = null;
        
    }
}
