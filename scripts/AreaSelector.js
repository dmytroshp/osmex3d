var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.AreaSelector = function (  ) { 
    
    THREE.Object3D.call( this );
    
    this.MIN_LENGTH = 20.0;
    this.MIN_WIDTH = 20.0;
    
    this.MAX_LENGTH = 100.0;
    this.MAX_WIDTH = 100.0;
    
    this.startPos = null;
    this.endPos = null;
    
    this.startTile = null;
    this.endTile = null;
    
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00, transparent: true, opacity: 0.5 } );
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
     
    this.box = new THREE.Mesh( geometry, material );
    this.box.scale = new THREE.Vector3(1.0, 1.0, 1.0);
    this.box.visible = false;
    this.add(this.box);
    
    this.enabled = false;
    
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
};

OSMEX.AreaSelector.prototype = Object.create( THREE.Object3D.prototype );

OSMEX.AreaSelector.prototype.getObjectInfoOverMouse = function ( mouse ) {
    
    /*var projector = new THREE.Projector();
    
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);
    
    var rayDirection = vector.sub(camera.position.clone().normalize()).normalize();
    
    console.log("rayDirection: ", rayDirection);

    var raycaster = new THREE.Raycaster(camera.position, rayDirection);
    
    
    
    var intersects = raycaster.intersectObjects(this.parent.children, true);
    
    console.log("intersects.length: ", intersects.length);

    if (intersects.length > 0) {

        for (i = 0; i < intersects.length; i++) {
            
            var intersector = intersects[i];

            //if (intersector.object.pickable && intersector.object.visible) {
                
                console.log("objectInfo is got");

                return intersector;
            //}
        }
    }
    
    return null;*/
    
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    var projector = new THREE.Projector();
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(camera.position, vector.sub(camera.position.clone().normalize()).normalize());
    var intersectPoint = ray.intersectPlane(this.groundPlane);
    
    return intersectPoint;
};

OSMEX.AreaSelector.prototype.onLeftMouseButtonDown = function ( mouse ) {

    var intersectPoint = this.getObjectInfoOverMouse(mouse);
    
    if (intersectPoint !== null) {
    
        this.startPos = intersectPoint;
        this.enabled = true;
        
        console.log("startPos");
    }
};

OSMEX.AreaSelector.prototype.onLeftMouseButtonUp = function ( mouse ) {
    
    if (this.enabled === false || this.startPos === null || this.endPos === null)
        return;
    
    this.finishBuild();
    this.startBuild();
}

OSMEX.AreaSelector.prototype.onMouseMove = function ( mouse ) {
    
    if (this.enabled === false || this.startPos === null)
        return;
    
    this.box.visible = true;
    
    var intersectPoint = this.getObjectInfoOverMouse(mouse);
    
    if (intersectPoint !== null) { 

        this.endPos = intersectPoint;

        var diag = this.endPos.clone().sub(this.startPos);

        //this.box.position = this.startPos.clone().add(diag.clone().divideScalar(2.0));

        var newLen = Math.abs(diag.x);
        var newWidth = Math.abs(diag.z);

        if (newLen < this.MIN_LENGTH || newWidth < this.MIN_WIDTH) {

            this.box.material.color = new THREE.Color( 0xff0000 );
        }
        else {

            newLen = Math.min(newLen, this.MAX_LENGTH);
            newWidth = Math.min(newWidth, this.MAX_WIDTH);

            this.box.material.color = new THREE.Color( 0xffff00 );
        }

        if (newLen !== this.MAX_LENGTH ) {

            var halfLen = newLen / 2.0;
            this.box.position.x = this.startPos.x + (diag.x < 0 ? -halfLen : halfLen);

        }
        if (newWidth !== this.MAX_WIDTH) {

            var halfWidth = newWidth / 2.0;
            this.box.position.z = this.startPos.z + (diag.z < 0 ? -halfWidth : halfWidth);
        }

        this.box.scale.x = newLen;
        this.box.scale.z = newWidth;
    }
};

OSMEX.AreaSelector.prototype.startBuild = function () {
    
    this.box.position = new THREE.Vector3(0, 0, 0);
    this.box.scale = new THREE.Vector3(1.0, 1.0, 1.0);
    this.box.visible = false;
    this.box.material.color = 0xff0000;
    
    this.enabled = true;
    //cameraController.noPan = true;
};

OSMEX.AreaSelector.prototype.finishBuild = function () {
    
    this.startPos = null;
    this.endPos = null;
    
    this.enabled = false;
    this.box.visible = false;
    
    //cameraController.noPan = false;
    
    //$('#build_box').removeClass('selected');
};
