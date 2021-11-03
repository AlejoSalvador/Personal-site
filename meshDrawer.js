

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( meshVS, meshFS );
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mv =  gl.getUniformLocation( this.prog, 'mv' );
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.mn = gl.getUniformLocation( this.prog, 'mn' );
		this.swapM = gl.getUniformLocation( this.prog, 'swapM' );
		this.loadedTexture = gl.getUniformLocation( this.prog, 'loadedTexture' );
		this.celShadingEnabled = gl.getUniformLocation( this.prog, 'celShadingEnabled' );
		this.boolTexture = gl.getUniformLocation( this.prog, 'boolTexture' );
		this.lightDirection = gl.getUniformLocation( this.prog, 'lightDir' );
		this.shininess = gl.getUniformLocation( this.prog, 'shininess' );
		this.CelShadingLevel = gl.getUniformLocation( this.prog, 'CelShadingLevel' );
		this.shadowMode = gl.getUniformLocation( this.prog, 'shadowMode' ); //si esta seteado en 0 dibuja colores. Si esta en 1 marca areas en sombra
		
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.posValue = gl.getAttribLocation( this.prog, 'pos' );
		this.colorValue = gl.getAttribLocation( this.prog, 'color' );
		this.normalsValue = gl.getAttribLocation( this.prog, 'normals' );
		// 4. Creamos los buffers
		this.positionBuffer = gl.createBuffer();
		this.colorBuffer = gl.createBuffer();
		this.normalsBuffer = gl.createBuffer();
		
		
		// asignamos valores a algunas variables uniformes
		gl.useProgram(this.prog);
		var sampler = gl.getUniformLocation(this.prog, 'texGPU');
		gl.uniform1i (sampler,0);
		gl.uniform1i(this.loadedTexture, 0);
		
	}
	//se llama para modificar tamaño del framebuffer al modificar el del canvas
	
	
	//activar o desactivar celShading
	celShading(boolShader)
	{
		gl.useProgram( this.prog );
       	gl.uniform1i(this.celShadingEnabled, boolShader==true);
		
		
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
	setMesh( vertPos, texCoords, normals )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices y otros atributos..
		this.numTriangles = vertPos.length / 3 / 3;
		gl.useProgram(this.prog);
		// 1. Binding y seteo del buffer de vértices
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		// 2. Binding y seteo del buffer de coordenadas de textura	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		// 3. Binding y seteo del buffer de normales	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
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
	draw( matrixMVP, matrixMV, matrixNormal, mode ) 
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		// 2. Setear uniformes con las matrices de transformaciones
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniformMatrix3fv( this.mn, false, matrixNormal );
   		// 3. Habilitar atributos: vértices, normales, texturas
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
		gl.vertexAttribPointer( this.posValue, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.posValue);
   
		gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
		gl.vertexAttribPointer( this.colorValue, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.colorValue);

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalsBuffer );
		gl.vertexAttribPointer( this.normalsValue, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normalsValue);

	
		gl.uniform1i(this.shadowMode, mode);

		
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
		
		
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura
		gl.useProgram( this.prog );

		this.textura = gl.createTexture();
		
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); 

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textura);
		gl.texImage2D(	gl.TEXTURE_2D,
				0,
				gl.RGB,
				gl.RGB,
				gl.UNSIGNED_BYTE,
				img
			     );
		gl.generateMipmap(gl.TEXTURE_2D);

		// [COMPLETAR] Ahora que la textura ya está seteada, debemos setear 
		// parámetros uniformes en el fragment shader para que pueda usarla. 
		gl.uniform1i(this.loadedTexture, 1);
	}
		
        // Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader para indicar si debe o no usar la textura
		gl.useProgram( this.prog );
       	gl.uniform1i(this.boolTexture, show==true);
	}
	
	// Este método se llama al actualizar la dirección de la luz desde la interfaz
	setLightDir( x, y, z )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram( this.prog );
		gl.uniform3fv(this.lightDirection, [x,y,z]);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram( this.prog );
		gl.uniform1f(this.shininess, shininess);

	}
	
	setCelShadingLevel( level )
	{		
		// [COMPLETAR] Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram( this.prog );
		gl.uniform1f(this.CelShadingLevel, level);

	}
	
}



// [COMPLETAR] Calcular iluminación utilizando Blinn-Phong.

// Recordar que: 
// Si declarás las variables pero no las usás, es como que no las declaraste
// y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, 
// incluso si son enteros: ejemplo, para 4 escribimos 4.0.

// Vertex Shader

var meshVS = `
	attribute vec3 pos;
	attribute vec3 normals;
	attribute vec2 color;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat4 swapM;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	void main()
	{ 	
		texCoord = color;
		normCoord = (swapM *vec4(normals,1)).xyz; //debo cambiar la orientacion de las normales si rote el modelo para que sigan teniendo sentido
		vertCoord = -mv * vec4(pos,1);
		gl_Position = mvp * swapM * vec4(pos,1);
	}
`;

// Fragment Shader
// Algunas funciones útiles para escribir este shader:
// Dot product: https://thebookofshaders.com/glossary/?search=dot
// Normalize:   https://thebookofshaders.com/glossary/?search=normalize
// Pow:         https://thebookofshaders.com/glossary/?search=pow


var meshFS = `
	precision mediump float;

	uniform mat3 mn;
	uniform int boolTexture;
	uniform int loadedTexture;
	uniform int celShadingEnabled;
	uniform int shadowMode;
	uniform sampler2D texGPU;
	uniform vec3 lightDir;
	uniform float shininess;
	
	uniform float CelShadingLevel;
	


	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;

	vec4 textureColor()
	{
		if (boolTexture==1 && loadedTexture==1) //ambos son uniform
		{
			return texture2D(texGPU,texCoord);
		}else
		{
			return vec4( 0.5, 0.5, 0.5, 1 );
		}
	}
	
	void main()
	{
		vec4 lightColor = vec4(1, 1, 1, 1);
		vec4 Kd = textureColor();
		vec4 Ks = vec4(1, 1, 1, 1);
		vec4 Ka = Kd * 0.25;

		vec3 normalVector = normalize(mn * normCoord);
		float cos_theta = max(0.0,dot(normalVector, lightDir));
		vec3 h = normalize(lightDir + normalize(vertCoord.xyz));
		float cos_w = pow(max(0.0,dot(normalVector, h)),shininess);
		float steps = CelShadingLevel;
	
		if (shadowMode==0) //al ser un uniform deberia andar rapido
		{
			vec4 diffuse;
			vec4 specular;
			if (celShadingEnabled==1) //es uniform
			{
				diffuse = floor(cos_theta * steps+0.5) / steps * Kd ;
				specular = floor( cos_w * steps+0.5) / steps * Ks;
			}else
			{
				diffuse = Kd * cos_theta;
				specular = Ks * cos_w;
			}
		
			vec4 ambient = Ka;
			gl_FragColor = lightColor * (diffuse + specular +ambient) ; //diffuse + specular
			
			if(cos_theta == 0.0) gl_FragColor = ambient;

			gl_FragColor.w = 1.0;
		}else //if (shadowMode==1)
		{
			if (floor(cos_theta * steps+0.5)<0.5)
			{
				gl_FragColor =vec4((normalVector+1.0)*0.5, 0.0);
			}else
			{
				gl_FragColor =vec4((normalVector+1.0)*0.5, 0.5);   //los clear color son 1 por default
			}
		}
	}
`;
