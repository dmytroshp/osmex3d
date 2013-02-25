var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SizerArrow = function ( dir, hex ) {
    
    OSMEX.Arrow.call( this, dir, new THREE.Vector3( 0, 0, 0 ), 30, hex, "sizing" );
    this.name = "SizeArrow";
    
    this.minLength = 5;
    this.maxLength = 75;
	
    this.cone.pickable = true;
    this.cone.pickRef = this;

    this.sizeFunc = null;
};

OSMEX.SizerArrow.prototype = Object.create( OSMEX.Arrow.prototype );

OSMEX.SizerArrow.prototype.setLength = function ( length ) {
    
    if (length < this.minLength) {
        
        length = this.minLength;
    }
    else if (length > this.maxLength) {
        
        length = this.maxLength;
    }
    
    if (this.sizeFunc) this.sizeFunc(length / 30.0);

    OSMEX.Arrow.prototype.setLength.call(this, length);
};