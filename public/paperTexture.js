

class PaperTexture
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		
		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram(paperVS, paperFS);
		gl.useProgram(this.prog);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders e indicamos de que texture obtienen la informacion
		this.sampler = gl.getUniformLocation(this.prog, 'texScreen');
		gl.uniform1i (this.sampler,2);
		this.samplerPaper = gl.getUniformLocation(this.prog, 'texPaper');
		gl.uniform1i (this.samplerPaper,3);
		
		this.samplerShadows = gl.getUniformLocation(this.prog, 'texShadows');
		gl.uniform1i (this.samplerShadows,4);
		
		this.transparency = gl.getUniformLocation( this.prog, 'transparency' );
		
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
	
	handleTextureLoaded(img){
		gl.useProgram( this.prog );
		this.paperTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, this.paperTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(	gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				img
			     );
		
		gl.activeTexture(gl.TEXTURE0);
	}
	
	changeTransparency(transparencyLevel){
		gl.useProgram( this.prog );
		transparencyLevel=transparencyLevel/100.0;
		gl.uniform1f(this.transparency, transparencyLevel);
	}
	
	draw(colorBuffer, shadowBuffer)
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		
		gl.uniform2f(this.inverseTextureSize, 1.0/canvas.width, 1.0/canvas.height);


		//configuramos la textura

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
		
				gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.paperTexture );
		
				gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, shadowBuffer );


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

var paperVS = `
	attribute vec2 aVertexPosition;
	attribute vec2 aVertexTextureCoords;
	
	varying vec2 vTextureCoord;
	void main(void) {    
		vTextureCoord = aVertexTextureCoords;
		gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	}
`;

var paperFS = `
	precision mediump float;
	uniform sampler2D texScreen;
	uniform sampler2D texPaper;
	uniform sampler2D texShadows;
	uniform float transparency;
	varying vec2 vTextureCoord;
	
	
	vec4 LookupShadows() { 
		return texture2D(texShadows, vTextureCoord);}
	
	vec4 h;
	
	void main(void){    
	
		vec4 originalColor=texture2D(texScreen, vTextureCoord);
		vec4 paperColor=texture2D(texPaper, vTextureCoord);
	
	
		(LookupShadows().w<0.6)?(h=vec4(transparency*originalColor*(paperColor-1.0)+originalColor)):(h=paperColor*originalColor); 
		//esto es una multiplicacion con alpha channel reordenado para usar MAD instructions
		
		h.w=1.0;
		gl_FragColor = h;
	}
	
	
`;