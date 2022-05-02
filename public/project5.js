// Estructuras globales e inicializaciones
var boxDrawer;          // clase para contener el comportamiento de la caja
var meshDrawer;         // clase para contener el comportamiento de la malla
var shadowMapping; 		//clase para calcular el shadowMap
var filter; 
var lineWide;
var cantFrameBuffers=7;
var frameBufferArray = new Array(cantFrameBuffers);
var shadowMapFrameBuffer;
var canvas, gl;         // canvas y contexto WebGL
var perspectiveMatrix;	// matriz de perspectiva
var lightView;

var transX=0, transY=0, transZ=3, lookAtLight=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], rotationMatrix=[-1,0,0,0,0,1,0,0,0,0,-1,0,0,0,0,1];

const shadowMapResolution=2048, lightPerspectiveMatrix=[
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, -1,
		0, 0, 0, 1
	];

//help button	
const button = document.querySelector('button');
const popup = document.querySelector('.popup-wrapper');
const close = document.querySelector('.popup-close');
 
button.addEventListener('click', () => {
    popup.style.display = 'block';
});
 
close.addEventListener('click', () => {
    popup.style.display = 'none';
});
 
popup.addEventListener('click', e => {
    // console.log(e);
    if(e.target.className === 'popup-wrapper') {
        popup.style.display = 'none';
    }
});
	
	
// Funcion de inicialización, se llama al cargar la página
function InitWebGL()
{
	// Inicializamos el canvas WebGL
	canvas = document.getElementById("canvas");
	canvas.oncontextmenu = function() {return false;};
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	
	if (!gl) 
	{
		alert("Imposible inicializar WebGL. Tu navegador quizás no lo soporte.");
		return;
	}
	
	// Inicializar color clear
	gl.clearColor(1,1,1,1);
	gl.enable(gl.DEPTH_TEST); // habilitar test de profundidad 
	
	gl.getExtension('WEBGL_depth_texture');// se necesita para hacer uso del depth buffer

	
	// Inicializar los shaders y buffers para renderizar	
	boxDrawer  = new BoxDrawer();
	meshDrawer = new MeshDrawer();
	shadowMapping = new ShadowMapping();
	recombiner = new Recombine();
	filter = new Filter();
	lineWide=new LineWide();
	paperTexture=new PaperTexture();
	pencilStroke= new PencilStroke();
	

	
	
	for (var i=0;i<cantFrameBuffers;i++)
	{
		frameBufferArray[i]=new FrameBuffers;
	}
	shadowMapFrameBuffer=new ShadowMapFrameBuffer;

	// Setear el tamaño del viewport
	UpdateCanvasSize();
	
	
	//cargar las imagenes a usar en los filtros que imitan dibujos a mano
	var imag = new Image(); 	
	imag.crossOrigin = "anonymous";
	imag.onload = function() { paperTexture.handleTextureLoaded(imag); DrawScene(); }
	imag.src = "https://alejosalvador.com/texturasfiltros/ivory-off-white-paper-texture.jpg";
	
	
	var imag2 = new Image(); 	
	imag2.crossOrigin = "anonymous";
	imag2.onload = function() { pencilStroke.handlePencilTextureLoaded(imag2); DrawScene(); }
	imag2.src = "https://alejosalvador.com/texturasfiltros/pencil.jpg";
	
	var imag3 = new Image(); 	
	imag3.crossOrigin = "anonymous";
	imag3.onload = function() { pencilStroke.handleShadowTextureLoaded(imag3); DrawScene(); }
	imag3.src = "https://alejosalvador.com/texturasfiltros/brushStroke.png";
	
	
	//inicializar correctamente segun las Checkbox
	meshDrawer.showTexture(document.getElementById('show-texture').checked);
	meshDrawer.swapYZ(document.getElementById('swap-yz').checked);
	shadowMapping.swapYZ(document.getElementById('swap-yz').checked);
	meshDrawer.celShading(document.getElementById('cel-shading').checked);
	
	var checking=document.getElementById('auto-rotate') ;
	AutoRotate(checking);
	

	
	ShowBorder(document.getElementById('show-border'));
	CelShading(document.getElementById('cel-shading'));
	SetPaperTexture(document.getElementById('paper-texture'));
	SetPencilTexture(document.getElementById('pencil-texture'));
	
}

