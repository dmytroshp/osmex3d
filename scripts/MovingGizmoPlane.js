var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.MovingGizmoPlane = function ( origin, dir, hex ) {
    
    THREE.Object3D.call( this );
    this.name = "MovingGizmoPlane";
    
    this.prevPos = new THREE.Vector3(0,0,0);

    this.moveFunc = null;
    
    this.dir = null;
    this.setDirection( dir ); 
    if ( hex === undefined ) hex = 0xffff00;

    var meshMaterial = new THREE.MeshPhongMaterial( {
        color: hex, 
        shading: THREE.SmoothShading, 
        ambient: 0xffffff
    } );   
    
    meshMaterial.side = THREE.DoubleSide;
   
   var planeGeometry = new THREE.PlaneGeometry(8,8,8,8);
   this.planeFront = new THREE.Mesh( planeGeometry, meshMaterial );
   this.planeBack = new THREE.Mesh( planeGeometry, meshMaterial );
   this.planeFront.position.set( 0, 0, 8 );
   this.planeBack.position.set( 0, 0, -8); 
   //this.rotation.set (0,1.5,0);
   this.add( this.planeFront );
   this.add( this.planeBack );
   
   this.planeFront.pickable = true;
   this.planeBack.pickable = true;
   this.planeFront.pickRef = this;
   this.planeBack.pickRef = this;
   

    if ( origin instanceof THREE.Vector3 ) this.position = origin;
};

OSMEX.MovingGizmoPlane.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.MovingGizmoPlane.prototype.setDirection = function ( dir ) {
    
    this.dir = dir.clone().normalize();

    var upVector = new THREE.Vector3( 0, 1, 0 );
	
    var cosa = upVector.dot( this.dir );
    this.rotation.set(cosa);
    var axis;
	
    if ( ( cosa < -0.99 ) || ( cosa > 0.99 ) )
    {
        axis = new THREE.Vector3( 1, 0, 0 );
    }
    else
    {
        axis = this.dir;
    }
	
    var radians = Math.acos( cosa );
	
    this.matrix = new THREE.Matrix4().makeRotationAxis( axis, radians*2 );
    this.rotation.setEulerFromRotationMatrix( this.matrix, this.eulerOrder );
};

OSMEX.MovingGizmoPlane.prototype.setPosition = function ( position ) {
    
    if (this.moveFunc) {
        
        if (this.dir.x == 0){
            position.setX(0);
            this.moveFunc(position.sub(this.prevPos));           
            this.prevPos = position; 
        }else if (this.dir.y == 0){
            position.setY(0);
            this.moveFunc(position.sub(this.prevPos));
            this.prevPos = position; 
        }else if (this.dir.z == 0){
            position.setZ(0);
            this.moveFunc(position.sub(this.prevPos));
            this.prevPos = position; 
        }

    }

};

OSMEX.MovingGizmoPlane.prototype.setColor = function ( hex ) {
    
    this.planeFront.material.color.setHex( hex );
    this.planeBack.material.color.setHex( hex );
}; 