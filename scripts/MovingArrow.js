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
    
    if (this.moveFunc) {
        
        if (this.dir.x == 1){
            this.moveFunc(position.x - this.prevPos);
            this.prevPos = position.x;            
        }else if (this.dir.y == 1){
            this.moveFunc(position.y - this.prevPos);
            this.prevPos = position.y; 
        }else if (this.dir.z == 1){
            this.moveFunc(position.z - this.prevPos);
            this.prevPos = position.z; 
        }

    }

};