// Variables for simulation state; can be interactively changed in GUI
// These are their default values
var wind = false;
var stopExternalForces = false; 
var wireframe = true;
var rotate = false;
var pinned = "Corners";
var object = "None";
var movingSphere = false;
var cornersPinned, oneEdgePinned, twoEdgesPinned, fourEdgesPinned, randomEdgesPinned;

// Variables used for random cloth pins
var randomPoints = [];
var rand, randX, randY;



// Performs one timestep of the simulation.
// This function is repeatedly called in a loop, and its results are
// then rendered to the screen.
// For more info, see animate() in render.js.
function simulate() {


  // If toggled, update sphere position for interactive fun
  if (movingSphere && sphere.visible) {
    updateSpherePosition();
  }

  for (let i=0;i<clothObjectArray.length;i++)
  {
    if (!stopExternalForces)
    {
      // Apply all relevant forces to the cloth's particles
      clothObjectArray[i].cloth.applyForces();


          // For each particle, perform Verlet integration to compute its new position
      clothObjectArray[i].cloth.update(TIMESTEP);
  
    }else{
      for (var j = 0; j < clothObjectArray[i].cloth.particles.length; j++){
        clothObjectArray[i].cloth.particles[j].previous= clothObjectArray[i].cloth.particles[j].position.clone();
      }
    }
    
        // Pin constraints
      //enforcePinConstraints();
    

    // Handle collisions with other objects in the scene
    clothObjectArray[i].cloth.handleCollisions();

    // Handle self-intersections
    if (avoidClothSelfIntersection) {
     //clothObjectArray[i].cloth.handleSelfIntersections();
    
    //if (clothObjectArray.length>1)
    // {
      handleBetweenClothIntersection();
    // }
     
    } 

    if (modelLoaded)
    {
      handleMeshClothIntersection();
    }
 

    // Apply cloth constraints
      clothObjectArray[i].cloth.enforceConstraints();

  }

 



}

/****** Helper functions for the simulation ******/
/****** You do not need to know how these work ******/

function pinCloth(choice) {
  if (choice == "Corners") {
    cornersPinned = true;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "OneEdge") {
    cornersPinned = false;
    oneEdgePinned = true;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "TwoEdges") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = true;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  } else if (choice == "FourEdges") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = true;
    randomEdgesPinned = false;
  } else if (choice == "Random") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = true;

    rand = Math.round(Math.random() * 10) + 1;
    randomPoints = [];
    for (r = 0; r < rand; r++) {
      randX = Math.round(Math.random() * xSegs);
      randY = Math.round(Math.random() * ySegs);
      randomPoints.push([randX, randY]);
    }
  } else if (choice == "None") {
    cornersPinned = false;
    oneEdgePinned = false;
    twoEdgesPinned = false;
    fourEdgesPinned = false;
    randomEdgesPinned = false;
  }
  enforcePinConstraints()
}

function enforcePinConstraints() {
  firstCloth=clothObjectArray[0].cloth;
  let particles = firstCloth.particles;

    for (u = 0; u <= xSegs; u++) {
      for (v = 0; v <= ySegs; v++) {
        particles[firstCloth.index(v, u)].unlock();
      }
    }

  if (cornersPinned) {
    // could also do particles[blah].lock() which will lock particles to
    // wherever they are, not to their original position
    particles[firstCloth.index(0, 0)].lockTo(-250,-250);
    particles[firstCloth.index(xSegs, 0)].lockTo(250,-250);
    particles[firstCloth.index(0, ySegs)].lockTo(-250,250);
    particles[firstCloth.index(xSegs, ySegs)].lockTo(250,250);
  } else if (oneEdgePinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[firstCloth.index(u, 0)].lockTo(-250+Math.round(u*500/xSegs),-250);
    }
  } else if (twoEdgesPinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[firstCloth.index(0, u)].lockTo(-250,-250+Math.round(u*500/xSegs));
      particles[firstCloth.index(xSegs, u)].lockTo(250,-250+Math.round(u*500/xSegs));
    }
  } else if (fourEdgesPinned) {
    for (u = 0; u <= xSegs; u++) {
      particles[firstCloth.index(0, u)].lockTo(-250,-250+Math.round(u*500/xSegs));
      particles[firstCloth.index(xSegs, u)].lockTo(250,-250+Math.round(u*500/xSegs));
      particles[firstCloth.index(u, 0)].lockTo(-250+Math.round(u*500/xSegs),-250);
      particles[firstCloth.index(u, xSegs)].lockTo(-250+Math.round(u*500/xSegs),250);
    }
  } else if (randomEdgesPinned) {
    for (u = 0; u < randomPoints.length; u++) {
      rand = randomPoints[u];
      randX = rand[0];
      randY = rand[1];
      particles[firstCloth.index(randX, randY)].lockTo(-250+Math.round(randX*500/xSegs),-250+Math.round(randY*500/ySegs));
    }
  }
}

