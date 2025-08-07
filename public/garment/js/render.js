if (!Detector.webgl) Detector.addGetWebGLMessage();

//import("three/addons/loaders/GLTFLoader.js");
// Instantiate a loader

// const loader = new GLTFLoader().setPath( 'model/man_base_mesh/' );
// 						loader.load( 'scene.gltf', async function ( gltf ) {

// 							const model = gltf.scene;

// 							// wait until the model can be added to the scene without blocking due to shader compilation

// 							await renderer.compileAsync( model, camera, scene );

// 							scene.add( model );

// 							render();
			
// 						} );


var particlesMeshPosBucketArray = new Array(rowOfBuckets*rowOfBuckets*rowOfBuckets);

var mouseCurrentlyInterface=false;

var currentMouseScreen;
var mouseButtonDown=false;
var currentTool="grab"; //option are "grab", "sew", "increaseLength", "cut"
var grabbingCloth=false;
var currentlyCutting=false;
var cutStart=THREE.Vector2();
var cutEnd=THREE.Vector2();
var currentCutLine=new THREE.Line();

var modelLoaded=false;
var bodyObject;
var bodyGeometry=[];
var container;
var stats;
var controls;

var camera, scene, renderer;
var cameraEdition, sceneEdition;
var time;


var clothObject;
var clothObjectEdition;
var clothObjectArray = []; 
var clothObjectEditionArray=[];

var groundMaterial;

// Objects in the scene
var sphere;
var box;
var boundingBox;

var gui;
var guiControls;

var poleMaterial, sphereMaterial;

var heightSpawn=125;

// The cloth object
var cloth = new Cloth(xSegs, ySegs, fabricLength, heightSpawn);
var clothEdition  = new Cloth(xSegs, ySegs, fabricLength, heightSpawn,true);

// Property of the ground floor in the scene
var GROUND_Y = -249;

// Properties of the sphere in the scene
var sphereSize = 125;
var spherePosition = new THREE.Vector3(0, -250 + sphereSize, 0);
var prevSpherePosition = new THREE.Vector3(0, -250 + sphereSize, 0);


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

var intersection;

const depthPlane= new THREE.Plane();
const worldPosition = new THREE.Vector3();

const inverseMatrix=new THREE.Matrix4();
const offset=new THREE.Vector3();


init();


animate();

