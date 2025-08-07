function Particle(x, y, z, mass, initialCloth=true, normalParticle=undefined) {
  //cloth should be false if positions are going to be directly given
  this.position = new THREE.Vector3(); // position
  this.previous = new THREE.Vector3(); // previous
  this.original = new THREE.Vector3(); // original

  if (initialCloth)
  {
    var initParemerizedPositionHeight=plane(fabricLength, fabricLength, z);
    initParemerizedPositionHeight(x, y, this.position);
    initParemerizedPositionHeight(x, y, this.previous);
    initParemerizedPositionHeight(x, y, this.original);
  }else
  {
    this.position = new THREE.Vector3(x,y,z); // position
    this.previous = new THREE.Vector3(x,y,z); // previous
    this.original = new THREE.Vector3(x,y,z); // original
    if (normalParticle!==undefined)
    {
      this.normal=normalParticle;
    }
 
  }

  this.lockPosition=false;
  this.netExternalForce = new THREE.Vector3(); // net force acting on particle
  this.netConstrainsForce = new THREE.Vector3();
  this.mass = mass; // mass of the particle

  this.structuralConstraints=[];
  this.shearConstraints=[];
  this.bendConstraints=[];

  //constraints are going to be always store in both particles it connect. Therefore when adding forces they should have half the power

  this.indexArray;

}

//Add to array should be used whenever I add to an array to remember to update the indexArray whenever I update it. DO NOT ADD DIRECTLY
Particle.prototype.pushToArray=function(arrayInput){
  this.indexArray=arrayInput.length;
  arrayInput.push(this);
  return arrayInput;
};

Particle.prototype.addSpring=function(constraint, springType){

  if (springType==="structural")
  {
    this.structuralConstraints.push(constraint);
  }else if (springType==="shear")
  {
    this.shearConstraints.push(constraint);
  }else if (springType==="bending")
  {
    this.bendConstraints.push(constraint);
  }else
  {
    console.error("wrongCostraintType at creating constraint");
  }

};

//Its important that if particleConnected is itself it will return false If the particle is not there false will be returned
Particle.prototype.returnConstraint = function(particleConnected,springType){

  if (this===particleConnected)
  {
    return false;
  }

  if (springType==="structural")
  {
    
    for (var i=0;i<this.structuralConstraints.length;i++)
    {
      if ((this.structuralConstraints[i].p1===particleConnected)||(this.structuralConstraints[i].p2===particleConnected))
      {
        return this.structuralConstraints[i];
      }
    }

  }else if (springType==="shear")
  {
    for (var i=0;i<this.shearConstraints.length;i++)
    {
      if ((this.shearConstraints[i].p1===particleConnected)||(this.shearConstraints[i].p2===particleConnected))
      {
        return this.shearConstraints[i];
      }
    }

  }else if (springType==="bending")
  {
    for (var i=0;i<this.bendConstraints.length;i++)
    {
      if ((this.bendConstraints[i].p1===particleConnected)||(this.bendConstraints[i].p2===particleConnected))
      {
        return this.bendConstraints[i];
      }
    }

  }else
  {
    console.error("wrongCostraintType at finding constraint");
  }

  return false;

};

//do not use. USE THE ONE IN CONSTRAINT
Particle.prototype.removeSpring = function(particleConnected,springType){

  if (springType==="structural")
  {
    
    constraintsList=[];
    for (var i=0;i<this.structuralConstraints.length;i++)
    {
      if ((this.structuralConstraints[i].p1!==particleConnected)&&(this.structuralConstraints[i].p2!==particleConnected))
      {
        constraintsList.push(this.structuralConstraints[i]);
      }
    }
    this.structuralConstraints=constraintsList;

  }else if (springType==="shear")
  {
    constraintsList=[];
    for (var i=0;i<this.shearConstraints.length;i++)
    {
      if ((this.shearConstraints[i].p1!==particleConnected)&&(this.shearConstraints[i].p2!==particleConnected))
      {
        constraintsList.push(this.shearConstraints[i]);
      }
    }
    this.shearConstraints=constraintsList;

  }else if (springType==="bending")
  {
    constraintsList=[];
    for (var i=0;i<this.bendConstraints.length;i++)
    {
      if ((this.bendConstraints[i].p1!==particleConnected)&&(this.bendConstraints[i].p2!==particleConnected))
      {
        constraintsList.push(this.bendConstraints[i]);
      }
    }
    this.bendConstraints=constraintsList;

  }else
  {
    console.error("wrongCostraintType at deleting constraint");
  }

};

Particle.prototype.enforceConstraints = function() {

  if (structuralSprings)
  {
    for (var i=0;i<this.structuralConstraints.length;i++)
      {
        this.structuralConstraints[i].enforce();
      }
  }

  if (shearSprings)
  {
    for (var i=0;i<this.shearConstraints.length;i++)
        {
          this.shearConstraints[i].enforce();
        }
  }
    
  if (bendingSprings)
  {
    for (var i=0;i<this.bendConstraints.length;i++)
    {
      this.bendConstraints[i].enforce();
    }
  }
    

};


Particle.prototype.lockTo = function(x,y) {
  this.position.set(x,125,y);
  this.previous.set(x,125,y);
  //this.position.copy(this.original);
 // this.previous.copy(this.original);
  this.lockPosition=true;
};

