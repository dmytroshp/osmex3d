var OSMEX = OSMEX || { REVISION: '1' };

var VECTOR_PREV = null;

OSMEX.RotationGizmo = function (  ) {
    
    THREE.Object3D.call( this );
    
    this.target = null;
	
    this.AxisX = new OSMEX.RotationTorus( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
	
    this.AxisY = new OSMEX.RotationTorus( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
	
    this.AxisZ = new OSMEX.RotationTorus( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
	
    this.add(this.AxisX);	
    this.add(this.AxisY);	
    this.add(this.AxisZ);
    
    this.overlay = new OSMEX.RotationGizmoOverlay(new THREE.Vector3( 1, 0, 0 ));
    this.add(this.overlay);
    
    this.setTarget(null);
};

OSMEX.RotationGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.RotationGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    if ( target ) {
        
        this.position = target.position;
        this.traverse( function( object ) { object.visible = true } );
        this.overlay.position = this.AxisX.position;
        
        this.AxisX.rotationFunc = function(target) { return function(BV, CV) { 
           
           var angle = Math.acos ((BV.x * CV.x + BV.y * CV.y) / (Math.sqrt(Math.pow(BV.x,2) + Math.pow(BV.y,2))*Math.sqrt(Math.pow(CV.x,2) + Math.pow(CV.y,2))));
      //     console.log (angle*180/Math.PI);

           target.rotation.x = angle;
                
                
        } }(this.target);
        
        this.AxisY.rotationFunc = function(target) { return function(vector) { target.rotation.y += 1 } }(this.target);
        
        this.AxisZ.rotationFunc = function(target) { return function(vector) { target.rotation.z += 1 } }(this.target);
    }
    else {
        
        this.traverse( function( object ) { object.visible = false } );
        
        this.AxisX.rotationFunc = null;
        
        this.AxisY.rotationFunc = null;
        
        this.AxisZ.rotationFunc = null;
    }
}

OSMEX.RotationGizmo.prototype.update = function ( camera ) {
    
    var vector = camera.position.clone().subSelf(this.position);
    
    this.overlay.setDirection(vector);
    
  /*  var shift = this.overlay.dir.clone().multiplyScalar(-1.5);
    var shiftedPos = this.position.clone().addSelf(shift);
    this.overlay.position = this.target.position;*/

}
