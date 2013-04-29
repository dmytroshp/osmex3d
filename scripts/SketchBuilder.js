/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function prepareSketchBuilder()
{
            var SCREEN_WIDTH = $('#sketchBuilder').width();
            var SCREEN_HEIGHT = $('#sketchBuilder').height();
            var SCREEN_FOV = 45;
            var FIRST_PICKABLE_OBJ = 6;
            var GRID_SIZE = 60;
            var MIN_LON = 30.73699951171875;
            var MIN_LAT = 46.470970513345925;
            var MAX_LON = 30.738372802734375;
            var MAX_LAT = 46.471916320870406;

            var container;

            var renderer;
            var camera;
            var cameraController, projector;
            var objectScene, interfaceScene;

            var mouse = new THREE.Vector2(0, 0);

            var CLICKED = [null, null];

            var PICKED, SELECTED, DRAGGING, SIZING, ROTATING, SCALING, MOVING;
            var ADDED = new Array(), MODIFIED = new Array(), REMOVED = new Array();
            var offsetVector = new THREE.Vector3();

            var groundGrid, groundPlane;

            var sizerGizmo, rotationGizmo, movingGizmo, actionPlane;
            
            var boxBuilder, sketchFactory;

            var arrowMode, objectType;

            var selectedObj = [];
            var operationStack = [];

            var myDialog, iconRenderer, iconCamera, iconCameraController, iconScene, iconLight, iconMesh, imageData;
            
            var OPERATED = false;
            var firstObject, secondObject, resultObj;
            
            
            init();
            animate();

            function init() {

                container = document.createElement('div');
                $('#sketchBuilder').append(container);

                $(document).ready(function() {
                    $.fn.preload = function() {
                        this.each(function(){
                            $('<img/>')[0].src = this;
                        });
                    }
                    
                    $(['img/48x48/1.png', 'img/48x48/1_over.png', 'img/48x48/1_pressed.png',
                        'img/48x48/2.png', 'img/48x48/2_over.png', 'img/48x48/2_pressed.png',
                        'img/48x48/3.png', 'img/48x48/3_over.png', 'img/48x48/3_pressed.png',
                        'img/48x48/4.png', 'img/48x48/4_over.png', 'img/48x48/4_pressed.png',
                        'img/48x48/5.png', 'img/48x48/5_over.png', 'img/48x48/5_pressed.png',
                        'img/48x48/6.png', 'img/48x48/6_over.png', 'img/48x48/6_pressed.png',
                        'img/48x48/7.png', 'img/48x48/7_over.png', 'img/48x48/7_pressed.png',
                        'img/48x48/8.png', 'img/48x48/8_over.png', 'img/48x48/8_pressed.png',
                        'img/48x48/9.png', 'img/48x48/9_over.png', 'img/48x48/9_pressed.png',
                        'img/48x48/10.png', 'img/48x48/10_over.png', 'img/48x48/10_pressed.png',
                        'img/48x48/11.png', 'img/48x48/11_over.png', 'img/48x48/11_pressed.png',
                        'img/48x48/12.png', 'img/48x48/12_over.png',
                        'img/publish.png','img/publish_hovered.png'
                   ]).preload();
                    
                    $("#topbar").css({
                        "left": ($('#sketchBuilder').width() / 2) - ($("#topbar").width() / 2) + "px",
                        "visibility": "visible"
                    });
                    
                    $("#tochange").css({
                       "margin-left": 5 + "px"
                    });
                    $("#build").css({
                       "margin-left": 5 + "px"
                    });
                    
                    $("#listOfOperations").css({
                       "opacity": 0.7
                    });

                    $("#leftbar").css({
                        "left": 10 + "px",
                        "top": $('#sketchBuilder').height() - $("#leftbar").height() - 10 + "px",
                        "visibility": "visible"
                    });



                    $("#bottombar").css({
                        "left": ($('#sketchBuilder').width() / 2) - ($("#bottombar").width() / 2) + "px",
                        "top": $('#sketchBuilder').height() - ($("#bottombar").height() + 10) + "px",
                        "visibility": "visible"
                    });

                    $("#rightbar").css({
                        "left": $('#sketchBuilder').width() - ($("#topbar").width() / 2) + "px",
                        "top": ($('#sketchBuilder').height() / 2) - ($("#topbar").height() / 2 * 5) + "px",
                        "visibility": "visible"
                    });

                    $("#righttopbar").css({
                        "left": ($('#sketchBuilder').width()) - ($("#topbar").width()) + "px",
                        "top": ($("#topbar").height() / 2) + "px",
                        "visibility": "visible"
                    });

                    $("#right-bottombar").css({
                        "left": $('#sketchBuilder').width() - ($("#right-bottombar").width()) - ($("#topbar").width() / 4) + "px",
                        "top": ($('#sketchBuilder').height()) - ($("#right-bottombar").height() + 10) + "px",
                        "visibility": "visible"
                    });

                    $(".group1").click(function() {
                        $(".selected").removeClass("selected");
                        $(this).addClass("selected");
                        setArrowsType(this);
                    });
                    $(".group2").click(function() {
                        $(".selected").removeClass("selected");
                        $(this).addClass("selected");
                        //addObject(this);
                        sketchFactory.startBuild($(this).attr('id'));
                    });

                    $(".group3").click(function() {
                        $(".selected").removeClass("selected");
                        $(this).addClass("selected");
                        buildNewGeometryElement(this);
                    });

                    $(".group3").tooltip();


                    myDialog = $(dialog_template);
                    myDialog.prependTo('#sketchBuilder');
                    myDialog.keyup(function () {
                         var name = $("#name");
                        $.ajax({
                                    type: "POST",
                                    
                                    url: "server_scripts/checkUniqueName.php",
                                    cache: false,
                                    data: {name: name.val()},
                                    success: function(data) {
                                        if (data != "0") {
                                            showErrorMessage("Error. Name '" + name.val() + "' exists.");
                                        }
                                       console.log(data);
                                    }
                                        
                        });
                    });
                    myDialog.dialog({
                        autoOpen: false,
                        height: 600,
                        width: 450,
                        resizable: false,
                        modal: true,
                        buttons: {
                            /*"Test": function() {
// TEST ONLY
var name = $("#name");
$.ajax({
type: "POST",
url: "server_scripts/checkUniqueName.php",
cache: false,
data: {name: name.val()},
success: function(data) {
console.log(data);
}
});
},*/
                            "Create": function() {
                                var name = $("#name"), category = $("#category");
                                
                                                                
                               
                                    
                                    var geometryExporter = new THREE.GeometryExporter();
                                    var serializedGeometry = geometryExporter.parse(CLICKED[0].geometry);

                                    imageData = iconRenderer.domElement.toDataURL("image/png");

                                    ajaxNewSketch(name, category, serializedGeometry, imageData);

                                    while (selectedObj.length > 0) {
                                        selectedObj.pop();
                                    }
                                    CLICKED[0].material.emissive.setHex(0x000000);
                                    if (CLICKED[1] != null) {
                                        CLICKED[1].material.emissive.setHex(0x000000);
                                    }
                                    CLICKED[0] = null;
                                    CLICKED[1] = null;

                                    $(this).dialog("close");
                            },
                            Cancel: function() {
                                
                                $(this).dialog("close");
                            }
                        },
                        open: function( event, ui ) {
                    
                            CLICKED[0].material.emissive.setHex(0x000000);
                            
                            iconMesh = new THREE.Mesh(CLICKED[0].geometry.clone(), CLICKED[0].material.clone());
                            iconScene.add(iconMesh);
                            
                            iconMesh.geometry.computeBoundingSphere();
                            
                            var maxMeshScale = Math.max(Math.max(iconMesh.scale.x, iconMesh.scale.y), iconMesh.scale.z);
                            var cameraOffset = iconMesh.geometry.boundingSphere.radius * maxMeshScale * 2.8;
                            iconCamera.position = new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(cameraOffset);
                            iconCamera.lookAt(iconMesh.geometry.boundingSphere.center);
                            
                            iconCameraController.enabled = true;
                            cameraController.enabled = false;
                        },
                        close: function( event, ui ) {
                            
                            iconScene.remove(iconMesh);
                            iconMesh = null;
                            
                            iconCameraController.enabled = false;
                            cameraController.enabled = true;
                        }
                        
                    });

                    $(".group4").click(function() {
                        
                        if (CLICKED[0]) {

                            myDialog.dialog("open");
                            
                        } else {
                            
                            showErrorMessage("Error. Please select an object to publish.");
                        }
                    });
                    
                    iconRenderer = new THREE.WebGLRenderer({
                                                            preserveDrawingBuffer: true, // required to support .toDataURL()
                                                            antialias: true
                                                           });
                    iconRenderer.setSize(235, 235);
                    iconRenderer.setClearColorHex(0xffffff, 1);
                    iconRenderer.autoClear = false;
                    $("#iconCanvas").append(iconRenderer.domElement);

                    iconCamera = new THREE.PerspectiveCamera(SCREEN_FOV, 1, 1, 300);
                    
                    iconCameraController = new OSMEX.CameraController(iconCamera);
                    iconCameraController.noZoom = true;
                    iconCameraController.noRotate = false;
                    iconCameraController.noPan = true;
                    iconCameraController.enabled = false;
                    //iconCameraController.addEventListener('change', iconRender);

                    iconScene = new OSMEX.ObjectScene();

                    iconLight = new THREE.DirectionalLight(0xffffff);
                    iconScene.add(iconLight);

                });


                renderer = new THREE.WebGLRenderer({antialias: true});

                camera = new OSMEX.Camera(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_FOV, 1, 1500, 1, 1500);
                camera.rotation.x -= Math.PI / 4;
                camera.position.z = 100;
                camera.position.y = 100;

                cameraController = new OSMEX.CameraController(camera);
                cameraController.addEventListener('change', onCameraChange);

                objectScene = new OSMEX.ObjectScene();
                interfaceScene = new OSMEX.InterfaceScene(camera);

                objectScene.fog = new THREE.Fog(0xFBFBFB, 1, 1500);

                objectScene.add(new THREE.AmbientLight(0x3f3f3f));
                interfaceScene.add(new THREE.AmbientLight(0x3f3f3f));

                var objectLight = new THREE.DirectionalLight(0xffffff);
                objectLight.position = camera.position;
                objectScene.add(objectLight);

                var interfaceLight = new THREE.DirectionalLight(0xffffff);
                interfaceLight.position = camera.position;
                interfaceScene.add(interfaceLight);

                // GROUND
                groundGrid = new OSMEX.Grid(60, 4);
                objectScene.add(groundGrid);

                groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
                objectScene.add(groundPlane);

                sizerGizmo = new OSMEX.SizerGizmo();
                interfaceScene.add(sizerGizmo);

                rotationGizmo = new OSMEX.RotationGizmo();
                interfaceScene.add(rotationGizmo);

                movingGizmo = new OSMEX.MovingGizmo();
                interfaceScene.add(movingGizmo);

                boxBuilder = new OSMEX.BoxBuilder();
                objectScene.add(boxBuilder);
                
                sketchFactory = new OSMEX.SketchFactory();
                objectScene.add(sketchFactory);

                actionPlane = new THREE.Plane();

                projector = new THREE.Projector();

                // RENDERER
                renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
                renderer.setClearColor(objectScene.fog.color, 1);
                renderer.autoClear = false;

                container.appendChild(renderer.domElement);

                document.addEventListener('mousemove', onDocumentMouseMove, false);
                document.addEventListener('mousedown', onDocumentMouseDown, false);
                document.addEventListener('mouseup', onDocumentMouseUp, false);
                document.addEventListener('dblclick', onDocumentDoubleClick, false);
                window.addEventListener('resize', onWindowResize, false);
            }

            function saveScene() {
                        postScene(ADDED, MODIFIED, REMOVED);
            }
            
            function hideMessage()
            {
                if (alert.fadeOut)
                    alert.fadeOut(1000, function() {
                    });
            }
            function showErrorMessage(text)
            {
                clearTimeout(timeout_id);
                if (alert.remove)
                    alert.remove();
                alert = $(red_alert_template);
                alert.find("#msgtext").html(text);
                alert.appendTo('#sketchBuilder');
                //$("#msgtext").html(text);
                alert.fadeIn(600, function() {
                    timeout_id = setTimeout(hideMessage, 440);
                });
            }

            function coordinates() {
                this.lat = 0;
                this.lon = 0;
            }

            function local2LatLon(vector) {

                var lonDiff = MAX_LON - MIN_LON;
                var latDiff = MAX_LAT - MIN_LAT;
                var lonStep = lonDiff / (GRID_SIZE * 2);
                var latStep = latDiff / (GRID_SIZE * 2);
                var lon = MIN_LON + ((vector.x + GRID_SIZE) * lonStep);
                var lat = MAX_LAT - ((vector.z + GRID_SIZE) * latStep);
                var coords = new coordinates();
                coords.lon = lon;
                coords.lat = lat;
                return coords;
            }

            function addBoundingBox() {
                for (var i = 0, l = objectScene.children.length; i < l; i++) {
                    
                    var obj = objectScene.children[i];

                    if (obj.bbox && obj.visible) {

                        obj.bbox.setVisibility($("#BBox").prop("checked"));
                    }
                }
            }

            function setArrowsType(element) {
                //alert($(element).attr('id'));
                if (arrowMode == "building") objectScene.remove(objectScene.children[objectScene.children.length-1]);
                arrowMode = $(element).attr('id');
                
                if (arrowMode === "build_box") {
                    
                    boxBuilder.startBuild();
                }
                else {
                    
                    boxBuilder.finishBuild();
                }
            }

             function buildNewGeometryElement(element) {
                if ($(element).attr('id') == "rollback") {

                    if (operationStack.length > 0) {
                        CLICKED[0] = null;
                        CLICKED[1] = null;
                        while (selectedObj.length > 0) {
                            selectedObj.pop();
                        }
                        var rollbackOperation = operationStack.pop();
                        objectScene.remove(rollbackOperation.output);
                        var tmp;
                        for (var i = 0; i < rollbackOperation.input.length; i++) {
                            tmp = rollbackOperation.input[i];
                            tmp.material.emissive.setHex(0x000000);
                            tmp.visible = true;
                        }
                        removeFromListOfOperations();
                    }
                } else {
                    if (!OPERATED && (!CLICKED[0] || !CLICKED[1])) {
                        showErrorMessage("Error. Select two objects.");
                    } else {
                        
                        
                        var first_bsp;
                        var second_bsp;
                        
                        var nameOfOperation, result_bsp;
                        var scale;
                        
                        
                        if (OPERATED) {
                             resultObj.visible = false;
                            objectScene. remove(resultObj);
                            operationStack.shift();
                            //resultObj = null;
                            first_bsp = new ThreeBSP(firstObject);
                            second_bsp = new ThreeBSP(secondObject);
                                 
                                 removeFromListOfOperations();
                        } else {
                        
                            firstObject = CLICKED[0].clone();
                            secondObject = CLICKED[1].clone();
                            first_bsp = new ThreeBSP(CLICKED[0]);
                            second_bsp = new ThreeBSP(CLICKED[1]);
                            OPERATED = true;
                        }
                            if ($(element).attr('id') == "union") {
                                nameOfOperation = "Union";
                                result_bsp = first_bsp.union(second_bsp);
                                scale = firstObject.scale;
                            } else if ($(element).attr('id') == "intersection") {
                                nameOfOperation = "Intersection";
                                result_bsp = first_bsp.intersect(second_bsp);
                                scale = firstObject.scale;
                            } else if ($(element).attr('id') == "complement_2-1") {
                                nameOfOperation = "Complement(2-1)";
                                result_bsp = second_bsp.subtract(first_bsp);
                                scale = firstObject.scale;
                            } else if ($(element).attr('id') == "complement_1-2") {
                                nameOfOperation = "Complement(1-2)";
                                result_bsp = first_bsp.subtract(second_bsp);
                                scale = firstObject.scale;
                            }

                            var material = new THREE.MeshPhongMaterial({color: 0x000000});
                            
                            
                            
                            var geometry = result_bsp.toGeometry();
                        
                            geometry.computeBoundingBox();
                            var scaleX = Math.abs(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
                            var scaleY = Math.abs(geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
                            var scaleZ = Math.abs(geometry.boundingBox.max.z - geometry.boundingBox.min.z) / 2;

                            var resultScale = new THREE.Vector3(scaleX, scaleY, scaleZ);
                            var resultPosition = geometry.boundingBox.center();

                            var rotationMatrix = new THREE.Matrix4().extractRotation(result_bsp.matrix);
                            var resultRotation = new THREE.Vector3().setEulerFromRotationMatrix( rotationMatrix );

                            var scaleMatrix = new THREE.Matrix4().makeScale( scaleX, scaleY, scaleZ );
                            var resultMatrix = new THREE.Matrix4().multiplyMatrices( rotationMatrix, scaleMatrix );
                            resultMatrix.elements[12] = resultPosition.x;
                            resultMatrix.elements[13] = resultPosition.y;
                            resultMatrix.elements[14] = resultPosition.z;
                            var invResultMatrix = new THREE.Matrix4().getInverse( resultMatrix );

                            for ( var i = 0, il = geometry.vertices.length; i < il; i++ ) {

                                geometry.vertices[i].applyMatrix4(invResultMatrix);
                            }

                            geometry.computeCentroids();
                            geometry.computeFaceNormals();
                            //geometry.computeVertexNormals();

                           resultObj = new OSMEX.Block( geometry, material );

                            resultObj.position = resultPosition.clone();
                            resultObj.scale = resultScale.clone();
                            resultObj.rotation = resultRotation.clone();
                            
                            
                            
                            //resultObj.pickable = true;
                            //resultObj.visible = true;
                            resultObj.name = "undef";
                            
                            if ($("#BBox").prop("checked")) resultObj.bbox.setVisibility(true);
                            
                            
                            objectScene.add(resultObj);

                            if (CLICKED[0]) {CLICKED[0].visible = false;CLICKED[0].setVisibility(false);}
                            
                            if (CLICKED[1]) {CLICKED[1].visible = false;CLICKED[1].setVisibility(false);}

                            var newSelected = [];
                            while (selectedObj.length > 0) {
                                newSelected.push(selectedObj.pop());
                            }
                            //var newOperation = {id: operationStack.length, type: nameOfOperation, input: newSelected, output: resultObj};
                            var newOperation = {id: operationStack.length, type: nameOfOperation, input: newSelected, output: resultObj};
                            operationStack.push(newOperation);
                             
                            saveAtListOfOperations(newOperation.id + 1 + ". " + newOperation.type);

                            //resultObj.oldColor = pickedObject.material.color.getHex();
                            resultObj.material.color.setHex( 0x008000 );
                            
                            CLICKED[0] = resultObj;
                            selectedObj.push(resultObj.clone());
                            CLICKED[1] = null;
                            OPERATED = true;
                    }
                }
            }

            function saveAtListOfOperations(text) {
                var obj = document.getElementById("listOfOperations");
                //obj.options[obj.options.length] = new Option(text, obj.options.length);
                var option = new Option(text, obj.options.length);
                for (var i = obj.options.length - 1; i >= 0; i--) {
                    var opt = new Option(obj.options[i].text, i);
                    obj.options[i + 1] = opt;
                }
                obj.options[0] = option;
            }

            function removeFromListOfOperations() {
                var obj = document.getElementById("listOfOperations");
                //obj.length = obj.length - 1;
                for (var i = 0; i < obj.options.length - 1; i++) {
                    var opt = new Option(obj.options[i + 1].text, obj.options.length);
                    obj.options[i] = opt;
                }
                obj.options[obj.options.length - 1] = null;
            }

            function onWindowResize() {

                camera.setSize($('#sketchBuilder').width(), $('#sketchBuilder').height());
                camera.updateProjectionMatrix();

                renderer.setSize($('#sketchBuilder').width(), $('#sketchBuilder').height());
            }

            function getPickedObject() {

                function getFirstSuitableObject(raycaster, objects, recursive) {

                    var intersects = raycaster.intersectObjects(objects, recursive);

                    if (intersects.length > 0) {

                        for (i = 0; i < intersects.length; i++) {

                            if (intersects[i].object.parent.name === "RotationGizmoOverlay") {
                                if (i + 1 < intersects.length && intersects[i + 1].object.parent.name === "RotationTorus")
                                    i += 1;
                                else if (i + 1 < intersects.length)
                                    continue;

                                return null;
                            }

                            var intersector = intersects[i];

                            if (intersector.object.pickable && intersector.object.visible) {

                                return intersector.object;
                            }
                        }
                    }

                    return null;
                }

                var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                projector.unprojectVector(vector, camera);

                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var pickedObject = getFirstSuitableObject(raycaster, interfaceScene.children, true);

                if (pickedObject === null) {

                    pickedObject = getFirstSuitableObject(raycaster, objectScene.children);
                }

                return pickedObject;
            }

            function onDocumentDoubleClick(event) {
                event.preventDefault();

                if (event.button == 0) {

                    var pickedObject = getPickedObject();

                    if (pickedObject != null && (pickedObject instanceof OSMEX.Block || pickedObject.name === "undef") ) {

                        if (!CLICKED[0] && !CLICKED[1]) {
                            
                            pickedObject.oldColor = pickedObject.material.color.getHex();
                            pickedObject.material.color.setHex( 0x008000 );
                            
                            CLICKED[0] = pickedObject;
                            selectedObj.push((pickedObject.clone()));
                            
                        }
                        else if (CLICKED[0] == pickedObject) {
                            
                            pickedObject.material.color.setHex( pickedObject.oldColor );

                            CLICKED[0] = null;
                            selectedObj.shift();
                            
                        }
                        else if (!CLICKED[1]) {
                            
                            pickedObject.oldColor = pickedObject.material.color.getHex();
                            pickedObject.material.color.setHex( 0x004080 );
                            
                            CLICKED[1] = pickedObject;
                            selectedObj.push((pickedObject.clone()));
                            
                        }
                        else if (CLICKED[1] == pickedObject) {
                            
                            pickedObject.material.color.setHex( pickedObject.oldColor );
                            
                            CLICKED[1] = null;
                            selectedObj.pop();
                            
                        }
                        else if (CLICKED[0] && CLICKED[1]) {
                        }
                        else {
                            
                            pickedObject.oldColor = pickedObject.material.color.getHex();
                            pickedObject.material.color.setHex( 0x008000 );
                            
                            CLICKED[0] = pickedObject;
                            selectedObj.unshift((pickedObject.clone()));
                        }
                        OPERATED = false;
                    }

                }
            }

            function onDocumentMouseMove(event) {

                event.preventDefault();

                mouse.x = (event.clientX / $('#sketchBuilder').width()) * 2 - 1;
                mouse.y = -(event.clientY / $('#sketchBuilder').height()) * 2 + 1;

                boxBuilder.onMouseMove(mouse);
                
                sketchFactory.onMouseMove(mouse);

                if (DRAGGING) {

                    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    projector.unprojectVector(vector, camera);
                    var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                    var intersectPoint = ray.intersectPlane(groundPlane);

                    DRAGGING.position.copy(intersectPoint.sub(offsetVector));
                }
                else if (SIZING) {

                    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    projector.unprojectVector(vector, camera);
                    var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                    var intersectPoint = ray.intersectPlane(actionPlane);

                    if (intersectPoint !== undefined) {

                        intersectPoint.sub(new THREE.Vector3().getPositionFromMatrix(SIZING.matrixWorld));
                        intersectPoint.multiplyScalar(1.0 / SIZING.parent.scale.x); // to compensate changing scale on changing distance
                        SIZING.trackSizing(intersectPoint);
                    }
                }
                else if (MOVING) {

                    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                    projector.unprojectVector(vector, camera);
                    var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                    var intersectPoint = ray.intersectPlane(actionPlane);

                    if (intersectPoint !== undefined) {

                        intersectPoint.sub(offsetVector);
                        MOVING.setPosition(intersectPoint);

                    }
                }
                else if (SCALING) {
                    var mouseX = (mouse.x * SCREEN_WIDTH / 2) / 10;

                    var sizingPos = projector.projectVector(new THREE.Vector3().getPositionFromMatrix(SCALING.matrixWorld).clone(), camera);
                    sizingPos.x = (sizingPos.x * SCREEN_WIDTH / 2) / 10;
                    var len = mouseX - sizingPos.x;

                    SCALING.setScale(len);
                }
                else if (ROTATING) {

                    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    projector.unprojectVector(vector, camera);
                    var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                    var intersectPoint = ray.intersectPlane(actionPlane);

                    if (intersectPoint === undefined) {
                        alert("RotationEnd plane intersection problem!");
                    }

                    intersectPoint.sub(new THREE.Vector3().getPositionFromMatrix(ROTATING.matrixWorld));

                    ROTATING.finishRotation(intersectPoint.clone().normalize());
                }
                else {
                    
                    var pickedObject = getPickedObject();
                    
                    if ( PICKED != pickedObject ) {
 
                         if ( PICKED ) {
                            
                            if ( PICKED.material.emissive ) {
                                
                                 PICKED.material.emissive.setHex( PICKED.oldEmissive );
                             }
                             else {
                                 
                                 PICKED.material.color.setHex( PICKED.oldColor );
                             }
                         }
 
                         PICKED = pickedObject;
 
                         if ( PICKED ) {
                             
                             if ( PICKED.material.emissive ) {
                                 
                                 PICKED.oldEmissive = PICKED.material.emissive.getHex();
                                 PICKED.material.emissive.setHex( 0xff0000 );
                             }
                             else {
                             
                                 PICKED.oldColor = PICKED.material.color.getHex();
                                 PICKED.material.color.setHex( 0xffff00 );
                             }
                         }
                     }
                     
                    
                }
            }

            function onDocumentMouseDown(event) {

                event.preventDefault();

                if (event.button == 0) {

                    if (boxBuilder.isBuilding()) {

                        boxBuilder.onLeftClick(mouse);
                        return;
                    }
                    
                    if (sketchFactory.isBuilding()) {
                        
                        sketchFactory.onLeftClick(mouse);
                        return;
                    }

                    if (PICKED) {
                        
                        cameraController.noPan = true;

                        var pickRef = (PICKED.pickRef !== undefined ? PICKED.pickRef : PICKED);

                        if (arrowMode == "deleting") {
                            if (CLICKED[0] != null)
                            CLICKED[0].material.emissive.setHex(0x000000);
                            if (CLICKED[1] != null)
                            CLICKED[1].material.emissive.setHex(0x000000);
                            CLICKED.length = 0;
                            selectedObj.length = 0;
                            objectScene.remove(PICKED);
                            document.getElementById("dragging").click();
                        }

                        if (pickRef instanceof OSMEX.Block || pickRef.name === "undef") {

                            SELECTED = pickRef;
                            DRAGGING = pickRef;

                            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                            projector.unprojectVector(vector, camera);
                            var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                            var intersectPoint = ray.intersectPlane(groundPlane);
                            offsetVector.copy(intersectPoint).sub(DRAGGING.position);
                        }
                        else if (pickRef instanceof OSMEX.SizerArrow) {

                            SIZING = pickRef;

                            var rotatedDir = SIZING.dir.clone();

                            SIZING.matrixRotationWorld.extractRotation(SIZING.matrixWorld);
                            var rotatedDir = SIZING.dir.clone().applyMatrix4(SIZING.matrixRotationWorld).normalize();
                            var sizingPos = new THREE.Vector3().getPositionFromMatrix(SIZING.matrixWorld);
                            var cameraDir = camera.position.clone().sub(sizingPos).normalize();
                            var rightDir = cameraDir.clone().cross(rotatedDir).normalize();
                            var forwardDir = rotatedDir.clone().cross(rightDir).normalize();
                            actionPlane.setFromNormalAndCoplanarPoint(forwardDir, sizingPos);
                            // TODO: situation when user is doing camera rotation while LMK pressed should be considered!

                            sizerGizmo.setSizing(true);
                        }
                        else if (pickRef instanceof OSMEX.MovingArrow || pickRef instanceof OSMEX.MovingGizmoPlane) {

                            MOVING = pickRef;

                            if (pickRef instanceof OSMEX.MovingArrow) {

                                var sizingPos = new THREE.Vector3().getPositionFromMatrix(MOVING.matrixWorld);
                                var cameraDir = camera.position.clone().sub(sizingPos).normalize();
                                var rightDir = cameraDir.clone().cross(MOVING.dir);
                                var forwardDir = MOVING.dir.clone().cross(rightDir);
                                actionPlane.setFromNormalAndCoplanarPoint(forwardDir, sizingPos);
                            }
                            else {

                                var sizingPos = new THREE.Vector3().getPositionFromMatrix(MOVING.matrixWorld);
                                actionPlane.setFromNormalAndCoplanarPoint(MOVING.dir, sizingPos);
                            }

                            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                            projector.unprojectVector(vector, camera);
                            var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                            var intersectPoint = ray.intersectPlane(actionPlane);
                            offsetVector.copy(intersectPoint).sub(new THREE.Vector3().getPositionFromMatrix(MOVING.matrixWorld));
                        }
                        else if (pickRef instanceof OSMEX.ScaleCube) {

                            SCALING = pickRef;

                        }
                        else if (pickRef instanceof OSMEX.RotationTorus) {

                            ROTATING = pickRef;

                            ROTATING.matrixRotationWorld.extractRotation(ROTATING.matrixWorld);
                            var normal = ROTATING.dir.clone().applyMatrix4(ROTATING.matrixRotationWorld).normalize();
                            var rotationPos = new THREE.Vector3().getPositionFromMatrix(ROTATING.matrixWorld);
                            actionPlane.setFromNormalAndCoplanarPoint(normal, rotationPos);
                            // TODO: situation when user is doing camera rotation while LMK pressed should be considered!

                            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                            projector.unprojectVector(vector, camera);
                            var ray = new THREE.Ray(camera.position, vector.sub(camera.position).normalize());
                            var intersectPoint = ray.intersectPlane(actionPlane);

                            if (intersectPoint === undefined) {
                                alert("RotationStart plane intersection problem!");
                            }

                            intersectPoint.sub(new THREE.Vector3().getPositionFromMatrix(ROTATING.matrixWorld));

                            ROTATING.setStartRotationVector(intersectPoint.clone().normalize());

                        }
                        else {

                            SELECTED = null;
                        }
                    }
                    else {

                        SELECTED = null;
                    }
                    if (arrowMode == "scaling")
                        sizerGizmo.setTarget(SELECTED)
                    else if (arrowMode == "moving")
                        movingGizmo.setTarget(SELECTED);
                    else if (arrowMode == "rotating")
                        rotationGizmo.setTarget(SELECTED);

                }
            }

            function onDocumentMouseUp(event) {

                event.preventDefault();
                if (event.button == 0) {

                    if (SIZING) {

                        SIZING.restoreDefaultLength();
                        sizerGizmo.setSizing(false);
                    }
                    if (SCALING)
                        SCALING.restoreDefaultScale();

                    DRAGGING = null;
                    SIZING = null;
                    SCALING = null;
                    ROTATING = null;
                    MOVING = null;
                    
                    cameraController.noPan = false;
                }
            }

            function animate() {

               requestAnimationFrame(animate);

                if (myDialog && myDialog.dialog( "isOpen" )) {
                    
                    iconCameraController.update();
                    
                    iconLight.position.x = iconCamera.position.x + 0.5;
                    iconLight.position.y = iconCamera.position.y + 1;
                    iconLight.position.z = iconCamera.position.z;
                    
                    iconRenderer.clear();
                    iconRenderer.render(iconScene, iconCamera);
                }
                else {
                    
                    update();
                    render();
                }
            }

            function update() {

                cameraController.update();
                rotationGizmo.update(camera);
                sizerGizmo.update();
                movingGizmo.update();
            }

            function onCameraChange() {

                boxBuilder.update();
                render();
            }


            function render() {

                renderer.clear();
                renderer.render(objectScene, camera);

                renderer.clear(false, true, false); // clear only Depth
                renderer.render(interfaceScene, camera);
            }
}

