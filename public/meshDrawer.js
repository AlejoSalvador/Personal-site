

//Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( meshVS, meshFS );
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mv =  gl.getUniformLocation( this.prog, 'mv' );
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.mn = gl.getUniformLocation( this.prog, 'mn' );
		this.lightMVP = gl.getUniformLocation( this.prog, 'lightMVP' );
		this.swapM = gl.getUniformLocation( this.prog, 'swapM' );
		this.loadedTexture = gl.getUniformLocation( this.prog, 'loadedTexture' );
		this.celShadingEnabled = gl.getUniformLocation( this.prog, 'celShadingEnabled' );
		this.boolTexture = gl.getUniformLocation( this.prog, 'boolTexture' );
		this.lightDirection = gl.getUniformLocation( this.prog, 'lightDir' );
		this.shininess = gl.getUniformLocation( this.prog, 'shininess' );
		this.CelShadingLevel = gl.getUniformLocation( this.prog, 'CelShadingLevel' );
		this.RimLightTreshold = gl.getUniformLocation( this.prog, 'RimLightTreshold' );
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
		
		this.shadowMap = gl.getUniformLocation(this.prog, 'shadowMap');
		gl.uniform1i (this.shadowMap,1);
		
	}
	
	
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
		//  Actualizar el contenido del buffer de vértices y otros atributos..
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
		//  Setear variables uniformes en el vertex shader
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
	draw( matrixMVP, matrixMV, matrixNormal, lightMVP, shadowMapTexture , mode) 
	{
		//dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		// 2. Setear uniformes con las matrices de transformaciones
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniformMatrix3fv( this.mn, false, matrixNormal );
		gl.uniformMatrix4fv( this.lightMVP, false, lightMVP );
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

		//4.setear uniformes y shadowMap
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, shadowMapTexture);
	
		gl.uniform1i(this.shadowMode, mode);

		
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles * 3 );
		
		gl.disableVertexAttribArray(this.colorValue);
		gl.disableVertexAttribArray( this.normalsValue);
		
		
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture( img )
	{
		// Binding de la textura
		gl.useProgram( this.prog );

		gl.deleteTexture(this.textura)
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

		// Ahora que la textura ya está seteada, debemos setear 
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
		// Setear variables uniformes en el fragment shader para especificar la dirección de la luz
		gl.useProgram( this.prog );
		gl.uniform3fv(this.lightDirection, [x,y,z]);
	}
		
	// Este método se llama al actualizar el brillo del material 
	setShininess( shininess )
	{		
		// Setear variables uniformes en el fragment shader para especificar el brillo.
		gl.useProgram( this.prog );
		gl.uniform1f(this.shininess, shininess);

	}
	
	setCelShadingLevel( level )
	{		
		// Setear variables uniformes en el fragment shader para especificar nivel de cel shading.
		gl.useProgram( this.prog );
		gl.uniform1f(this.CelShadingLevel, level);

	}
	
	SetRimLightTreshold( level )
	{		
		// Setear variables uniformes en el fragment shader para especificar nivel de cel shading.
		gl.useProgram( this.prog );
		gl.uniform1f(this.RimLightTreshold, level);

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
	uniform mat4 lightMVP;
	uniform mat4 swapM;

	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;
	varying vec4 lightSpaceFragPos;

	void main()
	{ 	
		texCoord = color;
		normCoord = (swapM *vec4(normals,1)).xyz; //debo cambiar la orientacion de las normales si rote el modelo para que sigan teniendo sentido
		vertCoord = normalize(-mv * swapM* vec4(pos,1));  //al rotar debo poner las coordenadas correctas del modelo sin perspectiva. normalizo porque se usa normalizado en fragment shader
		
		//fragment position from light perspective. Done here instead of in the fragment to reduce calculations
		lightSpaceFragPos = lightMVP * swapM * vec4(pos,1);
		// perform perspective divide
		vec3 lightSpaceFrag = lightSpaceFragPos.xyz / lightSpaceFragPos.w;
		// transform to [0,1] range
		lightSpaceFragPos = vec4(lightSpaceFrag * 0.5 + 0.5, 1.0);
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
	uniform sampler2D  shadowMap;
	uniform vec3 lightDir;
	uniform float shininess;
	
	uniform float CelShadingLevel;
	uniform float RimLightTreshold;
	


	varying vec2 texCoord;
	varying vec3 normCoord;
	varying vec4 vertCoord;
	varying vec4 lightSpaceFragPos;

	vec4 textureColor()
	{
		
		if (boolTexture==1 && loadedTexture==1) //ambos son uniform
		{
			vec4 itexture;
			itexture=texture2D(texGPU,texCoord);
			return pow(itexture, vec4(2.2));
		}else
		{
			return vec4( 0.3, 0.3, 0.3, 1 );
		}
		
		
	}
	
	float  ShadowCalculation(vec4 projCoords, vec3 normalVector)
	{
	
		// get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
		float closestDepth = texture2D(shadowMap, projCoords.xy).x; 
		// get depth of current fragment from light's perspective
		float currentDepth = projCoords.z;
		//get a bias to prevent shadow acne
		float bias = max(0.01 * (1.0 - dot(normalVector, lightDir)), 0.001); 		
		// check whether current frag pos is in shadow
		float shadow = currentDepth-bias > closestDepth  ? 1.0 : 0.0;
		
		

		return shadow;
		
	}
	
	void main()
	{
		
		vec4 lightColor = vec4(1, 1, 1, 1);
		vec4 Kd = textureColor();
		vec4 Ks = vec4(1, 1, 1, 1);
		vec4 Ka = Kd * 0.25;

		vec3 normalVector = normalize(mn * normCoord);
		float shadow = ShadowCalculation(lightSpaceFragPos,normalVector); 
		normalVector= (gl_FrontFacing)? -normalVector : normalVector; //simplemente da vuelta las cosas que desde el angulo de vision estan dadas vueltas
		//Esto es un pequeño truco para que las caras que cuando las normales se usan a ambos lados se den vuelta si las estoy mirando del otro lado. no tiene sentido ver normales para el otro lado
		normalVector= (dot(normalVector,vertCoord.xyz)<-0.15)? -normalVector : normalVector; //Alternativa sin gl_FrontFacing. tiene un treshold por el tema de que a veces hay errores en los bordes debido a errores en el calculo de normales y prefiero tener errores en la cara de atras que en todo el resto
		//la segunda alternativa corre siempre para solucionar casos con los que me cruce en los que por algun motivo esta mal el winding en algunas partes.
		float cos_theta = max(0.0,dot(normalVector, lightDir));
		float steps = CelShadingLevel;
		
		
		if (shadowMode==0) //al ser un uniform deberia andar rapido
		{
			vec3 h = normalize(lightDir + vertCoord.xyz);
			float cos_w = pow(max(0.0,dot(normalVector, h)),shininess);
			vec4 diffuse;
			vec4 specular;
			float rimIntensity = (1.0 - dot(normalVector, vertCoord.xyz)); //intensity of rim lighting.
			if (celShadingEnabled==1) //es uniform
			{
				diffuse = floor(cos_theta * (1.0-shadow)* steps+0.9) / steps * Kd ;    //de esta manera con steps en 1 muy rapidamente adquiere colores. con otros steps lo hara mas rapido lo cual tiene sentido al tener mas variedad de colores.
				specular = floor( cos_w * (1.0-shadow) * steps+0.6) / steps * Ks;//lo hago mas bajo en el specula porque no quiero que sea tan sensible
				rimIntensity=smoothstep(RimLightTreshold, RimLightTreshold * 1.1, rimIntensity);
			}else
			{
				diffuse = Kd * cos_theta * (1.0-shadow);
				specular = Ks * cos_w * (1.0-shadow);
				rimIntensity=pow(rimIntensity, 0.5);
			}
			
			vec4 rim=rimIntensity*diffuse;
			
			vec4 ambient = Ka;
			vec4 HDRcolor = lightColor * (diffuse + specular +ambient+rim); //diffuse + specular+ambient+rim 
			vec4 mapped= HDRcolor*(1.0+HDRcolor/vec4(1.25*1.25, 1.25*1.25, 1.25*1.25, 1.0))/ (HDRcolor + vec4(1.0));
			//aplico el color mapping de Reinhard para no perder informacion por clamping. Uso de white points 1.25 ya que se que el color no puede ir mas alla de 1.0+0.25=1.25
			//ignoro el specular poque intencionalmente es blanco en el area mas central asi que esta bien que se haga el clamping. Por un motivo similar ignoro la rim light
			//esta es la version extendida de Reinhard. Es importante aclarar que la division y multiplicaciones entre vectores se hace por componentes

			gl_FragColor= pow(mapped, vec4(1.0 / 2.2)); //hago una gamma correction
			//ambos procedimientos se hicieron aca para evitar tener que trabajar con framebuffers que permitan trabajar con HDR sin linear mapping ni tenes que hacer una gamma corection a posterior


			gl_FragColor.w = 1.0;
			
			
		}else //if (shadowMode==1)
		{
			gl_FragColor = (floor(cos_theta * (1.0-shadow) * steps+0.9)<0.1)? vec4((normalVector+1.0)*0.5, 0.0):vec4((normalVector+1.0)*0.5, 0.5);//los clear color son 1 por default
		}
		
		
	}
`;