// Funcion para actualizar el tamaño de la ventana cada vez que se hace resize
function UpdateCanvasSize()
{
	// 1. Calculamos el nuevo tamaño del viewport
	canvas.style.width  = "100%";
	canvas.style.height = "100%";

	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width  = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;

	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);

	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	
	// 2. Lo seteamos en el contexto WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );

	// 3. Cambian las matrices de proyección, hay que actualizarlas
	UpdateProjectionMatrix();
	
	//debe cambiar el tamaño de las texturas del buffer ya que el canvas cambio de tamaño
	for (var i=0;i<cantFrameBuffers;i++)
	{
		frameBufferArray[i].frameBufferResize();
	}	
	
}

// Calcula la matriz de perspectiva (column-major)
function ProjectionMatrix( c, z, fov_angle=60 )
{
	var r = c.width / c.height;
	var n = (z - 1.74);
	const min_n = 0.001;
	if ( n < min_n ) n = min_n;
	var f = (z + 1.74);;
	var fov = 3.145 * fov_angle / 180;
	var s = 1 / Math.tan( fov/2 );
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}


// Devuelve la matriz de perspectiva (column-major)
function UpdateProjectionMatrix()
{
	perspectiveMatrix = ProjectionMatrix( canvas, transZ );
}






// Funcion que reenderiza la escena. 
function DrawScene()
{
	// 1. Obtenemos las matrices de transformación 
	var mv  = GetModelViewMatrix( transX, transY, transZ, 0, 0 );
	mv=MatrixMult(mv,rotationMatrix)
	var mvp = MatrixMult( perspectiveMatrix, mv );
	var lightMV=MatrixMult( lookAtLight, rotationMatrix );
	var lightmvp = MatrixMult( lightPerspectiveMatrix, lightMV );

	var translationProyected=MatrixMult( perspectiveMatrix, [transX, transY, 0, 1] );
	
	
	gl.viewport( 0, 0, shadowMapResolution, shadowMapResolution );

		//calculamos el shadow map
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFrameBuffer.framebuffer);
	gl.clear(  gl.DEPTH_BUFFER_BIT ); 
	shadowMapping.draw(lightmvp);
	

	gl.viewport( 0, 0, canvas.width, canvas.height );
		
	// 2. Limpiamos la escena
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	
	
	if (edgeShow.checked||paperShow.checked||pencilShow.checked ){
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[0].framebuffer);     //aca guardo en el buffer si y solo si necesito postprocesar
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	}
	// 3. Le pedimos a cada objeto que se dibuje a si mismo
	var nrmTrans = [ mv[0],mv[1],mv[2], mv[4],mv[5],mv[6], mv[8],mv[9],mv[10] ];
	meshDrawer.draw( mvp, mv, nrmTrans, lightmvp, shadowMapFrameBuffer.depthBuffer, 0 ); //dibuja colores
	
	if ( showBox.checked) {
		boxDrawer.draw( mvp );
	}

	var lastBuffer=0;
	if (edgeShow.checked||paperShow.checked||pencilShow.checked){
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[6].framebuffer); //para que no interfiera con los buffers
		gl.clearColor(0.5,0.5,-1,1);//inicializa las normales para que la normal del fondo sea perpendicular al mismo
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		gl.clearColor(1,1,1,1);//devuelve clearColor a su valor usual
		meshDrawer.draw( mvp, mv, nrmTrans, lightmvp, shadowMapFrameBuffer.depthBuffer, 1 ); 			//Calcula areas en sombra y areas que pertenecen al modelo en W. ademas en xyz estan las normales
	}
	
	if (edgeShow.checked){
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[lastBuffer+1].framebuffer);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );                            									  //calcula linea del borde
		filter.draw(frameBufferArray[6].depthBuffer,transZ, planes.checked, frameBufferArray[6].frameTexture, perspectiveMatrix[0], perspectiveMatrix[5]);
		lastBuffer++;
		for (var iter= 2; iter<=document.getElementById('border-exp').value;iter++){
			gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[lastBuffer+1].framebuffer);
			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );                 												  //cada pasada ensancha linea
			lineWide.draw(frameBufferArray[lastBuffer].frameTexture);
			lastBuffer++;
		}
		
		if (paperShow.checked||pencilShow.checked )
			{gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[lastBuffer+1].framebuffer);}
		else {gl.bindFramebuffer(gl.FRAMEBUFFER, null);}
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );																  //aplica la linea del borde		
		recombiner.draw(frameBufferArray[0].frameTexture,frameBufferArray[lastBuffer].frameTexture);
		lastBuffer++;
		
			
	}
	
	
	if (paperShow.checked){
		if (pencilShow.checked)
			{gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[lastBuffer+1].framebuffer);}else
			{gl.bindFramebuffer(gl.FRAMEBUFFER, null);}
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );                                                                    //Aplica textura de papel
		paperTexture.draw(frameBufferArray[lastBuffer].frameTexture, frameBufferArray[6].frameTexture);
		lastBuffer++;
	}
	
	if (pencilShow.checked ){	
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );                                                                     //aplica textura para simular lapiz
		pencilStroke.draw(frameBufferArray[lastBuffer].frameTexture, frameBufferArray[6].frameTexture, translationProyected[0], translationProyected[1], transZ, frameBufferArray[0].depthBuffer);
	}
	

	
}

// Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram( vsSource, fsSource, wgl=gl )
{
	// Función que compila cada shader individualmente
	const vs = CompileShader( wgl.VERTEX_SHADER,   vsSource, wgl );
	const fs = CompileShader( wgl.FRAGMENT_SHADER, fsSource, wgl );

	// Crea y linkea el programa 
	const prog = wgl.createProgram();
	wgl.attachShader(prog, vs);
	wgl.attachShader(prog, fs);
	wgl.linkProgram(prog);

	if (!wgl.getProgramParameter(prog, wgl.LINK_STATUS)) 
	{
		alert('No se pudo inicializar el programa: ' + wgl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader( type, source, wgl=gl )
{
	// Creamos el shader
	const shader = wgl.createShader(type);

	// Lo compilamos
	wgl.shaderSource(shader, source);
	wgl.compileShader(shader);

	// Verificamos si la compilación fue exitosa
	if (!wgl.getShaderParameter( shader, wgl.COMPILE_STATUS) ) 
	{
		alert('Ocurrió un error durante la compilación del shader:' + wgl.getShaderInfoLog(shader));
		wgl.deleteShader(shader);
		return null;
	}

	return shader;
}

// Multiplica 2 matrices y devuelve A*B.
// Los argumentos y el resultado son arreglos que representan matrices en orden column-major
function MatrixMult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) 
	{
		for ( var j=0; j<4; ++j ) 
		{
			var v = 0;
			for ( var k=0; k<4; ++k ) 
			{
				v += A[j+4*k] * B[k+4*i];
			}

			C.push(v);
		}
	}
	return C;
}

// ======== Funciones para el control de la interfaz ========

var showBox;  // boleano para determinar si se debe o no mostrar la caja
var edgeShow; // boleano para determinar si se debe o no mostrar el borde
var paperShow; // boleano para determinar si se debe o no aplicar textura de papel
var	pencilShow; //boleano para determinar si se debe o no simular trazo a mano
var planes; //booleano para determinar si se usa planos para calcular el borde
// Al cargar la página
window.onload = function() 
{
	showBox = document.getElementById('show-box');
	edgeShow = document.getElementById('show-border');
	paperShow = document.getElementById('paper-texture');
	pencilShow = document.getElementById('pencil-texture');
	planes =  document.getElementById('planes');
	
	
	InitWebGL();
	
	// Componente para la luz
	lightView = new LightView();


	// Evento de zoom (ruedita)
	canvas.zoom = function( s ) 
	{
		transZ *= s/canvas.height + 1;
		UpdateProjectionMatrix();
		DrawScene();
	}

	canvas.onwheel = function() { canvas.zoom(0.3*event.deltaY); }
	// Evento de click 
	canvas.onmousedown = function() 
	{
		var cx = event.clientX;
		var cy = event.clientY;
		if ( event.ctrlKey ) 
		{
			canvas.onmousemove = function() 
			{
				canvas.zoom(5*(event.clientY - cy));
				cy = event.clientY;
			}
		}
		else 
		{   
			
			if ( event.altKey ) 
			{
				canvas.onmousemove = function() 
				{
					transX -= (cx - event.clientX)/canvas.width*5;
					transY += (cy - event.clientY)/canvas.height*3;
					cx = event.clientX;
					cy = event.clientY;
					UpdateProjectionMatrix();
					DrawScene();
				}
			}
			else{
				if ( event.shiftKey)
				{
					canvas.onmousemove = function() 
					{
						var rotZ = (cx - event.clientX)/canvas.width*5;
						cx = event.clientX;
						cy = event.clientY;
						var individualRotationMatrix= GetModelViewMatrix( 0, 0, 0, 0, 0, rotZ);
						rotationMatrix=MatrixMult(individualRotationMatrix, rotationMatrix);
						DrawScene();
					}
				}else
				{
					// Si se mueve el mouse, actualizo las matrices de rotación
					canvas.onmousemove = function() 
					{
						var rotY = (cx - event.clientX)/canvas.width*5;
						var rotX = (cy - event.clientY)/canvas.height*5;
						cx = event.clientX;
						cy = event.clientY;
		
						var individualRotationMatrix= GetModelViewMatrix( 0, 0, 0, rotX, rotY);
						rotationMatrix=MatrixMult(individualRotationMatrix, rotationMatrix);
						DrawScene();
					}
				}
			}
		}
	}




	// Evento soltar el mouse
	canvas.onmouseup = canvas.onmouseleave = function() 
	{
		canvas.onmousemove = null;
	}
	
	SetShininess( document.getElementById('shininess-exp') );
	SetThickness( document.getElementById('border-exp') );
	SetCelShadingLevel( document.getElementById('cel-shading-exp') );
	SetRimLightTreshold( document.getElementById('rim-light-treshold') );
	SetTransparency( document.getElementById('transparency-exp') );
	SetPencilIntensity( document.getElementById('pencil-intensity-exp') );
	ChangeMenu( document.getElementById('menu-select') );
	
	fetch('https://alejosalvador.com/models/nyra.obj')
	  .then(response => response.blob())
	  .then(result => {LoadObjStart(new File([result], "name"))
	  })
	

	
	fetch('https://alejosalvador.com/models/nyra.png')
	  .then(response => response.blob())
	  .then(result => {LoadTextureStart(new File([result], "name"))
	  })
	
	var DefaultTextureFile = '/models/nyra.png';
	
	LoadTexture( DefaultTextureFile );
	
	// Dibujo la escena
	DrawScene();
};

// Evento resize
function WindowResize()
{
	UpdateCanvasSize();
	DrawScene();
}

// Control de la calesita de rotación
var timer;
function AutoRotate( param )
{
	// Si hay que girar...
	if ( param.checked ) 
	{
		document.getElementById('rotation-speed').style.display = "block";	
		// Vamos rotando una cantiad constante cada 30 ms
		timer = setInterval( function() 
		{
				var v = document.getElementById('rotation-speed').value;
				var autorot = 0.0005 * v;
				if ( autorot > 2*Math.PI ) autorot -= 2*Math.PI;

				var individualRotationMatrix= GetModelViewMatrix( 0, 0, 0, 0, autorot);
				rotationMatrix=MatrixMult(individualRotationMatrix, rotationMatrix);
				// Reenderizamos
				DrawScene();
			}, 30
		);
		
	} 
	else 
	{
		document.getElementById('rotation-speed').style.display = "none";
		clearInterval( timer );
		
	}
}

// Control de textura visible
function ShowTexture( param )
{
	meshDrawer.showTexture( param.checked );
	DrawScene();
}

// Control de intercambiar y-z
function SwapYZ( param )
{
	meshDrawer.swapYZ( param.checked );
	shadowMapping.swapYZ( param.checked );
	DrawScene();
}

// Cargar archivo obj
function LoadObj( param )
{
	
	if ( param.files && param.files[0] ) 
	{
		LoadObjStart( param.files[0] );
	}
}

// Cargar archivo obj
function LoadObjStart( param )
{
	
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			var mesh = new ObjMesh;
			mesh.parse( e.target.result );
			var box = mesh.getBoundingBox();
			var shift = [
				-(box.min[0]+box.max[0])/2,
				-(box.min[1]+box.max[1])/2,
				-(box.min[2]+box.max[2])/2
			];
			var size = [
				(box.max[0]-box.min[0])/2,
				(box.max[1]-box.min[1])/2,
				(box.max[2]-box.min[2])/2
			];
			var maxSize = Math.max( size[0], size[1], size[2] );
			var scale = 1/maxSize;
			mesh.shiftAndScale( shift, scale );
			var buffers = mesh.getVertexBuffers();
			meshDrawer.setMesh( buffers.positionBuffer, buffers.texCoordBuffer, buffers.normalBuffer );
			shadowMapping.setMesh( buffers.positionBuffer);
			DrawScene();
		}
		reader.readAsText( param );
	
}


