var OSMEX = OSMEX || { REVISION: '1' };


OSMEX.BoundingBox = function ( target ) {
    
    THREE.Object3D.call( this );
    
    this.name = "BoundingBox";
    
    this.target = target;
    this.pickable = false;
   
    target.geometry.computeBoundingBox();
     
    var XmaxYmaxZmax = target.geometry.boundingBox.max.clone().multiplySelf(target.scale);
    var XmaxYmaxZmin = target.geometry.boundingBox.max.clone().setZ(target.geometry.boundingBox.min.z).multiplySelf(target.scale);   
    var XmaxYminZmax = target.geometry.boundingBox.max.clone().setY(target.geometry.boundingBox.min.y).multiplySelf(target.scale);
    var XmaxYminZmin = target.geometry.boundingBox.min.clone().setX(target.geometry.boundingBox.max.x).multiplySelf(target.scale);
    
    var XminYmaxZmax = target.geometry.boundingBox.max.clone().setX(target.geometry.boundingBox.min.x).multiplySelf(target.scale);
    var XminYmaxZmin = target.geometry.boundingBox.min.clone().setY(target.geometry.boundingBox.max.y).multiplySelf(target.scale);   
    var XminYminZmax = target.geometry.boundingBox.min.clone().setZ(target.geometry.boundingBox.max.z).multiplySelf(target.scale);
    var XminYminZmin = target.geometry.boundingBox.min.clone().multiplySelf(target.scale);
    
    
    var FrontLeftLineGeometry = new THREE.Geometry();
    FrontLeftLineGeometry.vertices.push( XminYmaxZmax );
    FrontLeftLineGeometry.vertices.push( XmaxYmaxZmax );
    FrontLeftLineGeometry.vertices.push( XmaxYminZmax );
    FrontLeftLineGeometry.vertices.push( XminYminZmax );   
    FrontLeftLineGeometry.vertices.push( XminYmaxZmax );
    FrontLeftLineGeometry.vertices.push( XminYmaxZmin );
    FrontLeftLineGeometry.vertices.push( XminYminZmin );
    FrontLeftLineGeometry.vertices.push( XminYminZmax ); 
    this.FrontLeftLine = new THREE.Line( FrontLeftLineGeometry, new THREE.LineBasicMaterial( {color: 0x0000ff} ) );   	
    this.add(this.FrontLeftLine);
    
    var BackRightLineGeometry = new THREE.Geometry();
    BackRightLineGeometry.vertices.push( XmaxYmaxZmin );
    BackRightLineGeometry.vertices.push( XminYmaxZmin );
    BackRightLineGeometry.vertices.push( XminYminZmin );
    BackRightLineGeometry.vertices.push( XmaxYminZmin );  
    BackRightLineGeometry.vertices.push( XmaxYmaxZmin );
    BackRightLineGeometry.vertices.push( XmaxYmaxZmax );
    BackRightLineGeometry.vertices.push( XmaxYminZmax );
    BackRightLineGeometry.vertices.push( XmaxYminZmin ); 
    this.BackRightLine = new THREE.Line( BackRightLineGeometry, new THREE.LineBasicMaterial( {color: 0x0000ff} ) );   	
    this.add(this.BackRightLine);
};

OSMEX.BoundingBox.prototype = Object.create( THREE.Object3D.prototype );