function placeObject(object) {
  if (object == "Sphere" || object == "sphere") {
    sphere.visible = true;
    box.visible = false;
    restartCloth();
  } else if (object == "Box" || object == "box") {
    sphere.visible = false;
    box.visible = true;
    restartCloth();
  } else if (object == "None" || object == "none") {
    sphere.visible = false;
    box.visible = false;
  }
}

function showWireframe(flag) {

  //TODO: correct wireframe clothMaterial for multiple cloth

  poleMaterial.wireframe = flag;
  for (var i=0; i<clothObjectArray.length;i++){
    clothObjectArray[i].cloth.clothMaterial.wireframe = flag;
  }

  wireframe = flag;
  
  sphereMaterial.wireframe = flag;
}

function updateSpherePosition() {
  prevSpherePosition.copy(spherePosition);
  spherePosition.y = 50 * Math.sin(time / 600);
  spherePosition.x = 50 * Math.sin(time / 600);
  spherePosition.z = 50 * Math.cos(time / 600);
}

function handleBetweenClothIntersection(){

    // Handle self intersections within the cloth by repelling any
  // pair of particles back towards a natural rest distance.
  // This should be similar to how constraints are enforced to keep
  // particles close to each other, but in the opposite direction.
  //
  // A naive approach that do this in quadratic time. There are more optimal ones
  //TODO: fixing push forces cloth interesection

  //Mapping particles to coordinates. Bucket sort should be a fast sort and easy to make use of
  var particlesClothPosBucketArray = new Array(rowOfBuckets*rowOfBuckets*rowOfBuckets);
  for (i=0;i<particlesClothPosBucketArray.length;i++)
  {
    particlesClothPosBucketArray[i]=new Array();
  }

  for (i=0;i<clothObjectArray.length;i++)
  {
    for (j=0;j<clothObjectArray[i].cloth.particles.length;j++)
    {
      
      var bucket=Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.x+250)))/(500/rowOfBuckets))*rowOfBuckets*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.y+250)))/(500/rowOfBuckets))*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.z+250)))/(500/rowOfBuckets));
      if (!Array.isArray(particlesClothPosBucketArray[bucket])){
        console.log("bucket",bucket);
        console.log("clothObjectArray[i].cloth.particles[j].position",clothObjectArray[i].cloth.particles[j].position);
        console.log("clothObjectArray[i].cloth.particles[j]",clothObjectArray[i].cloth.particles[j]);
      }//TODO:FIXING THIS bucket NaN when restarting. This means position deleted at restart
      particlesClothPosBucketArray[bucket].push(clothObjectArray[i].cloth.particles[j]);
    }
  }

//TODO: particle pushing resolution to keep correct side by using normals in the particles and identifying if partcile change side prome previous to current

  for (var k=0;k<particlesClothPosBucketArray.length;k++)
  {
      var bucket= particlesClothPosBucketArray[k];
      for (var i = 0; i < bucket.length; i++){
        for (var j = i+1; j < bucket.length; j++){
          if (bucket[i].position.distanceTo(bucket[j].position) < restDistance/2){
            if ((!bucket[i].lockPosition) && (!bucket[j].lockPosition))
            {
              p1 = bucket[i];
              p2 = bucket[j];
              var v12 = (p1.position.clone()).sub(p2.position);
              var factor = (v12.length() - restDistance) / v12.length();
              var vcorr = v12.multiplyScalar(factor/2);
              p2.position.sub(vcorr);
              p1.position.add(vcorr);
            }
          }
        }
      }

      for (var a=0;a<2;a++)
      {
        for (var b=0;b<2;b++)
        {
          for (var c=0;c<2;c++)
          {
            if (a+b+c>0)
            {
              var positionbucket2=k+a*rowOfBuckets*rowOfBuckets+b*rowOfBuckets+c;
              if (positionbucket2<particlesClothPosBucketArray.length)
              {
                var bucket2= particlesClothPosBucketArray[positionbucket2];
                
                for (var i = 0; i < bucket.length; i++){
                  for (var j = 0; j < bucket2.length; j++){
                    if (bucket[i].position.distanceTo(bucket2[j].position) < restDistance/2){
                      if ((!bucket[i].lockPosition) && (!bucket2[j].lockPosition))
                      {
                        p1 = bucket[i];
                        p2 = bucket2[j];
                        var v12 = (p1.position.clone()).sub(p2.position);
                        var factor = (v12.length() - restDistance) / v12.length();
                        var vcorr = v12.multiplyScalar(factor/2);
                        p2.position.sub(vcorr);
                        p1.position.add(vcorr);
                      }
                    }
                  }
                }
              }
              

            }
          }
        }  
      }
      
      //for (var)
  }
}

