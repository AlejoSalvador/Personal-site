
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
//the second line in the entry given should always be the one that indicates the cut since UB is used to know how far along it the current vertex is
function segmentIntersect(x1, y1, x2, y2, depth, x3, y3, x4, y4 ) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
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

  function segmentProjectedIntersect(x1, y1, x2, y2, depth, x3, y3, x4, y4 ) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      let  denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false;
      }
  
      //let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // Return a object with the x and y coordinates of the intersection
      let x = x3 + ub * (x4 - x3)
      let z = y3 + ub * (y4 - y3)
  
    //ub is returned to get the position along the segment we are located along. its used for sorting
      return [ub, new THREE.Vector3(x,depth,z)]
  }

   function computingEdgeUVTriang (edge, edgeUV, triangles,triangNumber1,UVtriangles1){

      for (let iteratorEdge=0; iteratorEdge<2;iteratorEdge++)
      {
        if (edge[iteratorEdge]===triangles[triangNumber1].a)
        {
          edgeUV[iteratorEdge]=UVtriangles1[0];
        }else
        if (edge[iteratorEdge]===triangles[triangNumber1].b)
        {
          edgeUV[iteratorEdge]=UVtriangles1[1];
        }
        else
        if (edge[iteratorEdge]===triangles[triangNumber1].c)
        {
          edgeUV[iteratorEdge]=UVtriangles1[2];
        }
      }

  }

  function computingEdgeUVQuad (edge, edgeUV, triangles,triangNumber1, triangNumber2,UVtriangles1, UVtriangles2){

    for (let iteratorEdge=0; iteratorEdge<2;iteratorEdge++)
    {
      if (edge[iteratorEdge]===triangles[triangNumber1].a)
      {
        edgeUV[iteratorEdge]=UVtriangles1[0];
      }else
      if (edge[iteratorEdge]===triangles[triangNumber1].b)
      {
        edgeUV[iteratorEdge]=UVtriangles1[1];
      }
      else
      if (edge[iteratorEdge]===triangles[triangNumber1].c)
      {
        edgeUV[iteratorEdge]=UVtriangles1[2];
      }else

      if (edge[iteratorEdge]===triangles[triangNumber2].a)
      {
        edgeUV[iteratorEdge]=UVtriangles2[0];
      }else
      if (edge[iteratorEdge]===triangles[triangNumber2].b)
      {
        edgeUV[iteratorEdge]=UVtriangles2[1];
      }
      else
      if (edge[iteratorEdge]===triangles[triangNumber2].c)
      {
        edgeUV[iteratorEdge]=UVtriangles2[2];
      }
    }

  }

function computingEdgeUVtriangle (edge, edgeUV, triangles,triang,UVtriangle){
  for (let iteratorEdge=0; iteratorEdge<2;iteratorEdge++)
  {
    if (edge[iteratorEdge]===triangles[triang].a)
    {
      edgeUV[iteratorEdge]=UVtriangle[0];
    }else
    if (edge[iteratorEdge]===triangles[triang].b)
    {
      edgeUV[iteratorEdge]=UVtriangle[1];
    }
    else
    if (edge[iteratorEdge]===triangles[triang].c)
    {
      edgeUV[iteratorEdge]=UVtriangle[2];
    }

  }
}

function computeProportionEdge(vertex1, vertex2, vertex3)
{
    if ((vertex1).x!==(vertex3).x)
    {
      return ((vertex1).x-vertex2.x)/((vertex1).x-(vertex3).x);
    }else
    {
      return ((vertex1).z-vertex2.z)/((vertex1).z-(vertex3).z);     
    }
}

function barycentricCoordinates(point, vertex1, vertex2, vertex3)
{
    const denominator = (vertex2.z - vertex3.z) * (vertex1.x - vertex3.x) + (vertex3.x - vertex2.x) * (vertex1.z - vertex3.z);

        // Check if the triangle is degenerate (collinear vertices)
    if (Math.abs(denominator) < 1e-9) {
        return null; 
    }

    const alpha = ((vertex2.z - vertex3.z) * (point.x - vertex3.x) + (vertex3.x - vertex2.x) * (point.y - vertex3.z)) / denominator;
    const beta = ((vertex3.z - vertex1.z) * (point.x - vertex3.x) + (vertex1.x - vertex3.x) * (point.y - vertex3.z)) / denominator;
    const gamma = 1 - alpha - beta;
    return [alpha, beta, gamma];
}

function isPointInTriangle(barycentricCoords) {
    if (!barycentricCoords) return false;
    const [l1, l2, l3] = barycentricCoords;
    return l1 >= 0 && l2 >= 0 && l3 >= 0;
}
function extrapolateUVFromBarycentric(barycentricCoords, uv1, uv2, uv3) {

    const [alpha, beta, gamma] = barycentricCoords;
    const u = alpha * uv1.x + beta * uv2.x + gamma * uv3.x;
    const v = alpha * uv1.y + beta * uv2.y + gamma * uv3.y;
    return new THREE.Vector2(u, v);

}

function extrapolatePositionFromBarycentric(barycentricCoords, vertex1, vertex2, vertex3) {
    const [alpha, beta, gamma] = barycentricCoords;
    const x = alpha * vertex1.x + beta * vertex2.x + gamma * vertex3.x;
    const y = alpha * vertex1.y + beta * vertex2.y + gamma * vertex3.y;
    const z = alpha * vertex1.z + beta * vertex2.z + gamma * vertex3.z;
    return new THREE.Vector3(x, y, z);
}

function computeWholeCutInsideFigure(currentCut, newVerticesAux,newVerticesEditionAux, filteredTriangs, filteredQuads, trianglesList, triangleListEditionFilteredUV, triangleListFiltered, clothEditionVertices, clothParticles, clothFaceVertexUvs)
{
    const cutStartPosition=currentCut.getCutStart();
     const cutStarEmd=currentCut.getCutEnd();
    const cutStartVectorEdition=currentCut.getCutStartVectorEdition();
    const cutOppositeVectorEdition=currentCut.getCutEndVectorEdition();
    const cutStartParticle=currentCut.getCutStartParticle();
    const cutOppositeParticle=currentCut.getCutEndParticle();

    //check everyFigure both in triangs and quads. I can do it in filtered one since this is the case 
    // where not a single quad or triang is not added to the filtered version
    // Doing it with raycaster doesn't makes anysense since the position could even be off camera
    var figureIndexContained=-1;
    for (let i=0;i<filteredTriangs.length;i++)
    {
      const triangleChecked =trianglesList[filteredTriangs[i][0]];
      if (triangleChecked.containsPoint(new THREE.Vector3(cutStartPosition.x, newVerticesEditionAux[0].y, cutStartPosition.y)))
      {
        figureIndexContained=i;
      }
    }

    if (figureIndexContained===-1) for (let i=0;i<filteredQuads.length;i++)
    {
      const quadChecked1 =trianglesList[filteredQuads[i][0]];
      if (quadChecked1.containsPoint(new THREE.Vector3(cutStartPosition.x, newVerticesEditionAux[0].y, cutStartPosition.y)))
      {
        figureIndexContained=i;
      }else
      {
        const quadChecked2 =trianglesList[filteredQuads[i][1]];
        if (quadChecked2.containsPoint(new THREE.Vector3(cutStartPosition.x, newVerticesEditionAux[0].y, cutStartPosition.y)))
        {
          figureIndexContained=i;
        }
      }
    }

    //TODO TOMORROW: I should make sure than in quads being in the edge between triangs also count as being contained
    //I will recode a version of the point inside for both quads and triangs. The quad one is going to call the triangle one adjusted for
    //being inclusive and then check if it is in a border and removing accordingly. Another posible trick may be that if the extreme point is not 
    // equal to the last intersection then it cannot be in a border


}

