var OSMEX = OSMEX || { REVISION: '1' };

MIN_OBJ_SCALE = 0.33;
//MAX_OBJ_SCALE = 20; /*not used for now*/

OSMEX.SizerGizmo = function ( ) {
    
    THREE.Object3D.call( this );
    
    this.target = null;
	
    this.AxisPositiveX = new OSMEX.SizerArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
    this.AxisNegativeX = new OSMEX.SizerArrow( new THREE.Vector3(-1, 0, 0 ), 0xff0000 );
	
    this.AxisPositiveY = new OSMEX.SizerArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
    this.AxisNegativeY = new OSMEX.SizerArrow( new THREE.Vector3( 0,-1, 0 ), 0x00ff00 );
	
    this.AxisPositiveZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    this.AxisNegativeZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0,-1 ), 0x0000ff );
	
    this.add(this.AxisPositiveX);
    this.add(this.AxisNegativeX);
	
    this.add(this.AxisPositiveY);
    this.add(this.AxisNegativeY);
	
    this.add(this.AxisPositiveZ);
    this.add(this.AxisNegativeZ);
    
    this.Cube = new OSMEX.ScaleCube();
    
    this.add(this.Cube);
    
    this.setTarget(null);
};

OSMEX.SizerGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.SizerGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    var arrowSizeFunc = null;
    var cubeSizeFunc = null;
    
    var visibility = false;
    
    if ( target ) {
        
        visibility = true;
        
        arrowSizeFunc = function(target) { return function(delta) {
                    
            var deltaScale = delta * 40.0;

            var scaleAxis = new THREE.Vector3( Math.abs(this.dir.x), Math.abs(this.dir.y), Math.abs(this.dir.z) );
            
            var currentScale = scaleAxis.clone().multiplySelf(target.scale).length();
            
            if (currentScale + deltaScale > 0.1) {
                
                var deltaScaleVec = scaleAxis.clone().multiplyScalar(deltaScale);
                target.scale.addSelf(deltaScaleVec);
                
                var shiftPos = this.dir.clone();
                target.matrix.rotateAxis(shiftPos);
                shiftPos.multiplyScalar(deltaScale / 2);
                target.position.addSelf(shiftPos);
            }
    
        } }(this.target);
    
        cubeSizeFunc = function(target) { return function(delta) {
                
            var deltaScale = delta * 5.0;
            var resultScale = target.scale.clone().addScalar(deltaScale);
            
            if (resultScale.x > 0.5 && resultScale.y > 0.5 && resultScale.z > 0.5) {
                
                target.scale.addScalar(deltaScale);
            }
              
        } }(this.target);
                
    }
    
    this.traverse( function( object ) { object.visible = visibility } );
    
    this.AxisPositiveX.sizeFunc = arrowSizeFunc;
    this.AxisNegativeX.sizeFunc = arrowSizeFunc;

    this.AxisPositiveY.sizeFunc = arrowSizeFunc;
    this.AxisNegativeY.sizeFunc = arrowSizeFunc;

    this.AxisPositiveZ.sizeFunc = arrowSizeFunc;
    this.AxisNegativeZ.sizeFunc = arrowSizeFunc;
    
    this.Cube.sizeFunc = cubeSizeFunc;
}

OSMEX.SizerGizmo.prototype.update = function ( ) {
    
    if(this.target){  
        
        this.position.copy(this.target.position);
        this.rotation.copy(this.target.rotation);
    }
}
