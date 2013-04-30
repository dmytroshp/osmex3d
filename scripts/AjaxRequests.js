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
            data: {uid: array[i].id, scaleX: array[i].scale.x, scaleY: array[i].scale.y, scaleZ: array[i].scale.z, rotationX: array[i].rotation.x, rotationY: array[i].rotation.y, rotationZ: array[i].rotation.z, positionLat: lonLatHeight.latitude, positionLon: lonLatHeight.longitude, positionHeight: lonLatHeight.height, TypeID: array[i].TypeID, isDeleted: array[i].isDeleted},
            success: function(data) {
                //alert(data);
            },
            error:function() {
                console.debug("Can't save scene");
            }
        })
    }
}

function ajaxNewSketch(name, category, serializedGeometry,imageData) {
    var result;
    $.ajax({
        type: "POST",
        async:false,
        url: "server_scripts/NewSketch.php",
        cache: false,
        data: {name: name.val(), category: category.val(), geometry: serializedGeometry,imageData:imageData},
        dataType:'text',
        success: function(data) {
            result=data;
        }
    });
    return result;
}
