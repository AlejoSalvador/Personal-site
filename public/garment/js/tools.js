
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
//the second line in the entry given should always be the one that indicates the cut since UB is used to know how far along it the current vertex is
function segmentIntersect(x1, y1, x2, y2, depth, x3, y3, x4, y4, ) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false;
      }
  
      let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          return false;
      }
  
    // Return a object with the x and y coordinates of the intersection
      let x = x3 + ub * (x4 - x3)
      let z = y3 + ub * (y4 - y3)
  
    //ub is returned to get the position along the segment we are located along. its used for sorting
      return [ub, new THREE.Vector3(x,depth,z)]
  }
  
  function cutCloth(){


    for (var i=0;i<clothObjectEditionArray.length;i++)
    {
      /*
      //first step is cutting the constrains
      let filteredConstraintsEdition=[];
      let filteredConstraints=[];
      for (var j=0;j<clothObjectEditionArray[i].cloth.constraints.length;j++)
      {
        var position1=clothObjectEditionArray[i].cloth.constraints[j].p1.position;
        var position2=clothObjectEditionArray[i].cloth.constraints[j].p2.position;
  
       // TODO: Make this work with cuts that are partial in the quad
      //TODO:Detect if line interesect with the other line. If they do remove the constrains. To do so reconstruct it with the elements on the same side. for both version of the cloth
      //looking to preserve equivalence between I th element in a cloth and ith element in the edition version of it. Do the same thing with triangle removal 
        if (segmentIntersect(position1.x, position1.z, position2.x, position2.z, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y)===false)
        {
  
          filteredConstraintsEdition.push(clothObjectEditionArray[i].cloth.constraints[j]);
          filteredConstraints.push(clothObjectArray[i].cloth.constraints[j]);
  
        }
      }
      clothObjectEditionArray[i].cloth.constraints=filteredConstraintsEdition;
      clothObjectArray[i].cloth.constraints=filteredConstraints;


      TODO: Reimplement constraints deletion in the new system and it should be easier since it only needs to be implemented in the quads and triangs cutted. after doing so
      remove everything on TOP

      */
  
      //second step is cutting the triangles
      
      let filteredTriangles=[];
      let filteredTrianglesUVS=[];
      let filteredTrianglesEditionUVS=[];

      let filteredQuads=[];
      let filteredTriangs=[];
  
      const newVerticesEdition=[...clothObjectEditionArray[i].cloth.clothGeometry.vertices];
      const newVertices=[...clothObjectArray[i].cloth.clothGeometry.vertices];
  
      const unfilteredTriangles=clothObjectEditionArray[i].cloth.clothGeometry.faces;
     

      let listOfIntersection=[]; //here we will save the intersection for later traversing them in order and combining the ones that are equal in a single element

      for (var j=0;j<clothObjectEditionArray[i].cloth.quads.length;j++)
      {

        //all this trick with intersection is done to find which are the vertex of the quad that are part of the segment shared between triangles.
     
        const currentTriangNumber1=clothObjectEditionArray[i].cloth.quads[j][0];
        const currentTriangNumber2=clothObjectEditionArray[i].cloth.quads[j][1];

        const symmetricDifference = (a, b) => new Set([...[...a].filter(x => !b.has(x)), ...[...b].filter(x => !a.has(x))]);
        const intersectionOfSets = (a, b) => new Set([...a].filter(x => b.has(x)));

        const setFirstTriang=new Set([unfilteredTriangles[currentTriangNumber1].a, unfilteredTriangles[currentTriangNumber1].b, unfilteredTriangles[currentTriangNumber1].c]);
        const setSecondTriang=new Set([unfilteredTriangles[currentTriangNumber2].a, unfilteredTriangles[currentTriangNumber2].b, unfilteredTriangles[currentTriangNumber2].c]);

        const differenceElements=symmetricDifference(setSecondTriang,setFirstTriang).values();

        const intersectionElements=intersectionOfSets(setSecondTriang,setFirstTriang).values();

        //difference will give both vertex not shared between triangles and interesection will give the segment shared between the 2 triangles
        const firstIndex=differenceElements.next().value;
        const secondIndex=differenceElements.next().value;
        //REMEMBER THAT SETS GIVES BACK IN INSERTION ORDER

        //this is a trick to make sure order. At the end of this vertex1Val will have something from first triangle

        let vertex1Val;
        let vertex3Val;

        if (setFirstTriang.has(firstIndex))
        {
          vertex1Val=firstIndex;
          vertex3Val=secondIndex;

        }else
        {
          vertex1Val=secondIndex;
          vertex3Val=firstIndex;

        }

        //its important to check that the 4 vertex are in winding order which means preserving order. The conditional on top just ensures that we start from the first triang.
        // Using set first triang unfilteredTriangles[currentTriangNumber1].a, unfilteredTriangles[currentTriangNumber1].b, unfilteredTriangles[currentTriangNumber1].c
        //we can check that if sements is either [a,b],[b,c] or [a,c] its valid. One we start its just a matter of cycling. It makes use that triangles that take part
        //in a quad are clockwise the quad must also be clockwise

        const vertex1=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex1Val]; 
        const vertex3=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex3Val];

        const thirdIndex=intersectionElements.next().value;
        const fourthIndex=intersectionElements.next().value;

        const vertexTriang=[unfilteredTriangles[currentTriangNumber1].a,unfilteredTriangles[currentTriangNumber1].b,unfilteredTriangles[currentTriangNumber1].c];

 

        let vertex2Val;
        let vertex4Val;

        for (var k=0;k<3;k++)
        {
          if (vertex1Val===vertexTriang[k])
          {
            if (thirdIndex===vertexTriang[(k+1)%3])
            {
              vertex2Val=thirdIndex;
              vertex4Val=fourthIndex;
            }else
            {
              vertex2Val=fourthIndex;
              vertex4Val=thirdIndex;
            } 
          }
        }




        //this operation on top is especially effective to preserve winding order in the 4 vertices

  
        const vertex2=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex2Val];
        const vertex4=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex4Val];

    
        let line1Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex2.x, vertex2.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
        let line2Intersection=segmentIntersect(vertex2.x, vertex2.z, vertex3.x, vertex3.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);

        let line3Intersection=segmentIntersect(vertex3.x, vertex3.z, vertex4.x, vertex4.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
        let line4Intersection=segmentIntersect(vertex4.x, vertex4.z, vertex1.x, vertex1.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
    
       
        //this case happens if the are no intersections. This means that everything is kept. 
        
    
        if ((line1Intersection===false)&&
        (line2Intersection===false)&&
        (line3Intersection===false)&&
        (line4Intersection===false))
        {
          filteredTriangles.push(unfilteredTriangles[currentTriangNumber1]);
          
  
          filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
          filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);

          filteredTriangles.push(unfilteredTriangles[currentTriangNumber2]);
          
  
          filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber2]);
          filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber2]);

          filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);
              
        }else
        {
          //THE THIRD ELEMENT INDICATES IF IF THE INTERSECTION BELONGS TO A QUAD OR TRIANG AND THE FORTH IS THE GIVEN QUAD OR TRIANG. In this case everything is a quad for simplicity sake in testing.
          //Its key to realize that the intersection segments also preserve winding order
          //TODO: ADD compatibility with triangs
          //TODO: make this in a for with arrays to use less if



          if (line1Intersection!==false)
          {
            let pushedElement=line1Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex1Val,vertex2Val]);

            pushedElement.push("quad");
            pushedElement.push(clothObjectEditionArray[i].cloth.quads[j]);

            listOfIntersection.push(pushedElement);
          }
          if (line2Intersection!==false)
          {
            let pushedElement=line2Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex2Val,vertex3Val]);

            pushedElement.push("quad");
            pushedElement.push(clothObjectEditionArray[i].cloth.quads[j]);

            listOfIntersection.push(pushedElement);
          }
          if (line3Intersection!==false)
          {
            let pushedElement=line3Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex3Val,vertex4Val]);

            pushedElement.push("quad");
            pushedElement.push(clothObjectEditionArray[i].cloth.quads[j]);

            listOfIntersection.push(pushedElement);
            
          }
          if (line4Intersection!==false)
          {
            let pushedElement=line4Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex4Val,vertex1Val]);

            pushedElement.push("quad");
            pushedElement.push(clothObjectEditionArray[i].cloth.quads[j]);

            listOfIntersection.push(pushedElement);
            
          }

        }        
      }
      //TODO: repeat what was done on top but with triangles


       //. BELOW THE TRIANGLES MAKE ALL THE PROCESS OF SORTING INTERSECTION LIST. REMOVE REPETITION. AND MAKE THE OPERATION OF ADDING THE QUADS. THEN ADD THE TRIANGLES AND MAKE THE OPERATION
      function compareIntersection(a,b)
      {
        if (a[0]<b[0])
        {
          return -1;
        }else if (a[0]===b[0])
        {
          var centerA;
          var centerB;
          
          var cutStart3D=new THREE.Vector3(cutStart.x,(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a]).y,cutStart.y);
          var cutEnd3D=new THREE.Vector3(cutEnd.x,(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a]).y,cutEnd.y);
          

          var centerA = (((clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a].clone()).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].b])).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].c])).multiplyScalar(1/3);
          var centerB = (((clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].a].clone()).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].b])).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].c])).multiplyScalar(1/3);
         
          var dir = (cutEnd3D.clone().sub(cutStart3D)).normalize();
          var v = centerA.sub(cutStart3D);
          var positionInLineToCompareCenterFigureA=v.dot(dir);

          var dir2 = (cutEnd3D.clone().sub(cutStart3D)).normalize();
          var v2 = centerB.sub(cutStart3D);
          var positionInLineToCompareCenterFigureB=v2.dot(dir2);


          if (positionInLineToCompareCenterFigureA<positionInLineToCompareCenterFigureB)
          {
            
            return -1;
          }

          //TODO PRIORITY:CHECK IF THIS WORKING CORRECTLY


        }
      }

      listOfIntersection.sort(compareIntersection);

      //remove repetition. this is done so that each specific point indicates which quads it belongs to without repetition

      //its important to remember that the same segment in 2 adjacent quads have different orientation to preserve order. So to prevent future bugs the edgeNeds to be save for both quads of the intersection

      //Elements of intersectionsOrderedWihoutRepetition
      //0: position along the cutting line the cut happens for sorting
      //1: coordinates of the intersection position
      //2: amount of quads or triang the intersection belongs to
      //3/6: Edge the intersection belongs to with corrent orientation clockwise or not
      //4/7: Type: Either a triang or quad of the first/second element it belongs to
      //5/8: quad with triang index of the triangles contained. 
      // TODO: Triangles not implemented yet

      let iterationsWihoutBorder=0;
      let intersectionsOrderedWithoutRepetition=[]
      for (let j=0;j<listOfIntersection.length;j=j+1)
      {
        //I will do a little trick of checking the future edges that are not at the the end and see if a border is going to happen. In case it happens I will do a little clean swap in the array before reaching there
         if (((j<listOfIntersection.length-2)&&(j>0)&&(iterationsWihoutBorder>0)&&(!((listOfIntersection[j][2][0]===listOfIntersection[j+1][2][1])&&(listOfIntersection[j][2][1]===listOfIntersection[j+1][2][0])))))
        {
          //iterations wihout border should not be 0 to prevent to get here in the second edge that forms the cut


          //this is an effective way to reorder the list in case that somehow the floating point calculation decide that the 2 edges of a cut are not in the correct order

          //if the figure in the intersection is different to the next edge but is equal to the other swap. Otherwise error
          if (listOfIntersection[j-1][4]!==listOfIntersection[j][4]){
            if ((listOfIntersection[j-1][4]===listOfIntersection[j+1][4])&&(listOfIntersection[j][4]===listOfIntersection[j+2][4]))
            {
              var aux=listOfIntersection[j];
              listOfIntersection[j]=listOfIntersection[j+1];
              listOfIntersection[j+1]=aux;
              console.log("swap happened");
            }else{
              console.log("error in the swap")
            }
          }

        }

             //first add the intersection vertexes. With that obtained triangles can be created. They are on the same position for the other side of the cut
             //Flip this edge in case it shares quad with the next one meaning that orientation would be flipped
          var edgeOfIntersection1;

          if ((j<listOfIntersection.length-1)&&(listOfIntersection[j][4]===listOfIntersection[j+1][4])) //this swap would be made to make sure both particles are in correct side of cut
          {
            edgeOfIntersection1=[listOfIntersection[j][2][1],listOfIntersection[j][2][0]];
          }else
          {
            edgeOfIntersection1=[listOfIntersection[j][2][0],listOfIntersection[j][2][1]];
          }

          //TODO: Make mass of particles proportional to adjacent triangles

          const verticesEdition=clothObjectEditionArray[i].cloth.clothGeometry.vertices;
          let positionCutEdgeProportionEdge1;

                if ((verticesEdition[edgeOfIntersection1[0]]).x!==(verticesEdition[edgeOfIntersection1[1]]).x)
                {
                  positionCutEdgeProportionEdge1=(Math.abs((verticesEdition[edgeOfIntersection1[0]]).x-listOfIntersection[j][1].x))/(Math.abs((verticesEdition[edgeOfIntersection1[0]]).x-(verticesEdition[edgeOfIntersection1[1]]).x));
                }else
                {
                  positionCutEdgeProportionEdge1=(Math.abs((verticesEdition[edgeOfIntersection1[0]]).z-listOfIntersection[j][1].z))/(Math.abs((verticesEdition[edgeOfIntersection1[0]]).z-(verticesEdition[edgeOfIntersection1[1]]).z));     
                }
                
          const vertices=clothObjectArray[i].cloth.clothGeometry.vertices;

          let x = vertices[edgeOfIntersection1[0]].x + positionCutEdgeProportionEdge1 * (vertices[edgeOfIntersection1[1]].x - vertices[edgeOfIntersection1[0]].x);
          let y = vertices[edgeOfIntersection1[0]].y + positionCutEdgeProportionEdge1 * (vertices[edgeOfIntersection1[1]].y - vertices[edgeOfIntersection1[0]].y);
          let z = vertices[edgeOfIntersection1[0]].z + positionCutEdgeProportionEdge1 * (vertices[edgeOfIntersection1[1]].z - vertices[edgeOfIntersection1[0]].z);

          newVertices.push(new THREE.Vector3(x,y,z)); 
          newVerticesEdition.push(listOfIntersection[j][1]); 
          new Particle(x, y, z,MASS,false).pushToArray(clothObjectArray[i].cloth.particles);
          

          newVertices.push(new THREE.Vector3(x,y,z));     
          newVerticesEdition.push(listOfIntersection[j][1]); 
          new Particle(x, y, z,MASS,false).pushToArray(clothObjectArray[i].cloth.particles);
         
          //need to create 2 copies for both of them since there should be a vertex for each side of the intersection since its is split in the middle
          
          //remember that the index will be the same for the vertex on all 3 sets (particles, edition and realCloth) since they are all modified simultaneousl
          //an interesing fact is that since J is advanced 1 if the intersection is shared for 2 quads the particles and vertex are not created 2 times

          //here the bend and structural springs are recreated
          const particle1Edge=clothObjectArray[i].cloth.particles[edgeOfIntersection1[0]];
          const particle2Edge=clothObjectArray[i].cloth.particles[edgeOfIntersection1[1]];

          const particlesEdge=[particle1Edge,particle2Edge];

          //find the the vertices that are connected via bendSprings and it goes over the current cutted edge

          const bendSprings=new Array(undefined,undefined);
          const externalVertexOfSpring=new Array(undefined,undefined);


          for (var l=0;l<2;l++)
          {
            for (let k=0; k<particlesEdge[1-l].structuralConstraints.length;k++)
            {
              let particleConnectedConstraint;
              if(particlesEdge[1-l].structuralConstraints[k].p1===particlesEdge[1-l]) //the idea is check from where its connected to sourceParticle to find the opposite in the edge
              {
                particleConnectedConstraint=particlesEdge[1-l].structuralConstraints[k].p2;
              }else
              {
                particleConnectedConstraint=particlesEdge[1-l].structuralConstraints[k].p1;
              }

              var bendSpringsTested=particleConnectedConstraint.returnConstraint(particlesEdge[l], "bending");
              if (bendSpringsTested!==false){
                bendSprings[l]=bendSpringsTested;
                externalVertexOfSpring[l]=particleConnectedConstraint;
              }
              //will keep the value as undefined if not found an edge
            }
          }
           
          

          //Calculate spring length. To do so I need to know the length in clothEdition. The trick to do so is using the indexArray and checking the vertex with that index 
          // in clothEdition
            //in case of bugs check if distance is correct

          //now that bendSprings are found they should be replaced on the externalVertex after being modified to the new external vertex

          for (var k=0;k<2;k++)
          {
            // newVertices.length-2+k should be the index of the new Vertex and particle

            if (externalVertexOfSpring[k]!==undefined)
            {
              const distanceBending=newVerticesEdition[externalVertexOfSpring[k].indexArray].distanceTo(newVerticesEdition[newVertices.length-2+k]);
              addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-2+k], externalVertexOfSpring[k], distanceBending, "bending");

            
              bendSprings[k].removeSpring();
            }

            
            
          }

          //this next step is making the structuralSprings and remove the previous one in the Edge


          for (var k=0;k<2;k++)
          {
            const distanceStructural=newVerticesEdition[edgeOfIntersection1[k]].distanceTo(newVerticesEdition[newVertices.length-1-k]);
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-1-k], particlesEdge[k], distanceStructural, "structural");

            
          }
          particlesEdge[0].returnConstraint(particlesEdge[1],"structural").removeSpring();

          //TODO: everything is made on the basis of the previous edge. edge. In case there is not a previous one it should be made specially for that
          //the bug is located in the added constrain in bending and struuctural just over here. IT HAPPENS BECAUSE OF THE OORIGENTATION OF THE EDGE. THE FIRST ONE IS THE OTHER ORDER

          //todo:Check which particle is used for making the triangles lower in the quad. 
          // This is probably because I do not check carefully which particle to use depending on direction of line

          //TODO:Fix problem when particles are to close to each other
          
          //add internal structural and bending springs for the cut itself
          //TODO: check how to prevent that I create a new spring that over what was previously cutted in the lower part
      

          
          if (iterationsWihoutBorder>0){ //its restarted at 1 when a border has a single element meaning its a border. 
            const distanceStructural=newVerticesEdition[newVertices.length-2].distanceTo(newVerticesEdition[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[0]]); //calculating one time is enough since both vertices are in same point
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-2],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[0]],distanceStructural, "structural");
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-1],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[1]],distanceStructural, "structural");
            if (iterationsWihoutBorder>1){ 
              const distanceBending=newVerticesEdition[newVertices.length-2].distanceTo(newVerticesEdition[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-2].indexVertex[0]]);
              addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-2],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-2].indexVertex[0]],distanceBending, "bending");
              addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-1],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-2].indexVertex[1]],distanceBending, "bending");
            }

          }

          


           //its important to note that:
           // 1.the second intersection vertex is used to get new triangles together with the second complete Edge(completeEdge2),
           // 2. intersection edge direction are reversed for both adjacent quads ,
           // 3. the second intersection edge for the first quad is the first intersection edge for the second quad
           // 4. from 2 and 3 we get that the same point lets call it X, will be the first point (clockwise) of the second intersection edge for the quad on top and the second point
           //for first intersection edge of the second Quad.
           //5. The completeEdge2 for any quad is made with first point (clockwise) of the second intersection edge and the second point of the first intersection Edge
           //6. from 4 and 5 we get that X belongs to the completeEdge2 for both quads
          //7. from 1 and 6 we get that triangles made with completeEdge2 are on the same side of the intersectionVertex on intersectionEdge1 that is the same edge. 
          //therefore they referecence the secondIntersectionVertex stored at the same intersection vertex as we wanted



        //comparing intersection line should be enough since they are consecutive cuts and this works unless they cut the same line 2 times consecutevly. And i plan to separate the line in those cases
        //Remember that doing the identification with points may not work where there is rounding errors. For this same reason there is probably a little of wobbling in the cuts but it does not matter
        if ((j<listOfIntersection.length-1)&&(listOfIntersection[j][2][0]===listOfIntersection[j+1][2][1])&&(listOfIntersection[j][2][1]===listOfIntersection[j+1][2][0]))
        {


          var pushedElement = {
            'proportionCuttingLine': listOfIntersection[j][0],
            'coordinateIntersection': listOfIntersection[j][1],
            'amountOfQuadsOrTriangs': 2,
            'indexVertex': [newVertices.length-2,newVertices.length-1], 
            'edgeIntersection': [listOfIntersection[j][2],listOfIntersection[j+1][2]],
            'typeFigure': [listOfIntersection[j][3],listOfIntersection[j+1][3]],
            'figure': [listOfIntersection[j][4],listOfIntersection[j+1][4]]
          }
          intersectionsOrderedWithoutRepetition.push(pushedElement);

          j=j+1;
          
       iterationsWihoutBorder=iterationsWihoutBorder+1;
          
          
          //outside border

          /*
          let pushedElement=[listOfIntersection[j][0]];
          pushedElement.push(listOfIntersection[j][1]);
          pushedElement.push(2);
          pushedElement.push(listOfIntersection[j][2]);
          pushedElement.push(listOfIntersection[j][3]);
          pushedElement.push(listOfIntersection[j][4]);
          pushedElement.push(listOfIntersection[j+1][2]);
          pushedElement.push(listOfIntersection[j+1][3]);
          pushedElement.push(listOfIntersection[j+1][4]);
          intersectionsOrderedWithoutRepetition.push(pushedElement);
          j=j+1
          */
        }else
        {


          var pushedElement = {
            'proportionCuttingLine': listOfIntersection[j][0],
            'coordinateIntersection': listOfIntersection[j][1],
            'amountOfQuadsOrTriangs': 1,
            'indexVertex': [newVertices.length-2,newVertices.length-1], 
            'edgeIntersection': [listOfIntersection[j][2]],
            'typeFigure': [listOfIntersection[j][3]],
            'figure': [listOfIntersection[j][4]]
          }
          intersectionsOrderedWithoutRepetition.push(pushedElement);

          //TODO:the idea is that the first time it touches border unless its on startup is just a reset. If it happens the second time is when it is actually restarting.
          //somehow its not working. IDEA IS TO CHECK IF IT GETS TO THE AREA OF RESTARTING
          if (iterationsWihoutBorder===0){
            iterationsWihoutBorder=1;
          }else
          {
            iterationsWihoutBorder=0;
          }
          console.log("1 time")
         

          //inside border
        }

      } 

      //The list without repetition has every intersection wihout repetition
      //TODO: MAKE THIS WORK WHEN SINGLE INTERSECTION IN QUAD WHICH MEANS SEGMENT FINISH INSIDE. ITS IMPORTANT TO DO IT RIGHT SINCE IF THAT DOES NOT HAPPEN THE CUT INTERSECTION WOULD NOT WORK
      //TODO: MAKE THIS WORK IN CASES WHERE THE INTERSECTION IS IN A VERTEX EITHER GETTING INSIDE OR NOT GETTING INSIDE
      //for now this only works with quads. triangs should be added


    console.log("intersectionsOrderedWithoutRepetition",intersectionsOrderedWithoutRepetition);
    

      for (let j=1;j<intersectionsOrderedWithoutRepetition.length;j=j+1)
      {
/*
        if (intersectionsOrderedWithoutRepetition[j-1].amountOfQuadsOrTriangs==1)
        {

          const geometry = new THREE.CircleGeometry( 1, 20 ); 
          const material = new THREE.MeshBasicMaterial( { color: 0xffff00} ); 
          const circle = new THREE.Mesh( geometry, material ); 
          circle.position.set(intersectionsOrderedWithoutRepetition[j-1].coordinateIntersection.x,intersectionsOrderedWithoutRepetition[j-1].coordinateIntersection.z,intersectionsOrderedWithoutRepetition[j-1].coordinateIntersection.y);
          sceneEdition.add( circle );

          circleList.push(circle);

          console.log("out");
        }
          */

        let currentQuad;

           /*if ((intersectionsOrderedWithoutRepetition[j-1].amountOfQuadsOrTriangs===1)&&(intersectionsOrderedWithoutRepetition[j].amountOfQuadsOrTriangs===1))
                  {
                    console.log("special case");
                    console.log(j);
                    console.log(intersectionsOrderedWithoutRepetition[j-1].figure[0]);
                    
                    console.log(intersectionsOrderedWithoutRepetition[j-1].figure[1]);
                    console.log(intersectionsOrderedWithoutRepetition[j].figure[0]);
                    console.log(intersectionsOrderedWithoutRepetition[j].figure[1]);


                    //this clearly indicates that the special case is happening with different quads and that is correct actually. what i need now is to check what is happening
                    //with the quads next to it

                    //TODO: Borrar este test (es decir lo del if). Esto indica que algo pasa con la deteccion de bordes. quizas ocurre por el orden en que se añaden a la lista
                    //de hecho eso deberia ocurrir porque cuando tienen coordenadas igualas decide por orden de insercion. Debo hacer que de alguna manera pueda diferenciar entre ambos
                    //un truco posible para diferenciar es juzgando en caso de empate por cualquier otro punto del quad ya que todos las figuras seran convexas
                    //el truco debe ser implementado antes de hacer el sort para que sea mas elegante
                  }
                    */
              
          
        for (let k=0;k<intersectionsOrderedWithoutRepetition[j-1].amountOfQuadsOrTriangs;k=k+1) //this 2 fors are made to check the 2 interesection that belong to the quad/triang
        {

          for (let l=0;l<intersectionsOrderedWithoutRepetition[j].amountOfQuadsOrTriangs;l=l+1) //intersectionsOrderedWithoutRepetition[j][2] indicates the amount of quad triangs the intersection belongs to
          {
          
            //we have to compare all the combinations but checking they belong to same type and to same quad or triang
            if (intersectionsOrderedWithoutRepetition[j-1].typeFigure[k]===intersectionsOrderedWithoutRepetition[j].typeFigure[l])
            {
              if (intersectionsOrderedWithoutRepetition[j-1].figure[k]===intersectionsOrderedWithoutRepetition[j].figure[l])
              {

                  
                
                // The triangles numbers reference vertex which need to be added and also delete the old unused ones
                //tengo un codigo nada mas. Debo asignar en ese numero de triangulo el correspondiente triangulo y luego citar dicho numero. Debo ver cual es el siguiente en la lista
                //have to create new particles in new position using the particle function to make the simulation functional
                //the particles can be anywhere (cloth.particles) but its important to create the constrains correctly (structural, shear, bending en Cloth)
                //with the particles done its important to make the triangles
                //Also remember to make the new quad
                
                //SO CREATE THE NEW PARTICLES IN CLOTH. PARTICLES AND THE CONSTRAINS
                //CREATE THE TRIANGS WITH THOSE PARTICLES
                //MAKE THE NEW SPRINGS
                //MAKE THE NEW QUADS
          
                //position of particle must be on the same proportion that the position is in cloth Edition but adjusted to the real cloth
                //la puedo obtener encontrando primero en los triangulos las posiciones en que se encuntran los extremos y de ahi calcular el ratio. Como es una recta alcanza
                //con comparar en una sola coordenada
                //debo agarrar los 2 triangulos y luego con esos triangulos obtengo sus vertices. De ahi con el numero de vertice puedo obtener el numero de particula que es el mismo.
                //y con el numero de particula puedo obtener las coordenadas de la particula con la cual puedo obtener las coordenadas intermedias para crear la nueva particula


                
                
            
                const currentTriangNumber1=intersectionsOrderedWithoutRepetition[j].figure[l][0];
                const currentTriangNumber2=intersectionsOrderedWithoutRepetition[j].figure[l][1];

                      
                const edgeOfIntersection1=intersectionsOrderedWithoutRepetition[j-1].edgeIntersection[k];
                const edgeOfIntersection2=intersectionsOrderedWithoutRepetition[j].edgeIntersection[l];

                const newVertex1Edge1Index=intersectionsOrderedWithoutRepetition[j-1].indexVertex[1];
                const newVertex2Edge1Index=intersectionsOrderedWithoutRepetition[j-1].indexVertex[0];

                const newVertex1Edge2Index=intersectionsOrderedWithoutRepetition[j].indexVertex[1];
                const newVertex2Edge2Index=intersectionsOrderedWithoutRepetition[j].indexVertex[0];

                //rember that both of the edges are in clockwise order for the quad which means that they dont need any extra sorting operation

                //remove the shearConstrains in this quad
                
                clothObjectArray[i].cloth.particles[edgeOfIntersection1[0]].returnConstraint(clothObjectArray[i].cloth.particles[edgeOfIntersection2[0]],"shear").removeSpring();
                clothObjectArray[i].cloth.particles[edgeOfIntersection1[1]].returnConstraint(clothObjectArray[i].cloth.particles[edgeOfIntersection2[1]],"shear").removeSpring();
                //DONE: ADD THE CONSTRAINS TO THE 2 NEW QUADS

                //using the edge of intersection have to go through cases to make the new quads. 
                // remember that forces is independant of length since it it made dividing coefficient over distance
                //TODO: Make mass proportional to adjacent triangles

                const verticesEdition=clothObjectEditionArray[i].cloth.clothGeometry.vertices;

                /*
                let positionCutEdgeProportionEdge1;
                let positionCutEdgeProportionEdge2;

                if ((verticesEdition[edgeOfIntersection1[0]]).x!==(verticesEdition[edgeOfIntersection1[1]]).x)
                {
                  positionCutEdgeProportionEdge1=(Math.abs((verticesEdition[edgeOfIntersection1[0]]).x-(intersectionsOrderedWithoutRepetition[j-1].coordinateIntersection).x))/(Math.abs((verticesEdition[edgeOfIntersection1[0]]).x-(verticesEdition[edgeOfIntersection1[1]]).x));
                  positionCutEdgeProportionEdge2=(Math.abs((verticesEdition[edgeOfIntersection2[0]]).x-(intersectionsOrderedWithoutRepetition[j].coordinateIntersection).x))/(Math.abs((verticesEdition[edgeOfIntersection2[0]]).x-(verticesEdition[edgeOfIntersection2[1]]).x));
                }else
                {
                  positionCutEdgeProportionEdge1=(Math.abs((verticesEdition[edgeOfIntersection1[0]]).z-(intersectionsOrderedWithoutRepetition[j-1].coordinateIntersection).z))/(Math.abs((verticesEdition[edgeOfIntersection1[0]]).z-(verticesEdition[edgeOfIntersection1[1]]).z));
                  positionCutEdgeProportionEdge2=(Math.abs((verticesEdition[edgeOfIntersection2[0]]).z-(intersectionsOrderedWithoutRepetition[j].coordinateIntersection).z))/(Math.abs((verticesEdition[edgeOfIntersection2[0]]).z-(verticesEdition[edgeOfIntersection2[1]]).z));
                
                }
                  */
                


                const vertices=clothObjectArray[i].cloth.clothGeometry.vertices;

                //primero vemos el caso en que no coincide  vertice en los 2 lados

                if (edgeOfIntersection1[0]==edgeOfIntersection2[0])
                {
                  console.log("gotHereSomehow");

                }else if (edgeOfIntersection1[0]==edgeOfIntersection2[1])
                {
                    console.log("gotHereSomehow");
                }else if (edgeOfIntersection1[1]==edgeOfIntersection2[0])
                  {
                      console.log("gotHereSomehow");
                }else if (edgeOfIntersection1[1]==edgeOfIntersection2[1])
                {
                    console.log("gotHereSomehow");
                }else
                {

                   


                  // CORRECT ORIENTATION FACE FOR NORMAL IS IMPORTANT FOR COLLISION CHECK AND RESOLUTION

                  //TODO: BUILD DIVISION IN QUADS TO ENABLE CUT UNDOING
                  //TODO: configure mass acording to area of quads and triangles of the vertex


                                    //now its important to pay attention to order when reconstructing the triangle

                  //since of edge intersection are in quad sorting order I know for a fact that the second element of one connect with the 1st of the other one. Importatant
                  //to preserve order there too. Second and then last to preserve it. The sequence of edges should be
                  //edgeOfIntersection1 ->completeEdge1->edgeOfIntersection2 ->completeEdge2 and loop there
                  

               

                  const completeEdge1= [edgeOfIntersection1[1],edgeOfIntersection2[0]];
                  const completeEdge2= [edgeOfIntersection2[1],edgeOfIntersection1[0]];


  

                    //first obtain the intersection vertexes. With that obtained triangles can be created. They are on the same position for the other side of the cut

                  //REMEMBER THAT TRIANGLES IN EDITION AND REAL CLOTH ARE THE SAME WITH VERTEX IN DIFFERENT POSITIONS. It does not matter since they have everything equal except for position
                //ITS SPECIALLY IMPORTANT TO PRESERVE ORDER. triangle clone 1 does because edges do. If a segment is order the 3rd should be
                //triangleClone2 is key using the fact of order in newVerticesEdtion is equal to the one in edgeOfIntersections. 
                // since completeEdge1 finishes in eDge of intersection 2 I need first the pointOfIntersection2
                //triangleClone 3 and 4 work exactly like 1 and 2
                //REMEMBER THAT AS LONG AS TRIANGLES ARE CLOCKWISE AND BUILD THE QUAD ORIENTATION DOES NOT MATTER SINCE EDGES ARE STILL THE SAME

                  
                    let triangleClone1= new THREE.Face3(completeEdge1[0], completeEdge1[1],newVertex1Edge1Index);

                    //this translate to [edgeOfIntersection1[1],edgeOfIntersection2[0],vertex belonging to edge of Intersection 1]
                    //this means that there should be one diagonal from edgeOfIntersection2[0] to the new vertex at position newVerticesEdition.length-2. 
                    // That means that the other diagonal should be from edgeOfIntersection1[1] to the other vertex at newVerticesEdition.length-1

                    filteredTriangles.push(triangleClone1);
                    
              
                    //TODO: have to edit the UVS in all 4 and also make the triangles for the real faces using proportion
                    filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                    //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                    let triangleClone2=new THREE.Face3(completeEdge1[1],newVertex1Edge2Index, newVertex1Edge1Index);

                    filteredTriangles.push(triangleClone2);
                    
              
                    
                    filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                    //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                    filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);

                    var distanceFirstDiagonal= newVerticesEdition[completeEdge1[0]].distanceTo(newVerticesEdition[newVertex1Edge2Index])
                    addConstraint(clothObjectArray[i].cloth.particles[completeEdge1[0]], clothObjectArray[i].cloth.particles[newVertex1Edge2Index], distanceFirstDiagonal, "shear");

                    distanceFirstDiagonal= newVerticesEdition[completeEdge1[1]].distanceTo(newVerticesEdition[newVertex1Edge1Index])
                    addConstraint(clothObjectArray[i].cloth.particles[completeEdge1[1]], clothObjectArray[i].cloth.particles[newVertex1Edge1Index], distanceFirstDiagonal, "shear");
    
                    
                    let triangleClone3=new THREE.Face3(completeEdge2[0], completeEdge2[1],newVertex2Edge2Index);

                    filteredTriangles.push(triangleClone3);
                    //filteredTriangles.push(clothObjectArray[i].cloth.clothGeometry.faces[currentTriangNumber1]);
              
                    
                    filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                    //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                    let triangleClone4=new THREE.Face3(completeEdge2[1], newVertex2Edge1Index,newVertex2Edge2Index);

                    filteredTriangles.push(triangleClone4);
                    //filteredTriangles.push(clothObjectArray[i].cloth.clothGeometry.faces[currentTriangNumber1]);
              
                    
                    filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                    //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);

                  filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);

                    var distanceFirstDiagonal= newVerticesEdition[completeEdge2[0]].distanceTo(newVerticesEdition[newVertex2Edge1Index])
                    addConstraint(clothObjectArray[i].cloth.particles[completeEdge2[0]], clothObjectArray[i].cloth.particles[newVertex2Edge1Index], distanceFirstDiagonal, "shear");

                    distanceFirstDiagonal= newVerticesEdition[completeEdge2[1]].distanceTo(newVerticesEdition[newVertex2Edge2Index])
                    addConstraint(clothObjectArray[i].cloth.particles[completeEdge2[1]], clothObjectArray[i].cloth.particles[newVertex2Edge2Index], distanceFirstDiagonal, "shear");
                  //TODO: JUST IN CASE. Check if shear constrains are working well in the part of making the quad

                }

              
              }
            }

          }
        }


        //TODO:USE THIS SECTION FOR SEPARATING CASES
        if (intersectionsOrderedWithoutRepetition[j].amountOfQuadsOrTriangs===1) //this means that the intersectin belongs to a single quad/trang
        {
          if (intersectionsOrderedWithoutRepetition[j].typeFigure==="quad")
          {
            currentQuad= intersectionsOrderedWithoutRepetition[j].figure;
          }
        }  
        else if (intersectionsOrderedWithoutRepetition[j].amountOfQuadsOrTriangs===2) //this means that the intersection belongs to 2 quads/triang
        {

        }

      }



      //console.log(listOfIntersection);
      //console.log(intersectionsOrderedWithoutRepetition);

      //fin de interseccion sin repeticiones

      //TODO: Finish this with triangles
      //this section does that same that is done with quad earlier but with triangs
      for (var j=0;j<clothObjectEditionArray[i].cloth.triangs.length;j++)
      {
        //console.log("INSIDE");
        const currentTriangNumber=clothObjectEditionArray[i].cloth.triangs[j];

        vertex1=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].a];
        vertex2=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].b];
        vertex3=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].c];
  
        let line1Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex2.x, vertex2.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y)[0];
        let line2Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex3.x, vertex3.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y)[0];
        let line3Intersection=segmentIntersect(vertex2.x, vertex2.z, vertex3.x, vertex3.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y)[0];
  
  
        if ((line1Intersection===false)&&
        (line2Intersection===false)&&
        (line3Intersection===false))
        {
          filteredTriangles.push(unfilteredTriangles[currentTriangNumber]);
          filteredTriangles.push(clothObjectEditionArray[i].cloth.clothGeometry.faces[currentTriangNumber]);
  
          filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
          filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
  
        }else
        {
          vertex1Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].a];
          vertex2Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].b]
          vertex3Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[currentTriangNumber].c]
          if ((line1Intersection!==false)&&(line2Intersection!==false))
          {
            newVerticesEdition.push(line1Intersection);
            newVerticesEdition.push(line2Intersection);
            newVertices.push(new THREE.Vector3(
              (2*vertex1.x-vertex2.x-line1Intersection.x)/(vertex1.x-vertex2.x)*(vertex1Cloth.x-vertex2Cloth.x)+vertex1Cloth.x
              ,0,
              (2*vertex1.z-vertex2.z-line1Intersection.z)/(vertex1.z-vertex2.z)*(vertex1Cloth.z-vertex2Cloth.z)+vertex1Cloth.z
            ));
  
            newVertices.push(new THREE.Vector3(
              (2*vertex1.x-vertex3.x-line2Intersection.x)/(vertex1.x-vertex3.x)*(vertex1Cloth.x-vertex3Cloth.x)+vertex1Cloth.x
              ,0,
              (2*vertex1.z-vertex3.z-line2Intersection.z)/(vertex1.z-vertex3.z)*(vertex1Cloth.z-vertex3Cloth.z)+vertex1Cloth.z
            ));
  
            clothObjectArray[i].cloth.particles.push(new Particle(newVertices[newVertices.length-2].x,newVertices[newVertices.length-2].y, newVertices[newVertices.length-2].z,MASS, false));
            clothObjectArray[i].cloth.particles.push(new Particle(newVertices[newVertices.length-1].x,newVertices[newVertices.length-1].y, newVertices[newVertices.length-1].z,MASS, false));
  
            //TODO: IMPORTANT: the fact that vertex appear 2 times needAFix. probaby array to find
            //we are going to creat an array using position along the function where the element are. UV is used for that
  
            //REMEMBER THAT TRIANGLES IN EDITION AND REAL CLOTH ARE THE SAME WITH VERTEX IN DIFFERENT POSITIONS
  
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[currentTriangNumber].a,newVerticesEdition.length-2,newVerticesEdition.length-1));
            
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
  
  
  
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[currentTriangNumber].b,newVerticesEdition.length-2,newVerticesEdition.length-1));
            
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
  
  
            
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[currentTriangNumber].c,unfilteredTriangles[currentTriangNumber].b,newVerticesEdition.length-1));
            
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber]);
          }
  
        }
  
      }
     
  
      //TODO: Chequear que no ocurran memory leaks
  
      let newGeometryEdition = new THREE.Geometry();
  
      // itemSize = 3 because there are 3 values (components) per vertex
  
      newGeometryEdition.vertices=newVerticesEdition;
  
      newGeometryEdition.faces=filteredTriangles;
  
      newGeometryEdition.faceVertexUvs[0]=filteredTrianglesEditionUVS;
  
  
      const meshEdition = new THREE.Mesh( newGeometryEdition, clothObjectEditionArray[i].cloth.clothMaterial.clone() );
      meshEdition.position.set(0,0,0);
      meshEdition.rotation.x=-Math.PI/2;
      meshEdition.dynamic=true;
  
  
  
      let clothEdition=clothObjectEditionArray[i].cloth;
      clothEdition.clothGeometry=newGeometryEdition;
  
      clothEdition.quads=filteredQuads;
    
  
      meshEdition.cloth=clothEdition;
  
      clothObjectEditionArray[i].cloth.clothGeometry.dispose();
  
      sceneEdition.remove(clothObjectEditionArray[i]);
      clothObjectEditionArray[i]=meshEdition;
      sceneEdition.add(meshEdition);
  
  
      let newGeometry = new THREE.Geometry();
  
      // itemSize = 3 because there are 3 values (components) per vertex
  
      newGeometry.vertices=newVertices;
  
      newGeometry.faces=filteredTriangles;
  
      newGeometry.faceVertexUvs[0]=filteredTrianglesEditionUVS; 
  
  
      const mesh = new THREE.Mesh( newGeometry, clothObjectArray[i].cloth.clothMaterial.clone() );
      mesh.position.set(0,0,0);
  
      mesh.dynamic=true;
  
      mesh.castShadow=true;
  
      let clothView=clothObjectArray[i].cloth;
      clothView.clothGeometry=newGeometry;
  
      clothView.quads=filteredQuads;
  
      mesh.cloth=clothView;
  
      clothObjectArray[i].cloth.clothGeometry.dispose();
  
      scene.remove(clothObjectArray[i]);
      clothObjectArray[i]=mesh;
      scene.add(mesh);
  
  
  
    }
  
  }


  function cutClothOriginal(){
    for (var i=0;i<clothObjectEditionArray.length;i++)
    {
      //first step is cutting the constrains
      let filteredConstraintsEdition=[];
      let filteredConstraints=[];
      for (var j=0;j<clothObjectEditionArray[i].cloth.constraints.length;j++)
      {
        var position1=clothObjectEditionArray[i].cloth.constraints[j].p1.position;
        var position2=clothObjectEditionArray[i].cloth.constraints[j].p2.position;
  
        //TODO:Detect if line interesect with the other line. If they do remove the constrains. To do so reconstruct it with the elements on the same side. for both version of the cloth
        //looking to preserve equivalence between I th element in a cloth and ith element in the edition version of it. Do the same thing with traingle removal 
        if (segmentIntersect(position1.x, position1.z, position2.x, position2.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y)==false)
        {
  
          filteredConstraintsEdition.push(clothObjectEditionArray[i].cloth.constraints[j]);
          filteredConstraints.push(clothObjectArray[i].cloth.constraints[j]);
  
        }
      }
      clothObjectEditionArray[i].cloth.constraints=filteredConstraintsEdition;
      clothObjectArray[i].cloth.constraints=filteredConstraints;
  
      //second step is cutting the triangles
      let filteredTriangles=[];
      let filteredTrianglesEdition=[];
      let filteredTrianglesUVS=[];
      let filteredTrianglesEditionUVS=[];
  
      newVerticesEdition=[...clothObjectEditionArray[i].cloth.clothGeometry.vertices];
      newVertices=[...clothObjectArray[i].cloth.clothGeometry.vertices];
  
      const unfilteredTrianglesEdition=clothObjectEditionArray[i].cloth.clothGeometry.faces;
      const unfilteredTriangles=clothObjectArray[i].cloth.clothGeometry.faces;
      for (var j=0;j<clothObjectEditionArray[i].cloth.clothGeometry.faces.length;j++)
      {
        vertex1=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].a];
        vertex2=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].b];
        vertex3=clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].c];
  
        let line1Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex2.x, vertex2.z,vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
        let line2Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex3.x, vertex3.z,vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
        let line3Intersection=segmentIntersect(vertex2.x, vertex2.z, vertex3.x, vertex3.z,vertex1.y,cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
  
  
        if ((line1Intersection===false)&&
        (line2Intersection===false)&&
        (line3Intersection===false))
        {
          filteredTrianglesEdition.push(unfilteredTrianglesEdition[j]);
          filteredTriangles.push(clothObjectEditionArray[i].cloth.clothGeometry.faces[j]);
  
          filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
          filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
  
        }else
        {
          vertex1Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].a];
          vertex2Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].b]
          vertex3Cloth=clothObjectArray[i].cloth.clothGeometry.vertices[unfilteredTrianglesEdition[j].c]
          if ((line1Intersection!==false)&&(line2Intersection!==false))
          {
            newVerticesEdition.push(line1Intersection[1]);
            newVerticesEdition.push(line2Intersection[1]);
            newVertices.push(new THREE.Vector3(
              (2*vertex1.x-vertex2.x-line1Intersection[1].x)/(vertex1.x-vertex2.x)*(vertex1Cloth.x-vertex2Cloth.x)+vertex1Cloth.x
              ,0,
              (2*vertex1.z-vertex2.z-line1Intersection[1].z)/(vertex1.z-vertex2.z)*(vertex1Cloth.z-vertex2Cloth.z)+vertex1Cloth.z
            ));
  
            newVertices.push(new THREE.Vector3(
              (2*vertex1.x-vertex3.x-line2Intersection[1].x)/(vertex1.x-vertex3.x)*(vertex1Cloth.x-vertex3Cloth.x)+vertex1Cloth.x
              ,0,
              (2*vertex1.z-vertex3.z-line2Intersection[1].z)/(vertex1.z-vertex3.z)*(vertex1Cloth.z-vertex3Cloth.z)+vertex1Cloth.z
            ));
  
            clothObjectArray[i].cloth.particles.push(new Particle(newVertices[newVertices.length-2].x,newVertices[newVertices.length-2].y, newVertices[newVertices.length-2].z,MASS, false));
            clothObjectArray[i].cloth.particles.push(new Particle(newVertices[newVertices.length-1].x,newVertices[newVertices.length-1].y, newVertices[newVertices.length-1].z,MASS, false));
  
            //TODO: IMPORTANT: the fact that vertex appear 2 times needAFix. probaby array to find
            //we are going to creat an array using position along the function where the element are. UB is used for that
  
  
            filteredTrianglesEdition.push(new THREE.Face3(unfilteredTrianglesEdition[j].a,newVerticesEdition.length-2,newVerticesEdition.length-1));
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[j].a,newVertices.length-2,newVertices.length-1));
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
  
  
  
            filteredTrianglesEdition.push(new THREE.Face3(unfilteredTrianglesEdition[j].b,newVerticesEdition.length-2,newVerticesEdition.length-1));
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[j].b,newVertices.length-2,newVertices.length-1));
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
  
  
            
            filteredTrianglesEdition.push(new THREE.Face3(unfilteredTrianglesEdition[j].c,unfilteredTrianglesEdition[j].b,newVerticesEdition.length-1));
            filteredTriangles.push(new THREE.Face3(unfilteredTriangles[j].c,unfilteredTriangles[j].b,newVertices.length-1));
            filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
            filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][j]);
          }
  
        }
  
      }
     
  
      //TODO: Chequear que no ocurran memory leaks
  
      let newGeometryEdition = new THREE.Geometry();
  
      // itemSize = 3 because there are 3 values (components) per vertex
  
      newGeometryEdition.vertices=newVerticesEdition;
  
      newGeometryEdition.faces=filteredTrianglesEdition;
  
      newGeometryEdition.faceVertexUvs[0]=filteredTrianglesEditionUVS;
  
  
      const meshEdition = new THREE.Mesh( newGeometryEdition, clothObjectEditionArray[i].cloth.clothMaterial.clone() );
      meshEdition.position.set(0,0,0);
      meshEdition.rotation.x=-Math.PI/2;
      meshEdition.dynamic=true;
  
  
  
      let clothEdition=clothObjectEditionArray[i].cloth;
      clothEdition.clothGeometry=newGeometryEdition;
  
  
      meshEdition.cloth=clothEdition;
  
      clothObjectEditionArray[i].cloth.clothGeometry.dispose();
  
      sceneEdition.remove(clothObjectEditionArray[i]);
      clothObjectEditionArray[i]=meshEdition;
      sceneEdition.add(meshEdition);
  
  
      let newGeometry = new THREE.Geometry();
  
      // itemSize = 3 because there are 3 values (components) per vertex
  
      newGeometry.vertices=newVertices;
  
      newGeometry.faces=filteredTrianglesEdition;
  
      newGeometry.faceVertexUvs[0]=filteredTrianglesUVS; 
  
  
      const mesh = new THREE.Mesh( newGeometry, clothObjectArray[i].cloth.clothMaterial.clone() );
      mesh.position.set(0,0,0);
  
      mesh.dynamic=true;
  
      mesh.castShadow=true;
  
      let clothView=clothObjectArray[i].cloth;
      clothView.clothGeometry=newGeometry;
  
  
  
      mesh.cloth=clothView;
  
      clothObjectArray[i].cloth.clothGeometry.dispose();
  
      scene.remove(clothObjectArray[i]);
      clothObjectArray[i]=mesh;
      scene.add(mesh);
  
  
  
    }
  
  }