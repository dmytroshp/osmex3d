<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - trackball camera</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
                <script type="text/javascript" src="jquery/jquery-1.9.1.js"></script>
                <script type="text/javascript" src="jquery/jquery-ui-1.10.2.custom.min.js"></script>
                <script src="threejs/three.js"></script>
                <script src="scripts/Camera.js"></script>
                <script src="scripts/CameraController.js"></script>
                <script src="scripts/TileMesh.js"></script>
                <script src="scripts/AreaSelector.js"></script>
                <script src="scripts/Detector.js"></script>
                <script type="text/javascript" src="scripts/AjaxReqForLandscape.js"></script> 
                
                <link type="text/css" href="css/smoothness/jquery-ui-1.10.2.custom.min.css" rel="stylesheet" />
		<style>
			body {
				color: #000;
				font-family:Monospace;
				font-size:13px;
				text-align:center;
				font-weight: bold;

				background-color: #fff;
				margin: 0px;
				overflow: hidden;
			}
                        .slider_place
                        {
                            position:absolute;
                            top: 60px;
                            right:20px;
                            width:120px;
                            height:50px;
                            z-index:2;
                        }
                        #slider
                        {
                            position:relative;
                            top:5px;
                            left:15px;
                            width:88px;
                        }
                        .opc
                        {
                            margin:0;
                            padding: 0;
                            font-size:10px;
                            font-weight: normal;
                        }
                        .lbl1
                        {
                            margin:0;
                            padding: 0;
                            font-size:10px;
                            font-weight: normal;
                            position: absolute;
                            left:5px;
                            bottom:5px;
                        }
                        .lbl2
                        {
                            margin:0;
                            padding: 0;
                            font-size:10px;
                            font-weight: normal;
                            position: absolute;
                            right:5px;
                            bottom:5px;
                        }
                        .edit_button
                        {
                            position: absolute;
                            top:10px;
                            right:30px;
                            width:100px;
                            height:40px;
                            background-image: url('/img/edit.png');
                        }
                        .edit_button.diabled
                        {
                            background-image: url('/img/edit_disabled.png');
                        }
                        .edit_button:hover
                        {
                            background-image: url('/img/edit_hovered.png');
                        }
                        .edit_button:active
                        {
                            background-image: url('/img/edit_pressed.png');
                        }
		</style>
	</head>

	<body>
        <?php
    if(!isset($_GET['zoom']))
{
    $landscapeMode='boundary';
    $zoom=0;
}
else
{
    $landscapeMode='zoom';
    $zoom=intval($_GET['zoom']);
}
$minlon=(isset($_GET['minlon'])&& is_numeric($_GET['minlon']))?$_GET['minlon']:'22.1370582580566';//-180;
$minlat=(isset($_GET['minlat'])&& is_numeric($_GET['minlat']))?$_GET['minlat']:'44.1845970153809';//-90;
$maxlon=(isset($_GET['maxlon'])&& is_numeric($_GET['maxlon']))?$_GET['maxlon']:'40.2271308898926';//180;
$maxlat=(isset($_GET['maxlat'])&& is_numeric($_GET['maxlat']))?$_GET['maxlat']:'52.379150390625';//90;
$mlat=(isset($_GET['mlat'])&& is_numeric($_GET['mlat']))?$_GET['mlat']:0;
$mlon=(isset($_GET['mlon'])&& is_numeric($_GET['mlon']))?$_GET['mlon']:0;
echo<<<HERE
<script type="text/javascript">
    
                    landscapeMode='$landscapeMode';
                    minlon=$minlon;
                    minlat=$minlat;
                    maxlon=$maxlon;
                    maxlat=$maxlat;
                    mlon=$mlon;
                    mlat=$mlat;
                    zoom=$zoom;
    
</script>
HERE;
?>
            <div id="map-controls">
                <div class="edit_button"></div>
                <div class="slider_place ui-widget ui-widget-content ui-corner-all">
                    <p class='opc'>Buildings opacity</p>
                    <div id="slider">&nbsp;</div>
                    <p class='lbl1'>0%</p><p class='lbl2'>100%</p>
                </div>
            </div>
        <div  jstcache="0"  id="cont" ></div>
        <div  jstcache="0"  id="build"></div>
		<div  jstcache="0"  id="container"></div>

<script type="text/javascript">
//Class of tile	
var edit_button=['/img/edit.png','/img/edit_disabled.png','/img/edit_hovered.png','/img/edit_pressed.png'];
$.each(edit_button,function(value,index){
    var img=$("<img src='"+value+"'>");
    img.css('display','none');
    img.appendTo('body');
});
function Tile () {
    this.id;
	this.refcount=-1;
	this.tex_x;
	this.tex_z;
	this.lvl;//level
    this.childs = new Array();//4 id of descendants 
    this.childs[0]=-1;
    this.childs[1]=-1;
    this.childs[2]=-1;
	this.childs[3]=-1;
    this.prnt;//parent
	this.texExist=false;
	this.texture;
	this.triangleGeometry = new THREE.Geometry();
	this.destroy = function () {
         delete this.id;
		 delete this.refcount;
		 delete this.tex;
		 delete this.lvl;
		 this.childs.length = 0;delete this.childs;this.childs=null;
		 delete this.prnt;
		 this.triangleGeometry.dispose();
		 //this.texture.dispose();
		 delete this.triangleGeometry;this.triangleGeometry=null;
    };

}
//Class Building
function TileBlds () {
    this.id;//id of tile
	this.x;
	this.z;
	this.cenx;
	this.cenz;
	this.scale_x;
	this.scale_z;
	this.minlon;
	this.minlat;
    this.arrIndxsBlds = new Array();
	this.destroy = function () {
         delete this.id;
		 delete this.scale_x;
		 delete this.scale_z;
		 delete this.minlon;
		 delete this.minlat;
		 delete this.x;
		 delete this.z;
		 delete this.cenx;
		 delete this.cenz;
		delete this.arrIndxsBlds
		this.arrIndxsBlds=null;
    };

}


			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container;

			var arrCurRoot = new Array();
			var arrCurBld = new Array();
			var curBldId = -1;
			var arrTile = new Array();
			var arrTileBlds = new Array();

			var timerid=0;
			var timer=1;
			var initTiles = new Array();
			var initTilesIndx=0;
			var initReady=true;
			var Exist1stTl=false;
			var UnitToPixelScale;
			var tileSizeRoot=3454245.2736;// in [m]
			var lvlbldactive=17;//-1;
			var maxidinque=-1;
			var distfor17=-1;

			var camera, controls, scene, renderer;
			var maxAnisotropy;

			var texture;

			var cross;

			var triangleMesh = new Array();
			var MeshOfBlds = new Array();
			var arrTex = new Array();

			var bverify=false;

                        buildingsOpacity=100;
                        $(document).ready(function(){
                            $('#slider').slider({
                                max:100,
                                min:0,
                                value:100,
                                step:1,
                                slide:function(event,ui)
                                {
                                    buildingsOpacity=ui.value;
                                }
                            });
                            $('#map-controls').mouseenter(function(){
                                controls.enabled=false;
                                //camera.noRotate=true;
                            });
                            $('#map-controls').mouseleave(function(){
                                controls.enabled=true;
                                //camera.noRotate=false;
                            });
                        });
                        
                        var div = document.getElementById('cont');
			//div.style.display="none";
			div.ongetdata =responseServer;		

			var div_bld = document.getElementById('build');
			div_bld.ongetdata =responseServerCubes;
			div_bld.style.display="none";


