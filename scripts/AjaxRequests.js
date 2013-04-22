

function postScene(ADDED, MODIFIED, REMOVED){
    ajaxPostScene(ADDED);   
    ajaxPostScene(MODIFIED);
    ajaxPostScene(REMOVED);
}

function ajaxPostScene (array) {
    for (var i = 0; i < array.length; i++){
        var coords = local2LatLon(array[i].position);
        $.ajax({
             type: "POST",
             url: "server_scripts/AddInstance.php",
             cache: false,
             data: {object_uid:array[i].id.val(),object_scaleX:array[i].scale.x.val(),object_scaleY:array[i].scale.y.val(),object_scaleZ:array[i].scale.z.val(),object_rotationX:array[i].rotation.x.val(),object_rotationY:array[i].rotation.y.val(),object_rotationZ:array[i].rotation.z.val(),object_positionLat:coords.lat.val(),object_positionLon:coords.lon.val(),object_referID:array[i].name.val(),isDeleted:array[i].isDeleted.val()},                
             success: function(data) {
                 alert(data);
             }
        })
    }
}