//TODO: Simplifying the parameter input of this function
function computeFigureExtreme(startingSide, currentCut, intersectionsList, newVerticesAux,newVerticesEditionAux, filteredTriangs, trianglesList, triangleListEditionFilteredUV, triangleListFiltered, clothEditionVertices, clothParticles, clothFaceVertexUvs)
{

  console.log("length InteresectionsList",intersectionsList.length);
  let cutStartPointIntersectionListCurrent;
  let cutStartPointIntersectionListNext=null;
  let cutStartPosition;
  let cutStartVectorEdition;
  let cutOppositeVectorEdition;
  if (startingSide==="fromStart")
  {
    cutStartPointIntersectionListCurrent=intersectionsList[0];
    if (intersectionsList.length>1)
    {
      cutStartPointIntersectionListNext=intersectionsList[1];
    }
    cutStartPosition=currentCut.getCutStart();
    cutStartVectorEdition=currentCut.getCutStartVectorEdition();
    cutOppositeVectorEdition=currentCut.getCutEndVectorEdition();
    cutStartParticle=currentCut.getCutStartParticle();
    cutOppositeParticle=currentCut.getCutEndParticle();
  }
  else if (startingSide==="fromEnd")
  {
    cutStartPointIntersectionListCurrent=intersectionsList[intersectionsList.length-1];
    if (intersectionsList.length>1)
    {
      cutStartPointIntersectionListNext=intersectionsList[intersectionsList.length-2];
    }
      cutStartPosition=currentCut.getCutEnd();
      cutStartVectorEdition=currentCut.getCutEndVectorEdition();
      cutOppositeVectorEdition=currentCut.getCutStartVectorEdition();
      cutStartParticle=currentCut.getCutEndParticle();
      cutOppositeParticle=currentCut.getCutStartParticle();
  }

    console.log("cutStartPointIntersectionListCurrent",cutStartPointIntersectionListCurrent);
        console.log("cutStartPointIntersectionListNext",cutStartPointIntersectionListNext);


  let insideFigure=false;
  let extremeBorderIndex;
  let triangleBelongs;
  if (intersectionsList.length>0)
  {
      for (let k=0;k<cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs;k++)
        {
          
          //const cutStartPosition3D= new THREE.Vector3(cutStartPosition.x, newVerticesEditionAux[cutStartPointIntersectionListCurrent.indexVertex[0]].y,cutStartPosition.y)

          for ( let l=0;l<cutStartPointIntersectionListCurrent.figure[k].length;l++)
          {
            
            const myTriangle =trianglesList[cutStartPointIntersectionListCurrent.figure[k][l]];
            const triangleToTest = new THREE.Triangle(clothEditionVertices[myTriangle.a], clothEditionVertices[myTriangle.b], clothEditionVertices[myTriangle.c]);

            const barycentricCoords = barycentricCoordinates(cutStartPosition, clothEditionVertices[myTriangle.a], clothEditionVertices[myTriangle.b], clothEditionVertices[myTriangle.c]);
          
            //console.log("triangleToTest",triangleToTest);
            //console.log("cutStartPosition3D",cutStartPosition3D);
          

            if (isPointInTriangle(barycentricCoords)) 
              //TODO: remember that contains point can break in edge cases because of floating point precision
            {
              
              insideFigure=true;
              extremeBorderIndex=k;
              triangleBelongs=l;
            }
          }
        }  
    

  }

    //inside figure works when inside a single triangle so later I need to check if it is a quad or triang
  if (insideFigure)
  {
    //DONE: check what happens when the edge is near the border since I think that it will try to make a 
    // bending spring in a place it should not be. That was fixed but there is something going on near the borders with a particle 
    // suddenly floating stucked in a place. breaking point seems to be in the algorithm making the line or whatever is given to it after creating 
    // the first cut 

    //TODO tomorrow: case when bot points of the cut are inside of the quad
    //the check will be done before entering the function of the extremes. In case it enters its a whole case similar to this one
    //TODO tomorrow: recoding the point inside triangle function since it should not include the edges.

    //TODO tomorrow: when the cut starts in a border
    //TODO tomorrow: when the cut goes through a corner
    //TODO tomorrow: when the cut goes thorugh a side between 2 figures
    //TODO tomorrow: set weights to the vertex according to the area of the triangles it shares
      
  
    const figureToCut=cutStartPointIntersectionListCurrent.figure[extremeBorderIndex];
    const centralVertexPosition=cutStartPosition;

    const intersectionEdge=cutStartPointIntersectionListCurrent.edgeIntersection;
    const intersectionsWithEdge=cutStartPointIntersectionListCurrent.indexVertex;


    let edgeOfIntersection1;
    let newVertex1Edge1Index;
    let newVertex2Edge1Index;

    if (startingSide==="fromStart")
    {
      edgeOfIntersection1=intersectionEdge[0];
      newVertex1Edge1Index=intersectionsWithEdge[1];
      newVertex2Edge1Index=intersectionsWithEdge[0];
    }else if (startingSide==="fromEnd")
    {
    if (intersectionEdge.length>1)
    {
      edgeOfIntersection1=intersectionEdge[1];
      newVertex1Edge1Index=intersectionsWithEdge[0];
      newVertex2Edge1Index=intersectionsWithEdge[1];
    }else
    {
      edgeOfIntersection1=intersectionEdge[0];
      newVertex1Edge1Index=intersectionsWithEdge[1];
      newVertex2Edge1Index=intersectionsWithEdge[0];
      }
    }

      if (cutStartPointIntersectionListCurrent.typeFigure[extremeBorderIndex]==="triang")
    {
      
      const currentTriangNumber1=figureToCut[0];
      const figureTriangNumber1=trianglesList[currentTriangNumber1];
      const setTriangIndex=[figureTriangNumber1.a, figureTriangNumber1.b, figureTriangNumber1.c];

      //get the central vertex in Edition for use in future calculations
      newVerticesEditionAux.push(cutStartVectorEdition);  
      const centralVertexIndex=newVerticesEditionAux.length-1;

      //vertexParticle is going to be calculated later with more information. In this section I only will get the edition vertex
      //the triangle should be in the correct order since the beggining since I just took the element from the array. I need to to a lot more for quads

      //I need to find to sort the edges so that edgeOfIntersection is the first edge in the triangle

      let loopVertex1=-1;
      let loopVertex2=-1;
      let loopvertex3=-1;
      for (let vertInTriang1=0;vertInTriang1<3;vertInTriang1++)
      {
        for (let vertInTriang2=0;vertInTriang2<3;vertInTriang2++)
        {
          if (vertInTriang1!==vertInTriang2 )
          {
            if ((setTriangIndex[vertInTriang1]===edgeOfIntersection1[0])&&(setTriangIndex[vertInTriang2]===edgeOfIntersection1[1]))
            {
                loopVertex1=vertInTriang1;
                loopVertex2=vertInTriang2;
                loopvertex3=3-vertInTriang1-vertInTriang2; //since the sum of the 3 vertices is 0+1+2=3 I can get the remaining one with this formula 
            }  

          } 
        }
      }

      let firstEdge=[setTriangIndex[loopVertex1],setTriangIndex[loopVertex2]];
      let intersectingOppositeEdge=[setTriangIndex[loopVertex2],setTriangIndex[loopvertex3]];

      //next step will be getting the UVs for the center Vertex and all the other ones

      //TODO: make a test to see what happens when the the intersecting line is parallel to the oppositeEDGE. It should be working but I lack the tests

      
        //Its very important than proportion is used in the correct order for the calculations

        //I think the next 50 lines can be replaced with simple barycentric coordinates calculation. 
        // I will need to do it for both the position and the UVs but it should be way more simple and less error prone.
        //I will need to make sure that the order of the vertices is correct though.

      let UVtriangle1= structuredClone(clothFaceVertexUvs[currentTriangNumber1]);

      let firstEdgeUV=[0,0];
      computingEdgeUVtriangle (firstEdge, firstEdgeUV, trianglesList, currentTriangNumber1, UVtriangle1);

      let intersectingOppositeEdgeUV=[0,0];
      computingEdgeUVtriangle (intersectingOppositeEdge, intersectingOppositeEdgeUV,trianglesList, currentTriangNumber1, UVtriangle1);

      let orderedTriangIndex=[firstEdge[0],firstEdge[1],intersectingOppositeEdge[1]];   //this is the order of the triangle vertices in the original triangle. It is important to keep it for future calculations
      let triangleUV=[firstEdgeUV[0],firstEdgeUV[1],intersectingOppositeEdgeUV[1]];

      let positionCutEdgeProportionFirstEdge=computeProportionEdge(newVerticesEditionAux[firstEdge[0]],newVerticesEditionAux[newVertex1Edge1Index], newVerticesEditionAux[firstEdge[1]]);
      let xInter1UV = firstEdgeUV[0].x + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].x - firstEdgeUV[0].x);
      let yInter1UV = firstEdgeUV[0].y + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].y - firstEdgeUV[0].y);


     /*


      //the position of the centerVertex in UV space la encuentro haciendo primero la continuacion de la recta para encontrar el punto de interseccion
        //con el triangulo. Luego hallo la posicion en UV usando proporciones entre los 2 puntos de referencia usados. 
        // Esto tambien podria usarse para obtener la ubicacion en el espacio 3D

      let vertex1TriangSpace=newVerticesAux[firstEdge[0]];
      let vertex2TriangSpace=newVerticesAux[firstEdge[1]];
      let vertex3TriangSpace=newVerticesAux[intersectingOppositeEdge[1]];

      orderedTriangIndex=[firstEdge[0],firstEdge[1],intersectingOppositeEdge[1]]; //this is the order of the triangle vertices in the original triangle. It is important to keep it for future calculations 


      const vertex1OppositeEdition=newVerticesEditionAux[intersectingOppositeEdge[0]];
      const vertex2OppositeEdition=newVerticesEditionAux[intersectingOppositeEdge[1]];

      let centralVertexOppositeIntersectionValue=segmentProjectedIntersect(vertex1OppositeEdition.x, vertex1OppositeEdition.z, vertex2OppositeEdition.x, vertex2OppositeEdition.z, vertex1OppositeEdition.y, currentCut.getCutStart().x, currentCut.getCutStart().y, currentCut.getCutEnd().x, currentCut.getCutEnd().y);
      
      let positionCutEdgeProportionOppositeIntersectionEdge=computeProportionEdge(vertex1OppositeEdition, centralVertexOppositeIntersectionValue, vertex2OppositeEdition);

      let positionCutEdgeProportionCentralToEdges=computeProportionEdge(newVerticesEditionAux[newVertex1Edge1Index],newVerticesEditionAux[centralVertexIndex], centralVertexOppositeIntersectionValue);

      //next step is using the proportions to get the position of the coreesponding UV coordinate of the center opposite
      let xInterAuxUV = intersectingOppositeEdgeUV[0].x + positionCutEdgeProportionOppositeIntersectionEdge * (intersectingOppositeEdgeUV[1].x - intersectingOppositeEdgeUV[0].x);
      let yInterAuxUV = intersectingOppositeEdgeUV[0].y + positionCutEdgeProportionOppositeIntersectionEdge * (intersectingOppositeEdgeUV[1].y - intersectingOppositeEdgeUV[0].y);

      //after that i should use both UV combined with the proportion to the center element to find its corresponding UV position
      let xCentralUV = xInter1UV + positionCutEdgeProportionCentralToEdges * (xInterAuxUV - xInter1UV);
      let yCentralUV   = yInter1UV + positionCutEdgeProportionCentralToEdges * (yInterAuxUV - yInter1UV);

*/
      let barycentricCoordsCentralVertex = barycentricCoordinates(centralVertexPosition, newVerticesEditionAux[orderedTriangIndex[0]], newVerticesEditionAux[orderedTriangIndex[1]], newVerticesEditionAux[orderedTriangIndex[2]]);
      let extrapolatedUVCentralVertex = extrapolateUVFromBarycentric(barycentricCoordsCentralVertex, triangleUV[0], triangleUV[1], triangleUV[2]);
      let xCentralUV = extrapolatedUVCentralVertex.x;
      let yCentralUV = extrapolatedUVCentralVertex.y;

      console.log("barycentricCoordsCentralVertex", barycentricCoordsCentralVertex);
      console.log("centralVertexPosition",centralVertexPosition);
      console.log("newVerticesEditionAux[orderedTriangIndex[0]]",newVerticesEditionAux[orderedTriangIndex[0]]);
    
