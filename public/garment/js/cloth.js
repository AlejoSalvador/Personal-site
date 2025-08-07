//TODO: https://threejs.org/docs/#api/en/core/Raycaster use the faces and point to identify the closest intersection vertex

/****************************** CLOTH PROPERTIES ******************************/
// Which spring types to use in the cloth
var structuralSprings = true;
var shearSprings = true;
var bendingSprings = true;

// Similar to coefficient of friction
// 0 = frictionless, 1 = cloth sticks in place
var friction = 0.6;

var particleDistance=10 //how much distance between particles
var fabricLength = 500; // sets the length of the cloth in both dimensions
var xSegs = fabricLength/particleDistance; // how many particles wide is the cloth
var ySegs = fabricLength/particleDistance; // how many particles tall is the cloth



// Flag for whether cloth should avoid self intersections
var avoidClothSelfIntersection = false;


// This is a higher-order function used for the cloth's parametric geometry
// and for particles to compute their initial positions in space
function initParameterizedPosition(height,width)
{
  return plane(height, width, 125);
}

/****************************** CONSTANTS ******************************/
// Rest distance coefficients for (B)ending springs and (S)hearing springs
var restDistance = fabricLength / xSegs;
var restDistanceB = 2;
var restDistanceS = Math.sqrt(2);

// Damping coefficient for integration
var DAMPING = 0.05;

// Mass of each particle in the cloth
var MASS = 0.1;

// Acceleration due to the gravity, scaled up because distance in cm
var GRAVITY = 9.8 * 100;

//SpringConstant of Cloth. TODO: move it to cloth instead of everything
var springEStiffness=20000;
var springBStifness=4000;
var springSStiffness=20000; 

// The timestep (or deltaT used in integration of the equations of motion)
// Smaller values result in a more stable simulation, but becomes slower.
// This value was found experimentally to work well in this simulation.

var simulationFramePerVisualizedFrame = 4;

var TIMESTEP = 1/60 / simulationFramePerVisualizedFrame;

//used to know how many buckets there will be in the simulation. There is a sweetspot where initialization per frame is not too long but the speedup achieved is high
var rowOfBuckets=20 


/****************************** HELPER FUNCTIONS ******************************/
// Used to parameterize the cloth's geometry and provide initial positions
// for the particles in the cloth
function plane(width, height, positionHeight) {
  return function(u, v, vec) {
    let x = u * width - width / 2;
    let y = positionHeight;
    let z = v * height - height / 2;
    vec.set(x, y, z);
  };
}

/***************************** CONSTRAINT *****************************/
function Constraint(p1, p2, distance, springType) {


  this.p1 = p1; // Particle 1
  this.p2 = p2; // Particle 2
  this.distance = distance; // Desired distance
  this.springType=springType;

  if (springType==="structural")
  {
    this.springConstant=springEStiffness/distance;
  }else if (springType==="shear")
  {
    this.springConstant=springBStifness/distance;
  }else if (springType==="bending")
  {
    this.springConstant=springSStiffness/distance;
  }else
  {
    console.error("wrongCostraintType at creating constraint");
  }
}

function addConstraint(p1, p2, distance, springType) {

  var constraint= new Constraint(p1, p2, distance, springType);
  p1.addSpring(constraint,springType);
  p2.addSpring(constraint,springType);

  //this calls the functions in particle to place the pointer to the constraint arrays inside the particle 
  //remember the key trick of using the structural springs to know where to draw bending spring. If I had a bending from A to B. I can search the structural spring from B to C 
  //where C is inside the same quad with A. With that information I know that the intersection with the cut along the line A->B (lets call it D) will be used to make bending D->C
  //this works with triang or any shape where there are cuts. It could probably be done directly at the intersection level grouped to prevent repetion


  return constraint;
}

Constraint.prototype.removeSpring= function()
{
  this.p1.removeSpring(this.p2,this.springType);
  this.p2.removeSpring(this.p1,this.springType);
};

