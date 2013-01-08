var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.Landscape = function ( ) {
    
    THREE.Object3D.call( this );
    
    var groundMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x000000 } );
    groundMaterial.side = THREE.DoubleSide;
    var groundGeometry = new OSMEX.GridGeometry( 100, 100, 20, 20 );
    groundGrid = new THREE.Mesh( groundGeometry, groundMaterial );
    add( groundGrid );      
};

OSMEX.Landscape.prototype = Object.create( THREE.Object3D.prototype );