// Cargar textura
function LoadTexture( param )
{
	if ( param.files && param.files[0] ) 
	{
		
		LoadTextureStart( param.files[0] );
	}
}

function LoadTextureStart( param )
{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			var img = document.getElementById('texture-img');
			img.onload = function() 
			{
				meshDrawer.setTexture( img );
				DrawScene();
			}
			img.src = e.target.result;
		};
		reader.readAsDataURL( param );
}


// Setear Intensidad
function SetShininess( param )
{
	var exp = param.value;
	var s = Math.pow(10,exp/25);
	document.getElementById('shininess-value').innerText = s.toFixed( s < 10 ? 2 : 0 );
	meshDrawer.setShininess(s);
	DrawScene();
}

// Setear grosor del contorno
function SetThickness( param )
{
	var value = param.value;
	if (value==1)
	{
		var s = "thin";
	}else if (value==2)
	{
		var s = "medium";
	}else{
		var s = "thick";
	}
	
	document.getElementById('border-thickness-value').innerText = s;
	DrawScene();
}
function SetCelShadingLevel( param )
{
	value=param.value;
	document.getElementById('cel-shading-value').innerText = value;
	meshDrawer.setCelShadingLevel(value-1.0);
	DrawScene();
}

function SetRimLightTreshold( param )
{
	value=param.value;
	document.getElementById('rim-light-treshold-value').innerText = value;
	meshDrawer.SetRimLightTreshold(value*0.01);
	DrawScene();
}



