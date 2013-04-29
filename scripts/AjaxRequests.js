function getCustomGeometry(id){
    var objGeometry;
    $.ajax({
        async:false,
        type:'GET',
        url:'server_scripts/getCustomGeometry.php',
        cache: false,
		processData: true,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {rID:id},
        dataType:'text',
        success:function(response)
        {    
            if (response === null) {

                var objGeometryStr = getCustomGeometry(response);

                objGeometry = getUnpackedGeometry(objGeometryStr);

                objGeometry.computeCentroids();
                objGeometry.computeFaceNormals();          
                var obj = new OSMEX.Block( objGeometry, this.usualMaterial.clone() );
                sketchFactory.currentObject = obj;
            }
        },
        error:function()
        {
            console.debug("Can't load geometry");
        }
        
    });
    return objGeometry;
    
}

function getBuildings(_tile_id,_minlon,_minlat,_maxlon,_maxlat){
    $.ajax({
        async:true,
        type:'GET',
        url:'server_scripts/getBuildings.php',
        cache: false,
		processData: true,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {tile_id: _tile_id, minlon: _minlon, minlat: _minlat,maxlon: _maxlon,maxlat: _maxlat},
        dataType:'text',
        success:function(r)
        {
            JSON_BUILDINGS = r;
        },
        error:function()
        {
            console.debug("Can't load buildings");
        }
        
    });
	
}

function postScene(scene) {
    var objArray = new Array();
    for (var i = FIRST_PICKABLE_OBJ, l = scene.children.length; i < l; i++){
        if (scene.children[i].isDeleted === true && scene.children[i].isCreated === false) objArray.push(scene.children[i]);
            else if(scene.children[i].isDeleted === false && scene.children[i].isCreated === true) objArray.push(scene.children[i]);
                else if (scene.children[i].isDeleted === false && scene.children[i].isCreated === false && scene.children[i].isModified === true)
                    objArray.push(scene.children[i])
    }
    ajaxPostScene(objArray)
}

function ajaxPostScene(array) {
    for (var i = 0; i < array.length; i++) {
        var coords = local2LatLon(array[i].position);
        $.ajax({
            type: "POST",
            url: "server_scripts/AddInstance.php",
            cache: false,
            data: {uid: array[i].id, scaleX: array[i].scale.x, scaleY: array[i].scale.y, scaleZ: array[i].scale.z, rotationX: array[i].rotation.x, rotationY: array[i].rotation.y, rotationZ: array[i].rotation.z, positionLat: coords.lat, positionLon: coords.lon,positionHeight:array[i].position.y, objectType: array[i].typeId, isDeleted: array[i].isDeleted},
            success: function(data) {
                alert(data);
            },
            error:function() {
                console.debug("Can't save scene");
            }
        })
    }
}

function ajaxNewSketch(name, category, serializedGeometry) {
    $.ajax({
        type: "POST",
        url: "server_scripts/NewSketch.php",
        cache: false,
        data: {name: name.val(), category: category.val(), geometry: serializedGeometry}, 
        success: function(data) {
            alert(data);
        }
    });
}