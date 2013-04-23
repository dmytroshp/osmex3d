

function postScene(ADDED, MODIFIED, REMOVED) {
    ajaxPostScene(ADDED);
    ajaxPostScene(MODIFIED);
    ajaxPostScene(REMOVED);
}

function ajaxPostScene(array) {
    for (var i = 0; i < array.length; i++) {
        var coords = local2LatLon(array[i].position);
        $.ajax({
            type: "POST",
            url: "server_scripts/AddInstance.php",
            cache: false,
            data: {object_uid: array[i].id, object_scaleX: array[i].scale.x, object_scaleY: array[i].scale.y, object_scaleZ: array[i].scale.z, object_rotationX: array[i].rotation.x, object_rotationY: array[i].rotation.y, object_rotationZ: array[i].rotation.z, object_positionLat: coords.lat, object_positionLon: coords.lon, object_referID: array[i].name, isDeleted: array[i].isDeleted},
            success: function(data) {
                alert(data);
            }
        })
    }
}

function ajaxNewSketch(name, category, serializedGeometry, dataUrl) {
    $.ajax({
        type: "POST",
        url: "server_scripts/NewSketch.php",
        cache: false,
        data: {name: name.val(), category: category.val(), geometry: serializedGeometry, url: dataUrl}, 
        success: function(data) {
            alert(data);
        }
    });
}