function SetTransparency( param )
{
	var s = param.value;
	document.getElementById('transparency-value').innerText = s;
	paperTexture.changeTransparency(s);
	DrawScene();
}

function SetPencilIntensity( param )
{
	var s = param.value;
	document.getElementById('pencil-intensity-value').innerText = s;
	pencilStroke.changeTransparency(s);
	DrawScene();
}


//Usado para mostrar y ocultar menus
function ChangeMenu(param)
{
	var x = document.getElementById('menu1');
	var y = document.getElementById('menu2');
	if (param.checked) {
		x.style.display = "block";
		y.style.display = "none";
	} else {
		x.style.display = "none";
		y.style.display = "block";
	}	
}

// Control para activar o desactivar cel-shader
function CelShading( param )
{

	meshDrawer.celShading( param.checked );
	if (param.checked)
	{
		document.getElementById('cel-shading-label').style.display = "block";
		document.getElementById('cel-shading-value').style.display = "block";
		document.getElementById('cel-shading-exp').style.display = "block";
		document.getElementById('cel-shading-rim-light').style.display = "block";
		document.getElementById('rim-light-treshold-value').style.display = "block";
		document.getElementById('rim-light-treshold').style.display = "block";
	}else
	{
		document.getElementById('cel-shading-label').style.display = "none";
		document.getElementById('cel-shading-value').style.display = "none";
		document.getElementById('cel-shading-exp').style.display = "none";
		document.getElementById('cel-shading-rim-light').style.display = "none";
		document.getElementById('rim-light-treshold-value').style.display = "none";
		document.getElementById('rim-light-treshold').style.display = "none";
	}
	DrawScene();
}

