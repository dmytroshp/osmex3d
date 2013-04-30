var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Block = function ( geometry, material ) {
    
    THREE.Mesh.call( this, geometry, material );
    
    this.castShadow = true;
    this.receiveShadow = true;
    
    this.typeObject = 1; // geometry type
	
    this.pickable = true;
    this.isCreated = false;
    this.isModified = false;
    this.isDeleted = false;
    this.id = 0;
    
    this.bbox = new OSMEX.BoundingBox(this);
    this.add(this.bbox);
    this.bbox.setVisibility(false);
};

OSMEX.Block.prototype = Object.create( THREE.Mesh.prototype );

OSMEX.Block.prototype.clone = function ( object ) {

    if ( object === undefined ) object = new OSMEX.Block( this.geometry, this.material );
    object.pickable = this.pickable;
    object.typeObject = this.typeObject;

    THREE.Mesh.prototype.clone.call( this, object );

    return object;
};

OSMEX.Block.prototype.setVisibility = function ( visibility ) {
    
    this.traverse( function( object ) { object.visible = visibility; } );
};