Constraint.prototype.enforce = function() {
  // ----------- CODE BEGIN ------------
  // Enforce this constraint by applying a correction to the two particles'
  // positions based on their current distance relative to their desired rest
  // distance. Since the constrains are applied 2 times. One time per particle I need to apply half the force
  var v12 = (this.p1.position.clone()).sub(this.p2.position);
  var distanceFromRest =  (this.distance-v12.length());
 /*   if (distanceFromRest<-100){
    console.log("this.distance",this.distance);
    console.log("v12.length()",v12.length());
    console.log(distanceFromRest*springConstant);
    console.log("forceDirected",v12.clone().normalize().multiplyScalar(distanceFromRest*springConstant));
    console.log("position1",this.p1.position.clone());
    console.log("position2",this.p2.position.clone());
    console.log("original1",this.p1.original.clone());
    console.log("original",this.p2.original.clone());
    console.log("net",this.p2.original.clone());
    console.log("forceDirectedNegate",(v12.clone().normalize().multiplyScalar(distanceFromRest*springConstant)).negate());

     const geometry = new THREE.BoxGeometry( 30, 30, 30 ); 
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
            // maxX=Math.max(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,maxX);
            // maxY=Math.max(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,maxY);
            // maxZ=Math.max(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,maxZ);
            // minX=Math.min(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,minX);
            // minY=Math.min(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,minY);
            // minZ=Math.min(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,minZ);
            const cube = new THREE.Mesh( geometry, material ); 
      cube.position.set(this.p1.position.x,this.p1.position.y, this.p1.position.z);
            scene.add( cube );

            const geometry2 = new THREE.BoxGeometry( 30, 30, 30 ); 
            const material2 = new THREE.MeshBasicMaterial( {color: 0x00ffff} ); 
            // maxX=Math.max(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,maxX);
            // maxY=Math.max(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,maxY);
            // maxZ=Math.max(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,maxZ);
            // minX=Math.min(child.geometry.attributes.position.getX(i)/ maxAxis*300-cent.x,minX);
            // minY=Math.min(child.geometry.attributes.position.getZ(i)/ maxAxis*300-cent.y+size.y * 0.5-250,minY);
            // minZ=Math.min(-child.geometry.attributes.position.getY(i)/ maxAxis*300-cent.z,minZ);
            const cube2 = new THREE.Mesh( geometry2, material2 ); 
      cube2.position.set(this.p2.position.x,this.p2.position.y, this.p2.position.z);
            scene.add( cube2 );

            render();

    throw new Error("Error_Message"); 
    //process.exit(0); 
  }  */
  
  var forceScalar = distanceFromRest*this.springConstant/2; //applying half the force

  var forceDirected = v12.clone().normalize().multiplyScalar(forceScalar);

/*   if (this.p2.lockPosition==true)
  {
    if (this.p1.lockPosition==true)
    {
      return
    }
    this.p1.addForce(forceDirected);  
  }else
  if (this.p1.lockPosition==true)
  {
    this.p2.addForce(forceDirected.negate());
  }else
  { */
    this.p2.addConstrainsForce(forceDirected.clone().negate());

    this.p1.addConstrainsForce(forceDirected);
  /* } */

  // var v12 = (this.p1.position.clone()).sub(this.p2.position);
  // var factor = (v12.length() - this.distance) / v12.length();
  // var vcorr = v12.multiplyScalar(factor/2);

  // if (this.p2.lockPosition==true)
  // {
  //   if (this.p1.lockPosition==true)
  //   {
  //     return
  //   }
  //   this.p1.position.sub(vcorr.multiplyScalar(2));  
  // }else
  // if (this.p1.lockPosition==true)
  // {
  //   this.p2.position.add(vcorr.multiplyScalar(2));
  // }else
  // {
  //   this.p2.position.add(vcorr);
  //   this.p1.position.sub(vcorr);
  // }
  // ----------- CODE END ------------
};