function init() {

  container = document.createElement("div");
  document.body.appendChild(container);

  // scene (First thing you need to do is set up a scene)
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    //initializing edition scene

    // scene (First thing you need to do is set up a scene)
    sceneEdition = new THREE.Scene();


  // camera (Second thing you need to do is set up the camera)
  camera = new THREE.PerspectiveCamera(30, window.innerWidth/2 / window.innerHeight, 1, 10000);
  camera.position.y = 450;
  camera.position.z = 1500;
  camera.aspect=window.innerWidth/2 / window.innerHeight;
  scene.add(camera);


      // camera (Second thing you need to do is set up the camera for edition)
      cameraEdition = new THREE.OrthographicCamera(-window.innerWidth/2,window.innerWidth/2,window.innerHeight,-window.innerHeight, 1, 10000);
      cameraEdition.position.y = 0;
      cameraEdition.position.z = 1500;
      cameraEdition.zoom=2;
      sceneEdition.add(cameraEdition);
      cameraEdition.updateProjectionMatrix();


  // renderer (Third thing you need is a renderer)
  renderer = new THREE.WebGLRenderer({ antialias: true, devicePixelRatio: 1 });
  renderer.setClearColor(scene.fog.color);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setViewport( 0, 0, window.innerWidth/2, window.innerHeight );

  renderer.setScissorTest(true);
  //renderer.setScissor( 100, 100, window.innerWidth/2, window.innerHeight );

  container.appendChild(renderer.domElement);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = true;

  // This gives us stats on how well the simulation is running
  stats = new Stats();
  container.appendChild(stats.domElement);

  // mouse controls camera
  controls = new THREE.OrbitControls( camera, renderer.domElement );

  // lights (fourth thing you need is lights)
  let light, materials;
  scene.add(new THREE.AmbientLight(0x666666));
  light = new THREE.DirectionalLight(0xdfebff, 1.75);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  let d = 300;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.camera.far = 1000;

  scene.add(light);

  // cloth (Now we're going to create the cloth)
  // every thing in our world needs a material and a geometry

  
  // this part allows us to use an image for the cloth texture
  // can include transparent parts
  var loader = new THREE.TextureLoader();
  var clothTexture = loader.load( "textures/patterns/custom.png" );
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
  clothTexture.anisotropy = 16;
  

  // cloth material
  // this tells us the material's color, how light reflects off it, etc.

  var clothMaterialAux = new THREE.MeshPhongMaterial({
    color: 0xaa2929,
    specular: 0x030303,
    wireframeLinewidth: 2,
    map: clothTexture,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
  });

  // cloth geometry
  // the geometry contains all the points and faces of an object
  var clothGeometryAux = new THREE.ParametricGeometry(initParameterizedPosition(fabricLength,fabricLength), cloth.w, cloth.h);
  clothGeometryAux.dynamic = true;

  cloth.clothGeometry=clothGeometryAux;
  cloth.clothMaterial=clothMaterialAux;

  cloth.quads=[];
  for (let i=0;i<clothGeometryAux.faces.length/2;i++)
  {
    cloth.quads.push([2*i,2*i+1]);
  }
  cloth.triangs=[];


  
  // more stuff needed for the texture
  var uniforms = { texture:  { type: "t", value: clothTexture } };
  var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;
  

  // cloth mesh
  // a mesh takes the geometry and applies a material to it
  // so a mesh = geometry + material
  clothObject = new THREE.Mesh(clothGeometryAux, clothMaterialAux);
  clothObject.position.set(0, 0, 0);
  clothObject.castShadow = true;
  

  clothObject.cloth=cloth;
  // whenever we make something, we need to also add it to the scene
  scene.add(clothObject); // add cloth to the scene

  
  // more stuff needed for texture
  clothObject.customDepthMaterial = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
  } );

  clothObjectArray.push(clothObject);

  //HERE I ADD clothObjectEdition. It is the copy used on the editor
  //TODO:Fixing the fact that particles are the same and this bring lots of problems. I should be creating a neww identical cloth

  var clothMaterialEditionAux = new THREE.MeshBasicMaterial({
    color: 0xaa2929,
    wireframeLinewidth: 2,
    map: clothTexture,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    wireframe:wireframe,
  });

  var clothGeometryEditionAux = new THREE.ParametricGeometry(initParameterizedPosition(fabricLength,fabricLength), clothEdition.w, clothEdition.h);
  clothGeometryEditionAux.dynamic = true;

  
  clothEdition.clothGeometry=clothGeometryEditionAux;
  clothEdition.clothMaterial=clothMaterialEditionAux;

  clothEdition.quads=[];
  for (let i=0;i<clothGeometryEditionAux.faces.length/2;i++)
  {
    clothEdition.quads.push([2*i,2*i+1]);
  }
  clothEdition.triangs=[];


  clothObjectEdition = new THREE.Mesh(clothGeometryEditionAux, clothMaterialEditionAux);
  clothObjectEdition.position.set(0, 0, 0);
  clothObjectEdition.rotation.x=-Math.PI/2;


  clothObjectEdition.cloth=clothEdition;
  // whenever we make something, we need to also add it to the scene
 
  
  sceneEdition.add(clothObjectEdition);
  
  // more stuff needed for texture
  clothObjectEdition.customDepthMaterial = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
  } );


  clothObjectEditionArray.push(clothObjectEdition);

  // sphere
  // sphere geometry
  let sphereGeo = new THREE.SphereGeometry(sphereSize, 20, 20);
  // sphere material
  sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.01,
  });
  // sphere mesh
  sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere); // add sphere to scene

  // ground

  
  // needed for ground texture
  var groundTexture = loader.load( "textures/terrain/grasslight-big.jpg" );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 25, 25 );
  groundTexture.anisotropy = 16;
  

  // ground material
  groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x404761, //0x3c3c3c,
    specular: 0x404761, //0x3c3c3c//,
    map: groundTexture
  });

  // ground mesh
  let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
  mesh.position.y = GROUND_Y - 1;
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh); // add ground to scene

  // poles
  let poleGeo = new THREE.BoxGeometry(5, 250 + 125, 5);
  poleMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x111111,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  let pole1 = new THREE.Mesh(poleGeo, poleMaterial);
  pole1.position.x = -250;
  pole1.position.z = 250;
  pole1.position.y = -(125 - 125 / 2);
  pole1.receiveShadow = false;
  pole1.castShadow = false;
  scene.add(pole1);

  let pole2 = new THREE.Mesh(poleGeo, poleMaterial);
  pole2.position.x = 250;
  pole2.position.z = 250;
  pole2.position.y = -(125 - 125 / 2);
  pole2.receiveShadow = false;
  pole2.castShadow = false;
  scene.add(pole2);

  let pole3 = new THREE.Mesh(poleGeo, poleMaterial);
  pole3.position.x = 250;
  pole3.position.z = -250;
  pole3.position.y = -(125 - 125 / 2);
  pole3.receiveShadow = false;
  pole3.castShadow = false;
  scene.add(pole3);

  let pole4 = new THREE.Mesh(poleGeo, poleMaterial);
  pole4.position.x = -250;
  pole4.position.z = -250;
  pole4.position.y = -62;
  pole4.receiveShadow = false;
  pole4.castShadow = false;
  scene.add(pole4);

  // create a box mesh
  let boxGeo = new THREE.BoxGeometry(250, 100, 250);
  let boxMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.01,
  });
  box = new THREE.Mesh(boxGeo, boxMaterial);
  box.position.x = 0;
  box.position.y = 0;
  box.position.z = 0;
  box.receiveShadow = true;
  box.castShadow = true;
  scene.add(box);

  boxGeo.computeBoundingBox();
  boundingBox = box.geometry.boundingBox.clone();



  

  // event listeners
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener( 'pointermove', onPointerMove );
  window.addEventListener("mousedown", mousedown);
  window.addEventListener("mouseup", mouseup);
  window.addEventListener("wheel", scrollWhell)

  var loader = new THREE.GLTFLoader();

  loader.load( 'model/man_base_mesh/scene.gltf', function ( gltf ) {


    bodyObject=gltf.scene;

    var bbox = new THREE.Box3().setFromObject(bodyObject);
    var cent = bbox.getCenter(new THREE.Vector3());
    var size = bbox.getSize(new THREE.Vector3());

    //Rescale the object to normalized space
    var maxAxis = Math.max(size.x, size.y, size.z);
    bodyObject.scale.multiplyScalar(1.0 / maxAxis*300);
    bbox.setFromObject(bodyObject);
    bbox.getCenter(cent);
    bbox.getSize(size);
    //Reposition to 0,halfY+49,0
    bodyObject.position.copy(cent).multiplyScalar(-1);
    bodyObject.position.y+= (size.y * 0.5);
    bodyObject.position.y-= 250;

    bodyObject.receiveShadow=true;
    bodyObject.castShadow = true;


    var countArea=0;
    // var maxX=0;
    // var maxY=0;
    // var maxZ=0;
    // var minX=0;
    // var minY=0;
    // var minZ=0;
    bodyObject.traverse( function ( child ) {
      if ( child.isMesh ) {
        //child.material.envMap = envMap;
           //Setting the buffer geometry
       //console.log(child.geometry);
       countArea++;
        if (countArea==10)
        {

          for (var i = 0; i < child.geometry.attributes.position.count; i++) { 
            //console.log("x",child.geometry.attributes.normal.getX(i),"y",child.geometry.attributes.normal.getZ(i),"z",child.geometry.attributes.normal.getY(i));
            var normalParticle=new THREE.Vector3(child.geometry.attributes.normal.getX(i),child.geometry.attributes.normal.getZ(i),child.geometry.attributes.normal.getY(i));
            bodyGeometry.push(new Particle(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250, -child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,MASS,false,normalParticle)) ;
           
            child.geometry

                // recalculate body normals
                //TODO: no se si deberia cambiarlo o mantener
                child.geometry.computeFaceNormals();
                child.geometry.computeVertexNormals();

                child.geometry.normalsNeedUpdate = true;
                child.geometry.verticesNeedUpdate = true;

        /*     const geometry = new THREE.BoxGeometry( 3, 3, 3 ); 
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
             //maxX=Math.max(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,maxX);
             //maxY=Math.max(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,maxY);
             //maxZ=Math.max(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,maxZ);
             //minX=Math.min(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,minX);
             //minY=Math.min(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,minY);
             //minZ=Math.min(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,minZ);
            const cube = new THREE.Mesh( geometry, material ); 
            cube.position.set(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250, -child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z);
            scene.add( cube ); */
          }
        }

        
        

        //child.castShadow=true;
        child.receiveShadow=true;
      }
    } );
    // console.log("maxX",maxX,"maxY",maxY,"maxZ",maxZ,)
    // console.log("minX",minX,"minY",minY,"minZ",minZ,)

    for (i=0;i<particlesMeshPosBucketArray.length;i++)
    {
      particlesMeshPosBucketArray[i]=new Array();
    }

    for (i=0;i<bodyGeometry.length;i++)
    {
        
      var bucket=Math.floor(Math.min(499,Math.max(0,(bodyGeometry[i].position.x+250)))/(500/rowOfBuckets))*rowOfBuckets*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(bodyGeometry[i].position.y+250)))/(500/rowOfBuckets))*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(bodyGeometry[i].position.z+250)))/(500/rowOfBuckets));
      //if (!Array.isArray(particlesMeshPosBucketArray[bucket])){
      //  console.log("bucket",bucket);
       // console.log("clothObjectArray[i].cloth.particles[j].position",clothObjectArray[i].cloth.particles[j].position);
        //console.log("clothObjectArray[i].cloth.particles[j]",clothObjectArray[i].cloth.particles[j]);
      //}//TODO:FIXING THIS bucket NaN when restarting. This means position deleted at restart
      //console.log(bucket);
      particlesMeshPosBucketArray[bucket].push(bodyGeometry[i]);
    }
  

    modelLoaded=true;

    if (showingMesh)
    {
      scene.add( bodyObject );
    }

  }, function ( xhr ) {
  
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  
  }, function ( error ) {
  
    console.error( error );
  
  } );




  // placeObject is a function that creates objects the cloth can collide into
  placeObject(object);

  // pinCloth sets how the cloth is pinned
  pinCloth(pinned);

  // wireframe sets whether or not the wireframe is shown by default
  showWireframe(wireframe);


    
  






}

