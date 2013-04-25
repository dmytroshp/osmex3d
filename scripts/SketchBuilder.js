var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.SketchBuilder = function ( type ) { 
    
    THREE.Object3D.call( this );
    
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000, shading: THREE.SmoothShading } );
    var geometry = null;
     
    if (type === "cube"){
        this.name = "cube"; 
        this.typeID = 1;
        geometry =  new THREE.CubeGeometry( 1, 1, 1 );
    }
    else if (type === "sphere"){
        this.name = "sphere"; 
        this.typeID = 2;
        geometry = new THREE.SphereGeometry( 0.6, 15, 15 );
    }
        else if (type === "cylinder"){
        this.name = "cylinder"; 
        this.typeID = 3;
        geometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 15, 15 );
    }

    this.Sketch = new OSMEX.Block( geometry, material );
    this.Sketch.name = this.name;
    this.Sketch.typeID = this.typeID;
    this.Sketch.scale = new THREE.Vector3(10.0, 10.0, 10.0);
    this.Sketch.add(new OSMEX.BoundingBox(this.Sketch));
    this.add(this.Sketch);
    
    
};

OSMEX.SketchBuilder.prototype = Object.create( THREE.Object3D.prototype );