// Control para activar o desactivar la configuracion de bordes
function ShowBorder( param )
{

	if (param.checked)
	{
		document.getElementById('borderSettings').style.display = "block";
	}else
	{
		document.getElementById('borderSettings').style.display = "none";
	}
	DrawScene();
}

function BorderDepth( param )
{

	if (param.checked)
	{
		document.getElementById('planes').checked = false;
	}else
	{
		document.getElementById('planes').checked = true;
	}
	DrawScene();
}

function BorderPlanes( param )
{

	if (param.checked)
	{
		document.getElementById('depth').checked = false;
	}else
	{
		document.getElementById('depth').checked = true;
	}
	DrawScene();
}

function SetPaperTexture( param )
{

	if (param.checked)
	{
		document.getElementById('transparency-label').style.display = "block";
		document.getElementById('transparency-value').style.display = "block";
		document.getElementById('transparency-exp').style.display = "block";
	}else
	{
		document.getElementById('transparency-label').style.display = "none";
		document.getElementById('transparency-value').style.display = "none";
		document.getElementById('transparency-exp').style.display = "none";
	}
	DrawScene();
}

function SetPencilTexture( param )
{

	if (param.checked)
	{
		document.getElementById('pencil-intensity-label').style.display = "block";
		document.getElementById('pencil-intensity-value').style.display = "block";
		document.getElementById('pencil-intensity-exp').style.display = "block";
	}else
	{
		document.getElementById('pencil-intensity-label').style.display = "none";
		document.getElementById('pencil-intensity-value').style.display = "none";
		document.getElementById('pencil-intensity-exp').style.display = "none";
	}
	DrawScene();
}




// Esta función recibe la matriz de proyección (ya calculada), una 
// traslación y dos ángulos de rotación (en radianes). Cada una de 
// las rotaciones se aplican sobre el eje x e y, respectivamente. 
// La función debe retornar la combinación de las transformaciones 
// 3D (rotación, traslación y proyección) en una matriz de 4x4, 
// representada por un arreglo en formato column-major. 

function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY, rotationZ=0 )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var xRotation = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	var yRotation = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	
	var zRotation = [
		Math.cos(rotationZ), Math.sin(rotationZ), 0, 0,
		-Math.sin(rotationZ), Math.cos(rotationZ), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];

	var mv = MatrixMult(xRotation, yRotation);
	mv = MatrixMult(zRotation, mv)
	mv = MatrixMult( trans, mv );
	return mv;
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function lookAt(cameraPosition, target, up) {
  var zAxis = normalize(
     subtractVectors(cameraPosition, target));
  var xAxis = normalize(cross(up, zAxis));
  var yAxis = normalize(cross(zAxis, xAxis));
 
  return [
    xAxis[0], xAxis[1], xAxis[2], 0,
    yAxis[0], yAxis[1], yAxis[2], 0,
    zAxis[0], zAxis[1], zAxis[2], 0,
    cameraPosition[0],
    cameraPosition[1],
    cameraPosition[2],
    1,
  ];
}

function inverse(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
  }