Particle.prototype.lock = function() {
  this.position.copy(this.previous);
  this.previous.copy(this.previous);  
};

Particle.prototype.unlock = function() {
  this.lockPosition=false;
};

Particle.prototype.addExternalForce = function(force) {
  // ----------- CODE BEGIN ------------
  // Add the given force to the particle's total netForce.
  this.netExternalForce.add(force);
  // ----------- CODE END ------------
};

Particle.prototype.addConstrainsForce = function(force) {
  // ----------- CODE BEGIN ------------
  // Add the given force to the particle's total netForce.
  this.netConstrainsForce.add(force);
  // ----------- CODE END ------------
};

Particle.prototype.integrate = function(deltaT) {
  // ----------- CODE BEGIN ------------
  // Perform Verlet integration on this particle with the provided
  // timestep deltaT.
  //
  // You need to:
  // (1) Save the old (i.e. current) position into this.previous.
  // (2) Compute the new position of this particle using Verlet integration,
  //     and store it into this.position.
  // (3) Reset the net force acting on the particle (i.e. make it (0, 0, 0) again).
  var externalAccel = this.netExternalForce.clone().multiplyScalar(deltaT*deltaT/this.mass);
  var constrainsAccel= this.netConstrainsForce.clone().multiplyScalar(deltaT*deltaT/this.mass); //TODO:FIX THIS SHIT WITH 2500 spring strength over
  //var constrainsAccelLength= Math.min((constrainsAccelRaw.clone()).length(),externalAccel.length()*2); //I try to make a correction to prevent the reduction of all the other terms in the calculation
  //var constrainsAccel=constrainsAccelRaw;


  var vel = ((this.position.clone()).sub(this.previous)).multiplyScalar(1-DAMPING/simulationFramePerVisualizedFrame);

  var totalAccel=externalAccel.clone().add(constrainsAccel);

  var totalDisplacementLength=Math.min((totalAccel.clone().add(vel)).length(),restDistance*0.2); //to stop excesive movement
  var totalDisplacementVector=totalAccel.clone().add(vel).setLength(totalDisplacementLength);



  this.previous = this.position.clone();
  this.position = (this.position.clone()).add(totalDisplacementVector);
  this.netExternalForce = new THREE.Vector3();
  this.netConstrainsForce = new THREE.Vector3();
  // ----------- CODE END ------------
};

Particle.prototype.handleFloorCollision = function() {
  // ----------- CODE BEGIN ------------
  // Handle collision of this particle with the floor.
  if (this.position.y < GROUND_Y){
    this.position.y = GROUND_Y;
  }
  // ----------- CODE END ------------
};

Particle.prototype.handleSphereCollision = function() {
  if (sphere.visible) {
    // ----------- CODE BEGIN ------------
    // Handle collision of this particle with the sphere.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();
    
    var diff = this.position.clone().sub(spherePosition);
    if (diff.length() > sphereSize)
      return;

    posNoFriction = spherePosition.clone().add(diff.multiplyScalar(sphereSize/diff.length()));

    if (this.previous.clone().sub(prevSpherePosition).length() <= sphereSize){
      this.position = posNoFriction;
      return;      
    }
    
    var mov = spherePosition.clone().sub(prevSpherePosition);
    posFriction = this.previous.clone().add(mov);

    this.position = (posFriction.multiplyScalar(friction)).add(posNoFriction.multiplyScalar(1-friction));

/*     var netCurrentForces=this.netExternalForce.clone().add(this.netConstrainsForce);
    var normalForceReverse=netCurrentForces.clone().projectOnVector(diff);
    this.addExternalForce(normalForceReverse.clone().negate()); */

    // ----------- CODE END ------------
  }
};

Particle.prototype.handleBoxCollision = function() {
  if (box.visible) {
    // ----------- CODE BEGIN ------------
    // Handle collision of this particle with the axis-aligned box.
    let posFriction = new THREE.Vector3();
    let posNoFriction = new THREE.Vector3();

    if (!boundingBox.containsPoint(this.position))
      return;


    // ALL POSSIBLE 6 PROJECTIONS
    var possible = new Array(6);
    for (var i = 0; i< 6; i++){
      possible[i] = this.position.clone();
    }
    possible[0].x = boundingBox.min.x;
    possible[1].x = boundingBox.max.x;
    possible[2].y = boundingBox.min.y;
    possible[3].y = boundingBox.max.y;
    possible[4].z = boundingBox.min.z;
    possible[5].z = boundingBox.max.z;
      
    var best = possible[0];
    var bestD = this.position.distanceTo(possible[0]);
    for (var i = 1; i< 6; i++){
      if (this.position.distanceTo(possible[i])<bestD){
        bestD=this.position.distanceTo(possible[i]);
        best = possible[i];
      }
    }    

    posNoFriction = best;    
    posFriction = this.previous.clone();

    if (boundingBox.containsPoint(this.previous)){
      this.position = posNoFriction;
      return;
    }

    this.position = posFriction.multiplyScalar(friction).add(posNoFriction.multiplyScalar(1-friction));     

    // ----------- CODE END ------------
  }
};