/****************************** CLOTH ******************************/
// Cloth constructor
// Parameters:
//   w: (int) number of segments width-wise
//   h: (int) number of segments height-wise
//   l: (int) actual length of the square cloth
//
// A cloth has the following properties:
//   this.w: (int) number of segments width-wise
//   this.h: (int) number of segments height-wise
//   this.constraints: (Constraints[]) list of Constraint objects
//      that constrain distances between some 2 particles in the cloth
//   this.particles: (Particles[]) list of Particle objects that make up the cloth
  //Cloth Properties
  //this.clothMaterial==inforamtion about the geometry of the cloth
  //this.clothGeometry==Information about the geometry of the cloth



function Cloth(w, h, l, heightSpawn, edition=false) {
  // Internal helper function for computing 1D index into particles list
  // from a particle's 2D index
  function index(u, v) {
    return u + v * (w + 1);
  }
  this.index = index;

  // Width and height, and spawnHeight
  this.w = w;
  this.h = h;
  this.heightSpawn=heightSpawn;

  //Cloth Properties
  //information about the geometry of the cloth
  var clothMaterial;
  // Information about the geometry of the cloth
  var clothGeometry;

  if (edition===false)
  {
    // Empty initial lists
    let particles = [];

    // Create particles
    for (v = 0; v <= h; v++) {
      for (u = 0; u <= w; u++) {
        (new Particle(u / w, v / h, heightSpawn, MASS)).pushToArray(particles);
      }
    }

    // Edge structural constraints
    for (v = 0; v <= h; v++) {
      for (u = 0; u <= w; u++) {
        if (v < h && (u == 1 || u == w)) {
            addConstraint(particles[index(u, v)], particles[index(u, v + 1)], restDistance,"structural");
        }

        if (u < w && (v == 0 || v == h)) {
            addConstraint(particles[index(u, v)], particles[index(u + 1, v)], restDistance,"structural");
          
        }
      }
    }

    // Structural constraints
    if (true) {
      // ----------- CODE BEGIN ------------
      // Add structural constraints between particles in the cloth to the list of constraints.
      for (v = 0; v < h; v++) {
        for (u = 0; u < w; u++) {
            addConstraint(particles[index(u, v)], particles[index(u, v + 1)], restDistance,"structural");
          
            addConstraint(particles[index(u, v)], particles[index(u + 1, v)], restDistance, "structural");
            
        }
      }

    }
  
    // ----------- CODE END ------------
  

    // Shear constraints
    if (true) {
      // -----------CODE BEGIN ------------
      // Add shear constraints between particles in the cloth to the list of constraints.
      for (v = 0; v <= h; v++) {
        for (u = 0; u <= w; u++) {
            if (u < w && v < h)
                addConstraint(particles[index(u, v)], particles[index(u + 1, v + 1)], restDistance * restDistanceS, "shear");
            if (u < w && v > 0)
                addConstraint(particles[index(u, v)], particles[index(u + 1, v - 1)], restDistance * restDistanceS, "shear");
        }
      }
      // ----------- CODE END ------------
    }

    // Bending constraints
    if (true) {
      // ----------- CODE BEGIN ------------
      // Add bending constraints between particles in the cloth to the list of constraints.
      for (v = 0; v <= h; v++) {
        for (u = 0; u <= w; u++) {
          if (v < h-1)
              addConstraint(particles[index(u, v)], particles[index(u , v + 2)], restDistance * restDistanceB, "bending")  ; 
          if (u < w-1)
              addConstraint(particles[index(u, v)], particles[index(u + 2, v)], restDistance * restDistanceB, "bending");
        }
      }

        // Store the particles lists into the cloth object
    this.particles = particles;
    // ----------- CODE END ------------
  }

}


}

Cloth.prototype.applyGravity = function() {
  let particles = this.particles;
  // ----------- CODE BEGIN ------------
  // For each particle in the cloth, apply force due to gravity.
  for (var i = 0; i < particles.length; i++){
      grav = new THREE.Vector3(0,-1,0);
      grav.multiplyScalar(particles[i].mass * GRAVITY);
      particles[i].addExternalForce(grav);

  }
  // ----------- CODE END ------------
};