function onWindowResize() {
  camera.aspect = window.innerWidth/2 / window.innerHeight;
  camera.updateProjectionMatrix();

  cameraEdition.left= -window.innerWidth/2;
  cameraEdition.right= window.innerWidth/2;
  cameraEdition.top= window.innerHeight;
  cameraEdition.bottom= -window.innerHeight;

  //cameraEdition.aspect = window.innerWidth/2 / window.innerHeight;
  cameraEdition.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

  var deviceCordinates=( event.clientX / (window.innerWidth/2) ); //combines both screen in 1. Its interval is 0 to 2 or 0 to 1 for 1 screen and 1 to 2 for the other

  if (deviceCordinates>1)
  {
    deviceCordinates=deviceCordinates-1; 
    if ((currentMouseScreen==0)&&(grabbingCloth==true)) //I drop cloth if i was holding it when i go to the other screen
    {
      intersection.object.cloth.particles[intersection.face.a].lockPosition=false;
      grabbingCloth=false;
    } 
    currentMouseScreen=1;
    if (mouseButtonDown==false)
    {
     controls.enabled=false;
    }
  }else
  {
    if ((currentMouseScreen==1)&&(currentlyCutting==true)) //I stop cutting cloth if i was holding it when i go to the other screen
    {
      sceneEdition.remove(currentCutLine);
      currentlyCutting=false;
      cutCloth();
    } 

    currentMouseScreen=0;  
    if (mouseButtonDown==false)
    {
      controls.enabled=true;
    } 



  }

	pointer.x = deviceCordinates * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function mousedown(){

  mouseButtonDown=true;

  if ((currentTool=="grab")&&(currentMouseScreen==0))
  {
    //TODO: changing position mouse to closest vertex instead of just a the face.A one
    //TODO: Fixing when sometime doesnt detect some parts close to the outside

        // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );


    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    if((intersects.length>0))
    {
      
      var i=0;
      while((i<intersects.length)&&(typeof (intersects[ i ].object.cloth)=="undefined"))
      {
        i=i+1;
      }
      if (i<intersects.length)
      {
        intersection=intersects[ i ];
        depthPlane.setFromNormalAndCoplanarPoint( camera.getWorldDirection( depthPlane.normal ), intersection.object.cloth.particles[intersection.face.a].position );
        
      controls.enabled=false; 
      grabbingCloth=true;
      }  

    } 

  }else if ((currentTool=="cut")&&(currentMouseScreen==1)&&(mouseCurrentlyInterface==false))
  {
    currentlyCutting=true;

    // update the picking ray with the camera and pointer position
    cutStart=new THREE.Vector2(pointer.x*(window.innerWidth/2)/cameraEdition.zoom,pointer.y*(window.innerHeight)/cameraEdition.zoom);


  }
  
}

function mouseup(){

  mouseButtonDown=false;
  if (controls.enabled==false)
  {
    controls.enabled=true;

    if (grabbingCloth==true)
    {
      intersection.object.cloth.particles[intersection.face.a].lockPosition=false;
    }
    else if (currentlyCutting==true)
    {
      sceneEdition.remove(currentCutLine);
      cutEnd=new THREE.Vector2(pointer.x*(window.innerWidth/2)/cameraEdition.zoom,pointer.y*(window.innerHeight)/cameraEdition.zoom);
      currentlyCutting=false;
      cutCloth();
    }


  }
    
}


function scrollWhell(event){
  const delta = -Math.sign(event.deltaY);
  if ((controls.enabled==false)&&(grabbingCloth==true))
  {

    //intersection.object.cloth.particles[intersection.face.a].lockPosition=false;

    depthPlaneAux=new THREE.Vector3();
    depthPlaneAux=depthPlaneAux.copy(depthPlane.normal);
    depthPlane.translate(depthPlaneAux.multiplyScalar(delta*50));
    
  }else if (currentMouseScreen==1)
  {
    
    cameraEdition.zoom=cameraEdition.zoom+delta/5;
    cameraEdition.updateProjectionMatrix();
  }  
}



//addClothPiece() is used when we want to add an additional cloth piece

function addClothPiece(){

   // cloth (Now we're going to create the cloth)
  // every thing in our world needs a material and a geometry

  
  // this part allows us to use an image for the cloth texture
  // can include transparent parts
  var loader = new THREE.TextureLoader();
  var clothTexture = loader.load( "textures/patterns/custom.png" );
  clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
  clothTexture.anisotropy = 16;
  

  // cloth material
  // this tells us the material's color, how light reflects off it, etc.

  var clothMaterialAux = new THREE.MeshPhongMaterial({
    color: 0xaa2929,
    specular: 0x030303,
    wireframeLinewidth: 2,
    map: clothTexture,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
  });

  clothMaterialAux.wireframe=wireframe;

  heightSpawn=heightSpawn+125;
  var clothAux = new Cloth(xSegs, ySegs, fabricLength, heightSpawn);

        // cloth geometry
    // the geometry contains all the points and faces of an object
    var clothGeometryAux = new THREE.ParametricGeometry(initParameterizedPosition(fabricLength,fabricLength), clothAux.w, clothAux.h);
    clothGeometryAux.dynamic = true;


  clothAux.clothGeometry=clothGeometryAux;
  clothAux.clothMaterial=clothMaterialAux;




      // more stuff needed for the texture
  var uniforms = { texture:  { type: "t", value: clothTexture } };
  var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;

    // cloth mesh
    // a mesh takes the geometry and applies a material to it
    // so a mesh = geometry + material
    var clothObjectAux = new THREE.Mesh(clothGeometryAux, clothMaterialAux);
    clothObjectAux.position.set(0, 0, 0);
    clothObjectAux.castShadow = true;

    
    // more stuff needed for texture
    clothObjectAux.customDepthMaterial = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide
    } );

    clothObjectAux.cloth=clothAux;
    // whenever we make something, we need to also add it to the scene
    scene.add(clothObjectAux); // add cloth to the scene

    clothObjectArray.push(clothObjectAux);
}