//Object ( dynamically add the necessary tiles)

var TLoad = new function () {
    this.maxid=9999999999999;
	//set 1st coordinates for 1st tileRoots
	this.startX=-1727122.6368;
	this.startZ=-1727122.6368;
	this.stepGrid=(Math.abs(this.startX)*2)/8;
	this.idforloadroot=-1;
	this.ReadyForRoot=true;
    this.indx=0;
	this.indxCube=0;
    this.ready=true;                 //a flag of readiness
    this.arTileForAdd = new Array(); //the queue of  tiles for loading
	this.arTileCubeForAdd = new Array(); //the queue of  tiles for loading
	this.requestBld=true;

this.prepareRootID = function (rootid) {
      if(this.ReadyForRoot){
	    this.idforloadroot=rootid;
		this.ReadyForRoot=false;
		this.arTileForAdd.push(rootid);
	       }
    };	

	   // check the queue overflow
this.isFull = function () {
      if(this.arTileForAdd.length>=256)return true;//queue consist of 256 
	  else{return false;}
    };

	  //check tile on present in the queue	  
this.tileinQueue= function (IdTile) {           
      if(this.arTileForAdd.indexOf(IdTile)>=0)return true;
	  else{return false;}
    };

this.tileCubeinQueue= function (strXspaceZ) {           
      if(this.arTileCubeForAdd.indexOf(strXspaceZ)>=0)return true;
	  else{return false;}
    };

	  //add tile in queue
this.pushTile = function (IdTile) {              
    if(!this.tileinQueue(IdTile)&&IdTile<=this.maxid/*&&!this.isFull()*/)this.arTileForAdd.push(IdTile);
};

this.pushTileCube = function (strXspaceZ) {                 
    if(true/*!this.tileCubeinQueue(strXspaceZ)*/){this.arTileCubeForAdd.push(strXspaceZ);}
};

this.needforload = function () {
   if(this.indx<this.arTileForAdd.length||this.indxCube<this.arTileCubeForAdd.length)return true;
   else{return false;}
}   

      //load and check flag of readiness
this.loadTile = function () {
   if(this.ready==true&&(this.indx<this.arTileForAdd.length||this.indxCube<this.arTileCubeForAdd.length)){
      if(this.indx<this.arTileForAdd.length&&this.requestBld){
         var id=this.arTileForAdd[this.indx];
         if(id>=0)
		 {
		    this.indx++;
			this.ready=false;
			//land_func(id);
			if(this.indxCube<this.arTileCubeForAdd.length)this.requestBld=false;
		 }
	  }
	else{
		if(this.indxCube<this.arTileCubeForAdd.length){
		    var id=this.arTileCubeForAdd[this.indxCube];
		    if(id.length>0){
			   this.indxCube++;this.ready=false;
			   var lanlot=id.split(' ');//console.debug(parseInt(xz[0])+" "+parseInt(xz[1]));
			   build_func(lanlot[0],lanlot[1],lanlot[2],lanlot[3],lanlot[4]);
			   //var xz=id.split(' ');//console.debug(parseInt(xz[0])+" "+parseInt(xz[1]));
			   //build_func(parseInt(xz[0]),parseInt(xz[1]));
			   this.requestBld=true;
			   }
			}
	}

	                               }						   
};

	//set flag of readiness
this.loaded = function () { 
    this.ready=true;
    //return this.arTileForAdd.pop();  //delete the tile from the queue
};

}

			init();
			animate();


            function getTanDeg(deg) {

               var rad = deg * Math.PI/180;

               return Math.tan(rad)

            }

			function verdrop(id,x,z,lvl)
				{
				  var dist=getDistance(camera,lvl,x,z);	
				  var pixelTileSize=tileSizeRoot/ Math.pow(2,lvl)*UnitToPixelScale/dist;
				  //if(dist<=200&&lvlbldactive<0)lvlbldactive=lvl;

				  /*if(lvl==8)
			      {
				   var minlon=tile2lon(x,lvl)
				   var maxlon=tile2lon(x+1,lvl)
				   var minlat=tile2lat(z+1,lvl)
				   var maxlat=tile2lat(z,lvl)
				   //alert("id "+id+" minlon "+minlon+" minlat "+minlat+" maxlon "+maxlon+" maxlat "+maxlat); 
				   console.debug("id "+id+" lvl "+lvl+" minlon "+minlon+" minlat "+minlat+" maxlon "+maxlon+" maxlat "+maxlat)
				   }*/

			      if(lvl==lvlbldactive&&!arrTileBlds[id])
			      {
				   if(distfor17<0)distfor17=dist;
				   arrTileBlds[id]=new TileBlds();
				   arrTileBlds[id].id=id;
				   var minlon=tile2lon(x,lvl)
				   var maxlon=tile2lon(x+1,lvl)
				   var minlat=tile2lat(z+1,lvl)
				   var maxlat=tile2lat(z,lvl)
			       var range_lon=maxlon-minlon;
			       var range_lat=maxlat-minlat;
				   //alert(minlon+" "+minlat+" "+maxlon+" "+maxlat)
				   var c=new Array();
				   var var1=Math.pow(2,lvl);//number of tiles in row (specific lvl) 
				   var scale=id==0?TLoad.stepGrid:TLoad.stepGrid/(var1);//determine a width and a height of cell
				   var offset=id==0?0:Math.abs(2*TLoad.startX)/(var1);  // determine an offset for 1st tile of specific lvl 
				   var startX=TLoad.startX+offset*x;
				   var startZ=TLoad.startZ+offset*z;
				   var x_=-1;
				   var z_=-1;
				   var i_=0;
				   var j_=0;
				   //Creation of a grid
				   for(;i_<9;i_+=8){
				   	z_=startZ+(scale)*i_;
				   	for(;j_<9;j_+=8){
				   		x_=startX+(scale)*j_;
				           c.push(new THREE.Vector3(x_,0.0,z_));
						   //alert(x_+" "+z_+" "+startX+" "+scale)
				   				}
				   				j_=0;
				   				};
					/*for(var v=0;v<4;v++){
                       alert(c[v].x+" "+c[v].y+" "+c[v].z)
                     }	*/				

			       var range_x=Math.max(c[1].x,c[0].x)-Math.min(c[1].x,c[0].x);
			       var range_z=Math.max(c[0].z,c[2].z)-Math.min(c[0].z,c[2].z);
				   arrTileBlds[id].scale_x=range_x/range_lon;
			       arrTileBlds[id].scale_z=range_z/range_lat;
				   arrTileBlds[id].minlon=minlon;
				   arrTileBlds[id].minlat=minlat;
				   arrTileBlds[id].z=c[3].z;
				   arrTileBlds[id].x=c[0].x;

                   TLoad.pushTileCube(""+id+" "+minlon+" "+minlat+" "+maxlon+" "+maxlat);

			     }

				  if(lvl<=18&&pixelTileSize>=384)
				  {

					/*timeoutId = setTimeout(*/verdrop(id*4+1,2*x,2*z,lvl+1)//, 5);
					/*timeoutId = setTimeout(*/verdrop(id*4+2,2*x+1,2*z,lvl+1)//, 5)
					/*timeoutId = setTimeout(*/verdrop(id*4+3,2*x,2*z+1,lvl+1)//, 5)
					/*timeoutId = setTimeout(*/verdrop(id*4+4,2*x+1,2*z+1,lvl+1)//, 5);

				  }
				  else{var tileId=id;arrTile[tileId]=new Tile();arrTile[tileId].id=tileId;/*alert(tileId+" "+arrTile[tileId].id);*/arrTile[tileId].tex_x=x;arrTile[tileId].tex_z=z;arrTile[tileId].lvl=lvl;arrTile[tileId].prnt=tileId==0?-1:((tileId-1)-((tileId-1)%4))/4;if(maxidinque<id){maxidinque=id;initTiles.unshift(id);}else{initTiles.push(id);}/*TLoad.pushTile(id);*//*arrCurRoot.push((id));*/ return 0;}

				}

            function setMinMax(minlon,minlat,maxlon,maxlat,Camera,CameraController)
            {	
              var minlon = minlon;
              var minlat = minlat;
              var maxlon = maxlon;
              var maxlat = maxlat;

              var cenlon=(maxlon-minlon)/2 + minlon
              var cenlat=(maxlat-minlat)/2 + minlat
              var _x=lon2tile(cenlon,18)
              var _z=lat2tile(cenlat,18)
              var num18trow=Math.pow(2,18)-1
              var _k=tileSizeRoot/num18trow
              var coordx=_x*_k-1727122.6368
              var coordz=_z*_k-1727122.6368
              var tilesize=(lon2tile(maxlon,18)-lon2tile(minlon,18))*13.1769
              var coordy=tilesize*UnitToPixelScale/256  ; //256-na lvl nige512	
              Camera.position.set(coordx, coordy, coordz);
              CameraController.target.x+=coordx
              CameraController.target.z+=coordz
            }

            function setPointZoom(cenlon,cenlat,zoom,Camera,CameraController)
            {	
              var cenlon=cenlon
              var cenlat=cenlat
              var zoom=zoom
              var _x=lon2tile(cenlon,18)
              var _z=lat2tile(cenlat,18)
              var lon1=tile2lon(_x,zoom);
              var lon2=tile2lon(_x+1,zoom);
              var numzoomtrow=Math.pow(2,18)-1
              var _k=tileSizeRoot/numzoomtrow
              var coordx=_x*_k-1727122.6368
              var coordz=_z*_k-1727122.6368
              var tilesize=(lon2tile(Math.max(lon2,lon1),zoom)-lon2tile(Math.min(lon2,lon1),zoom))*Math.pow(2,18-zoom)*13.1769
              var coordy=tilesize*UnitToPixelScale/256  ; //256-na lvl nige	
              Camera.position.set(coordx, coordy, coordz);
              CameraController.target.x+=coordx
              CameraController.target.z+=coordz
            }			

			function init() {
			    //land_func(0);// load 1st tileroots
				//camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10000000 );
				camera = new OSMEX.Camera( window.innerWidth,window.innerHeight,45, 0.01, 10000000 , 0.01, 10000000 );
				//camera.position.set(0, 3454245.2736, 0.0);
				UnitToPixelScale = window.innerHeight /( 2.0 * getTanDeg(camera.fov / 2.0));

                controls = new OSMEX.CameraController( camera );
                //controls.userZoomSpeed = 0.43;
				controls.ZoomSpeed = 0.43;


				if(typeof(landscapeMode) != "undefined" && landscapeMode != null)
				{
	               if(landscapeMode=='boundary')
	               {
	                 setMinMax(minlon,minlat,maxlon,maxlat,camera,controls)
	               }
	               else if(landscapeMode=='zoom')
	               {
	                 setPointZoom(mlon,mlat,zoom,camera,controls)
	               }
				}else
				{
				  setPointZoom(0,0,0,camera,controls)
				  //setPointZoom(10.86388,48.359621,17,camera,controls)
				  //setMinMax(25.64,44.4,39.95,54.18,camera,controls)
				}

				//controls.rotateSpeed = 0.01;

				//controls.addEventListener( 'change', render/*checkTiles*/ );
                //timerid=setTimeout(verify, 25);

				//scene
                scene = new THREE.Scene();
				//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );


				// lights

				/*light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0x002288 );
				light.position.set( -1, -1, -1 );
				scene.add( light );

				light = new THREE.AmbientLight( 0x222222 );
				scene.add( light );	*/

				// renderer

				renderer = new THREE.WebGLRenderer( { antialias: false  } );//,preserveDrawingBuffer: true
				//renderer.setClearColor( scene.fog.color, 1 );
				//renderer.setDepthTest(true);
				//renderer.autoClear = true;
				renderer.setClearColor( new THREE.Color(0xffffff), 1 );
				renderer.setSize( window.innerWidth, window.innerHeight );

				container = document.getElementById( 'container' );
				container.appendChild( renderer.domElement );

				maxAnisotropy = renderer.getMaxAnisotropy();

				//
                                //On Window Resize
				window.addEventListener( 'resize', onWindowResize, false );
               //wrt("clear")
			  /* for(var i = 0; i < tiles[0].triangleGeometry.vertices.length; i++) {
                         wrt(""+i+" "+tiles[0].triangleGeometry.vertices[i].x+" "+tiles[0].triangleGeometry.vertices[i].y+" "+tiles[0].triangleGeometry.vertices[i].z)
	                  }
					  wrt("center "+tiles[0].center.x+" "+tiles[0].center.y+" "+tiles[0].center.z)*/
			   /*console.debug("tiles[0].center.x "+tiles[0].center.x)
			   console.debug("tiles[1].center.x "+tiles[1].center.x)
			   console.debug("tiles[2].center.x "+tiles[2].center.x)
			   console.debug("tiles[3].center.x "+tiles[3].center.x)
			   console.debug("tiles[4].center.x "+tiles[4].center.x)*/



			   /*onkeypress = function (event) {
	               if ((event = event || window.event).keyCode == 37)camera.center.x-=0.25
		           if ((event = event || window.event).keyCode == 39)camera.center.x+=0.25
				   if ((event = event || window.event).keyCode == 38)camera.center.z-=0.25
				   if ((event = event || window.event).keyCode == 40)camera.center.z+=0.25
	           }*/

			   //land_func(300)

			  verdrop(0,0,0,0);
			  //for (var beg=initTiles.length -1;beg>=0;beg--)TLoad.pushTile(initTiles[beg]);//TLoad.pushTile(initTiles[beg]);
			  //document.addEventListener('keydown',onDocumentKeyDown,false);
			  
			  //render();
			  
			  timer=setInterval( checkTiles , 15);

			}

			function onDocumentKeyDown(event){
			   var k = 20000.0/3454245.2736;
			   var delta = k * camera.position.y;
			   var dx=0,dz=0;
			   event = event || window.event;
			   var keycode = event.keyCode;
			   switch(keycode){
			   case 37 : //left
			   dx=(-1)*delta*Math.cos( controls.theta );
			   dz=delta*Math.sin( controls.theta );
			   break;
			   case 38 : // up 
			   dx=(-1)*delta*Math.sin( controls.theta );
			   dz=(-1)*delta*Math.cos( controls.theta );
			   break;
			   case 39 : // right
			   dx=delta*Math.cos( controls.theta );
			   dz=(-1)*delta*Math.sin( controls.theta );
			   break;
			   case 40 : //down
			   dx=delta*Math.sin( controls.theta );
			   dz=delta*Math.cos( controls.theta );
			   break;
			   }
			   camera.position.x +=dx;
			   controls.center.x +=dx;
			   camera.position.z +=dz;
			   controls.center.z +=dz;
               checkTiles();
			   }



			function initFaceTex(tile) {
					//Faces
                	for(ix=0;ix<8;ix++){//collumn
                	   for(iy=0;iy<8;iy++){//row of quads
                	       tile.triangleGeometry.faces.push(new THREE.Face3(9*ix+iy,9*ix+iy+1,9*ix+iy+9));
                	       tile.triangleGeometry.faces.push(new THREE.Face3(9*ix+iy+1,9*ix+iy+10,9*ix+iy+9));
	                	                }
                					}

                    //UV
                	step=1.0/8.0
                	for(v=1.0;v>0;v-=step){
                	  for(u=0.0;u<1;u+=step){
                	tile.triangleGeometry.faceVertexUvs[0].push( [
                            new THREE.Vector2(u, v) ,
                            new THREE.Vector2(u+step, v) ,
                			new THREE.Vector2(u, v-step)
                        ] );
                	tile.triangleGeometry.faceVertexUvs[0].push( [
                            new THREE.Vector2(u+step, v ) ,
                            new THREE.Vector2(u+step, v-step) ,
                            new THREE.Vector2(u, v-step) 
                        ] );
                		                      }
	                	                   }			

			}


			//function is called in response to a request from the server to get the tile by id
			function responseServer(s) {

				var tileId=-1;
				var flagroot=false;
				var findtile=false;
				var jstr;
				var flg_empty=false;
				jstr=JSON.parse(''+s);
				if(jstr.id<0){
				var lvl=-1;
				var id =Math.abs(jstr.id);
				for(t=0;/*t<=TLoad.maxid*/;t=(t*4+4)){lvl++;if(id<=t)break}
				if(lvl<=18)jstr.id=id;
				}
				if(jstr.verts[0]==undefined)flg_empty=true;


                if(jstr.id>=0){	

                    }else{console.debug("! Reject request id is out of range!");}
					 //r=(delete tile);
                    // console.debug("del  "+r);
                      jstr=null;					
					  TLoad.loaded()

				                      }
									  

			function responseServerCubes(s) {

				var jstr;
				jstr=jQuery.parseJSON(s);
				if(typeof(arrTileBlds[jstr.tile_id]) != "undefined" && arrTileBlds[jstr.tile_id] != null)
				{
				  if(jstr.tile_id>=0&&arrTileBlds[jstr.tile_id].id!=undefined)
				  {
				
				   var id=jstr.tile_id;
				   //alert(id)
				   //alert("builtile "+id)
                   for(var j=0;j<jstr.builds.length;j++){
				       var b=parseInt(jstr.builds[j].id);
				       //alert(" Build id "+b)
					   MeshOfBlds[b] = new THREE.Mesh(
                            new THREE.CubeGeometry(0.212,0.2,0.226),
                           //new THREE.MeshBasicMaterial({color: 0x000000, opacity: 1})
				           new THREE.MeshBasicMaterial({
				           color: 0xd78254//,
				           //'map':texture,
				           //wireframe: false,
				           //side:THREE.DoubleSide,
                           //'overdraw': true
				                })
                            );

			    var lon=parseFloat(jstr.builds[j].positionLon);///OSM_w;
                var lat=parseFloat(jstr.builds[j].positionLat);///OSM_h;
			    MeshOfBlds[b].position.set(arrTileBlds[id].x+(lon-arrTileBlds[id].minlon)*arrTileBlds[id].scale_x,0.5,arrTileBlds[id].z-(lat-arrTileBlds[id].minlat)*arrTileBlds[id].scale_z);
                MeshOfBlds[b].scale.set(parseFloat(jstr.builds[j].scaleX),8,parseFloat(jstr.builds[j].scaleZ));  
			    MeshOfBlds[b].rotation.set(parseFloat(jstr.builds[j].rotationX), parseFloat(jstr.builds[j].rotationY), parseFloat(jstr.builds[j].rotationZ));
                scene.add( MeshOfBlds[b]);
				MeshOfBlds[b].visible=true;
				arrTileBlds[id].arrIndxsBlds[j]=b;
					   }
				//render();
				//arrCurBld.push(id);	
                }				
				}
				jstr=null;
				TLoad.loaded()	
               }				


			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				UnitToPixelScale = window.innerHeight /( 2.0 * getTanDeg(camera.fov / 2.0));

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );
                                controls.update();
				render();

			}

			/*function verify(){
				//console.debug("TLoad.arTileForAdd.length "+TLoad.arTileForAdd.length)	
                TLoad.loadTile();
				
			    //timerid=setInterval(verify, 20);
			}*/

			function getDistance(cam,tlvl,tosmX,tosmZ){
			    //console.debug("dist for xyz "+tlvl+" "+tosmX+" "+tosmZ)

				var var1=Math.pow(2,tlvl);//number of tiles in row (specific lvl) 
				var scale=tlvl==0?TLoad.stepGrid:TLoad.stepGrid/(var1);//determine a width and a height of cell
				var offset=tlvl==0?0:Math.abs(2*TLoad.startX)/(var1);  // determine an offset for 1st tile of specific lvl 

				var vec1X=TLoad.startX+offset*tosmX;
				var vec1Z=TLoad.startZ+offset*tosmZ;

				var vec2X=TLoad.startX+offset*tosmX+(scale)*8;
				var vec2Z=TLoad.startZ+offset*tosmZ;

				var vec3X=TLoad.startX+offset*tosmX;
				var vec3Z=TLoad.startZ+offset*tosmZ+(scale)*8;

				var vec4X=TLoad.startX+offset*tosmX+(scale)*8;
				var vec4Z=TLoad.startZ+offset*tosmZ+(scale)*8;

                var cenx=(vec2X+vec1X)/2.0;
                var cenz=(vec2Z+vec3Z)/2.0;

				var tilecenter=new THREE.Vector3( cenx, 0.0, cenz);
				/*tex
				var ax=Math.max(cam.position.x,cenx)-Math.min(cam.position.x,cenx);
				var ay=Math.max(cam.position.y,0)-Math.min(cam.position.y,0);
				var az=Math.max(cam.position.z,cenz)-Math.min(cam.position.z,cenz);
				var cD=Math.sqrt(ax*ax+ay*ay+az*az);*/
				//cD=1 * cD.toFixed(1)
				//console.debug("cR "+cD+"lvl "+tlvl)
                return tilecenter.sub(cam.position).length();				
			}

			function deltilemesh(id,req){
			    //console.debug("del "+"id "+" "+id)
				if(req==false)req=false;
				else{req=true;}
				if(typeof(triangleMesh[id]) != "undefined" && triangleMesh[id] != null)
				{
			      scene.remove(triangleMesh[id]);
			      /*triangleMesh[id].geometry.deallocate();
			      triangleMesh[id].material.deallocate();
			      triangleMesh[id].deallocate();*/

			      //renderer.deallocateObject(triangleMesh[id]);
			      triangleMesh[id].geometry.dispose();
			      triangleMesh[id].material.dispose();
			      //renderer.deallocateTexture(arrTex[id]);
				  if(typeof(arrTex[id]) != "undefined" && arrTex[id] != null)
				  {
			        arrTex[id].dispose()
			        delete arrTex[id];
			        arrTex[id]=null;
				  }
			      r=delete triangleMesh[id];
			      triangleMesh[id]=null
			      console.debug("del "+triangleMesh[id]+" id "+id+" "+r)
				}
				if(req){
				  if(triangleMesh[(id*4+1)])deltilemesh((id*4+1));
				  if(triangleMesh[(id*4+2)])deltilemesh((id*4+2));
				  if(triangleMesh[(id*4+3)])deltilemesh((id*4+3));
				  if(triangleMesh[(id*4+4)])deltilemesh((id*4+4));
				}
			}

            function deltile(id,req){
                if(req==false)req=false;
				else{req=true;}
				if(typeof(arrTile[id]) != "undefined" && arrTile[id] != null)
				{
                  var dist=getDistance(camera,arrTile[id].lvl,arrTile[id].tex_x,arrTile[id].tex_z);
                  if(arrTileBlds[id]&&dist>=/*210*/distfor17+10)delbuildsoftile(id);
                  arrTile[id].destroy();
                  delete arrTile[id];
                  arrTile[id]=null;
                  console.debug("Delete "+arrTile[id]+" id "+id)
				}
				if(req){
				  if(arrTile[(id*4+1)])deltile((id*4+1));
				  if(arrTile[(id*4+2)])deltile((id*4+2));
				  if(arrTile[(id*4+3)])deltile((id*4+3));
				  if(arrTile[(id*4+4)])deltile((id*4+4));
				}

			}

			function delbuildsoftile(id){
			    if(arrTileBlds[id]){
				  //alert("del "+id+" "+id)
				  if(arrTileBlds[id].arrIndxsBlds[0]!=undefined)
				    {
					//alert("del arrTileBlds[id].arrIndxsBlds.length() "+arrTileBlds[id].arrIndxsBlds.length())
				     for(var i in arrTileBlds[id].arrIndxsBlds)
		                {
						  var b=arrTileBlds[id].arrIndxsBlds[i];
		                  //alert("del build "+b)
		                  scene.remove(MeshOfBlds[b]);
                          //renderer.deallocateObject(MeshOfBlds[b]);
						  MeshOfBlds[b].geometry.dispose();
						  MeshOfBlds[b].material.dispose();
			              //renderer.deallocateTexture(arrTex[id]);
			              //delete arrTex[id];
			              //arrTex[id]=null;
			              delete MeshOfBlds[b];
			              MeshOfBlds[b]=null
		                }
		              //arrTileBlds[id].arrIndxsBlds.splice(0,arrTileBlds[id].arrIndxsBlds.length);
		             }
				  arrTileBlds[id].destroy();
				  delete arrTileBlds[id];
				  arrTileBlds[id]=null;
				 }


			}
			

			function crtMesh(id,flagroot){

				var var1=Math.pow(2,arrTile[id].lvl);//number of tiles in row (specific lvl) 
				scale=id==0?TLoad.stepGrid:TLoad.stepGrid/(var1);//determine a width and a height of cell
				//console.debug("scale "+scale+" tile.id "+arrTile[tileId].id+" tile.lvl "+arrTile[tileId].lvl)
				var offset=id==0?0:Math.abs(2*TLoad.startX)/(var1);  // determine an offset for 1st tile of specific lvl 
				//count 1st coordinates for concrete tile
				var startX=TLoad.startX+offset*arrTile[id].tex_x;
				var startZ=TLoad.startZ+offset*arrTile[id].tex_z;
				//console.debug("tileId "+tileId)
				//console.debug("startX "+startX)
				//console.debug("startZ "+startZ)
				var x_=-1;
				var z_=-1;
				var index_=0;
				var i_=0;
				var j_=0;
				//Creation of a grid
                    for(;i_<9;i_++){
					    z_=startZ+(scale)*i_;
					   for(;j_<9;j_++){
					      x_=startX+(scale)*j_;
		                  arrTile[id].triangleGeometry.vertices.push(new THREE.Vector3( x_,0.0,z_));
						  //console.debug("flg_empty "+flg_empty);
				          //console.debug("index "+index_+" x "+x_+" jstr.verts[index] "+jstr.verts[index_]+" z "+z_);
						  index_++;
						             }
									 j_=0;
											};
				initFaceTex(arrTile[id]);


				/*var tex=''+arrTile[id].lvl+'/'+arrTile[id].tex_x+'/'+arrTile[id].tex_z;
				arrTex[id]=THREE.ImageUtils.loadTexture('http://c.tile.openstreetmap.org/'+tex+".png",new THREE.UVMapping(),function()
				  {
				     arrTile[id].texExist=true;
					 if(typeof(flagroot) != "undefined" && flagroot != null){
                         
					//console.debug("tex x  "+arrTile[tileId].tex_x+" y "+arrTile[tileId].tex_y);
					console.debug("crt  "+id+" ");
					console.debug("del  "+(id*4+1)+" ");
					console.debug("del  "+(id*4+2)+" ");
					console.debug("del  "+(id*4+3)+" ");
					console.debug("del  "+(id*4+4)+" ");

                    deltilemesh((id*4+1));
					deltilemesh((id*4+2));
					deltilemesh((id*4+3));
					deltilemesh((id*4+4));
					deltile((id*4+1));
					deltile((id*4+2));
					deltile((id*4+3));
					deltile((id*4+4));
					}
					else{
                     var delprntid=id==0?-1:((id-1)-((id-1)%4))/4;
					 console.debug("id "+id+" "+delprntid);
					 deltilemesh(delprntid);
					 deltile(delprntid);
					 }
					 
                     //render();
	            });*/
//console.debug("id "+id);

				console.debug("id "+id);
                arrTex[id].magFilter = THREE.LinearFilter;
                arrTex[id].minFilter = THREE.LinearFilter;
				arrTex[id].anisotropy = maxAnisotropy;
				var triangleMaterial = new THREE.MeshBasicMaterial({
				//'map':texture,
				'map': arrTex[id],
				//wireframe: true,
				side:THREE.DoubleSide//,
                //'overdraw': false
				                });				

                triangleMesh[id] = new THREE.Mesh(arrTile[id].triangleGeometry, triangleMaterial);
				triangleMesh[id].position.set(0.0, 0.0, 0.0);
				scene.add(triangleMesh[id]);
				triangleMesh[id].visible=true;
				//if(arrTile[id].lvl>15)triangleMesh[id].visible=false;

				console.debug("Crt "+triangleMesh[id]+" id "+id)
				
				//arrCurRoot.push(id);
				
				//render();

			}
			
			function loadTexture(id){
			
			    var tex=''+arrTile[id].lvl+'/'+arrTile[id].tex_x+'/'+arrTile[id].tex_z;
				arrTex[id]=THREE.ImageUtils.loadTexture('http://c.tile.openstreetmap.org/'+tex+".png",new THREE.UVMapping(),function()
				  {
				     arrTile[id].texExist=true;
				  });

			}
			
			function dist2Blds(tid,cam){
                var cenx=arrTileBlds[tid].cenx;
                var cenz=arrTileBlds[tid].cenz;
				var tilecenter=new THREE.Vector3( cenx, 0.0, cenz);
                return tilecenter.sub(cam.position).length();
            }				
			
			function loadBlds(tid,cam,tlvl,tosmX,tosmZ){

				var var1=Math.pow(2,tlvl);//number of tiles in row (specific lvl) 
				var scale=tlvl==0?TLoad.stepGrid:TLoad.stepGrid/(var1);//determine a width and a height of cell
				var offset=tlvl==0?0:Math.abs(2*TLoad.startX)/(var1);  // determine an offset for 1st tile of specific lvl 

				var vec1X=TLoad.startX+offset*tosmX;
				var vec1Z=TLoad.startZ+offset*tosmZ;

				var vec2X=TLoad.startX+offset*tosmX+(scale)*8;
				var vec2Z=TLoad.startZ+offset*tosmZ;

				var vec3X=TLoad.startX+offset*tosmX;
				var vec3Z=TLoad.startZ+offset*tosmZ+(scale)*8;

				var vec4X=TLoad.startX+offset*tosmX+(scale)*8;
				var vec4Z=TLoad.startZ+offset*tosmZ+(scale)*8;

                var cenx=(vec2X+vec1X)/2.0;
                var cenz=(vec2Z+vec3Z)/2.0;

				var tilecenter=new THREE.Vector3( cenx, 0.0, cenz);

                var dist = tilecenter.sub(cam.position).length();

                if(dist<=100)
                {
                  if(tlvl<18)
				  {
				    loadBlds(tid*4+1,cam,tlvl+1,2*tosmX,2*tosmZ);
					loadBlds(tid*4+2,cam,tlvl+1,2*tosmX+1,2*tosmZ);
					loadBlds(tid*4+3,cam,tlvl+1,2*tosmX,2*tosmZ+1);
					loadBlds(tid*4+4,cam,tlvl+1,2*tosmX+1,2*tosmZ+1);
				  }
				  if(tlvl==18 && (typeof(arrTileBlds[tid]) == "undefined" || arrTileBlds[tid] == null))
			      {
				    arrTileBlds[tid]=new TileBlds();
				    arrTileBlds[tid].id=tid;
				    var minlon=tile2lon(tosmX,tlvl)
				    var maxlon=tile2lon(tosmX+1,tlvl)
				    var minlat=tile2lat(tosmZ+1,tlvl)
				    var maxlat=tile2lat(tosmZ,tlvl)
				    var range_lon=maxlon-minlon;
				    var range_lat=maxlat-minlat;
				    var c0=new THREE.Vector3( vec1X,0.0,vec1Z);
				    var c1=new THREE.Vector3( vec2X,0.0,vec2Z);
				    var c2=new THREE.Vector3( vec3X,0.0,vec3Z);
				    var c3=new THREE.Vector3( vec4X,0.0,vec4Z);
				    var range_x=Math.max(c1.x,c0.x)-Math.min(c1.x,c0.x);
				    var range_z=Math.max(c0.z,c2.z)-Math.min(c0.z,c2.z);
				    arrTileBlds[tid].scale_x=range_x/range_lon;
				    arrTileBlds[tid].scale_z=range_z/range_lat;
				    arrTileBlds[tid].minlon=minlon;
				    arrTileBlds[tid].minlat=minlat;
				    arrTileBlds[tid].z=c3.z;
				    arrTileBlds[tid].x=c0.x;
					arrTileBlds[tid].cenx=cenx;
				    arrTileBlds[tid].cenz=cenz;
					//alert(8)
				    TLoad.pushTileCube(""+tid+" "+minlon+" "+minlat+" "+maxlon+" "+maxlat);
					//build_func(tid,minlon,minlat,maxlon,maxlat)
					/*if(TLoad&&!bverify){alert("bv");
			            if(TLoad.needforload()){alert(tid);bverify=true;timerid=setTimeout(verify, 25);}
				      }*/
			      }
                }				
			}

			function checkTiles() {
				console.debug(" ")
				console.debug(" ")
				
				
			if(initTilesIndx<initTiles.length)
			  {
			    var tex=''+arrTile[initTiles[initTilesIndx]].lvl+'/'+arrTile[initTiles[initTilesIndx]].tex_x+'/'+arrTile[initTiles[initTilesIndx]].tex_z;
				if(initReady)
				{
			    initReady=false;
				arrTex[initTiles[initTilesIndx]]=THREE.ImageUtils.loadTexture('http://c.tile.openstreetmap.org/'+tex+".png",new THREE.UVMapping(),function()
				  {
				     //alert("o "+initTiles[initTilesIndx]);
				     arrTile[initTiles[initTilesIndx]].texExist=true;
					 crtMesh(initTiles[initTilesIndx]);
					 arrCurRoot.push(initTiles[initTilesIndx]);
					 initTilesIndx++;
					 initReady=true;
				  });
                };
                				
			   }
			else{
				/*console.debug("camera.phi "+controls.phi)
				console.debug("camera.theta "+controls.theta)*/
				//console.debug("fov "+camera.fov)
			/*	
			  console.debug("arrCurBld.length "+arrCurBld.length)
			  curBldId++;
			  if(curBldId>=arrCurBld.length)curBldId=0;
			  var curbld=arrCurBld[curBldId];
			  if(arrTileBlds[curbld])
			  if(typeof(arrTileBlds[curbld]) != "undefined" && arrTileBlds[curbld] != null)
			  {
			  var dist2b=dist2Blds(curbld,camera);
			  //console.debug("dist2b "+dist2b+" "+arrTileBlds[curbld].id)
			  alert(arrTileBlds[curbld].id)
			  if(dist2b>110){arrCurBld.splice(curBldId,1);delbuildsoftile(curbld);}
			  }*/

				console.debug("arrCurRoot.length "+arrCurRoot.length)	
				//&&TLoad.idforloadroot!=arrCurRoot[j]&&TLoad.ReadyForRoot
				var InitArray = new Array();
				
				for(j=0;j<arrCurRoot.length;j++){ 
				  cur_ID=arrCurRoot[j];
				  if(typeof(arrTile[cur_ID]) != "undefined" && arrTile[cur_ID] != null)
				  {
				  //console.debug("cur_ID "+cur_ID)
				    flagDrop=false;
			        chldsExist=true;

			  var dist=getDistance(camera,arrTile[cur_ID].lvl,arrTile[cur_ID].tex_x,arrTile[cur_ID].tex_z);	
			  var pixelTileSize=tileSizeRoot/ Math.pow(2,arrTile[cur_ID].lvl)*UnitToPixelScale/dist;
			  
			  /*if(dist<=100)
			  {
			    loadBlds(cur_ID,camera,arrTile[cur_ID].lvl,arrTile[cur_ID].tex_x,arrTile[cur_ID].tex_z)
			  }*/
			  
              //if(dist<=200&&lvlbldactive<0)lvlbldactive=arrTile[cur_ID].lvl;
			  if(arrTile[cur_ID].lvl==lvlbldactive)
			  {
			    if(distfor17<0)distfor17=dist;
                if(typeof(arrTileBlds[cur_ID]) == "undefined" || arrTileBlds[cur_ID] == null)
				{
				 arrTileBlds[cur_ID]=new TileBlds();
				 arrTileBlds[cur_ID].id=cur_ID;
				 var minlon=tile2lon(arrTile[cur_ID].tex_x,arrTile[cur_ID].lvl)
				 var maxlon=tile2lon(arrTile[cur_ID].tex_x+1,arrTile[cur_ID].lvl)
				 var minlat=tile2lat(arrTile[cur_ID].tex_z+1,arrTile[cur_ID].lvl)
				 var maxlat=tile2lat(arrTile[cur_ID].tex_z,arrTile[cur_ID].lvl)
			     var range_lon=maxlon-minlon;
			     var range_lat=maxlat-minlat;
			     var c0=triangleMesh[cur_ID].geometry.vertices[0];
			     var c1=triangleMesh[cur_ID].geometry.vertices[8];
			     var c2=triangleMesh[cur_ID].geometry.vertices[72];
			     var c3=triangleMesh[cur_ID].geometry.vertices[80];
			     var range_x=Math.max(c1.x,c0.x)-Math.min(c1.x,c0.x);
			     var range_z=Math.max(c0.z,c2.z)-Math.min(c0.z,c2.z);
				 arrTileBlds[cur_ID].scale_x=range_x/range_lon;
			     arrTileBlds[cur_ID].scale_z=range_z/range_lat;
				 arrTileBlds[cur_ID].minlon=minlon;
				 arrTileBlds[cur_ID].minlat=minlat;
				 arrTileBlds[cur_ID].z=c3.z;
				 arrTileBlds[cur_ID].x=c0.x;
                 //alert(""+arrTile[cur_ID].id+" "+minlon+" "+minlat+" "+maxlon+" "+maxlat)
                 TLoad.pushTileCube(""+arrTile[cur_ID].id+" "+minlon+" "+minlat+" "+maxlon+" "+maxlat);
				}

			  }

			    if(pixelTileSize>=384&&arrTile[cur_ID].lvl<18)
				{
				  //console.debug("drop "+pixelTileSize+"id "+cur_ID)
				  var ch1=cur_ID*4+1;
				  var ch2=cur_ID*4+2;
				  var ch3=cur_ID*4+3;
				  var ch4=cur_ID*4+4;
				  var flg=false;
				  var exstCh1=false;
				  if(typeof(arrTile[ch1]) != "undefined" && arrTile[ch1] != null)exstCh1=true;
				  var exstCh2=false;
				  if(typeof(arrTile[ch2]) != "undefined" && arrTile[ch2] != null)exstCh2=true;
				  var exstCh3=false;
				  if(typeof(arrTile[ch3]) != "undefined" && arrTile[ch3] != null)exstCh3=true;
				  var exstCh4=false;
				  if(typeof(arrTile[ch4]) != "undefined" && arrTile[ch4] != null)exstCh4=true;
				  if(!exstCh1||!exstCh2||!exstCh3||!exstCh4)
				  {
				    arrTile[ch1]=new Tile();arrTile[ch1].id=ch1;arrTile[ch1].tex_x=2*arrTile[cur_ID].tex_x;arrTile[ch1].tex_z=2*arrTile[cur_ID].tex_z;arrTile[ch1].lvl=arrTile[cur_ID].lvl+1;arrTile[ch1].prnt=cur_ID;
				    arrTile[ch2]=new Tile();arrTile[ch2].id=ch2;arrTile[ch2].tex_x=2*arrTile[cur_ID].tex_x+1;arrTile[ch2].tex_z=2*arrTile[cur_ID].tex_z;arrTile[ch2].lvl=arrTile[cur_ID].lvl+1;arrTile[ch2].prnt=cur_ID;
				    arrTile[ch3]=new Tile();arrTile[ch3].id=ch3;arrTile[ch3].tex_x=2*arrTile[cur_ID].tex_x;arrTile[ch3].tex_z=2*arrTile[cur_ID].tex_z+1;arrTile[ch3].lvl=arrTile[cur_ID].lvl+1;arrTile[ch3].prnt=cur_ID;
				    arrTile[ch4]=new Tile();arrTile[ch4].id=ch4;arrTile[ch4].tex_x=2*arrTile[cur_ID].tex_x+1;arrTile[ch4].tex_z=2*arrTile[cur_ID].tex_z+1;arrTile[ch4].lvl=arrTile[cur_ID].lvl+1;arrTile[ch4].prnt=cur_ID;
				    loadTexture(ch1);
				    loadTexture(ch2);
				    loadTexture(ch3);
				    loadTexture(ch4);
				  }
				  else
				  {
				    flg=arrTile[ch1].texExist&&arrTile[ch2].texExist&&arrTile[ch3].texExist&&arrTile[ch4].texExist;
				    if(flg)
					{
				       arrCurRoot.splice(j,1);
				       var delprntid=ch1==0?-1:((ch1-1)-((ch1-1)%4))/4;
				       deltilemesh(delprntid,false);
				       deltile(delprntid,false);
				       crtMesh(ch1);
				       crtMesh(ch2);
				       crtMesh(ch3);
				       crtMesh(ch4);
					   arrCurRoot.push(ch1);
					   arrCurRoot.push(ch2);
					   arrCurRoot.push(ch3);
					   arrCurRoot.push(ch4);
				    }
				  }
				
				break;
				}
                  else{
				 //does tile have a parent
				 if(arrTile[cur_ID].prnt>=0){

				    prntId=(1*arrTile[cur_ID].prnt);
					ch_id1=4*prntId+1;
					ch_id2=4*prntId+2;
					ch_id3=4*prntId+3;
					ch_id4=4*prntId+4;
					allchexist=true;
					if(!arrTile[ch_id1]){allchexist=false;}
					if(!arrTile[ch_id2]){allchexist=false;}
					if(!arrTile[ch_id3]){allchexist=false;}
					if(!arrTile[ch_id4]){allchexist=false;}
					if(allchexist){				

					var distFromCh1=getDistance(camera,arrTile[ch_id1].lvl,arrTile[ch_id1].tex_x,arrTile[ch_id1].tex_z);
					var pixelTileSize1=tileSizeRoot/ Math.pow(2,arrTile[ch_id1].lvl)*UnitToPixelScale/distFromCh1;
				    var distFromCh2=getDistance(camera,arrTile[ch_id2].lvl,arrTile[ch_id2].tex_x,arrTile[ch_id2].tex_z);
					var pixelTileSize2=tileSizeRoot/ Math.pow(2,arrTile[ch_id2].lvl)*UnitToPixelScale/distFromCh2;
				    var distFromCh3=getDistance(camera,arrTile[ch_id3].lvl,arrTile[ch_id3].tex_x,arrTile[ch_id3].tex_z);
					var pixelTileSize3=tileSizeRoot/ Math.pow(2,arrTile[ch_id3].lvl)*UnitToPixelScale/distFromCh3;
				    var distFromCh4=getDistance(camera,arrTile[ch_id4].lvl,arrTile[ch_id4].tex_x,arrTile[ch_id4].tex_z);
					var pixelTileSize4=tileSizeRoot/ Math.pow(2,arrTile[ch_id4].lvl)*UnitToPixelScale/distFromCh4;


				 	if(pixelTileSize1<=128&&pixelTileSize2<=128&&pixelTileSize3<=128&&pixelTileSize4<=128)
					{
					  //console.debug("rise "+cur_ID+" "+pixelTileSize1+"prnt "+prntId)
					  if(typeof(arrTile[prntId]) != "undefined" && arrTile[prntId] != null)
					  {
					    if(arrTile[prntId].texExist)
						{
							var count=0;
							for(i=0 ;i< arrCurRoot.length;i++)
							{
							    if(typeof(arrTile[arrCurRoot[i]]) != "undefined" && arrTile[arrCurRoot[i]] != null)
								{
					              if(arrTile[arrCurRoot[i]].prnt==prntId){console.debug("del  "+i);arrCurRoot[i]=0;count++;}
								}
					        }
					      arrCurRoot.sort();
                          console.debug("count  "+count);						  
					      for(i=0 ;i<count;i++)arrCurRoot.shift();
						   console.debug("crt  "+prntId+" ");
						   console.debug("del  "+(prntId*4+1)+" ");
						   console.debug("del  "+(prntId*4+2)+" ");
						   console.debug("del  "+(prntId*4+3)+" ");
						   console.debug("del  "+(prntId*4+4)+" ");
						   deltilemesh((prntId*4+1));
						   deltilemesh((prntId*4+2));
						   deltilemesh((prntId*4+3));
						   deltilemesh((prntId*4+4));
						   deltile((prntId*4+1));
						   deltile((prntId*4+2));
						   deltile((prntId*4+3));
						   deltile((prntId*4+4));
						   crtMesh(prntId);
						   arrCurRoot.push(prntId);
			  
						   
						   break;
						}
					  }
					  else
					  {
					  arrTile[prntId]=new Tile();
					  arrTile[prntId].id=prntId;
					  arrTile[prntId].tex_x=arrTile[(prntId*4+1)].tex_x/2;
				      arrTile[prntId].tex_z=arrTile[(prntId*4+1)].tex_z/2;
					  arrTile[prntId].lvl=arrTile[prntId*4+1].lvl-1;
					  arrTile[prntId].prnt=prntId==0?-1:((prntId-1)-((prntId-1)%4))/4;
					  loadTexture(prntId);
					  }

					  //if(!TLoad.tileinQueue(prntId))InitArray.push(prntId);

                    

					}

				    }}}		

                        }
						
						}
						
						
				if(InitArray.length)		
				{		
                InitArray.sort();
				InitArray.reverse();
				TLoad.arTileForAdd = InitArray.concat(TLoad.arTileForAdd);
				TLoad.indx=0;
				}
				//if(TLoad)TLoad.loadTile();
                
				//render();

				/*if(TLoad&&!bverify){
			     if(TLoad.needforload()){bverify=true;timerid=setTimeout(verify, 35);}
				}*/
			  }
				if(TLoad){
			     if(TLoad.needforload())TLoad.loadTile();
				}
              
			}

			function verify(){

				/*if(TLoad){
			     if(TLoad.needforload()){TLoad.loadTile();timerid=setTimeout(verify, 25);}
				 else{bverify=false;}
				}*/
			}

			function render() {
			    /*renderer.render( scene, camera );
				renderer.clear(flase, true, flase);
				*/
                //renderer.clear(true, true, true);
				//renderer.context.depthMask( true );
				//controls.update();
                renderer.render( scene, camera);
			}



			function lon2tile(lon,zoom) {
			     return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
			 }
            function lat2tile(lat,zoom)  { 
			    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
			}

			function tile2lon(x,z) {
			    return (x/Math.pow(2,z)*360-180);
 			}
 			function tile2lat(y,z) {
 			    var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
 			    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
 			}



		</script>

	</body>
</html>