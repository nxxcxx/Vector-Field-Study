// Source: js/loaders.js

var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	main();
	run();

};

loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded+'/'+total, item );

};

var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );
shaderLoader.showStatus = true;

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	Object.keys( urlObj ).forEach( function( key ) {

		shaderLoader.load( urlObj[ key ], function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		});

	} );

};

var SHADER_CONTAINER = {};
shaderLoader.loadMultiple( SHADER_CONTAINER, {

	passVert: 'shaders/pass.vert',
	passFrag: 'shaders/pass.frag',

	hudVert: 'shaders/hud.vert',
	hudFrag: 'shaders/hud.frag',

	vectorFieldSimVert: 'shaders/vectorFieldSim.vert',
	vectorFieldSimFrag: 'shaders/vectorFieldSim.frag',

	vectorFieldVert: 'shaders/vectorField.vert',
	vectorFieldFrag: 'shaders/vectorField.frag'

} );

// Source: js/scene.js
/* exported updateHelpers */

if ( !Detector.webgl ){
	Detector.addGetWebGLMessage();
}

var container, stats;
var scene, light, camera, cameraCtrl, renderer;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
var screenRatio = WIDTH / HEIGHT;
var clock = new THREE.Clock();

// ---- Settings
var sceneSettings = {

	bgColor: 0x606060,
	enableGridHelper: false,
	enableAxisHelper: false

};

// ---- Scene
	container = document.getElementById( 'canvas-container' );
	scene = new THREE.Scene();

// ---- Camera
	camera = new THREE.PerspectiveCamera( 60, screenRatio, 10, 100000 );
	// camera orbit control
	cameraCtrl = new THREE.OrbitControls( camera, container );
	cameraCtrl.object.position.y = 500;
	cameraCtrl.update();

// ---- Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );
	renderer.setClearColor( sceneSettings.bgColor, 1 );
	renderer.autoClear = false;
	container.appendChild( renderer.domElement );

// ---- Stats
	stats = new Stats();
	container.appendChild( stats.domElement );

// ---- grid & axis helper
	var gridHelper = new THREE.GridHelper( 600, 50 );
	gridHelper.setColors( 0 );
	gridHelper.material.opacity = 0.5;
	gridHelper.material.transparent = true;
	gridHelper.position.y = -300;
	scene.add( gridHelper );

	var axisHelper = new THREE.AxisHelper( 50 );
	scene.add( axisHelper );

	function updateHelpers() {
		axisHelper.visible = sceneSettings.enableAxisHelper;
		gridHelper.visible = sceneSettings.enableGridHelper;
	}
	updateHelpers();

// ---- Lights
	// back light
	light = new THREE.DirectionalLight( 0xffffff, 0.8 );
	light.position.set( 100, 230, -100 );
	scene.add( light );

	// hemi
	light = new THREE.HemisphereLight( 0x00ffff, 0x29295e, 1 );
	light.position.set( 370, 200, 20 );
	scene.add( light );

	// ambient
	light = new THREE.AmbientLight( 0x111111 );
	scene.add( light );

// Source: js/gui.js
/* exported gui, gui_display, gui_settings, initGui, updateGuiDisplay */

var gui, gui_display, gui_settings;

function initGui() {

	// gui_settings.add( Object, property, min, max, step ).name( 'name' );

	gui = new dat.GUI();
	gui.width = 300;

	gui_display = gui.addFolder( 'Display' );
	gui_display.autoListen = false;

	gui_settings = gui.addFolder( 'Settings' );
		gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );
		gui_settings.add( camera, 'fov', 25, 120, 1 ).name( 'FOV' );
		gui_settings.add( fbos.tUniforms.noiseScale, 'value', 0.0, 10.0, 0.1 ).name( 'Noise Scale' );

	gui_display.open();
	gui_settings.open();

	gui_settings.__controllers.forEach( function ( controller ) {
		controller.onChange( updateSettings );
	} );

}

function updateSettings() {

	camera.updateProjectionMatrix();
	renderer.setClearColor( sceneSettings.bgColor , 1.0 );

}

function updateGuiDisplay() {

	gui_display.__controllers.forEach( function ( controller ) {
		controller.updateDisplay();
	} );

}

// Source: js/fbos.js
/* exported FBOS, fbos */

var fbos;

