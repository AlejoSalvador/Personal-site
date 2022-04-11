class Recombine
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		
		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( recombineVS, recombineFS );
		gl.useProgram(this.prog);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders e indicamos de que texture obtienen la informacion
		this.sampler = gl.getUniformLocation(this.prog, 'texScreen');
		gl.uniform1i (this.sampler,2);
		this.samplerBlack = gl.getUniformLocation(this.prog, 'texBlack');
		gl.uniform1i (this.samplerBlack,3);
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.aVertexPosition = gl.getAttribLocation( this.prog, 'aVertexPosition' );
		this.aVertexTextureCoords = gl.getAttribLocation( this.prog, 'aVertexTextureCoords' );
		
		// 4. Creamos los buffers

		this.vertices = [    -1.0,-1.0,   	1.0,-1.0,  		-1.0, 1.0, 
		-1.0, 1.0,   	1.0,-1.0,     1.0, 1.0];
		
		this.textureCoords = [     0.0, 0.0,	   1.0, 0.0,     0.0, 1.0,     
		0.0, 1.0,     1.0, 0.0,     1.0, 1.0];
		
		//5. incializamos los buffers
		this.vertexBuffer = gl.createBuffer();
		this.textureBuffer = gl.createBuffer();


	
	

		
	}
	
	
	draw(colorBuffer,blackBuffer)
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		

		//configuramos la textura

		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
		
				gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, blackBuffer);


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

var recombineVS = `
	attribute vec2 aVertexPosition;
	attribute vec2 aVertexTextureCoords;
	
	varying vec2 vTextureCoord;
	void main(void) {    
		vTextureCoord = aVertexTextureCoords;
		gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	}
`;


var recombineFS = `
	precision mediump float;
	uniform sampler2D texScreen;
	uniform sampler2D texBlack;
	varying vec2 vTextureCoord;
	

	void main(void){    
		(texture2D(texBlack, vTextureCoord).x<0.5) ? (gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 )):(gl_FragColor = texture2D(texScreen, vTextureCoord));	
	}
	
	
`;