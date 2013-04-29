function getCustomGeometry(id, successCallback){

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
        success: successCallback,
        error:function()
        {
            console.debug("Can't load geometry");
        }
        
    });
}

function getBuildings(_minlon,_minlat,_maxlon,_maxlat, successCallback){
    $.ajax({
        async:true,
        type:'GET',
        url:'server_scripts/getBuildings.php',
        cache: false,
        processData: true,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {tile_id: 0, minlon: _minlon, minlat: _minlat,maxlon: _maxlon,maxlat: _maxlat},
        dataType:'text',
        success: successCallback,
        error:function()
        {
            console.debug("Can't load buildings");
        }
        
    });
	
}

function ajaxPostScene(array, osmArea) {
    for (var i = 0; i < array.length; i++) {
        var lonLatHeight = osmArea.XyzToLonLatHeight(array[i].position);
        $.ajax({
            type: "POST",
            url: "server_scripts/AddInstance.php",
            cache: false,
            data: {object_uid: array[i].id, object_scaleX: array[i].scale.x, object_scaleY: array[i].scale.y, object_scaleZ: array[i].scale.z, object_rotationX: array[i].rotation.x, object_rotationY: array[i].rotation.y, object_rotationZ: array[i].rotation.z, object_positionLat: lonLatHeight.latitude, object_positionLon: lonLatHeight.longitude, object_positionHeight: lonLatHeight.height, object_referID: array[i].typeID, isDeleted: array[i].isDeleted},
            success: function(data) {
                alert(data);
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