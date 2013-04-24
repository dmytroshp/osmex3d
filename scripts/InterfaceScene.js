var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.InterfaceScene = function ( camera ) {
    
    THREE.Scene.call( this );
    
    this.camera = camera;
};

OSMEX.InterfaceScene.prototype = Object.create( THREE.Scene.prototype );

OSMEX.InterfaceScene.prototype.updateMatrixWorld = function ( force ) {
    
    for (var i = 0, l = this.children.length; i < l; i++)
    {
        var distance = this.camera.position.distanceTo(this.children[i].position) / 250.0;
        this.children[i].scale.x = distance;
        this.children[i].scale.y = distance;
        this.children[i].scale.z = distance;
    }
    
    THREE.Scene.prototype.updateMatrixWorld.call(this, force);
};
