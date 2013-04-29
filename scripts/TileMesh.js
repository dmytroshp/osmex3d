var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.TileMesh = function ( tileId, geometry, material ) {
    
    THREE.Mesh.call( this, geometry, material );
	
    this.tileId = tileId;
    this.pickable = true;
};

OSMEX.TileMesh.prototype = Object.create( THREE.Mesh.prototype );

OSMEX.TileMesh.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new OSMEX.TileMesh( this.tileId, this.geometry, this.material );
	object.pickable = this.pickable;

	THREE.Mesh.prototype.clone.call( this, object );

	return object;

};
