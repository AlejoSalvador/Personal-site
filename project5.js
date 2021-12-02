// Estructuras globales e inicializaciones
var boxDrawer;          // clase para contener el comportamiento de la caja
var meshDrawer;         // clase para contener el comportamiento de la malla
var filter; 
var lineWide;
var cantFrameBuffers=7;
var frameBufferArray = new Array(cantFrameBuffers);
var canvas, gl;         // canvas y contexto WebGL
var perspectiveMatrix;	// matriz de perspectiva

var rotX=0, rotY=0, transX=0, transY=0, transZ=3, autorot=0;

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
	recombiner = new Recombine();
	filter = new Filter();
	lineWide=new LineWide();
	paperTexture=new PaperTexture();
	pencilStroke= new PencilStroke();
	

	
	
	for (var i=0;i<cantFrameBuffers;i++)
	{
		frameBufferArray[i]=new FrameBuffers;
	}

	// Setear el tamaño del viewport
	UpdateCanvasSize();
	
	
	//cargar las imagenes a usar en los filtros que imitan dibujos a mano
	var imag = new Image(); 	
	imag.crossOrigin = "anonymous";
	imag.onload = function() { paperTexture.handleTextureLoaded(imag); DrawScene(); }
	imag.src = "https://i.imgur.com/h1I7FJP.jpg";
	
	
	var imag2 = new Image(); 	
	imag2.crossOrigin = "anonymous";
	imag2.onload = function() { pencilStroke.handlePencilTextureLoaded(imag2); DrawScene(); }
	imag2.src = "https://i.imgur.com/0ltQdk7.jpg";
	
	var imag3 = new Image(); 	
	imag3.crossOrigin = "anonymous";
	imag3.onload = function() { pencilStroke.handleShadowTextureLoaded(imag3); DrawScene(); }
	imag3.src = "https://i.imgur.com/WphPKUJ.png";
	
	
	//inicializar correctamente segun las Checkbox
	meshDrawer.showTexture(document.getElementById('show-texture').checked);
	meshDrawer.swapYZ(document.getElementById('swap-yz').checked);
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
	var mv  = GetModelViewMatrix( transX, transY, transZ, rotX, autorot+rotY );
	var mvp = MatrixMult( perspectiveMatrix, mv );

	var translationProyected=MatrixMult( perspectiveMatrix, [transX, transY, 0, 1] );
	
	
		
	// 2. Limpiamos la escena
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	if (edgeShow.checked||paperShow.checked||pencilShow.checked ){
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[0].framebuffer);     //aca guardo en el buffer si y solo si necesito postprocesar
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	}
	// 3. Le pedimos a cada objeto que se dibuje a si mismo
	var nrmTrans = [ mv[0],mv[1],mv[2], mv[4],mv[5],mv[6], mv[8],mv[9],mv[10] ];
	meshDrawer.draw( mvp, mv, nrmTrans, 0 ); //dibuja colores
	
	if ( showBox.checked) {
		boxDrawer.draw( mvp );
	}

	var lastBuffer=0;
	if (paperShow.checked||pencilShow.checked  || planes.checked){
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferArray[6].framebuffer); //para que no interfiera con los buffers
		gl.clearColor(0.5,0.5,-1,1);//inicializa las normales para que la normal del fondo sea perpendicular al mismo
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		gl.clearColor(1,1,1,1);//devuelve clearColor a su valor usual
		meshDrawer.draw( mvp, mv, nrmTrans, 1 ); 			//Calcula areas en sombra y areas que pertenecen al modelo en W. ademas en xyz estan las normales
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
				// Si se mueve el mouse, actualizo las matrices de rotación
				canvas.onmousemove = function() 
				{
					rotY += (cx - event.clientX)/canvas.width*5;
					rotX += (cy - event.clientY)/canvas.height*5;
					cx = event.clientX;
					cy = event.clientY;
					UpdateProjectionMatrix();
					DrawScene();
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
	SetTransparency( document.getElementById('transparency-exp') );
	SetPencilIntensity( document.getElementById('pencil-intensity-exp') );
	ChangeMenu( document.getElementById('menu-select') );
	
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
				autorot += 0.0005 * v;
				if ( autorot > 2*Math.PI ) autorot -= 2*Math.PI;

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
	DrawScene();
}

// Cargar archivo obj
function LoadObj( param )
{
	if ( param.files && param.files[0] ) 
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
			DrawScene();
		}
		reader.readAsText( param.files[0] );
	}
}

// Cargar textura
function LoadTexture( param )
{
	if ( param.files && param.files[0] ) 
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
		reader.readAsDataURL( param.files[0] );
	}
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
		var s = "fino";
	}else if (value==2)
	{
		var s = "medio";
	}else{
		var s = "grueso";
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
	}else
	{
		document.getElementById('cel-shading-label').style.display = "none";
		document.getElementById('cel-shading-value').style.display = "none";
		document.getElementById('cel-shading-exp').style.display = "none";
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
	mv = MatrixMult(mv, zRotation)
	mv = MatrixMult( trans, mv );
	return mv;
}