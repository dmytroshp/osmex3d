var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Block = function ( geometry, material ) {
    
    THREE.Mesh.call( this, geometry, material );
	
    this.pickable = true;
};

OSMEX.Block.prototype = Object.create( THREE.Mesh.prototype );

