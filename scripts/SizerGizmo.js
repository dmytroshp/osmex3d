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
    
    this.Cube =  new OSMEX.ScaleCube ();
	
    this.add(this.AxisPositiveX);
    this.add(this.AxisNegativeX);
	
    this.add(this.AxisPositiveY);
    this.add(this.AxisNegativeY);
	
    this.add(this.AxisPositiveZ);
    this.add(this.AxisNegativeZ);
    
    this.add(this.Cube);
    
    this.setTarget(null);
};

OSMEX.SizerGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.SizerGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    if ( target ) {
        
        var SCALE_PREV=1;
        var SCALE_PREV_CUBE=0;
        var ABS = null;
        
        this.traverse( function( object ) { object.visible = true } );
        
        this.AxisPositiveX.sizeFunc = function(target) { return function(scale) {
                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.x += ABS;
                        target.position.x += (scale-SCALE_PREV)*5;
                    } else if(target.scale.x - ABS > MIN_OBJ_SCALE){
                            target.scale.x -= ABS;
                            target.position.x += (scale-SCALE_PREV)*5;
                    }  
                    SCALE_PREV=scale; 
                }  
                
        } }(this.target);
    
        this.AxisNegativeX.sizeFunc = function(target) { return function(scale) {
                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){  
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.x += ABS;
                        target.position.x -= (scale-SCALE_PREV)*5;
                    } else if(target.scale.x - ABS > MIN_OBJ_SCALE){
                            target.scale.x -= ABS;
                            target.position.x -= (scale-SCALE_PREV)*5;
                    }                         
                    SCALE_PREV=scale; 
                }                              
               
              
        } }(this.target);
        
        this.AxisPositiveY.sizeFunc = function(target) { return function(scale) { 
                                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){  
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.y += ABS;
                        target.position.y += (scale-SCALE_PREV)*5;
                    } else if(target.scale.y - ABS > MIN_OBJ_SCALE){
                            target.scale.y -= ABS;
                            target.position.y += (scale-SCALE_PREV)*5;
                    }  
                    SCALE_PREV=scale; 
                }  
              
        } }(this.target);
                
        this.AxisNegativeY.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){  
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.y += ABS;
                        target.position.y -= (scale-SCALE_PREV)*5;
                    } else if(target.scale.y - ABS > MIN_OBJ_SCALE){
                            target.scale.y -= ABS;
                            target.position.y -= (scale-SCALE_PREV)*5;
                    }  
                    SCALE_PREV=scale; 
                }  
                
        
              
        } }(this.target);
                
        
        this.AxisPositiveZ.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){ 
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.z += ABS;
                        target.position.z += (scale-SCALE_PREV)*5;
                    } else if(target.scale.z - ABS > MIN_OBJ_SCALE){
                            target.scale.z -= ABS;
                            target.position.z += (scale-SCALE_PREV)*5;
                    }  
                    SCALE_PREV=scale; 
                }
              
        } }(this.target);
                
        this.AxisNegativeZ.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.6 ){
                    ABS = Math.abs(scale-SCALE_PREV);
                    if(scale-SCALE_PREV > 0) {
                        target.scale.z += ABS;
                        target.position.z -= (scale-SCALE_PREV)*5;
                    } else if(target.scale.z - ABS > MIN_OBJ_SCALE){
                            target.scale.z -= ABS;
                            target.position.z -= (scale-SCALE_PREV)*5;
                    }  
                    SCALE_PREV=scale; 
                }
              
        } }(this.target);
    
        this.Cube.sizeFunc = function(target) { return function(scale) {
                
               if (Math.abs(scale-SCALE_PREV_CUBE) < 1 ){
                   ABS = Math.abs(scale-SCALE_PREV_CUBE);
                    if(scale-SCALE_PREV_CUBE > 0) {                       
                        target.scale.x += ABS;
                        target.scale.y += ABS;
                        target.scale.z += ABS;
                    } else if(target.scale.x - ABS > MIN_OBJ_SCALE){
                         target.scale.x -= ABS;
                         target.scale.y -= ABS;
                         target.scale.z -= ABS;
                    }  
                    SCALE_PREV_CUBE=scale; 
                }
              
        } }(this.target);
                
       
    }
    else {
        
        this.traverse( function( object ) { object.visible = false } );
        
        this.AxisPositiveX.sizeFunc = null;
        this.AxisNegativeX.sizeFunc = null;
        
        this.AxisPositiveY.sizeFunc = null;
        this.AxisNegativeY.sizeFunc = null;
        
        this.AxisPositiveZ.sizeFunc = null;
        this.AxisNegativeZ.sizeFunc = null;
        
        this.Cube.sizeFunc = null;
    }
}

OSMEX.SizerGizmo.prototype.update = function ( ) {
    
    if(this.target){  
        
        this.position.copy(this.target.position);
        this.rotation.copy(this.target.rotation);
    }
}