/*
      //I will use the proportion to get the initial position of the center vertex in the original coordinates
      let xInterAuxPositional = vertex2TriangSpace.x + positionCutEdgeProportionOppositeIntersectionEdge * (vertex3TriangSpace.x - vertex2TriangSpace.x);
      let yInterAuxPositional = vertex2TriangSpace.y + positionCutEdgeProportionOppositeIntersectionEdge * (vertex3TriangSpace.y - vertex2TriangSpace.y);
      let zInterAuxPositional = vertex2TriangSpace.z + positionCutEdgeProportionOppositeIntersectionEdge * (vertex3TriangSpace.z - vertex2TriangSpace.z);

      let xInter1Positional = newVerticesAux[newVertex1Edge1Index].x;
      let yInter1Positional = newVerticesAux[newVertex1Edge1Index].y;
      let zInter1Positional = newVerticesAux[newVertex1Edge1Index].z;



      let xCentralPositional = xInter1Positional + positionCutEdgeProportionCentralToEdges * (xInterAuxPositional - xInter1Positional);
      let yCentralPositional = yInter1Positional + positionCutEdgeProportionCentralToEdges * (yInterAuxPositional - yInter1Positional);
      let zCentralPositional = zInter1Positional + positionCutEdgeProportionCentralToEdges * (zInterAuxPositional - zInter1Positional);
*/
      let extrapolatedCentralVertexClothPosition = extrapolatePositionFromBarycentric(barycentricCoordsCentralVertex, newVerticesAux[orderedTriangIndex[0]], newVerticesAux[orderedTriangIndex[1]], newVerticesAux[orderedTriangIndex[2]]);
      let xCentralPositional = extrapolatedCentralVertexClothPosition.x;
      let yCentralPositional = extrapolatedCentralVertexClothPosition.y;
      let zCentralPositional = extrapolatedCentralVertexClothPosition.z;
      
      let triangleClone1= new THREE.Face3(centralVertexIndex, newVertex2Edge1Index, orderedTriangIndex[1]);
      triangleListFiltered.push(triangleClone1);
      
      let UVoutput=structuredClone(UVtriangle1);
      UVoutput[0].x=xCentralUV;
      UVoutput[0].y=yCentralUV;
      UVoutput[1].x=xInter1UV;
      UVoutput[1].y=yInter1UV;
      UVoutput[2]=firstEdgeUV[1];

      triangleListEditionFilteredUV.push(UVoutput);
      filteredTriangs.push([triangleListFiltered.length-1]);

      let triangleClone2= new THREE.Face3(centralVertexIndex,  orderedTriangIndex[1], orderedTriangIndex[2]);
      triangleListFiltered.push(triangleClone2);
      
      let UVoutput2=structuredClone(UVtriangle1);
      UVoutput2[0].x=xCentralUV;
      UVoutput2[0].y=yCentralUV;
      UVoutput2[1]=firstEdgeUV[1];
      UVoutput2[2]=intersectingOppositeEdgeUV[1];

      triangleListEditionFilteredUV.push(UVoutput2);
      filteredTriangs.push([triangleListFiltered.length-1]);

      let triangleClone3= new THREE.Face3(centralVertexIndex,  orderedTriangIndex[2], orderedTriangIndex[0]);
      triangleListFiltered.push(triangleClone3);
      
      let UVoutput3=structuredClone(UVtriangle1);
      UVoutput3[0].x=xCentralUV;
      UVoutput3[0].y=yCentralUV;
      UVoutput3[1]=intersectingOppositeEdgeUV[1];
      UVoutput3[2]=firstEdgeUV[0];

      triangleListEditionFilteredUV.push(UVoutput3);
      filteredTriangs.push([triangleListFiltered.length-1]);

      let triangleClone4= new THREE.Face3(centralVertexIndex,  orderedTriangIndex[0], newVertex1Edge1Index);
      triangleListFiltered.push(triangleClone4);
      
      let UVoutput4=structuredClone(UVtriangle1);
      UVoutput4[0].x=xCentralUV;
      UVoutput4[0].y=yCentralUV;
      UVoutput4[1]=intersectingOppositeEdgeUV[1];
      UVoutput4[2].x=xInter1UV;
      UVoutput4[2].y=yInter1UV;

      triangleListEditionFilteredUV.push(UVoutput4);
      filteredTriangs.push([triangleListFiltered.length-1]);

      let x = xCentralPositional;
      let y = yCentralPositional;
      let z = zCentralPositional;

      cutStartParticle.overridePosition(new THREE.Vector3(x,y,z));
      const p=cutStartParticle.pushToArray(clothParticles);
      newVerticesAux.push(new THREE.Vector3(x,y,z)); 
      const centralVertexParticle=clothParticles[centralVertexIndex];
      

      const distanceStructural=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[newVertex1Edge1Index]); //calculating one time is enough since both vertices are in same point
      addConstraint(centralVertexParticle,clothParticles[newVertex1Edge1Index],distanceStructural, "structural");
      addConstraint(centralVertexParticle,clothParticles[newVertex2Edge1Index],distanceStructural, "structural");

    //TODO: make this also work when the cut ends exacly on the edge. IN THIS CASE THE BENDING SHOULD GO OVER DIRECTLY TO THE NEW VERTEX. I SHOULD ALSO CONSIDER THE CASE OF
      //EDGES CONTAINED IN SAME FIGURE

    //Make the constrains that goes over directly to intersectionsOrderedWithoutRepetition[1]
      if ((cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)&&(intersectionsList.length>1)&&(cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)){ //this bending spring is added when the border cutted is not the edge of the whole cloth. There should always be another Edge after
        const distanceBending=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[cutStartPointIntersectionListNext.indexVertex[0]]);
        addConstraint(centralVertexParticle,clothParticles[cutStartPointIntersectionListNext.indexVertex[1]],distanceBending, "bending");
        addConstraint(centralVertexParticle,clothParticles[cutStartPointIntersectionListNext.indexVertex[0]],distanceBending, "bending");
      }else if ((cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)&&(intersectionsList.length===1)&&(cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)) //this bending spring is added when the border cutted is not the edge of the whole cloth but the cut ends in the edge. In this case there should not be another edge after but there should be one before since it is the end of the cut
      {
        //this is done both time since i need to equal springs since they should be on both sides of the cut
         const distanceBending=newVerticesEditionAux[centralVertexIndex].distanceTo(cutOppositeVectorEdition);
        addConstraint(centralVertexParticle,cutOppositeParticle,distanceBending, "bending");
      }
      // cuando la linea empieza en el triang final
      //el iteraciones sin bordes simplemente debe hacer un simple checkeo para ver si el borde siguiente pertenece a mas de un triang o no



      //constraints structural que salen de central. 
        const distanceStructural1=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedTriangIndex[0]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedTriangIndex[0]],distanceStructural1, "structural"); //this shear is made as structural since it is between vertices that are in the same triangle. I should check if this is correct later

        const distanceStructural2=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedTriangIndex[1]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedTriangIndex[1]],distanceStructural2, "structural");

        const distanceStructural3=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedTriangIndex[2]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedTriangIndex[2]],distanceStructural3, "structural");


    




    }else if (cutStartPointIntersectionListCurrent.typeFigure[extremeBorderIndex]==="quad")
    {
      const currentTriangNumber1=figureToCut[0];
      const currentTriangNumber2=figureToCut[1];

      const CurrentTriangleIncludedNumber=figureToCut[triangleBelongs];

      const figureTriangNumber1=trianglesList[currentTriangNumber1];
      const figureTriangNumber2=trianglesList[currentTriangNumber2];
      const figureTriangIncluded=trianglesList[CurrentTriangleIncludedNumber]

      const setFirstTriang=new Set([figureTriangNumber1.a, figureTriangNumber1.b, figureTriangNumber1.c]);
      const setSecondTriang=new Set([figureTriangNumber2.a, figureTriangNumber2.b, figureTriangNumber2.c]);

      const setQuad=setFirstTriang.union(setSecondTriang).values();
      
      const vertexQuadIndex=[setQuad.next().value,setQuad.next().value,setQuad.next().value,setQuad.next().value];
      
    //Reasoning at the time: i should pay attention that this should be done both in edition and the cloth per se. The particle creation should be done by taking into account the particle
      //get the central vertex in Edition for use in future calculations
      //the particle is being created before since now I need to be able to make the conection in case the are too close between them
      //the particle can be generated for the cloth at cut creation and then relocate it when I can know its position. 
      // This way I can make unions already in the first step
      newVerticesEditionAux.push(cutStartVectorEdition);  
      const centralVertexIndex=newVerticesEditionAux.length-1;


      //vertexParticle is going to be calculated later with more information. In this section I only will get the edition vertex


      let loopVertex1=-1;
      let loopVertex2=-1;
      for (let vertInQuad1=0;vertInQuad1<4;vertInQuad1++)
      {
        for (let vertInQuad2=0;vertInQuad2<4;vertInQuad2++)
        {
          if (vertInQuad1!==vertInQuad2 )
          {
            if ((vertexQuadIndex[vertInQuad1]===edgeOfIntersection1[0])&&(vertexQuadIndex[vertInQuad2]===edgeOfIntersection1[1]))
            {
                loopVertex1=vertInQuad1;
                loopVertex2=vertInQuad2; 
            }  

          } 
        }
      }

      console.log("startLoopVertex1",  loopVertex1);
      console.log("startLoopVertex2",  loopVertex2);

      let auxIndex=vertexQuadIndex[0];
      vertexQuadIndex[0]=vertexQuadIndex[loopVertex1];
      vertexQuadIndex[loopVertex1]=auxIndex;

      //since in first move I took the first element to other place I need to swap with the one that was originally there
      if (loopVertex2===0)
      {
        auxIndex=vertexQuadIndex[1];
        vertexQuadIndex[1]=vertexQuadIndex[loopVertex1];
        vertexQuadIndex[loopVertex1]=auxIndex;
      }
        //this condition is to prevent reversing the swap if they were correct but reversed
      else 
      {
        auxIndex=vertexQuadIndex[1];
        vertexQuadIndex[1]=vertexQuadIndex[loopVertex2];
        vertexQuadIndex[loopVertex2]=auxIndex;
      }


            
      const orderedQuadIndex=vertexQuadIndex;

      const symmetricDifference = (a, b) => new Set([...[...a].filter(x => !b.has(x)), ...[...b].filter(x => !a.has(x))]);
      const differenceElements=symmetricDifference(setSecondTriang,setFirstTriang).values();
      const diagonal1=differenceElements.next().value;
      const diagonal2=differenceElements.next().value;

      if (diagonal1===orderedQuadIndex[0])
      {
        if (diagonal2===orderedQuadIndex[3])
        {
          let aux=orderedQuadIndex[2];
          orderedQuadIndex[2]=orderedQuadIndex[3];
          orderedQuadIndex[3]=aux;

        }
      }else if (diagonal1===orderedQuadIndex[1])
      {
          if (diagonal2===orderedQuadIndex[2])
        {
          let aux=orderedQuadIndex[2];
          orderedQuadIndex[2]=orderedQuadIndex[3];
          orderedQuadIndex[3]=aux;

        }
        
      } else if (diagonal2===orderedQuadIndex[0])
      {
        if (diagonal1===orderedQuadIndex[3])
        {
          let aux=orderedQuadIndex[2];
          orderedQuadIndex[2]=orderedQuadIndex[3];
          orderedQuadIndex[3]=aux;
        }
        
      }else if (diagonal2===orderedQuadIndex[1])
      {
        if (diagonal1===orderedQuadIndex[2])
        {
          let aux=orderedQuadIndex[2];
          orderedQuadIndex[2]=orderedQuadIndex[3];
          orderedQuadIndex[3]=aux;
        }
        
      }


      let firstEdge=[orderedQuadIndex[0],orderedQuadIndex[1]];
      let oppositeEdge=[orderedQuadIndex[2],orderedQuadIndex[3]];

      //TODO: make a test to see what happens when the the intersecting line is parallel to the oppositeEDGE. It should be working but I lack the tests

      
        //Its very important than proportion is used in the correct order for the calculations



      let UVtriangle1= structuredClone(clothFaceVertexUvs[currentTriangNumber1]);
      let UVtriangle2= structuredClone(clothFaceVertexUvs[currentTriangNumber2]);

      const triangleEditionIndex=trianglesList[CurrentTriangleIncludedNumber];
      const triangleUV=clothFaceVertexUvs[CurrentTriangleIncludedNumber];

      const barycentricCoordsCentralVertex=barycentricCoordinates(centralVertexPosition,newVerticesEditionAux[triangleEditionIndex.a],newVerticesEditionAux[triangleEditionIndex.b],newVerticesEditionAux[triangleEditionIndex.c])
      const UVcoordsCenter=extrapolateUVFromBarycentric(barycentricCoordsCentralVertex, triangleUV[0], triangleUV[1], triangleUV[2]);
      const xCentralUV=UVcoordsCenter.x;
      const yCentralUV=UVcoordsCenter.y;

      const clothCoordsCenter=extrapolatePositionFromBarycentric(barycentricCoordsCentralVertex, newVerticesAux[triangleEditionIndex.a], newVerticesAux[triangleEditionIndex.b], newVerticesAux[triangleEditionIndex.c]);
      const xCentralPositional=clothCoordsCenter.x;
      const yCentralPositional=clothCoordsCenter.y;
      const zCentralPositional=clothCoordsCenter.z;


      let firstEdgeUV=[0,0];
      computingEdgeUVQuad (firstEdge, firstEdgeUV, trianglesList, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

      let oppositeEdgeUV=[0,0];
      computingEdgeUVQuad (oppositeEdge, oppositeEdgeUV,trianglesList, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

      let positionCutEdgeProportionFirstEdge=computeProportionEdge(newVerticesEditionAux[firstEdge[0]],newVerticesEditionAux[newVertex1Edge1Index], newVerticesEditionAux[firstEdge[1]]);

      let xInter1UV = firstEdgeUV[0].x + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].x - firstEdgeUV[0].x);
      let yInter1UV = firstEdgeUV[0].y + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].y - firstEdgeUV[0].y);

      /*

      //the position of the centerVertex in UV space la encuentro haciendo primero la continuacion de la recta para encontrar el punto de interseccion
        //con el cuadrilatero. Luego hallo la posicion en UV usando proporciones entre los 2 puntos de referencia usados. Esto tambien podria usarse en
      //el espacio 3D donde antes lo necesitaba 

      //I need to change the edge I use for calculations if the opposite is parallel to the first Edge

      let vertex1Opposite=newVerticesEditionAux[oppositeEdge[0]];
      let vertex2Opposite=newVerticesEditionAux[oppositeEdge[1]];
      //first step should be finding the intrsection of the projection of the opposite edge with the line.
      let lineOppositeIntersection=segmentProjectedIntersect(vertex1Opposite.x, vertex1Opposite.z, vertex2Opposite.x, vertex2Opposite.z, vertex1Opposite.y, currentCut.getCutStart().x, currentCut.getCutStart().y, currentCut.getCutEnd().x, currentCut.getCutEnd().y);
      
      let vertex1IntersectingLineOppositeEdition=vertex1Opposite;
      let vertex2IntersectingLineOppositeEdition=vertex2Opposite;

      let vertex1IntersectingLineOpposite=newVerticesAux[oppositeEdge[0]];
      let vertex2IntersectingLineOpposite=newVerticesAux[oppositeEdge[1]];

      let intersectionLinePosition=lineOppositeIntersection;
      let intersectionOppositeEdge=oppositeEdge;
      let intersetionLineOppositeUV=oppositeEdgeUV;
      if (lineOppositeIntersection===false) //this means that the opposite edge is parallel so I should use another Edge. In that case i do some overwrites
      {
        vertex1IntersectingLineOppositeEdition=newVerticesEditionAux[firstEdge[1]];
        vertex2IntersectingLineOppositeEdition=newVerticesEditionAux[oppositeEdge[0]];

        vertex1IntersectingLineOpposite=newVerticesAux[firstEdge[1]];
        vertex2IntersectingLineOpposite=newVerticesAux[oppositeEdge[0]];

        let intersectionOppositeEdge=[vertex1IntersectingLineOppositeEdition, vertex2IntersectingLineOppositeEdition];
        intersectionLinePosition=segmentProjectedIntersect(vertex1IntersectingLineOppositeEdition.x, vertex1IntersectingLineOppositeEdition.z, vertex2IntersectingLineOppositeEdition.x, vertex2IntersectingLineOppositeEdition.z, vertex1IntersectingLineOppositeEdition.y, currentCut.getCutStart().x, currentCut.getCutStart().y, currentCut.getCutEnd().x, currentCut.getCutEnd().y);
      
        computingEdgeUVQuad (intersectionOppositeEdge, intersetionLineOppositeUV,trianglesList, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);


      }

      let centralVertexOppositeValue = intersectionLinePosition[1];

      let positionCutEdgeProportionOppositeIntersectionEdge=computeProportionEdge(vertex1IntersectingLineOppositeEdition, centralVertexOppositeValue, vertex2IntersectingLineOppositeEdition);

      let positionCutEdgeProportionCentralToEdges=computeProportionEdge(newVerticesEditionAux[newVertex1Edge1Index],newVerticesEditionAux[centralVertexIndex], centralVertexOppositeValue);

      //next step is using the proportions to get the position of the coreesponding UV coordinate of the center opposite
      let xInterAuxUV = intersetionLineOppositeUV[0].x + positionCutEdgeProportionOppositeIntersectionEdge * (intersetionLineOppositeUV[1].x - intersetionLineOppositeUV[0].x);
      let yInterAuxUV = intersetionLineOppositeUV[0].y + positionCutEdgeProportionOppositeIntersectionEdge * (intersetionLineOppositeUV[1].y - intersetionLineOppositeUV[0].y);

      //after that i should use both UV combined with the proportion to the center element to find its corresponding UV position
      let xCentralUV = xInter1UV + positionCutEdgeProportionCentralToEdges * (xInterAuxUV - xInter1UV);
      let yCentralUV   = yInter1UV + positionCutEdgeProportionCentralToEdges * (yInterAuxUV - yInter1UV);

      //I will use the proportion to get the initial position of the center vertex in the original coordinates
      let xInterAuxPositional = vertex1IntersectingLineOpposite.x + positionCutEdgeProportionOppositeIntersectionEdge * (vertex2IntersectingLineOpposite.x - vertex1IntersectingLineOpposite.x);
      let yInterAuxPositional = vertex1IntersectingLineOpposite.y + positionCutEdgeProportionOppositeIntersectionEdge * (vertex2IntersectingLineOpposite.y - vertex1IntersectingLineOpposite.y);
      let zInterAuxPositional = vertex1IntersectingLineOpposite.z + positionCutEdgeProportionOppositeIntersectionEdge * (vertex2IntersectingLineOpposite.z - vertex1IntersectingLineOpposite.z);

      let xInter1Positional = newVerticesAux[newVertex1Edge1Index].x;
      let yInter1Positional = newVerticesAux[newVertex1Edge1Index].y;
      let zInter1Positional = newVerticesAux[newVertex1Edge1Index].z;


      let xCentralPositional = xInter1Positional + positionCutEdgeProportionCentralToEdges * (xInterAuxPositional - xInter1Positional);
      let yCentralPositional = yInter1Positional + positionCutEdgeProportionCentralToEdges * (yInterAuxPositional - yInter1Positional);
      let zCentralPositional = zInter1Positional + positionCutEdgeProportionCentralToEdges * (zInterAuxPositional - zInter1Positional);
*/

      //I will construct the triangles here
      let triangleClone1= new THREE.Face3(centralVertexIndex, newVertex2Edge1Index, orderedQuadIndex[1]);
      triangleListFiltered.push(triangleClone1);
      
      let UVoutput=structuredClone(UVtriangle1);
      UVoutput[0].x=xCentralUV;
      UVoutput[0].y=yCentralUV;
      UVoutput[1].x=xInter1UV;
      UVoutput[1].y=yInter1UV;
      UVoutput[2]=firstEdgeUV[1];

      triangleListEditionFilteredUV.push(UVoutput);
      filteredTriangs.push([triangleListFiltered.length-1]);
      

      let triangleClone2= new THREE.Face3(centralVertexIndex, orderedQuadIndex[1], orderedQuadIndex[2]);
      triangleListFiltered.push(triangleClone2);

      let UVoutput2=structuredClone(UVtriangle1);
      UVoutput2[0].x=xCentralUV;
      UVoutput2[0].y=yCentralUV;
      UVoutput2[1]=firstEdgeUV[1];
      UVoutput2[2]=oppositeEdgeUV[0];


      triangleListEditionFilteredUV.push(UVoutput2);

      filteredTriangs.push([triangleListFiltered.length-1]);  

      let triangleClone3= new THREE.Face3(centralVertexIndex, orderedQuadIndex[2], orderedQuadIndex[3]);
      triangleListFiltered.push(triangleClone3);

      let UVoutput3=structuredClone(UVtriangle1);
      UVoutput3[0].x=xCentralUV;
      UVoutput3[0].y=yCentralUV;
      UVoutput3[1]=oppositeEdgeUV[0];
      UVoutput3[2]=oppositeEdgeUV[1];


      triangleListEditionFilteredUV.push(UVoutput3);

      filteredTriangs.push([triangleListFiltered.length-1]);  

      let triangleClone4= new THREE.Face3(centralVertexIndex, orderedQuadIndex[3], orderedQuadIndex[0]);
      triangleListFiltered.push(triangleClone4);

      let UVoutput4=structuredClone(UVtriangle1);
      UVoutput4[0].x=xCentralUV;
      UVoutput4[0].y=yCentralUV;
      UVoutput4[1]=oppositeEdgeUV[1];
      UVoutput4[2]=firstEdgeUV[0];


      triangleListEditionFilteredUV.push(UVoutput4);

      filteredTriangs.push([triangleListFiltered.length-1]);  

      let triangleClone5= new THREE.Face3(centralVertexIndex, orderedQuadIndex[0], newVertex1Edge1Index);
      triangleListFiltered.push(triangleClone5);

      let UVoutput5=structuredClone(UVtriangle1);
      UVoutput5[0].x=xCentralUV;
      UVoutput5[0].y=yCentralUV;
      UVoutput5[1]=firstEdgeUV[0];
      UVoutput5[2].x=xInter1UV;
      UVoutput5[2].y=yInter1UV;


      triangleListEditionFilteredUV.push(UVoutput5);

      filteredTriangs.push([triangleListFiltered.length-1]);  

      
      // cuando la linea empieza en el quad final
      //el iteraciones sin bordes simplemente debe hacer un simple checkeo para ver si el borde siguiente pertenece a mas de un quad o no

                    
      let x = xCentralPositional;
      let y = yCentralPositional;
      let z = zCentralPositional;

      cutStartParticle.overridePosition(new THREE.Vector3(x,y,z));
      const p=cutStartParticle.pushToArray(clothParticles);
      newVerticesAux.push(new THREE.Vector3(x,y,z)); 
      const centralVertexParticle=clothParticles[centralVertexIndex];
      
      const distanceStructural=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[newVertex1Edge1Index]); //calculating one time is enough since both vertices are in same point
      addConstraint(centralVertexParticle,clothParticles[newVertex1Edge1Index],distanceStructural, "structural");
      addConstraint(centralVertexParticle,clothParticles[newVertex2Edge1Index],distanceStructural, "structural");

      //TODO: make this also work when the cut ends exacly on the edge. IN THIS CASE THE BENDING SHOULD GO OVER DIRECTLY TO THE NEW VERTEX. I SHOULD ALSO CONSIDER THE CASE OF
      //EDGES CONTAINED IN SAME FIGURE

      //Make the constrains that goes over directly to intersectionsOrderedWithoutRepetition[1]
      if ((cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)&&(intersectionsList.length>1)&&(cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)){ //this bending spring is added when the border cutted is not the edge of the whole cloth. There should always be another Edge after
        const distanceBending=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[cutStartPointIntersectionListNext.indexVertex[0]]);
        addConstraint(centralVertexParticle,clothParticles[cutStartPointIntersectionListNext.indexVertex[1]],distanceBending, "bending");
        addConstraint(centralVertexParticle,clothParticles[cutStartPointIntersectionListNext.indexVertex[0]],distanceBending, "bending");
      }else if ((cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)&&(intersectionsList.length===1)&&(cutStartPointIntersectionListCurrent.amountOfQuadsOrTriangs===2)) //this bending spring is added when the border cutted is not the edge of the whole cloth but the cut ends in the edge. In this case there should not be another edge after but there should be one before since it is the end of the cut
      {
        //this is done both time since i need to equal springs since they should be on both sides of the cut
         const distanceBending=newVerticesEditionAux[centralVertexIndex].distanceTo(cutOppositeVectorEdition);
        addConstraint(centralVertexParticle,cutOppositeParticle,distanceBending, "bending");
      }


        //constraints Shear que salen de central. 
        const distanceShear1=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedQuadIndex[0]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedQuadIndex[0]],distanceShear1, "structural"); //this shear is made as structural since it is between vertices that are in the same triangle. I should check if this is correct later

        const distanceShear2=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedQuadIndex[1]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedQuadIndex[1]],distanceShear2, "structural");

        const distanceShear3=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedQuadIndex[2]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedQuadIndex[2]],distanceShear3, "structural");

        const distanceShear4=newVerticesEditionAux[centralVertexIndex].distanceTo(newVerticesEditionAux[orderedQuadIndex[3]]); //calculating one time is enough since both vertices are in same point
        addConstraint(centralVertexParticle,clothParticles[orderedQuadIndex[3]],distanceShear4, "structural");

    }

  }
      
}
  
  
  function cutCloth(){


    for (var i=0;i<clothObjectEditionArray.length;i++)
    {

      let currentCut=new Cut(i,cutStart,cutEnd);

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

      console.log("unfilteredTriangles",unfilteredTriangles);
      for (var j=0;j<clothObjectEditionArray[i].cloth.triangs.length;j++)
      {
        const currentTriang=clothObjectEditionArray[i].cloth.triangs[j][0];

        console.log("unfilteredTriangles[currentTriang]",unfilteredTriangles[currentTriang]);

        
        const vertex1Val=unfilteredTriangles[currentTriang].a;
        const vertex2Val=unfilteredTriangles[currentTriang].b;
        const vertex3Val=unfilteredTriangles[currentTriang].c;
        const vertex1=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex1Val]
        const vertex2=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex2Val]
        const vertex3=clothObjectEditionArray[i].cloth.clothGeometry.vertices[vertex3Val]


        let line1Intersection=segmentIntersect(vertex1.x, vertex1.z, vertex2.x, vertex2.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);
        let line2Intersection=segmentIntersect(vertex2.x, vertex2.z, vertex3.x, vertex3.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);

        let line3Intersection=segmentIntersect(vertex3.x, vertex3.z, vertex1.x, vertex1.z, vertex1.y, cutStart.x, cutStart.y, cutEnd.x, cutEnd.y);

        if ((line1Intersection===false)&&
        (line2Intersection===false)&&
        (line3Intersection===false))
        {
          filteredTriangles.push(unfilteredTriangles[currentTriang]);
          
  
          filteredTrianglesEditionUVS.push(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriang]);
          filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriang]);

        

          filteredTriangs.push([filteredTriangles.length-1]);

        }else
        {

          
          if (line1Intersection!==false)
          {
            let pushedElement=line1Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex1Val,vertex2Val]);

            pushedElement.push("triang");
            pushedElement.push(clothObjectEditionArray[i].cloth.triangs[j]);

            listOfIntersection.push(pushedElement);
          }
          if (line2Intersection!==false)
          {
            let pushedElement=line2Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex2Val,vertex3Val]);

            pushedElement.push("triang");
            pushedElement.push(clothObjectEditionArray[i].cloth.triangs[j]);

            listOfIntersection.push(pushedElement);
          }
          if (line3Intersection!==false)
          {
            let pushedElement=line3Intersection;

            //the 2nd element will be the vertexes of the segment the intesection belongs to. This will allow a way to make the cuts posible
            pushedElement.push([vertex3Val,vertex1Val]);

            pushedElement.push("triang");
            pushedElement.push(clothObjectEditionArray[i].cloth.triangs[j]);

            listOfIntersection.push(pushedElement);
            
          }
        }
        

        //TODO: check that all triangs were added correctly
         

      }
      //console.log("triangs",clothObjectEditionArray[i].cloth.triangs);
      //console.log("filteredTriangs",filteredTriangs);


       //. BELOW THE TRIANGLES MAKE ALL THE PROCESS OF SORTING INTERSECTION LIST. REMOVE REPETITION. AND MAKE THE OPERATION OF ADDING THE QUADS. THEN ADD THE TRIANGLES AND MAKE THE OPERATION
      function compareIntersection(a,b)
      {
        vertexA=[clothObjectEditionArray[i].cloth.clothGeometry.vertices[a[2][0]],clothObjectEditionArray[i].cloth.clothGeometry.vertices[a[2][1]]];
        vertexB=[clothObjectEditionArray[i].cloth.clothGeometry.vertices[b[2][0]],clothObjectEditionArray[i].cloth.clothGeometry.vertices[b[2][1]]];
        
       
        //TODO: check that everything is working without bugs
        //if (Math.abs(a[0]-b[0])<0.00000001)
         if ((Math.abs(a[0]-b[0])<0.001)&&((vertexA===vertexB)||((vertexA[0]===vertexB[1])&&(vertexA[1]===vertexB[0]))))
        {
          var centerA;
          var centerB;
          
          var cutStart3D=new THREE.Vector3(cutStart.x,(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a]).y,cutStart.y);
          var cutEnd3D=new THREE.Vector3(cutEnd.x,(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a]).y,cutEnd.y);
          

          var centerA = (((clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].a].clone()).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].b])).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[a[4][0]].c])).multiplyScalar(1/3);
          var centerB = (((clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].a].clone()).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].b])).add(clothObjectEditionArray[i].cloth.clothGeometry.vertices[unfilteredTriangles[b[4][0]].c])).multiplyScalar(1/3);
         


          var dirCut = (cutEnd3D.clone().sub(cutStart3D)).normalize();
         

         // var dir2 = (cutEnd3D.clone().sub(cutStart3D)).normalize();



          let dirA=[newVerticesEdition[a[2][1]].x-newVerticesEdition[a[2][0]].x,newVerticesEdition[a[2][1]].z-newVerticesEdition[a[2][0]].z];
          let dirB=[newVerticesEdition[b[2][1]].x-newVerticesEdition[b[2][0]].x,newVerticesEdition[b[2][1]].z-newVerticesEdition[b[2][0]].z];

        

          let dirPerpendicularA=new THREE.Vector3(-dirA[1],0,dirA[0]).normalize();
          let dirPerpendicularB=new THREE.Vector3(-dirB[1],0,dirB[0]).normalize();

          //now i need to make make the general Orientation of the perpendicular be the same as the cutting line. In case it is not (negative dot product) I flip




          if (dirPerpendicularA.clone().dot(dirCut)<0)
          {
            dirPerpendicularA= dirPerpendicularA.negate();
            
          }

          if (dirPerpendicularB.clone().dot(dirCut)<0)
          {
            dirPerpendicularB= dirPerpendicularB.negate();
            
          }




          const intersectionPoint=a[1];
          var vA = centerA.sub(intersectionPoint);
          var positionInLineToCompareCenterFigureA=vA.dot(dirPerpendicularA);

          var vB = centerB.sub(intersectionPoint);
          var positionInLineToCompareCenterFigureB=vB.dot(dirPerpendicularA);


        //ESTO CAMBIA LA LINEA POR LA PERPENDICULAR A LA RECTA ASEGURANDO QUE EL ORDEN VAYA A PRESERVARSE YA QUE NO EXISTEN POLIGONOS CON ANGULOS INTERIORES DE MAS DE 180 GRADOS

          if (positionInLineToCompareCenterFigureA<positionInLineToCompareCenterFigureB)
          {
            
            return -1;
          }



        } else if (a[0]<b[0])
        {
          return -1;
        }
      }
      console.log("ListOfIntersectionUnsorted",listOfIntersection);

      listOfIntersection.sort(compareIntersection); 

      let currentFigure=listOfIntersection[0][4];
      let mode="check";
      for (let j=1;j<listOfIntersection.length-1;j=j+1)
      {
        if (mode==="check")
        {
            if (listOfIntersection[j][4]===currentFigure)
            {
              mode="set";

            }else if (listOfIntersection[j+1][4]===currentFigure)
            {
              const aux=listOfIntersection[j];
              listOfIntersection[j]=listOfIntersection[j+1];  
              listOfIntersection[j+1]=aux;
              mode="set";
              console.log("SWAP HAPPENED");
            }else
            {
              //this means that the line does belong to a quad in a extreme of the line since every other one shares quad with the next one
              mode="check";
              currentFigure=listOfIntersection[j][4];
              console.log("THERE WAS AN EXTRME");
            }
        }else if (mode==="set") 
        {
           mode="check";
           currentFigure=listOfIntersection[j][4];
        }

      } 

      
      console.log("listOfIntersection Sorted",structuredClone(listOfIntersection));

      //remove repetition. this is done so that each specific point indicates which quads it belongs to without repetition

      //its important to remember that the same segment in 2 adjacent quads have different orientation to preserve order. So to prevent future bugs the edgeNeds to be save for both quads of the intersection

      //Elements of intersectionsOrderedWihoutRepetition
      //0: position along the cutting line the cut happens for sorting
      //1: coordinates of the intersection position
      //2: amount of quads or triang the intersection belongs to
      //3/6: Edge the intersection belongs to with corrent orientation clockwise or not
      //4/7: Type: Either a triang or quad of the first/second element it belongs to
      //5/8: quad with triang index of the triangles contained. 




      let iterationsSinceLimitStart=0;
      let intersectionsOrderedWithoutRepetition=[]

      console.log("listOfIntersection HELLO", listOfIntersection);
      for (let j=0;j<listOfIntersection.length;j=j+1)
      {

        //TODO: MAKE A LIST OF CUTS AND STORE EVERY INTERSECTION TO ENABLE REDOING AFTER UNDOING AND ALSO ENABLING THE CREATION OF AN ADITIONAL VERTEX FOR THE EXTREME. REMEMBER
        //TO STORE EVERYTHING FROM [1] to leave room for [0] unless the cut is perfect in the start

      // TODO: IMPLEMENT THE LIMIT OF THE CUT
      //TODO: IMPLEMENT THE CORNER CUT

        



             //first add the intersection vertexes. With that obtained triangles can be created. They are on the same position for the other side of the cut
             //Flip this edge in case it shares quad with the next one meaning that orientation would be flipped
            //this is made to consider the case of an edge that is part of a single quad.
          var edgeOfIntersection1;

          if ((j<listOfIntersection.length-1)&&(listOfIntersection[j][4]===listOfIntersection[j+1][4])) 
            //this swap would be made to make sure both particles are in correct side of cut. it happens if both this segemnt and the nextt are in the same figure
          {
            edgeOfIntersection1=[listOfIntersection[j][2][1],listOfIntersection[j][2][0]];
          }else
          {
            edgeOfIntersection1=[listOfIntersection[j][2][0],listOfIntersection[j][2][1]];
          }

          //TODO next: Make mass of particles proportional to adjacent triangles

          //get proportion cut happens in edge
          const verticesEdition=clothObjectEditionArray[i].cloth.clothGeometry.vertices;
          let positionCutEdgeProportionEdge1;

                if ((verticesEdition[edgeOfIntersection1[0]]).x!==(verticesEdition[edgeOfIntersection1[1]]).x)
                  //this check is to prevent division by zero
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
         
          //need to create 2 copies for each cut in each edge since there should be a vertex for each side of the intersection since its is split in the middle
          
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



                          


            //TODO: I think this would not work with cuts that are not straight. the caluclation asumes colinterality between the 3 particles.
              if (bendSpringsTested!==false){
                const distanceDifferenceBendingStructural=bendSpringsTested.distance-particlesEdge[1-l].structuralConstraints[k].distance-particlesEdge[1-l].returnConstraint(particlesEdge[l], "structural").distance
                if (distanceDifferenceBendingStructural<0.001) //this is to check for colinearity with a margin for floating point errors
                {
                  bendSprings[l]=bendSpringsTested;
                  externalVertexOfSpring[l]=particleConnectedConstraint;

                }

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
            if (distanceStructural===0)
            {
              console.log("error distance structural is 0, hello1");
            }
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-1-k], particlesEdge[k], distanceStructural, "structural");


            
          }

          particlesEdge[0].returnConstraint(particlesEdge[1],"structural").removeSpring();

          //everything is made on the basis of the previous edge. edge. In case there is not a previous one it should be made specially for that
     

          //todo:Check which particle is used for making the triangles lower in the quad. 
          // This is probably because I do not check carefully which particle to use depending on direction of line

          //TODO:Fix problem when particles are to close to each other
          
          //here I add internal structural and bending springs for the cut itself
      

          
          if (iterationsSinceLimitStart>0){ //its restarted at 1 when a border has a single element meaning its a border. 
            const distanceStructural=newVerticesEdition[newVertices.length-2].distanceTo(newVerticesEdition[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[0]]); //calculating one time is enough since both vertices are in same point
            if (distanceStructural===0)
            {
              console.log("error distance structural is 0, hello2");
              //"TODO: tomorrow fixing the error that happens for connecting 2 adjacent lines that should be connected"
            }
            
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-2],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[0]],distanceStructural, "structural");
            addConstraint(clothObjectArray[i].cloth.particles[newVertices.length-1],clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[intersectionsOrderedWithoutRepetition.length-1].indexVertex[1]],distanceStructural, "structural");
            if (iterationsSinceLimitStart>1){ 
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



        //comparing intersection line to see if the same line is reversed consecutively meaning that it is a border between 2 quads. In that case I will add the 2 intersections
        //  together in the same element to make it easier to handle the cut later since they are basically the same intersection but with different orientation. 
        // This is made to consider the case of an edge that is part of 2 adjacent quads. It checks vertex per se and not coordinate to prevent problems with the fact that 2 points in the border
        //share same coordinate but are different vertex.
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
          
       iterationsSinceLimitStart=iterationsSinceLimitStart+1;
          
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

          //this works since it adds if it the next element is the second part of a quad since it will the one using this interationsSinceLimitStart information
          
          if ((j<listOfIntersection.length-1)&&(listOfIntersection[j][3]===listOfIntersection[j+1][3])&&(listOfIntersection[j][4]===listOfIntersection[j+1][4]))
          {
            iterationsSinceLimitStart=iterationsSinceLimitStart+1;
          }else
          {
            iterationsSinceLimitStart=0;
          }    
        }
        //console.log("j=", j, "  iterationsSinceLimitStart=", iterationsSinceLimitStart);

      } 

      //The list without repetition has every intersection wihout repetition
      //TODO: MAKE THIS WORK IN CASES WHERE THE INTERSECTION IS IN A VERTEX EITHER GETTING INSIDE OR NOT GETTING INSIDE
      //TODO: MAKING CUT UNDOING TO WORK. ONE WAY IS REGISTER ALL CHANGES IN QUAD TO ENABLE FAST UNDOING IN JUST THE NEEDED QUAD OF EVERYTHING AFTER THE REMOVED CUT. IT SHOULD ALSO WORK ON EXTENDED CUTS
      //REMEMBER TO PAY SPECIAL ATTENTION TO SHARED BORDER WITH OTHER CUTS. WHEN REPLACING A BENDING I SHOULD ALSO UPDATE THE CHANGE TO THE REDO FUNCTION OF ANY QUADS WHERE IT IS INVOLVED

      //TODO: MAKING ALL THIS WORK EVEN WHEN STARTING THE CUT IN A PREVIOUS PARTICLE
      //for now this only works with quads. triangs should be added


    console.log("intersectionsOrderedWithoutRepetition",intersectionsOrderedWithoutRepetition);
    console.log("clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[0].indexVertex[0]]",clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[0].indexVertex[0]]);
    console.log("clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[0].indexVertex[1]]",clothObjectArray[i].cloth.particles[intersectionsOrderedWithoutRepetition[0].indexVertex[1]]);
 
  
    console.log("cloth.vertices",newVerticesEdition);
    console.log("cloth.particles",clothObjectArray[i].cloth.particles);
    console.log("particle added",particleAdded);

    currentCut.setListOfIntersectionSorted(intersectionsOrderedWithoutRepetition);
    console.log("cutListClothArray",cutListClothArray[i]);



    

         //first find the index of the element in the border that does not belong to the quad of the next edge meaning 
         // that is should be the first one with the extreme of the cutting line

         //ALSO CONSIDER CASES WHERE THE QUAD GOES JUST OVER 2 CONNECTED QUADS SINCE THE BEND SPRING FAILS. MAYBE IT WOULD BE EASIER IF IT WAS A COMPLETLY DIFFERENT CASE

         //I will detect here is the starting point is inside of a quad. In case it is the next steps should be done without any problem
         //https://erich.realtimerendering.com/ptinpoly
         //I decided to make use of  .containsPoint that is contained in threeJS


         

         //TODO: consider the case where the cut stars in 2 adjacent quads having a single intersection point. the bending spring should be there
