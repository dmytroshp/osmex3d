var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SketchBuilder = function ( type ) { 
    
    THREE.Object3D.call( this );
    
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000, shading: THREE.SmoothShading } );
    var geometry = null;
     
    if (type === "cube"){
        this.name = "cube"; 
        geometry =  new THREE.CubeGeometry( 1, 1, 1 );
    }
    else if (type === "cylinder"){
        this.name = "cylinder"; 
        geometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 15, 15 );
    }
    else if (type === "sphere"){
        this.name = "sphere"; 
        geometry = new THREE.SphereGeometry( 0.6, 15, 15 );
    }
    
    this.Sketch = new OSMEX.Block( geometry, material );
    this.Sketch.scale = new THREE.Vector3(10.0, 10.0, 10.0);
    this.add(this.Sketch);

};

OSMEX.SketchBuilder.prototype = Object.create( THREE.Object3D.prototype );



