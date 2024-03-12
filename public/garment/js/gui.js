var guiEnabled = true;

if (guiEnabled) {
  // GUI properties
  guiControls = new (function() {
    this.fabricLength = fabricLength;
    this.restDistance=restDistance;
    this.particleDistance = particleDistance;
    this.wireframe = wireframe;

    this.rotate = rotate;
    this.wind = wind;
    this.stopExternalForces=stopExternalForces;
    this.object = object;
    this.showingMesh = showingMesh;
    this.movingSphere = movingSphere;
    this.pinned = pinned;

    this.structuralSprings = structuralSprings;

    this.shearSprings = shearSprings;
    // this.shearSpringLengthMultiplier = restDistanceS;

    this.bendingSprings = bendingSprings;
    // this.bendingSpringLengthMultiplier = restDistanceB;

    this.friction = friction;
    this.avoidClothSelfIntersection = avoidClothSelfIntersection;

    this.clothColor = 0xaa2929;
    this.clothSpecular = 0x030303;

    this.groundColor = 0x404761;
    this.groundSpecular = 0x404761;

    this.fogColor = 0xcce0ff;
  })();

  // GUI elements
  gui = new dat.GUI();

  let sizeControl = gui
    .add(guiControls, "fabricLength", 200, 1000)
    .step(20)
    .name("Size")
    .onChange(function(value) {
      fabricLength = value;
      xSegs = Math.round(value / particleDistance);
      ySegs = Math.round(value / particleDistance);
      restDistance=particleDistance;
      restartCloth();
    });

  let wireframeControl = gui
    .add(guiControls, "wireframe")
    .name("Wireframe")
    .onChange(function(value) {
      showWireframe(value);
    });

  let interactionControls = gui.addFolder("Interaction");

  interactionControls
    .add(guiControls, "rotate")
    .name("auto rotate")
    .onChange(function(value) {
      rotate = value;
    });
  interactionControls
    .add(guiControls, "wind")
    .name("wind")
    .onChange(function(value) {
      wind = value;
    });

  interactionControls
    .add(guiControls, "object", ["None", "Sphere", "Box"])
    .name("object")
    .onChange(function(value) {
      placeObject(value);
    });
  interactionControls
    .add(guiControls, "showingMesh")
    .name("adding person")
    .onChange(function(value) {
      if (value)
      {
        if (!showingMesh)
        {
          scene.add( bodyObject );
          restartCloth();
        }
      }else 
      {
        if (showingMesh)
        {
          scene.remove( bodyObject );
          restartCloth();
        }
        
      }
      showingMesh=value;

    });
  interactionControls
    .add(guiControls, "movingSphere")
    .name("moving sphere")
    .onChange(function(value) {
      movingSphere = value;
    });
  interactionControls
    .add(guiControls, "pinned", ["None", "Corners", "OneEdge", "TwoEdges", "FourEdges", "Random"])
    .name("pinned")
    .onChange(function(value) {
      pinCloth(value);
    });

  let simulationControls= gui.addFolder("Simulation");

  simulationControls
    .add(guiControls, "stopExternalForces")
    .name("stopExternalForces")
    .onChange(function(value) {
      stopExternalForces = value;
    });

    simulationControls
    .add(guiControls, "particleDistance", 5, 50)
    .step(1)
    .name("particleDistance")
    .onChange(function(value) {
      particleDistance = value;
      xSegs = Math.round(fabricLength / value);
      ySegs = Math.round(fabricLength / value);
      restDistance = value;
      restartCloth();
    });

  let behaviorControls = gui.addFolder("Behavior");

  behaviorControls
    .add(guiControls, "structuralSprings")
    .name("structural")
    .onChange(function(value) {
      structuralSprings = value;
      restartCloth();
    });
  behaviorControls
    .add(guiControls, "shearSprings")
    .name("shear")
    .onChange(function(value) {
      shearSprings = value;
      restartCloth();
    });
  behaviorControls
    .add(guiControls, "bendingSprings")
    .name("bending")
    .onChange(function(value) {
      bendingSprings = value;
      restartCloth();
    });
  behaviorControls.add(guiControls, "friction", 0, 1).onChange(function(value) {
    friction = value;
  });
  behaviorControls
    .add(guiControls, "avoidClothSelfIntersection")
    .name("NoSelfIntersect")
    .onChange(function(value) {
      avoidClothSelfIntersection = value;
    });

  let appearanceControls = gui.addFolder("Appearance");
  appearanceControls
    .addColor(guiControls, "clothColor")
    .name("cloth color")
    .onChange(function(value) {
      clothObjectArray[0].cloth.clothMaterial.color.setHex(value);
    });
  appearanceControls
    .addColor(guiControls, "clothSpecular")
    .name("cloth reflection")
    .onChange(function(value) {
      clothObjectArray[0].cloth.specular.setHex(value);
    });
  appearanceControls
    .addColor(guiControls, "groundColor")
    .name("ground color")
    .onChange(function(value) {
      groundMaterial.color.setHex(value);
    });
  appearanceControls
    .addColor(guiControls, "groundSpecular")
    .name("gnd reflection")
    .onChange(function(value) {
      groundMaterial.specular.setHex(value);
    });
  appearanceControls.addColor(guiControls, "fogColor").onChange(function(value) {
    scene.fog.color.setHex(value);
    renderer.setClearColor(scene.fog.color);
  });

  let extraClothControls = gui.addFolder("extraCloth");
  var obj = { add:function(){ addClothPiece() }};

  extraClothControls.add(obj,'add');

}