function handleMeshClothIntersection(){

  // Handle self intersections within the cloth by repelling any
  // pair of particles back towards a natural rest distance.
  // This should be similar to how constraints are enforced to keep
  // particles close to each other, but in the opposite direction.
  //
  // A naive approach that do this in quadratic time. There are more optimal ones
  //TODO: fixing push forces cloth interesection

  //Mapping particles to coordinates. Bucket sort should be a fast sort and easy to make use of
  var particlesClothPosBucketArray = new Array(rowOfBuckets*rowOfBuckets*rowOfBuckets);
  for (i=0;i<particlesClothPosBucketArray.length;i++)
  {
    particlesClothPosBucketArray[i]=new Array();
  }

  for (i=0;i<clothObjectArray.length;i++)
  {
    for (j=0;j<clothObjectArray[i].cloth.particles.length;j++)
    {
      
      var bucket=Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.x+250)))/(500/rowOfBuckets))*rowOfBuckets*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.y+250)))/(500/rowOfBuckets))*rowOfBuckets+Math.floor(Math.min(499,Math.max(0,(clothObjectArray[i].cloth.particles[j].position.z+250)))/(500/rowOfBuckets));
      if (!Array.isArray(particlesClothPosBucketArray[bucket])){
        console.log("bucket",bucket);
        console.log("clothObjectArray[i].cloth.particles[j].position",clothObjectArray[i].cloth.particles[j].position);
        console.log("clothObjectArray[i].cloth.particles[j]",clothObjectArray[i].cloth.particles[j]);
      }//TODO:FIXING THIS bucket NaN when restarting. This means position deleted at restart
      particlesClothPosBucketArray[bucket].push(clothObjectArray[i].cloth.particles[j]);
    }
  }

  //TODO: particle pushing resolution to keep correct side by using normals in the particles and identifying if partcile change side prome previous to current

  for (var k=0;k<particlesClothPosBucketArray.length;k++)
  {
    
    var bucketCloth= particlesClothPosBucketArray[k];
    for (var i = 0; i < bucketCloth.length; i++)
    {
      var minDistance=1000;
      var closestMeshBucket=undefined;
      var closestMeshParticle=undefined;
      p1 = bucketCloth[i];
      for (var a=-1;a<2;a++)
      {
        for (var b=-1;b<2;b++)
        {
          for (var c=-1;c<2;c++)
          {
            var positionbucket2=k+a*rowOfBuckets*rowOfBuckets+b*rowOfBuckets+c;
            if ((positionbucket2<particlesMeshPosBucketArray.length) && (positionbucket2>=0))
            {
              var bucketMesh=particlesMeshPosBucketArray[positionbucket2];
              for (var j = 0; j < bucketMesh.length; j++)
              { 
                if (bucketCloth[i].position.distanceTo(bucketMesh[j].position) < restDistance)
                {
                    
                  if ((!bucketCloth[i].lockPosition) && (!bucketMesh[j].lockPosition))
                  {
                    p2 = bucketMesh[j];
                    var v12 = (p1.position.clone()).sub(p2.position);

                    if (v12.length()<minDistance)
                    {
                      minDistance=v12.length();
                      closestMeshBucket=bucketMesh;
                      closestMeshParticle=j;
                    }
                      
                  }
                }
              }
            }
          }
        }
      }
      if (minDistance<1000)
      {
        p2 = closestMeshBucket[closestMeshParticle];
        //console.log("intersection",bucketCloth[i].position.distanceTo(bucketMesh[j].position));

        var v12 = (p1.position.clone()).sub(p2.position);
        //var factor = (v12.length() - restDistance) / v12.length();

        // var factor = (p2.normal.length() - restDistance) / v12.length();
        var normal = p2.normal.clone().normalize().multiplyScalar(restDistance*2);
        //if (v12.projectOnVector(p2.normal).divide(p2.normal));
        //console.log(v12.projectOnVector(p2.normal));
        //var vcorr=p1.netForce.clone().negate().projectOnVector(p2.normal);
       if (v12.add(normal).projectOnVector(normal).length()<v12.projectOnVector(normal).length())
       {
        p1.position=p1.position.clone().add((p2.position.clone().sub(p1.position)).projectOnVector(normal)).add(normal);
        p1.previous=p1.position;
       }
  
      }

    }
  }
}

