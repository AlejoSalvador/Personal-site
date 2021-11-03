
//ACORDARSE DE EFECTO VENTANA PARA INFORME.


class PencilStroke
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		
		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram(pencilVS, pencilFS);
		gl.useProgram(this.prog);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders e indicamos de que texture obtienen la informacion
		this.sampler = gl.getUniformLocation(this.prog, 'texScreen');
		gl.uniform1i (this.sampler,2);
		this.samplerPencil = gl.getUniformLocation(this.prog, 'texPencil');
		gl.uniform1i (this.samplerPencil,3);
		
		this.samplerShadows = gl.getUniformLocation(this.prog, 'texShadows');
		gl.uniform1i (this.samplerShadows,4);
		
		this.samplerShadowPencil = gl.getUniformLocation(this.prog, 'texShadowPencil');
		gl.uniform1i (this.samplerShadowPencil,5);
		
		this.samplerDepth = gl.getUniformLocation(this.prog, 'texDepth');
		gl.uniform1i (this.samplerDepth,6);
		
		this.transparency = gl.getUniformLocation( this.prog, 'transparency' );
		
		this.transX = gl.getUniformLocation( this.prog, 'transX' );
		this.transY = gl.getUniformLocation( this.prog, 'transY' );
		this.transZ = gl.getUniformLocation( this.prog, 'transZ' );
		
		
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
	
	handlePencilTextureLoaded(img){
		gl.useProgram( this.prog );
		this.pencilTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.pencilTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
		gl.texImage2D(	gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				img
			     );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); 
		gl.activeTexture(gl.TEXTURE0);
	}
	handleShadowTextureLoaded(img){
		gl.useProgram( this.prog );
		this.shadowTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE12);
		gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
		gl.texImage2D(	gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				img
			     );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); 
			gl.activeTexture(gl.TEXTURE0);
	}
	
	changeTransparency(transparencyLevel){
		gl.useProgram( this.prog );
		transparencyLevel=transparencyLevel/100.0
		gl.uniform1f(this.transparency, transparencyLevel);
	}
	
	
	draw(colorBuffer, shadowBuffer,traX,traY, traZ, depthBuffer)
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		

		gl.uniform1f(this.transX, traX); //seteo traslacion
		gl.uniform1f(this.transY, traY); //seteo traslacion
		gl.uniform1f(this.transZ, traZ);

		//configuramos la textura

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
		
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.pencilTexture );
		
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, shadowBuffer );
		
		gl.activeTexture(gl.TEXTURE5);
		gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture );
		
		gl.activeTexture(gl.TEXTURE6);
		gl.bindTexture(gl.TEXTURE_2D, depthBuffer);


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

var pencilVS = `
	attribute vec2 aVertexPosition;
	attribute vec2 aVertexTextureCoords;
	
	varying vec2 vTextureCoord;
	void main(void) {    
		vTextureCoord = aVertexTextureCoords;
		gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	}
`;


var pencilFS = `
	precision mediump float;
	uniform sampler2D texScreen;
	uniform sampler2D texPencil;
	uniform sampler2D texShadows;
	uniform sampler2D texShadowPencil;
	uniform sampler2D texDepth; //la uso para poder calcular la traslacion a realizar
	uniform float transX;
	uniform float transY;
	uniform float transZ;
	uniform float transparency;
	varying vec2 vTextureCoord;

	float near = transZ - 1.74;
	float minn = 0.001;
	float far  = transZ + 1.74; 
	float linearDepth;

	float linearizeDepth(float depth)
	{
		
		 float n = near;
		 float f = far;
		 float z = depth * 2.0 - 1.0; 
		 return (2.0 * n*f) / (f + n - z * (f - n));  
	}
			
	vec4 LookupPencil() { 
		return texture2D(texPencil, vTextureCoord-vec2(transX/linearDepth*0.5,transY/linearDepth*0.5));}  //con esto se consigo la eliminacion del efecto ventana en traslaciones
				
	vec4 LookupShadowPencil() { 
		return texture2D(texShadowPencil, vTextureCoord-vec2(transX/linearDepth*0.5,transY/linearDepth*0.5));}
			
	void main(void){ 
	
	
		vec4 originalColor=texture2D(texScreen, vTextureCoord);

		if (near < minn)
			{near = minn;}
		
		linearDepth=linearizeDepth(texture2D(texDepth, vTextureCoord).x);
		vec4 shadows=texture2D(texShadows, vTextureCoord);
	
		vec4 h;
		
		(shadows.w<0.6)?(h=vec4(transparency*originalColor*(1.2*LookupPencil()-1.0)+originalColor)):(h=originalColor); // estoy subiendo la iluminacion para compensar lo que bajo en la multiplicación.
		//es una multiplicacion alpha reordenada por rendimimiento
		
		if (shadows.w<0.3) h=vec4(transparency*h*(1.8*LookupShadowPencil()-1.0)+h);
		//es una multiplicacion alpha reordenada por rendimimiento
		
		gl_FragColor = vec4(h.xyz,1.0);
		
	}	
`;