// restartCloth() is used when we change a fundamental cloth property with a slider
// and therefore need to recreate the cloth object from scratch
function restartCloth() {

  for (let i=0;i<clothObjectArray.length;i++)
  {
    scene.remove(clothObjectArray[i]);


    var clothAux = new Cloth(xSegs, ySegs, fabricLength, clothObjectArray[i].cloth.heightSpawn);

    var clothMaterialAux=clothObjectArray[i].cloth.clothMaterial;

    clothAux.clothMaterial=clothMaterialAux;


      // recreate cloth geometry
    var clothGeometryAux = new THREE.ParametricGeometry(initParameterizedPosition(fabricLength,fabricLength), xSegs, ySegs);
    clothGeometryAux.dynamic = true;
    clothAux.clothGeometry=clothGeometryAux

      // recreate cloth mesh
    var clothObjectAux = new THREE.Mesh(clothGeometryAux, clothMaterialAux);
    clothObjectAux.position.set(0, 0, 0);
    clothObjectAux.castShadow = true;

    clothObjectAux.cloth=clothAux;

    scene.add(clothObjectAux); // adds the cloth to the scene

    clothObjectArray[i]=clothObjectAux;

  }
 

  if (randomEdgesPinned)
  {
    rand = Math.round(Math.random() * 10) + 1;
    randomPoints = [];
    for (r = 0; r < rand; r++) {
      randX = Math.round(Math.random() * xSegs);
      randY = Math.round(Math.random() * ySegs);
      randomPoints.push([randX, randY]);
      //console.log([randX, randY]);
    }
  }

  enforcePinConstraints()

  
}

