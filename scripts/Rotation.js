var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Rotation = function ( dir, hex ) {
    
    OSMEX.Torus.call( this, dir, new THREE.Vector3( 0, 0, 0 ), 30, hex );

    //this.pickable = true;
    this.torus.pickable = true;
    this.torus.pickRef = this;
    
    this.sizeFunc = null;
};

OSMEX.Rotation.prototype = Object.create( OSMEX.Torus.prototype );

OSMEX.Rotation.prototype.setAngle = function ( angle ) {
    
    if (this.rotationFunc) this.rotationFunc(angle / 30.0);
    
};