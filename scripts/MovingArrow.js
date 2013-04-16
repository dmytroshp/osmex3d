var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.MovingArrow = function ( dir, hex ) {
    
    OSMEX.Arrow.call( this, dir, new THREE.Vector3( 0, 0, 0 ), 30, hex, "moving" );
    
    this.name = "MovingArrow";            

    this.cone.pickable = true;
    this.cone.pickRef = this;  

    this.prevPos = null;

    this.moveFunc = null;
    
};

OSMEX.MovingArrow.prototype = Object.create( OSMEX.Arrow.prototype );

OSMEX.MovingArrow.prototype.setPosition = function ( position ) {
    
    this.matrixRotationWorld.extractRotation( this.matrixWorld );
    var rotatedDir = this.matrixRotationWorld.multiplyVector3( this.dir.clone() ).normalize();
    var newLen = rotatedDir.dot(position);
    
    if (this.moveFunc) {
  
            this.moveFunc(newLen - this.len + 10); 
    }

};