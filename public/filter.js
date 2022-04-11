class Filter
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		
		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( filterVS, filterFS );
		gl.useProgram(this.prog);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders e indicamos de que texture obtienen la informacion
		this.samplerDepth = gl.getUniformLocation(this.prog, 'texDepth');
		gl.uniform1i (this.samplerDepth,3);
		this.samplerNormals = gl.getUniformLocation(this.prog, 'texNormals');
		gl.uniform1i (this.samplerNormals,4);
		
		this.transZ = gl.getUniformLocation( this.prog, 'transZ' );
		this.transformX = gl.getUniformLocation( this.prog, 'transformX' );
		this.transformY = gl.getUniformLocation( this.prog, 'transformY' );
		
		this.borderDetectionMode = gl.getUniformLocation( this.prog, 'borderDetectionMode' );
		
		this.inverseTextureSize = gl.getUniformLocation(this.prog, 'uInverseTextureSize');
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.aVertexPosition = gl.getAttribLocation( this.prog, 'aVertexPosition' );
		this.aVertexTextureCoords = gl.getAttribLocation( this.prog, 'aVertexTextureCoords' );
		
		// 4. Creamos los buffers

		this.vertices = [    -1.0,-1.0,   	1.0,-1.0,  		-1.0, 1.0, 
		-1.0, 1.0,   	1.0,-1.0,     1.0, 1.0];
		
		this.textureCoords = [     0.0, 0.0,	   1.0, 0.0,     0.0, 1.0,     
		0.0, 1.0,     1.0, 0.0,     1.0, 1.0];
		
		//5. Inicializamos los buffers
		this.vertexBuffer = gl.createBuffer();
		this.textureBuffer = gl.createBuffer();
		
	}

	
	draw(depthBuffer,transZ, borderDetectionMode,  normalBuffer,transformX, transformY)
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		
		gl.uniform2f(this.inverseTextureSize, 1.0/canvas.width, 1.0/canvas.height);
		
		gl.uniform1f(this.transZ, transZ);
		gl.uniform1f(this.transformX, transformX);
		gl.uniform1f(this.transformY, transformY);
		
		if (borderDetectionMode==true){
			gl.uniform1i(this.borderDetectionMode, 1);
			}
		else {
			gl.uniform1i(this.borderDetectionMode, 0);
			}
		

		//configuramos la textura

		
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, depthBuffer);

		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, normalBuffer);

   		// 3. Habilitar atributos: vértices, normales, texturas
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		gl.enableVertexAttribArray( this.aVertexPosition);
		gl.vertexAttribPointer( this.aVertexPosition, 2, gl.FLOAT, false, 0, 0 );

   
		gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer );
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
		gl.enableVertexAttribArray( this.aVertexTextureCoords);
		gl.vertexAttribPointer( this.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0 );

		

		gl.drawArrays( gl.TRIANGLES, 0, 6 );
		
		gl.activeTexture(gl.TEXTURE0);
	}
}

var filterVS = `
	attribute vec2 aVertexPosition;
	attribute vec2 aVertexTextureCoords;
	
	varying vec2 vTextureCoord;
	void main(void) {    
		vTextureCoord = aVertexTextureCoords;
		gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	}
`;


