class LineWide
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// [COMPLETAR] inicializaciones

		
		// 1. Compilamos el programa de shaders
		this.prog   = InitShaderProgram( wideVS, wideFS );
		gl.useProgram(this.prog);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders e indicamos de que texture obtienen la informacion
		this.samplerWide = gl.getUniformLocation(this.prog, 'texWide');
		gl.uniform1i (this.samplerWide,2);
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
	

	
	draw(blackBuffer)
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		
		// 1. Seleccionamos el shader
		gl.useProgram( this.prog );
		
		gl.uniform2f(this.inverseTextureSize, 1.0/canvas.width, 1.0/canvas.height);


		//configuramos la textura
		
		gl.activeTexture(gl.TEXTURE2);
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

var wideVS = `
	attribute vec2 aVertexPosition;
	attribute vec2 aVertexTextureCoords;
	
	varying vec2 vTextureCoord;
	void main(void) {    
		vTextureCoord = aVertexTextureCoords;
		gl_Position = vec4(aVertexPosition, 0.0, 1.0);
	}
`;



var wideFS = `
	precision mediump float;
	uniform sampler2D texWide;
	uniform vec2 uInverseTextureSize;
	varying vec2 vTextureCoord;
	vec4 offsetLookupWide(float xOff, float yOff) { 
		return texture2D(texWide, vec2(vTextureCoord.x + xOff*uInverseTextureSize.x, vTextureCoord.y + yOff*uInverseTextureSize.y));}
		
	
	void main(void){    
	
	
		float x=1.0;
		vec4 cercanos[9];
		cercanos[0]=offsetLookupWide(0.0, 0.0);
		cercanos[1]=offsetLookupWide(1.0, 0.0);
		cercanos[2]=offsetLookupWide(-1.0, 0.0);
		cercanos[3]=offsetLookupWide(0.0, 1.0);
		cercanos[4]=offsetLookupWide(0.0, -1.0);
		cercanos[5]=offsetLookupWide(1.0, 1.0);
		cercanos[6]=offsetLookupWide(-1.0, -1.0);
		cercanos[7]=offsetLookupWide(-1.0, 1.0);
		cercanos[8]=offsetLookupWide(1.0, -1.0);
		
		for (int i=0;i<9;i++)
		{
			if (x>cercanos[i].x) x=cercanos[i].x;
		}
		
		
		(x<0.5) ? (gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 )):(gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ));
	
	}
	
	
`;