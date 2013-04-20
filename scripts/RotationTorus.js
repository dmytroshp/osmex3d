var OSMEX = OSMEX || { REVISION: '1' };

OSMEX.RotationTorus = function ( radius, width, dir, hex, useDepth ) {
    
    OSMEX.Torus.call( this, radius, width, dir, hex, useDepth );
    this.name = "RotationTorus";

    this.torus.pickable = true;
    this.torus.pickRef = this;
    
    this.startRotationVec = new THREE.Vector3( 1, 0, 0 );
    
    this.rotationFunc = null;
};

OSMEX.RotationTorus.prototype = Object.create( OSMEX.Torus.prototype );

OSMEX.RotationTorus.prototype.setStartRotationVector = function ( startRotationVec ) {
    
    this.startRotationVec = startRotationVec;
}

OSMEX.RotationTorus.prototype.finishRotation = function ( endRotationVec ) {
    
    var cosa = this.startRotationVec.dot(endRotationVec);
    
    var radians = Math.acos( cosa );
    
    if (radians > 0.01) {
        
        var up = new THREE.Vector3().crossVectors(this.startRotationVec, endRotationVec).normalize();
        
        this.matrixRotationWorld.extractRotation( this.matrixWorld );
         var globalDir = this.dir.clone().applyMatrix4(this.matrixRotationWorld).normalize();
        
        //console.log("dot=" + up.dot(globalDir));
        
        if (up.dot(globalDir) < 0) {
            
            radians = -radians;
        }
        
        if (this.rotationFunc) this.rotationFunc(radians);
        
        this.setStartRotationVector(endRotationVec);
    }
}
