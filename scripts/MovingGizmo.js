var OSMEX = OSMEX || { REVISION: '1' };


OSMEX.MovingGizmo = function ( ) {
    
    THREE.Object3D.call( this );
    
    scale = this.scale;
    
    this.target = null;
	
    this.AxisX = new OSMEX.MovingArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
	
    this.AxisY = new OSMEX.MovingArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
	
    this.AxisZ = new OSMEX.MovingArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    
	
    this.add(this.AxisX);
	
    this.add(this.AxisY);
	
    this.add(this.AxisZ);

    
    this.setTarget(null);
};

OSMEX.MovingGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.MovingGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    var arrowMoveFunc = null;
    
    var visibility = false;
    
    if ( target ) {
        
        visibility = true;
        
        arrowMoveFunc = function(target) { return function(delta) {
                          
            if (delta < 2 && delta > -2){
                var deltaScale = delta ;
                var shiftPos = this.dir.clone();
                target.matrix.rotateAxis(shiftPos);
                console.log("delta",deltaScale);
                shiftPos.multiplyScalar(deltaScale * 1.5 );
                console.log("shiftPos",shiftPos);            
                target.position.addSelf(shiftPos);
            }          
                 
                          
        } }(this.target);
                        
    }
    
    
    this.traverse( function( object ) { object.visible = visibility } );
    
    this.AxisX.moveFunc = arrowMoveFunc;
    
    this.AxisY.moveFunc = arrowMoveFunc;
    
    this.AxisZ.moveFunc = arrowMoveFunc;
      
}

OSMEX.MovingGizmo.prototype.update = function ( ) {
    
    if(this.target){  
        
        this.position.copy(this.target.position);
        this.rotation.copy(this.target.rotation);
        
    }
}