Cloth.prototype.applyWind = function() {

  let particles = this.particles;
  // ----------- CODE BEGIN ------------
  // For each face in the cloth's geometry, apply a wind force.
  //
  // Here are some dummy values for a relatively boring wind.
  //
  // Try making it more interesting by making the strength and direction
  // of the wind vary with time. You can use the global variable `time`,
  // which stores (and is constantly updated with) the current Unix time
  // in milliseconds.
  //
  // One suggestion is to use sinusoidal functions. Play around with the
  // constant factors to find an appealing result!
  var timeInSeconds = time/1000;
  let windStrength = 30 + 20 * Math.abs(Math.sin(time/1000)+(Math.random()-0.5));

  let windForce = new THREE.Vector3(Math.sin(timeInSeconds/20), 1, Math.cos(timeInSeconds/20)).normalize().multiplyScalar(windStrength);
  // -----------CODE END ------------

  // Apply the wind force to the cloth particles
  let faces = this.clothGeometry.faces;
  for (i = 0; i < faces.length; i++) {
    let face = faces[i];
      let normal = face.normal;
      let tmpForce = normal
        .clone()
        .normalize()
        .multiplyScalar(normal.dot(windForce));
      particles[face.a].addExternalForce(tmpForce);
      particles[face.b].addExternalForce(tmpForce);
      particles[face.c].addExternalForce(tmpForce);
  }
};

// Wrapper function that calls each of the other force-related
// functions, if applicable. Additional forces in the simulation
// should be added here.
Cloth.prototype.applyForces = function() {
  this.applyGravity();
  if (wind) {
    this.applyWind();
  }
};

Cloth.prototype.update = function(deltaT) {
  let particles = this.particles;
  // ----------- CODE BEGIN ------------
  // For each particle in the cloth, have it update its position
  // by calling its integrate function.
  for (var i = 0; i < particles.length; i++){
    if (!particles[i].lockPosition)
    {
      particles[i].integrate(deltaT);
    }
  }
  // -----------CODE END ------------
};

Cloth.prototype.handleCollisions = function() {
  let particles = this.particles;
  // ----------- CODE BEGIN ------------
  // For each particle in the cloth, call the appropriate function(s)
  // for handling collisions with various objects.
  //
  // Edit this function as you implement additional collision-detection functions.
  // ----------- Our reference solution uses 6 lines of code.
  for (var i = 0; i < particles.length; i++){
    if (!particles[i].lockPosition)
    {
      particles[i].handleFloorCollision();
      particles[i].handleSphereCollision();
      particles[i].handleBoxCollision();
    }

  } 
  // ----------- CODE END ------------
};

Cloth.prototype.enforceConstraints = function() {
  /*
  let constraints = this.constraints;
  // Enforce all constraints in the cloth.
  for (var i = 0; i < constraints.length; i++){
    constraints[i].enforce();
  }
  */

  let particles = this.particles;
   for (var i = 0; i < particles.length; i++){
    particles[i].enforceConstraints();
  }

};
/*
Cloth.prototype.handleSelfIntersections = function() {
  // ----------- CODE BEGIN ------------
  // Handle self intersections within the cloth by repelling any
  // pair of particles back towards a natural rest distance.
  // This should be similar to how constraints are enforced to keep
  // particles close to each other, but in the opposite direction.
  //
  // A naive approach that do this in quadratic time. There are more optimal ones

  let particles = this.particles;
  for (var i = 0; i < particles.length; i++){
    for (var j = i+1; j < particles.length; j++){
      if (particles[i].position.distanceTo(particles[j].position) < restDistance/2){
        if ((!particles[i].lockPosition) && (!particles[j].lockPosition))
        {
          p1 = particles[i];
          p2 = particles[j];
          var v12 = (p1.position.clone()).sub(p2.position);
          var factor = (v12.length() - restDistance) / v12.length();
          var vcorr = v12.multiplyScalar(factor/2);
          p2.position.sub(vcorr);
          p1.position.add(vcorr);
        }
      }
    }
  }
  // -----------CODE END ------------
};
*/
