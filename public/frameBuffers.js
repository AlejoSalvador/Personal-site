// [COMPLETAR] Completar la implementación de esta clase.
class FrameBuffers
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{

		//5.SETTING UP FRAME BUFFER
		var width = canvas.width;
		var height = canvas.height;
		gl.activeTexture(gl.TEXTURE1);
		//1. Init Color Texture
		this.frameTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.frameTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		//Init Depth Buffer
		this.depthBuffer = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.depthBuffer);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
		
			//3. Init Frame Buffer
		this.framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.frameTexture, 0);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthBuffer, 0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.activeTexture(gl.TEXTURE0);
		
		
	}
	//se llama para modificar tamaño del framebuffer al modificar el del canvas
	frameBufferResize()
	{
		//SETTING UP FRAME BUFFER
		gl.useProgram(this.prog);
		var width = canvas.width;
		var height = canvas.height;
		//1. Updating Color Texture
		gl.activeTexture(gl.TEXTURE1);
		
		gl.bindTexture(gl.TEXTURE_2D, this.frameTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); //resize for new width and height
			
		//2. Updating Depth Buffer
		
		gl.bindTexture(gl.TEXTURE_2D, this.depthBuffer);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null); //resize for new width and height
	
		gl.activeTexture(gl.TEXTURE0);
		
	}
	
}