var filterFS = `
	precision mediump float;
	uniform sampler2D texDepth;
	uniform sampler2D texNormals;
	uniform vec2 uInverseTextureSize;
	varying vec2 vTextureCoord;
	
	uniform float transZ;
	uniform float transformX;
	uniform float transformY;
	
	uniform int borderDetectionMode;
	
	float near = transZ - 1.74;
	float minn = 0.001;
	float far  = transZ + 1.74; 

	float linearizeDepth(float depth)
	{
		
		 float n = near;
		 float f = far;
		 float z = depth * 2.0 - 1.0; 
		 return (2.0 * n*f) / (f + n - z * (f - n));  
	}
	vec3 spaceTransformXYZ(float x, float y, float linearDepth)
	{
		float xp = x * 2.0 - 1.0;
		float yp= y * 2.0 - 1.0;
		return vec3(xp*linearDepth/transformX,yp*linearDepth/transformY,linearDepth);
		  
	}
	
	float planeDistance(const in vec3 positionA, const in vec3 positionB, const in vec3 normalB) {   // se usa para la version con planos normales
	   vec3 positionDelta = positionB-positionA;
	   float planeDistanceDelta = dot(positionDelta, normalB);
	   return planeDistanceDelta; 
	}
	
		
	float offsetLookupDepth(float xOff, float yOff) { 
		return linearizeDepth(texture2D(texDepth, vec2(vTextureCoord.x + xOff*uInverseTextureSize.x, vTextureCoord.y + yOff*uInverseTextureSize.y)).x);}
		
	vec3 offsetLookupNormal(float xOff, float yOff) { 
		return (texture2D(texNormals, vec2(vTextureCoord.x + xOff*uInverseTextureSize.x, vTextureCoord.y + yOff*uInverseTextureSize.y)).xyz)*2.0-1.0;}
		
	vec3 offsetLookupPosition(float xOff, float yOff) { 
	
		return spaceTransformXYZ(vTextureCoord.x + xOff*uInverseTextureSize.x, vTextureCoord.y + yOff*uInverseTextureSize.y, offsetLookupDepth(xOff, yOff));
	}
	
	void main(void){    
		
		if (near < minn)
			{near = minn;}      
		
		float cercanos[9];
		cercanos[0]=offsetLookupDepth(0.0, 0.0);
		cercanos[1]=offsetLookupDepth(1.0, 0.0);
		cercanos[2]=offsetLookupDepth(-1.0, 0.0);
		cercanos[3]=offsetLookupDepth(0.0, 1.0);
		cercanos[4]=offsetLookupDepth(0.0, -1.0);
		if (borderDetectionMode==0)
		{
			
			
			float x=0.0;
			x=-4.0*cercanos[0];
			for (int i=1;i<=4;i++)
			{
				x+=cercanos[i];
			}
			//ES IMPORTANTE QUE AJUSTE LA DIFERENCIA EN FUNCION DE LA PROFUNDIDAD YA QUE AL ALEJARME LOS PIXELES PASARAN A TENER LA PROFUNIDAD DEL PIXEL ADYACENTE
			x/=	offsetLookupDepth(0.0, 0.0);
			(abs(x)>0.007) ? (gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 )):(gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ));
		}else{
			float planeDist;
			//lo de la condicion de profundidad es para evitar grosor extra. Tuve que normalizar antes las distancias por cosas como traingulos que tambien  uso la backface. visible en nyra
			planeDist = planeDistance(offsetLookupPosition(-1.0, 0.0), offsetLookupPosition(0.0, 0.0), offsetLookupNormal(0.0, 0.0)); 
			planeDist += planeDistance(offsetLookupPosition(1.0, 0.0), offsetLookupPosition(0.0, 0.0), offsetLookupNormal(0.0, 0.0)); 
			planeDist += planeDistance(offsetLookupPosition(0.0, -1.0), offsetLookupPosition(0.0, 0.0), offsetLookupNormal(0.0, 0.0)); 
			planeDist += planeDistance(offsetLookupPosition(0.0, 1.0), offsetLookupPosition(0.0, 0.0), offsetLookupNormal(0.0, 0.0)); 
		
			//ES IMPORTANTE QUE AJUSTE LA PLANE DISTANCE EN FUNCION DE LA PROFUNDIDAD YA QUE AL ALEJARME LOS PIXELES PASARAN A TENER LA PROFUNIDAD DEL PIXEL ADYACENTE
			planeDist/=	offsetLookupDepth(0.0, 0.0);
				
			gl_FragColor = (abs(planeDist)>0.005) ? (vec4( 0.0, 0.0, 0.0, 1.0 )):(vec4( 1.0, 1.0, 1.0, 1.0 ));
		}
		
		
			
		
	}
	
	
	
`;