function FBOS( renderer, bufferSize ) {

	var gl = renderer.getContext();
	if ( !gl.getExtension( "OES_texture_float" ) ) {
		console.error( "No OES_texture_float support for float textures!" );
	}

	if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
		console.error( "No support for vertex shader textures!" );
	}

	this.tRenderer = renderer;
	this.tBufferSize = bufferSize;

	var halfBufferSize = bufferSize*0.5;
	this.tCamera = new THREE.OrthographicCamera( -halfBufferSize, halfBufferSize, halfBufferSize, -halfBufferSize, 1, 10 );
	this.tCamera.position.z = 5;

	this.tScene = new THREE.Scene();

	this.tTarget = new THREE.WebGLRenderTarget( bufferSize, bufferSize, {

		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		stencilBuffer: false,
		depthBuffer: false,

	} );


	this.tUniforms = {

		time: { type: 'f', value: 0 },
		resolution: { type: 'v2', value: new THREE.Vector2( bufferSize, bufferSize ) },
		noiseScale: { type: 'f', value: 5.0 }

	};

	this.tShader = new THREE.ShaderMaterial( {

		uniforms: this.tUniforms,
		vertexShader: SHADER_CONTAINER.vectorFieldSimVert,
		fragmentShader: SHADER_CONTAINER.vectorFieldSimFrag

	} );

	// test reading and writing to same texture
		this.passTarget = this.tTarget.clone();
		this.passUniforms = {

			resolution: {type: 'v2', value: new THREE.Vector2( bufferSize, bufferSize ) },
			texture: {type: 't', value: this.tTarget}

		};

		this.passShader = new THREE.ShaderMaterial( {

			uniforms: this.passUniforms,
			vertexShader: SHADER_CONTAINER.passVert,
			fragmentShader: SHADER_CONTAINER.passFrag

		} );
		this.passQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.passShader );
		this.passScene = new THREE.Scene();
		this.passScene.add( this.passQuad );
	//


	this.tQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.tShader );

	this.tScene.add( this.tQuad );

	this.simulate = function () {

		this.tRenderer.render( this.tScene, this.tCamera, this.tTarget );

		// this.tRenderer.render( this.passScene, this.tCamera, this.tTarget );

	};

	this.getOutput = function () {

		return this.tTarget;

	};

	// HUD stuff
		this.renderHUD = function () {

			this.tRenderer.clearDepth();
			this.tRenderer.render( this.HUDScene, this.HUDCam );

		};

		this.updateHUD = function() {	// call on window resize

			// match aspect ratio to prevent distortion
			this.HUDCam.left = -screenRatio;
			this.HUDCam.right = screenRatio;

			this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
			this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

			this.HUDCam.updateProjectionMatrix();

		};

		this.createHUD = function() {

			this.HUDMargin = 0.05;
			var hudHeight = 2.0 / 4.0;
			var hudWidth = hudHeight;

			this.HUDCam = new THREE.OrthographicCamera( -screenRatio, screenRatio, 1, -1, 1, 10 );
			this.HUDCam.position.z = 5;

			this.hudMaterial = new THREE.ShaderMaterial( {

				uniforms: { tDiffuse: { type: "t", value: this.tTarget } },
				vertexShader: SHADER_CONTAINER.hudVert,
				fragmentShader: SHADER_CONTAINER.hudFrag,
				depthWrite: false,
				depthTest: false,
				side: THREE.DoubleSide

			} );


			var hudGeo = new THREE.PlaneBufferGeometry( hudWidth, hudHeight );
			hudGeo.applyMatrix( new THREE.Matrix4().makeTranslation( hudWidth / 2, hudHeight / 2, 0 ) );

			this.HUDMesh = new THREE.Mesh( hudGeo, this.hudMaterial );
			this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
			this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

			this.HUDScene = new THREE.Scene();
			this.HUDScene.add( this.HUDMesh );

		};

		this.createHUD();

} // end of class

