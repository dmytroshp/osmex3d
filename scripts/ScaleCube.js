var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.ScaleCube = function (  ) {
    
    OSMEX.Cube.call( this );
    this.name = "ScaleCube";
	
    this.cube.pickable = true;
    this.cube.pickRef = this;
    
    this.sizeFunc = null;
};

OSMEX.ScaleCube.prototype = Object.create( OSMEX.Cube.prototype );

OSMEX.ScaleCube.prototype.setScale = function ( scale ) {

    
    if (this.sizeFunc) this.sizeFunc( scale / 20 );

};