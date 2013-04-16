var OSMEX = OSMEX || { REVISION: '1' };


OSMEX.MovingGizmo = function ( ) {
    
    THREE.Object3D.call( this );
    
    scale = this.scale;
    
    this.target = null;
	
    this.AxisX = new OSMEX.MovingArrow( new THREE.Vector3( 1, 0, 0 ), 0xff0000 );  
	
    this.AxisY = new OSMEX.MovingArrow( new THREE.Vector3( 0, 1, 0 ), 0x00ff00 );
	
    this.AxisZ = new OSMEX.MovingArrow( new THREE.Vector3( 0, 0, 1 ), 0x0000ff );
    
    this.AxisXPlane = new OSMEX.MovingGizmoPlane(this, new THREE.Vector3( 0, 1, 1 ), 0x00ffff );  
	
    this.AxisYPlane = new OSMEX.MovingGizmoPlane(this, new THREE.Vector3( 1, 0, 1 ), 0xff00ff );
	
    this.AxisZPlane = new OSMEX.MovingGizmoPlane(this, new THREE.Vector3( 1, 1, 0 ), 0xffff00 );
    
	
    this.add(this.AxisX);
	
    this.add(this.AxisY);
	
    this.add(this.AxisZ);

    this.add(this.AxisXPlane);
	
    this.add(this.AxisYPlane);
	
    this.add(this.AxisZPlane);
    
    this.setTarget(null);
};

OSMEX.MovingGizmo.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.MovingGizmo.prototype.setTarget = function ( target ) {
    
    this.target = target;
    
    var arrowMoveFunc = null;
    var planeMoveFunc = null;
    
    var visibility = false;
    
    if ( target ) {
        
        visibility = true;
        
        arrowMoveFunc = function(target) { return function(delta) {
                          

            var deltaScale = delta * this.parent.scale.x;

            //if (deltaScale < 2 && deltaScale > -2) {   // 0.1 is minimum possible scale
                
                var shiftPos = this.dir.clone();
                shiftPos.multiplyScalar(deltaScale )
                target.position.addSelf(shiftPos);
          //  }
                          
        } }(this.target);
    
        planeMoveFunc = function(target) { return function(delta) {
           // console.log (delta) 
            var deltaScale = delta.multiplyScalar(this.parent.scale.x).divideScalar(2);
           
            //if (deltaScale < 2 && deltaScale > -2) {   // 0.1 is minimum possible scale
                
                var shiftPos = new THREE.Vector3(0,1,0);
                shiftPos.multiplySelf(deltaScale );
                 
                target.position.addSelf(deltaScale);
                console.log (delta); 
          //  }                       
                          
        } }(this.target);
                        
    }
    
    
    this.traverse( function( object ) { object.visible = visibility } );
    
    this.AxisX.moveFunc = arrowMoveFunc;
    
    this.AxisY.moveFunc = arrowMoveFunc;
    
    this.AxisZ.moveFunc = arrowMoveFunc;
    
    this.AxisXPlane.moveFunc = planeMoveFunc;
    
    this.AxisYPlane.moveFunc = planeMoveFunc;
    
    this.AxisZPlane.moveFunc = planeMoveFunc;
      
}

OSMEX.MovingGizmo.prototype.update = function ( ) {
    
    if(this.target){  
        
        this.position.copy(this.target.position);
        
    }
}