//TODO: ADD CASE WHERE THE 2 VERTEX EXTREME INSIDE SAME QUAD NOT CUTTING ANY EDGE
        //TODO:Tomorrow. Casos en que termina en un borde limite y ademas casoS en que sale de una esquina (ESQUINA A ESQUINA. ESQUINA A LADO. ESQUINA A CENTRO). Y casos en que coincide con el lado
        //segment intersect is made in such a way that if the line is exactly on a corner it will consider it as intersecting with both lines. If is is at the end of the line it is also counted. So if the last registered point is in the limit i should not add another 
        // I should make some tests to see if this is working correctly and if not I should add some tolerance to the calculations. This is important because it can cause some problems with the UVs and the constraints if the line is exactly on the edge.
        //TODO: Tomorrow add the different spring mass depending area of triangles it belongs.
        //TODO: tomorrow fix phisics model
        //TODO: tomorrow add undo functionality
        //TODO: Tomorrow add the union Clocth functionality to be able to merge the cutted cloth with other cloth. This should be done by checking the vertices that are in the same position and then merging them. I should also check the constraints that are connected to those vertices and merge them as well. 
        //TODO: TOMORROW: ADD PIECES TO THE CURRENT CLOTH FUNCTIONALITY
        

 
    computeFigureExtreme("fromStart", currentCut,intersectionsOrderedWithoutRepetition, newVertices, newVerticesEdition, filteredTriangs,unfilteredTriangles, filteredTrianglesEditionUVS, filteredTriangles,clothObjectEditionArray[i].cloth.clothGeometry.vertices,clothObjectArray[i].cloth.particles, clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0]);

    computeFigureExtreme("fromEnd", currentCut,intersectionsOrderedWithoutRepetition, newVertices, newVerticesEdition, filteredTriangs,unfilteredTriangles, filteredTrianglesEditionUVS, filteredTriangles,clothObjectEditionArray[i].cloth.clothGeometry.vertices,clothObjectArray[i].cloth.particles, clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0]);

      console.log("intersectionsOrderedWithoutRepetition HELLO", intersectionsOrderedWithoutRepetition);
           
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
              


        //this check to find 2 consecutive intersection that are part of the same figure also works to not include the case when the is not an entire figure
        for (let k=0;k<intersectionsOrderedWithoutRepetition[j-1].amountOfQuadsOrTriangs;k=k+1) //this 2 fors are made to check the 2 interesection that belong to the quad/triang
        {

          for (let l=0;l<intersectionsOrderedWithoutRepetition[j].amountOfQuadsOrTriangs;l=l+1) //intersectionsOrderedWithoutRepetition[j][2] indicates the amount of quad triangs the intersection belongs to
          {
          
            //we have to compare all the combinations but checking they belong to same type and to same quad or triang
            if (intersectionsOrderedWithoutRepetition[j-1].typeFigure[k]===intersectionsOrderedWithoutRepetition[j].typeFigure[l])
            {
              if (intersectionsOrderedWithoutRepetition[j-1].figure[k]===intersectionsOrderedWithoutRepetition[j].figure[l])
              {
               
                  

                if (intersectionsOrderedWithoutRepetition[j-1].typeFigure[k]==="triang")
                {
                    //TODO: triangle case should be considered here including most of quad aspects adapted to here

                    const currentTriangNumber1=intersectionsOrderedWithoutRepetition[j].figure[l][0];
                    const edgeOfIntersection1=intersectionsOrderedWithoutRepetition[j-1].edgeIntersection[k];
                    const edgeOfIntersection2=intersectionsOrderedWithoutRepetition[j].edgeIntersection[l];

                    const newVertex1Edge1Index=intersectionsOrderedWithoutRepetition[j-1].indexVertex[1];
                    const newVertex2Edge1Index=intersectionsOrderedWithoutRepetition[j-1].indexVertex[0];

                   const newVertex1Edge2Index=intersectionsOrderedWithoutRepetition[j].indexVertex[1];
                    const newVertex2Edge2Index=intersectionsOrderedWithoutRepetition[j].indexVertex[0];

                    const verticesEdition=clothObjectEditionArray[i].cloth.clothGeometry.vertices;
                    const vertices=clothObjectArray[i].cloth.clothGeometry.vertices;


                    let sharedVertex;
                    let firstEdge;
                    let secondEdge;
                    let newVertex1firstEdgeIndex;
                    let newVertex2firstEdgeIndex;
                    let newVertex1secondEdgeIndex;
                    let newVertex2secondEdgeIndex;
                    if (edgeOfIntersection1[1]===edgeOfIntersection2[0])
                    {
                      sharedVertex=edgeOfIntersection2[0];
                      firstEdge=edgeOfIntersection1;
                      secondEdge=edgeOfIntersection2;

                      newVertex1firstEdgeIndex=newVertex1Edge1Index;
                      newVertex2firstEdgeIndex=newVertex2Edge1Index;
                      newVertex1secondEdgeIndex=newVertex1Edge2Index;
                      newVertex2secondEdgeIndex=newVertex2Edge2Index;
                    }else if (edgeOfIntersection2[1]===edgeOfIntersection1[0])
                    {
                      sharedVertex=edgeOfIntersection1[0];
                      firstEdge=edgeOfIntersection2;
                      secondEdge=edgeOfIntersection1 ;

                      newVertex1firstEdgeIndex=newVertex2Edge2Index;
                      newVertex2firstEdgeIndex=newVertex1Edge2Index;
                      newVertex1secondEdgeIndex=newVertex2Edge1Index;
                      newVertex2secondEdgeIndex=newVertex1Edge1Index;
                    }

                    const firstVertex=firstEdge[0];
                    const secondVertex=firstEdge[1];
                    const thirdVertex=secondEdge[1];


                    

                      let UVtriangle1= structuredClone(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                    let firstEdgeUV=[0,0];
                    computingEdgeUVTriang (firstEdge, firstEdgeUV, unfilteredTriangles, currentTriangNumber1, UVtriangle1);

                    let secondEdgeUV=[0,0];
                    computingEdgeUVTriang (secondEdge, secondEdgeUV, unfilteredTriangles, currentTriangNumber1, UVtriangle1);



                    let positionCutEdgeProportionFirstEdge=computeProportionEdge(newVerticesEdition[firstEdge[0]],newVerticesEdition[newVertex1firstEdgeIndex], newVerticesEdition[firstEdge[1]]);

                    let xInter1 = firstEdgeUV[0].x + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].x - firstEdgeUV[0].x);
                    let yInter1 = firstEdgeUV[0].y + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].y - firstEdgeUV[0].y);

                    let positionCutEdgeProportionSecondEdge=computeProportionEdge(newVerticesEdition[secondEdge[0]],newVerticesEdition[newVertex1secondEdgeIndex], newVerticesEdition[secondEdge[1]]);
                
                    let xInter2 = secondEdgeUV[0].x + positionCutEdgeProportionSecondEdge * (secondEdgeUV[1].x - secondEdgeUV[0].x);
                    let yInter2 = secondEdgeUV[0].y + positionCutEdgeProportionSecondEdge * (secondEdgeUV[1].y - secondEdgeUV[0].y);

                                          

                    let triangleClone1= new THREE.Face3(newVertex1firstEdgeIndex, firstEdge[1], newVertex1secondEdgeIndex);

                    //this translate to [edgeOfIntersection1[1],edgeOfIntersection2[0],vertex belonging to edge of Intersection 1]
                    //this means that there should be one diagonal from edgeOfIntersection2[0] to the new vertex at position newVerticesEdition.length-2. 
                    // That means that the other diagonal should be from edgeOfIntersection1[1] to the other vertex at newVerticesEdition.length-1

                    filteredTriangles.push(triangleClone1);
                      
                
                    let UVoutput=structuredClone(UVtriangle1);
                    UVoutput[0].x=xInter1;
                    UVoutput[0].y=yInter1
                    UVoutput[1]=firstEdgeUV[1];
                    UVoutput[2].x=xInter2;
                    UVoutput[2].y=yInter2;

                    filteredTrianglesEditionUVS.push(UVoutput);

                    filteredTriangs.push([filteredTriangles.length-1]);  

                    //continue from here
                    
                    let triangleClone2= new THREE.Face3(firstEdge[0], newVertex2firstEdgeIndex,secondEdge[1]);


                    filteredTriangles.push(triangleClone2);
                      
          

                    let UVoutput2=structuredClone(UVtriangle1);
                    UVoutput2[0]=firstEdgeUV[0];
                    UVoutput2[1].x=xInter1;
                    UVoutput2[1].y=yInter1;
                    UVoutput2[2]=secondEdgeUV[1];

                    filteredTrianglesEditionUVS.push(UVoutput2);


                    //start of new triangle calculations


                    let triangleClone3=new THREE.Face3(newVertex2firstEdgeIndex,newVertex2secondEdgeIndex, secondEdge[1]);

                    filteredTriangles.push(triangleClone3);

                    let UVoutput3=structuredClone(UVtriangle1);
                    UVoutput3[0].x=xInter1;
                    UVoutput3[0].y=yInter1;
                    UVoutput3[1].x=xInter2;
                    UVoutput3[1].y=yInter2;
                    UVoutput3[2]=secondEdgeUV[1];

                    filteredTrianglesEditionUVS.push(UVoutput3);
                      //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                    filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);

                    var distanceFirstDiagonal= newVerticesEdition[firstEdge[0]].distanceTo(newVerticesEdition[newVertex2secondEdgeIndex]);
                    addConstraint(clothObjectArray[i].cloth.particles[firstEdge[0]], clothObjectArray[i].cloth.particles[newVertex2secondEdgeIndex], distanceFirstDiagonal, "shear");

                    distanceFirstDiagonal= newVerticesEdition[secondEdge[1]].distanceTo(newVerticesEdition[newVertex2firstEdgeIndex]);
                    addConstraint(clothObjectArray[i].cloth.particles[secondEdge[1]], clothObjectArray[i].cloth.particles[newVertex2firstEdgeIndex], distanceFirstDiagonal, "shear");

                    
                    



                } 
                else if (intersectionsOrderedWithoutRepetition[j-1].typeFigure[k]==="quad")
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

                  if ((edgeOfIntersection1[0]===edgeOfIntersection2[0])||(edgeOfIntersection1[0]===edgeOfIntersection2[1])||(edgeOfIntersection1[1]===edgeOfIntersection2[0])||(edgeOfIntersection1[1]===edgeOfIntersection2[1]))
                  {
                    

                   
                    // generate and extra structural constraint for enabling the new quad split. finally create quads and triangs with their UVs
                    //everything is workin theory on the previous steps since they are independant of the location of the Edge. For this case so I should be focusing on this step

                    //since edges are always clockwise it will be key to see order


                    let sharedVertex;
                    let firstEdge;
                    let secondEdge;
                    let newVertex1firstEdgeIndex;
                    let newVertex2firstEdgeIndex;
                    let newVertex1secondEdgeIndex;
                    let newVertex2secondEdgeIndex;
                    if (edgeOfIntersection1[1]===edgeOfIntersection2[0])
                    {
                      sharedVertex=edgeOfIntersection2[0];
                      firstEdge=edgeOfIntersection1;
                      secondEdge=edgeOfIntersection2;

                      newVertex1firstEdgeIndex=newVertex1Edge1Index;
                      newVertex2firstEdgeIndex=newVertex2Edge1Index;
                      newVertex1secondEdgeIndex=newVertex1Edge2Index;
                      newVertex2secondEdgeIndex=newVertex2Edge2Index;
                    }else if (edgeOfIntersection2[1]===edgeOfIntersection1[0])
                    {
                      sharedVertex=edgeOfIntersection1[0];
                      firstEdge=edgeOfIntersection2;
                      secondEdge=edgeOfIntersection1 ;

                      newVertex1firstEdgeIndex=newVertex2Edge2Index;
                      newVertex2firstEdgeIndex=newVertex1Edge2Index;
                      newVertex1secondEdgeIndex=newVertex2Edge1Index;
                      newVertex2secondEdgeIndex=newVertex1Edge1Index;
                    }
                    //now I need to find the oposite vertex

                    //currentTriangNumber1

                    const setFirstTriang=new Set([unfilteredTriangles[currentTriangNumber1].a, unfilteredTriangles[currentTriangNumber1].b, unfilteredTriangles[currentTriangNumber1].c]);
                    const setSecondTriang=new Set([unfilteredTriangles[currentTriangNumber2].a, unfilteredTriangles[currentTriangNumber2].b, unfilteredTriangles[currentTriangNumber2].c]);
                    const setEdgesCombined= new Set ([edgeOfIntersection1[0],edgeOfIntersection1[1]]).union(new Set ([edgeOfIntersection2[0],edgeOfIntersection2[1]]));
                    const oppositeVertex = setFirstTriang.union(setSecondTriang).difference(setEdgesCombined).values().next().value;
                    const oppositeEdge=[secondEdge[1],oppositeVertex];
                    console.log(setEdgesCombined);
                    console.log(oppositeVertex);
                    console.log (sharedVertex);

                    console.log("firstEdge",firstEdge);
                    console.log("secondEdge",secondEdge);
                    console.log("oppositeEdge",oppositeEdge);
                    clothObjectArray[i].cloth.particles[firstEdge[0]].returnConstraint(clothObjectArray[i].cloth.particles[secondEdge[1]],"shear").removeSpring();
                    clothObjectArray[i].cloth.particles[sharedVertex].returnConstraint(clothObjectArray[i].cloth.particles[oppositeVertex],"shear").removeSpring();

                    

                      let UVtriangle1= structuredClone(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                      let UVtriangle2= structuredClone(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber2]);

    



                      let firstEdgeUV=[0,0];
                      computingEdgeUVQuad (firstEdge, firstEdgeUV, unfilteredTriangles, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

                      
                      let oppositeEdgeUV=[0,0];
                      computingEdgeUVQuad (oppositeEdge, oppositeEdgeUV,unfilteredTriangles, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

                      console.log(firstEdgeUV);
                      

                    let positionCutEdgeProportionFirstEdge=computeProportionEdge(newVerticesEdition[firstEdge[0]],newVerticesEdition[newVertex1firstEdgeIndex], newVerticesEdition[firstEdge[1]]);

                    let xInter1 = firstEdgeUV[0].x + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].x - firstEdgeUV[0].x);
                    let yInter1 = firstEdgeUV[0].y + positionCutEdgeProportionFirstEdge * (firstEdgeUV[1].y - firstEdgeUV[0].y);

                    let positionCutEdgeProportionSecondEdge=computeProportionEdge(newVerticesEdition[secondEdge[0]],newVerticesEdition[newVertex1secondEdgeIndex], newVerticesEdition[secondEdge[1]]);
                
                    let xInter2 = firstEdgeUV[1].x + positionCutEdgeProportionSecondEdge * (oppositeEdgeUV[0].x - firstEdgeUV[1].x);
                    let yInter2 = firstEdgeUV[1].y + positionCutEdgeProportionSecondEdge * (oppositeEdgeUV[0].y - firstEdgeUV[1].y);

                    console.log("xInter1",xInter1);
                    console.log("yInter1",yInter1);
                    console.log("xInter2",xInter2);
                    console.log("yInter2",yInter2);
                    console.log("positionCutEdgeProportionEdge1",positionCutEdgeProportionFirstEdge);
                    console.log("positionCutEdgeProportionEdge2",positionCutEdgeProportionSecondEdge);

                      
                    let triangleClone1= new THREE.Face3(newVertex1firstEdgeIndex, firstEdge[1], newVertex1secondEdgeIndex);

                      //this translate to [edgeOfIntersection1[1],edgeOfIntersection2[0],vertex belonging to edge of Intersection 1]
                      //this means that there should be one diagonal from edgeOfIntersection2[0] to the new vertex at position newVerticesEdition.length-2. 
                      // That means that the other diagonal should be from edgeOfIntersection1[1] to the other vertex at newVerticesEdition.length-1

                      filteredTriangles.push(triangleClone1);
                      
                
                      let UVoutput=structuredClone(UVtriangle1);
                      UVoutput[0].x=xInter1;
                      UVoutput[0].y=yInter1
                      UVoutput[1]=firstEdgeUV[1];
                      UVoutput[2].x=xInter2;
                      UVoutput[2].y=yInter2;

                      filteredTrianglesEditionUVS.push(UVoutput);

                      filteredTriangs.push([filteredTriangles.length-1]);


                    
                      //continue from here making the quad
                      let triangleClone2= new THREE.Face3(firstEdge[0], oppositeEdge[0],oppositeEdge[1]);


                      filteredTriangles.push(triangleClone2);
                      
          

                      let UVoutput2=structuredClone(UVtriangle1);
                      UVoutput2[0]=firstEdgeUV[0];
                      UVoutput2[1]=oppositeEdgeUV[0];
                      UVoutput2[2]=oppositeEdgeUV[1];


                      filteredTrianglesEditionUVS.push(UVoutput2);


                      //start of new triangle calculations


                      let triangleClone3=new THREE.Face3(firstEdge[0],newVertex2firstEdgeIndex, oppositeEdge[0]);

                      filteredTriangles.push(triangleClone3);

                      let UVoutput3=structuredClone(UVtriangle1);
                      UVoutput3[0]=firstEdgeUV[0];
                      UVoutput3[1].x=xInter1;
                      UVoutput3[1].y=yInter1;
                      UVoutput3[2]=oppositeEdgeUV[0];

                      filteredTrianglesEditionUVS.push(UVoutput3);
                      //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                      filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);

                      var distanceFirstDiagonal= newVerticesEdition[firstEdge[0]].distanceTo(newVerticesEdition[oppositeEdge[0]])
                      addConstraint(clothObjectArray[i].cloth.particles[firstEdge[0]], clothObjectArray[i].cloth.particles[oppositeEdge[0]], distanceFirstDiagonal, "shear");

                      distanceFirstDiagonal= newVerticesEdition[oppositeEdge[1]].distanceTo(newVerticesEdition[newVertex2firstEdgeIndex])
                      addConstraint(clothObjectArray[i].cloth.particles[oppositeEdge[1]], clothObjectArray[i].cloth.particles[newVertex2firstEdgeIndex], distanceFirstDiagonal, "shear");

                      const distanceLimitDiagonal= newVerticesEdition[oppositeEdge[0]].distanceTo(newVerticesEdition[newVertex2firstEdgeIndex])
                      addConstraint(clothObjectArray[i].cloth.particles[oppositeEdge[0]], clothObjectArray[i].cloth.particles[newVertex2firstEdgeIndex], distanceLimitDiagonal, "structural");
      

                      let triangleClone4= new THREE.Face3(newVertex2firstEdgeIndex, newVertex2secondEdgeIndex, oppositeEdge[0]);

                      filteredTriangles.push(triangleClone4);
  
                      let UVoutput4=structuredClone(UVtriangle1);
                      UVoutput4[0].x=xInter1;
                      UVoutput4[0].y=yInter1;
                      UVoutput4[1].x=xInter2;
                      UVoutput4[1].y=yInter2;
                      UVoutput4[2]=oppositeEdgeUV[0];

                      filteredTrianglesEditionUVS.push(UVoutput4);

                      filteredTriangs.push([filteredTriangles.length-1]);
                      



                  }else
                  {

                      //remove the shearConstrains in this quad
                  
                    clothObjectArray[i].cloth.particles[edgeOfIntersection1[0]].returnConstraint(clothObjectArray[i].cloth.particles[edgeOfIntersection2[0]],"shear").removeSpring();
                    clothObjectArray[i].cloth.particles[edgeOfIntersection1[1]].returnConstraint(clothObjectArray[i].cloth.particles[edgeOfIntersection2[1]],"shear").removeSpring();
              


                    // CORRECT ORIENTATION FACE FOR NORMAL IS IMPORTANT FOR COLLISION CHECK AND RESOLUTION

                    //TODO: BUILD DIVISION IN QUADS TO ENABLE CUT UNDOING
                    //TODO: configure mass acording to area of quads and triangles of the vertex


                                      //now its important to pay attention to order when reconstructing the triangle

                    //since of edge intersection are in quad sorting order I know for a fact that the second element of one connect with the 1st of the other one. Importatant
                    //to preserve order there too. Second and then last to preserve it. The sequence of edges should be
                    //edgeOfIntersection1 ->completeEdge1->edgeOfIntersection2 ->completeEdge2 and loop there
                    

                      let UVtriangle1= structuredClone(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);
                      let UVtriangle2= structuredClone(clothObjectEditionArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber2]);
                    
                  
                      
                      const completeEdge1= [edgeOfIntersection1[1],edgeOfIntersection2[0]];
                      const completeEdge2= [edgeOfIntersection2[1],edgeOfIntersection1[0]];

                      let completeEdge1UV=[0,0];
                      computingEdgeUVQuad (completeEdge1, completeEdge1UV, unfilteredTriangles, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

                      
                      let completeEdge2UV=[0,0];
                      computingEdgeUVQuad (completeEdge2, completeEdge2UV,unfilteredTriangles, currentTriangNumber1, currentTriangNumber2, UVtriangle1, UVtriangle2);

                      //console.log("completeEdge1UV",completeEdge1UV);
                     // console.log("completeEdge2UV",completeEdge2UV);

                      
            
            
                    let positionCutEdgeProportionEdge1=computeProportionEdge(newVerticesEdition[edgeOfIntersection1[0]],newVerticesEdition[newVertex1Edge1Index], newVerticesEdition[edgeOfIntersection1[1]]);

                    let xInter1 = completeEdge2UV[1].x + positionCutEdgeProportionEdge1 * (completeEdge1UV[0].x - completeEdge2UV[1].x);
                    let yInter1 = completeEdge2UV[1].y + positionCutEdgeProportionEdge1 * (completeEdge1UV[0].y - completeEdge2UV[1].y);

                    let positionCutEdgeProportionEdge2=computeProportionEdge(newVerticesEdition[edgeOfIntersection2[0]],newVerticesEdition[newVertex1Edge2Index], newVerticesEdition[edgeOfIntersection2[1]]);
                
                    let xInter2 = completeEdge1UV[1].x + positionCutEdgeProportionEdge2 * (completeEdge2UV[0].x - completeEdge1UV[1].x);
                    let yInter2 = completeEdge1UV[1].y + positionCutEdgeProportionEdge2 * (completeEdge2UV[0].y - completeEdge1UV[1].y);

    

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
                      
          

                      let UVoutput=structuredClone(UVtriangle1);
                      UVoutput[0]=completeEdge1UV[0];
                      UVoutput[1]=completeEdge1UV[1];
                      UVoutput[2].x=xInter1;
                      UVoutput[2].y=yInter1;

                      filteredTrianglesEditionUVS.push(UVoutput);


                      //start of new triangle calculations


                      let triangleClone2=new THREE.Face3(completeEdge1[1],newVertex1Edge2Index, newVertex1Edge1Index);

                      filteredTriangles.push(triangleClone2);

                      let UVoutput2=structuredClone(UVtriangle1);
                      UVoutput2[0]=completeEdge1UV[1];
                      UVoutput2[1].x=xInter2;
                      UVoutput2[1].y=yInter2;
                      UVoutput2[2].x=xInter1;
                      UVoutput2[2].y=yInter1;

                      filteredTrianglesEditionUVS.push(UVoutput2);
                      //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                      filteredQuads.push([filteredTriangles.length-2,filteredTriangles.length-1]);

                      var distanceFirstDiagonal= newVerticesEdition[completeEdge1[0]].distanceTo(newVerticesEdition[newVertex1Edge2Index])
                      addConstraint(clothObjectArray[i].cloth.particles[completeEdge1[0]], clothObjectArray[i].cloth.particles[newVertex1Edge2Index], distanceFirstDiagonal, "shear");

                      distanceFirstDiagonal= newVerticesEdition[completeEdge1[1]].distanceTo(newVerticesEdition[newVertex1Edge1Index])
                      addConstraint(clothObjectArray[i].cloth.particles[completeEdge1[1]], clothObjectArray[i].cloth.particles[newVertex1Edge1Index], distanceFirstDiagonal, "shear");
      

                      
                      
                      let triangleClone3=new THREE.Face3(completeEdge2[0], completeEdge2[1],newVertex2Edge2Index);

                      filteredTriangles.push(triangleClone3);
                      //filteredTriangles.push(clothObjectArray[i].cloth.clothGeometry.faces[currentTriangNumber1]);

                      let UVoutput3=structuredClone(UVtriangle1);
                      UVoutput3[0]=completeEdge2UV[0];
                      UVoutput3[1]=completeEdge2UV[1];
                      UVoutput3[2].x=xInter2;
                      UVoutput3[2].y=yInter2;

                      filteredTrianglesEditionUVS.push(UVoutput3);
                
                      
                      //filteredTrianglesUVS.push(clothObjectArray[i].cloth.clothGeometry.faceVertexUvs[0][currentTriangNumber1]);


                      let triangleClone4=new THREE.Face3(completeEdge2[1], newVertex2Edge1Index,newVertex2Edge2Index);

                      filteredTriangles.push(triangleClone4);
                      //filteredTriangles.push(clothObjectArray[i].cloth.clothGeometry.faces[currentTriangNumber1]);
                
                      let UVoutput4=structuredClone(UVtriangle1);
                      UVoutput4[0]=completeEdge2UV[1];
                      UVoutput4[1].x=xInter1;
                      UVoutput4[1].y=yInter1;
                      UVoutput4[2].x=xInter2;
                      UVoutput4[2].y=yInter2;

                      filteredTrianglesEditionUVS.push(UVoutput4);
                    
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
        }


       
       

      }



      //console.log(listOfIntersection);
      //console.log(intersectionsOrderedWithoutRepetition);

      //fin de interseccion sin repeticiones

      //TODO: Finish this with triangles
      //this section does that same that is done with quad earlier but with triangs
      /*
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
      */
     
  
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
      clothEdition.triangs=filteredTriangs;

  
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
      clothView.triangs=filteredTriangs;
  
      mesh.cloth=clothView;
  
      clothObjectArray[i].cloth.clothGeometry.dispose();
  
      scene.remove(clothObjectArray[i]);
      clothObjectArray[i]=mesh;
      scene.add(mesh);
  
  
  
    }
  
  }

  
