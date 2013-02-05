var OSMEX = OSMEX || { REVISION: '1' };

var SCALE_PREV=0;

OSMEX.SizerGizmo = function ( ) {
    
    THREE.Object3D.call( this );
    
    this.target = null;
	
    this.AxisPositiveX = new OSMEX.SizerArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
    this.AxisNegativeX = new OSMEX.SizerArrow( new THREE.Vector3(-1, 0, 0 ), 0xff0000 );
	
    this.AxisPositiveY = new OSMEX.SizerArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
    this.AxisNegativeY = new OSMEX.SizerArrow( new THREE.Vector3( 0,-1, 0 ), 0x00ff00 );
	
    this.AxisPositiveZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    this.AxisNegativeZ = new OSMEX.SizerArrow( new THREE.Vector3( 0, 0,-1 ), 0x0000ff );
	
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
    
    this.setTarget(null);
};

OSMEX.SizerGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.SizerGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    if ( target ) {
        
        var SCALE_PREV=0;
        
        this.position = target.position;
        this.traverse( function( object ) { object.visible = true } );
        
        this.AxisPositiveX.sizeFunc = function(target) { return function(scale) {
                /*console.log(target.scale.x);*/
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.x += Math.abs(scale-SCALE_PREV);
                        else target.scale.x -= Math.abs(scale-SCALE_PREV);  
                    target.position.x += (scale-SCALE_PREV)*5;
                }                              
                SCALE_PREV=scale; 
                
        } }(this.target);
    
        this.AxisNegativeX.sizeFunc = function(target) { return function(scale) {
                
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.x += Math.abs(scale-SCALE_PREV);
                        else target.scale.x -= Math.abs(scale-SCALE_PREV);  
                    target.position.x -= (scale-SCALE_PREV)*5*Math.cos(target.rotation.y*180/3.14);
                }                              
                SCALE_PREV=scale; 
              
        } }(this.target);
        
        this.AxisPositiveY.sizeFunc = function(target) { return function(scale) { 
                                
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.y += Math.abs(scale-SCALE_PREV);
                        else target.scale.y -= Math.abs(scale-SCALE_PREV);  
                    target.position.y += (scale-SCALE_PREV)*5;
                }                              
                SCALE_PREV=scale; 
              
        } }(this.target);
                
        this.AxisNegativeY.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.y += Math.abs(scale-SCALE_PREV);
                        else target.scale.y -= Math.abs(scale-SCALE_PREV);  
                    target.position.y -= (scale-SCALE_PREV)*5;
                }                              
                SCALE_PREV=scale; 
              
        } }(this.target);
                
        
        this.AxisPositiveZ.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.z += Math.abs(scale-SCALE_PREV);
                        else target.scale.z -= Math.abs(scale-SCALE_PREV);  
                    target.position.z += (scale-SCALE_PREV)*5;
                }                              
                SCALE_PREV=scale; 
              
        } }(this.target);
                
        this.AxisNegativeZ.sizeFunc = function(target) { return function(scale) {
                                                
                if (Math.abs(scale-SCALE_PREV) < 0.2 /*&& target.scale.x >= 0.3*/){                  
                    if(scale-SCALE_PREV > 0) target.scale.z += Math.abs(scale-SCALE_PREV);
                        else target.scale.z -= Math.abs(scale-SCALE_PREV);  
                    target.position.z -= (scale-SCALE_PREV)*5;
                }                              
                SCALE_PREV=scale; 
              
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
        
    }
}
