

// Completar la implementación de esta clase.
class ShadowMapping
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( shadowVS, shadowFS );
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.lightmvp =  gl.getUniformLocation( this.prog, 'lightmvp' );
		this.swapM = gl.getUniformLocation( this.prog, 'swapM' );
		
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.posValue = gl.getAttribLocation( this.prog, 'pos' );

		// 4. Creamos los buffers
		this.positionBuffer = gl.createBuffer();	
		
	}

	
	// Esta función se llama cada vez que el usuario carga un nuevo
	// archivo OBJ. En los argumentos de esta función llegan un areglo
	// con las posiciones 3D de los vértices, un arreglo 2D con las
	// coordenadas de textura y las normales correspondientes a cada 
	// vértice. Todos los items en estos arreglos son del tipo float. 
	// Los vértices y normales se componen de a tres elementos 
	// consecutivos en el arreglo vertPos [x0,y0,z0,x1,y1,z1,..] y 
	// normals [n0,n0,n0,n1,n1,n1,...]. De manera similar, las 
	// cooredenadas de textura se componen de a 2 elementos 
	// consecutivos y se  asocian a cada vértice en orden. 
	setMesh( vertPos)
	{
		//  Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;
		gl.useProgram(this.prog);
		// 1. Binding y seteo del buffer de vértices
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// Setear variables uniformes en el vertex shader
		var trans;
		if (swap==true){ 
			trans= [
			1, 0, 0, 0,
			0, Math.cos(Math.PI/2), -Math.sin(Math.PI/2), 0,
			0, Math.sin(Math.PI/2), Math.cos(Math.PI/2), 0,
			0, 0, 0, 1
			];
		}else{
			trans= [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
			];
		}
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.swapM, false, trans );
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz model-view-projection (matrixMVP),
	// la matriz model-view (matrixMV) que es retornada por 
	// GetModelViewProjection y la matriz de transformación de las 
	// normales (matrixNormal) que es la inversa transpuesta de matrixMV
	//el modo dice si dibuja colores o marca areas sombreas
	//el mode 1 es decir ShadowMode guarda las areas sombreadas en W y aprovechara x,y, z para que en el mismo llamado se devuelva las normales en el fragmento
	draw( matrixlightMVP ) 
	{
		//dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		// 2. Setear uniformes con las matrices de transformaciones
		gl.uniformMatrix4fv( this.lightmvp, false, matrixlightMVP );
		
   		// 3. Habilitar atributos: vértices, normales, texturas
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
		gl.vertexAttribPointer( this.posValue, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.posValue);
   
	
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
			
	}
	
			
}


// Vertex Shader

var shadowVS = `
	attribute vec3 pos;

	uniform mat4 lightmvp;
	uniform mat4 swapM;

	

	void main()
	{ 		
	
		gl_Position = (lightmvp * swapM * vec4(pos,1));
	}
`;

// Fragment Shader

var shadowFS = `
	precision mediump float;
	void main()
	{
		 // gl_FragDepth = gl_FragCoord.z;
	}
`;
