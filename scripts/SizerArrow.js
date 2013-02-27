var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SizerArrow = function ( dir, hex ) {
    
    OSMEX.Arrow.call( this, dir, new THREE.Vector3( 0, 0, 0 ), 40, hex, "sizing" );
    this.name = "SizeArrow";
    
    this.minLength = 5;
    this.maxLength = 75;
    
    this.prevSize = 0.5;
	
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
    
    if (this.sizeFunc) {
        
        var size = (length - this.minLength) / (this.maxLength - this.minLength); // converting to range [0; 1]
        this.sizeFunc(size - this.prevSize);
        this.prevSize = size;
    }

    OSMEX.Arrow.prototype.setLength.call(this, length);
};

OSMEX.SizerArrow.prototype.restoreDefaultLength = function ( ) {
    
    this.prevSize = 0.5;  
    
    OSMEX.Arrow.prototype.restoreDefaultLength.call(this);
};