function animate() {
  requestAnimationFrame(animate);

  if (modelLoaded)
  {
    //console.log(bodyGeometry);
  }

  if ((controls.enabled==false)&&(grabbingCloth==true))
  {

    var newPosition=new THREE.Vector3();

    raycaster.setFromCamera( pointer, camera );

      //  const helper = new THREE.PlaneHelper( depthPlane, 100, 0xffff00 );
   // scene.add( helper );

    if (raycaster.ray.intersectPlane( depthPlane, newPosition ))
    {

      intersection.object.cloth.particles[intersection.face.a].position.copy(newPosition);
      intersection.object.cloth.particles[intersection.face.a].previous = newPosition.clone();

      intersection.object.cloth.particles[intersection.face.a].lockPosition=true;
      
    }

 

    //intersection.object.cloth.particles[intersection.face.a].position.set(newPosition);

    		//intersects[ 0 ].object.material.color.set( 0xff0000 );
    //console.log("intersects[ 0 ]",intersects[ 0 ].face);
    //console.log("intersects[ 0 ].object.cloth",intersects[ 0 ].object.cloth.particles[intersects[0].face.a]);

   // controls.enabled=true;

  }else if (currentlyCutting==true)
  {
    var cutCurrentEnd=new THREE.Vector2(pointer.x*(window.innerWidth/2)/cameraEdition.zoom,pointer.y*(window.innerHeight)/cameraEdition.zoom);

    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    const points = [];
    points.push( new THREE.Vector3( cutStart.x, cutStart.y, 700 ) );
    points.push( new THREE.Vector3( cutCurrentEnd.x, cutCurrentEnd.y, 700 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    sceneEdition.remove(currentCutLine);
    currentCutLine = new THREE.Line( geometry, material );
    sceneEdition.add( currentCutLine );
  }


  time = Date.now();
  for (let i=0;i<simulationFramePerVisualizedFrame;i++)
  {
    simulate(); // run physics simulation to create new positions of cloth
  }
  
  render(); // update position of cloth, compute normals, rotate camera, render the scene
  stats.update();
  controls.update();
}

// the rendering happens here
function render() {
  let timer = Date.now() * 0.0002;

/* 
  for (var j=0;j<clothObjectArray.length;j++)
  {
    // update position of the cloth
    // i.e. copy positions from the particles (i.e. result of physics simulation)
    // to the cloth geometry
    let p = clothObjectArray[j].cloth.particles;
    for (let i = 0, il = p.length; i < il; i++) {
      clothObjectArray[j].cloth.clothGeometry.vertices[i].copy(p[i].position);
    }

    // recalculate cloth normals
    clothObjectArray[j].cloth.clothGeometry.computeFaceNormals();
    clothObjectArray[j].cloth.clothGeometry.computeVertexNormals();

    clothObjectArray[j].cloth.clothGeometry.normalsNeedUpdate = true;
    clothObjectArray[j].cloth.clothGeometry.verticesNeedUpdate = true;
  } */
  // update sphere position from current sphere position in simulation
  sphere.position.copy(spherePosition);
  

  // option to auto-rotate camera
  if (rotate) {
    let cameraRadius = Math.sqrt(
      camera.position.x * camera.position.x + camera.position.z * camera.position.z
    );
    camera.position.x = Math.cos(timer) * cameraRadius;
    camera.position.z = Math.sin(timer) * cameraRadius;
  }

  camera.lookAt(scene.position);
  

  renderer.setViewport( 0, 0, window.innerWidth/2, window.innerHeight );
  renderer.setScissor( 0, 0, window.innerWidth/2, window.innerHeight);
  renderer.render(scene, camera); // render the scene

  //render edition Scene

   renderer.setViewport( window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight );
  renderer.setScissor( window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
  renderer.render(sceneEdition, cameraEdition); 


}