// Source: js/grid.js
function grid( _size, _step ) {

	gridGeom = new THREE.BufferGeometry();
	var size = _size;
	var step = _step;
	var initialHeight = 0;
	var hs = size / 2;
	var spc = size / ( step - 1 );

	var i, r, c;
	// arrange vertices like a grid
	var vertexPositions = [];
	for ( r = 0; r < step; r++ ) {
		for ( c = 0; c < step; c++ ) {

			vertexPositions.push( [ -hs + spc * c, 0            , -hs + spc * r ] );
			vertexPositions.push( [ -hs + spc * c, initialHeight, -hs + spc * r ] );

		}
	}

	// transfer to typed array
	var buffVerts = new Float32Array( vertexPositions.length * 3 );
	for ( i = 0; i < vertexPositions.length; i++ ) {

		buffVerts[ i * 3 + 0 ] = vertexPositions[ i ][ 0 ];
		buffVerts[ i * 3 + 1 ] = vertexPositions[ i ][ 1 ];
		buffVerts[ i * 3 + 2 ] = vertexPositions[ i ][ 2 ];

	}

	/* store reference position when sampling a texel in a shader
	 *  UV       (1,1)
	 *	  ┌─────────┐
	 *	  │       / │
	 *	  │ f0  /   │
	 *	  │   /  f1 │
	 *	  │ /       │
	 *	  └─────────┘
	 * (0,0)
	 */

	var vertexHere = [];
	var normalizedSpacing = 1.0 / step;
	for ( r = 0; r < step; r++ ) {
		for ( c = 0; c < step; c++ ) {

			vertexHere.push( [ normalizedSpacing * c, 1.0-normalizedSpacing * r, 0 ] );
			vertexHere.push( [ normalizedSpacing * c, 1.0-normalizedSpacing * r, 1.0 ] ); // flag a vertex to displace in a shader

		}
	}

	// transfer to typed array
	var buffHere = new Float32Array( vertexHere.length * 3 );

	for ( i = 0; i < vertexHere.length; i++ ) {

		buffHere[ i * 3 + 0 ] = vertexHere[ i ][ 0 ];
		buffHere[ i * 3 + 1 ] = vertexHere[ i ][ 1 ];
		buffHere[ i * 3 + 2 ] = vertexHere[ i ][ 2 ];

	}



	// vertex color
	var vcolor = [];
	for ( r = 0; r < step; r++ ) {
		for ( c = 0; c < step; c++ ) {

			vcolor.push( [ 1.0, 0.0, 0.0 ] );
			vcolor.push( [ 0.0, 0.0, 1.0 ] );
		}
	}

	var buffColor = new Float32Array( vcolor.length * 3 );

	for ( i = 0; i < vcolor.length; i++ ) {

		buffColor[ i * 3 + 0 ] = vcolor[ i ][ 0 ];
		buffColor[ i * 3 + 1 ] = vcolor[ i ][ 1 ];
		buffColor[ i * 3 + 2 ] = vcolor[ i ][ 2 ];

	}


	gridGeom.addAttribute( 'position', new THREE.BufferAttribute( buffVerts, 3 ) );
	gridGeom.addAttribute( 'here', new THREE.BufferAttribute( buffHere, 3 ) );
	gridGeom.addAttribute( 'color', new THREE.BufferAttribute( buffColor, 3 ) );

	gridGeom.attributes.position.needsUpdate = true;
	gridGeom.attributes.here.needsUpdate = true;
	gridGeom.attributes.color.needsUpdate = true;


	gridShader = new THREE.ShaderMaterial( {

		uniforms: {
			heightMap: {
				type: 't',
				value: null
			},
		},

		attributes: {
			here: {
				type: 'v3',
				value: null
			} // need to specify attributes .addAttribute won't add in here
		},

		vertexShader: SHADER_CONTAINER.vectorFieldVert,
		fragmentShader: SHADER_CONTAINER.vectorFieldFrag,
		vertexColors: THREE.VertexColors,
		// transparent: true,
		// blending: THREE.AdditiveBlending,
		// depthWrite: false
		// depthTest: false,
		// side: THREE.DoubleSide,

	} );

	gridMesh = new THREE.Line( gridGeom, gridShader, THREE.LinePieces );
	gridMesh.position.y = -50;

	scene.add( gridMesh );

}

// Source: js/main.js
 /* exported main */

function main() {

   fbos = new FBOS( renderer, 512 );
   grid( 500, 150 );

   initGui();

}

// Source: js/run.js
/* exported run */

function update() {

	fbos.tUniforms.time.value = clock.getElapsedTime();
	fbos.simulate();
	gridShader.uniforms.heightMap.value = fbos.getOutput();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();
	update();
	renderer.render( scene, camera );
	fbos.renderHUD();
	stats.update();

}

// Source: js/events.js

window.addEventListener( 'keypress', function ( event ) {

	var key = event.keyCode;

	switch( key ) {

		case 65:/*A*/
		case 97:/*a*/ sceneSettings.enableGridHelper = !sceneSettings.enableGridHelper; updateHelpers();
		break;

		case 83 :/*S*/
		case 115:/*s*/ sceneSettings.enableAxisHelper = !sceneSettings.enableAxisHelper; updateHelpers();
		break;

	}

} );


var timerID;
window.addEventListener( 'resize', function () {

	clearTimeout( timerID );
	timerID = setTimeout( function () {
		onWindowResize();
	}, 100 );

} );


function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	pixelRatio = window.devicePixelRatio || 1;
	screenRatio = WIDTH/HEIGHT;

	camera.aspect = screenRatio;
	camera.updateProjectionMatrix();

	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );

	fbos.updateHUD();

}

//# sourceMappingURL=app.js.map