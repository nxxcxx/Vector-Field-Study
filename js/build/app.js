// Source: js/loaders.js
var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	main();
	run();

};

loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded + '/' + total, item );

};

var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );
shaderLoader.showStatus = true;

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	Object.keys( urlObj ).forEach( function ( key ) {

		shaderLoader.load( urlObj[ key ], function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		} );

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
	vectorFieldFrag: 'shaders/vectorField.frag',

	particleVert: 'shaders/particle.vert',
	particleFrag: 'shaders/particle.frag',

	velocity: 'shaders/velocity.frag',
	position: 'shaders/position.frag'


} );

var TEXTURES = {};
var textureLoader = new THREE.TextureLoader( loadingManager );
textureLoader.load( 'sprites/electric.png', function ( tex ) {

	TEXTURES.electric = tex;

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

	bgColor: 0x202020,
	enableGridHelper: false,
	enableAxisHelper: true

};

// ---- Scene
	container = document.getElementById( 'canvas-container' );
	scene = new THREE.Scene();

// ---- Camera
	camera = new THREE.PerspectiveCamera( 60, screenRatio, 10, 1000000 );
	// camera orbit control
	cameraCtrl = new THREE.OrbitControls( camera, container );
	cameraCtrl.object.position.z = 800;
	cameraCtrl.update();

// ---- Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );
	renderer.setClearColor( sceneSettings.bgColor, 1.0 );
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

// Source: js/FBOCompositor.js
function FBOCompositor( renderer, bufferSize, vertexPass ) {

	var gl = renderer.getContext();
	if ( !gl.getExtension( "OES_texture_float" ) ) {
		console.error( "No OES_texture_float support for float textures!" );
	}

	if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
		console.error( "No support for vertex shader textures!" );
	}

	this.renderer = renderer;
	this.bufferSize = bufferSize;
	this.vertexPass = vertexPass;
	var halfBufferSize = bufferSize * 0.5;
	this.camera = new THREE.OrthographicCamera( -halfBufferSize, halfBufferSize, halfBufferSize, -halfBufferSize, 1, 10 );
	this.camera.position.z = 5;
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene = new THREE.Scene();
	this.scene.add( this.quad );
	this.dummyRenderTarget = new THREE.WebGLRenderTarget( 2, 2 );

	this.passThruShader = new THREE.ShaderMaterial( {

		uniforms: {
			resolution: {
				type: 'v2',
				value: new THREE.Vector2( this.bufferSize, this.bufferSize )
			},
			passTexture: {
				type: 't',
				value: null
			}
		},
		vertexShader: SHADER_CONTAINER.passVert,
		fragmentShader: SHADER_CONTAINER.passFrag

	} );

	this.passes = [];

}

// end of FBOCompositor

FBOCompositor.prototype = {

	tick: function () {

		for ( var i = 0; i < this.passes.length; i++ ) {

			this.updatePassDependencies();
			var currPass = this.passes[ i ];
			this.renderPass( currPass.getShader(), currPass.getRenderTarget() );
			currPass.swapBuffer();

		}

	},

	getFinalTarget: function () {

		var finalPass = this.passes[ this.passes.length - 1 ];
		return finalPass.getRenderTarget();

	},

	getTarget: function ( name ) {

		return this.getPass( name ).getRenderTarget();

	},

	getPass: function ( name ) {

		var pass = null;
		this.passes.some( function ( currPass ) {

			if ( currPass.name === name ) {
				pass = currPass;
			}
			return currPass.name === name;

		} );

		return pass;

	},

	addPass: function ( name, fragmentSahader, inputTargets ) {

		var pass = new FBOPass( name, this.vertexPass, fragmentSahader, this.bufferSize );
		pass.inputTargetList = inputTargets;
		this.passes.push( pass );
		return pass;

	},

	updatePassDependencies: function () {

		var self = this;
		for ( var i = 0; i < this.passes.length; i++ ) {

			var currPass = this.passes[ i ];
			Object.keys( currPass.inputTargetList || {} ).forEach( function ( shaderInputName ) {

				currPass.setInputTarget( shaderInputName, self.getTarget( currPass.inputTargetList[ shaderInputName ] ) );

			} );

		}

	},

	renderPass: function ( shader, passTarget ) {

		this.quad.material = shader;
		this.renderer.render( this.scene, this.camera, passTarget, true );

	},

	renderInitialBuffer: function ( dataTexture, toPass ) {

		var pass = this.getPass( toPass );
		this.passThruShader.uniforms.passTexture.value = dataTexture;
		this.renderPass( this.passThruShader, pass.doubleBuffer[ 1 ] ); // render to secondary buffer which is already set as input to first buffer.
		this.renderPass( this.passThruShader, pass.doubleBuffer[ 0 ] );
		/*!
		 *	dont call renderer.clear() before updating the simulation it will clear current active buffer which is the render target that we previously rendered to.
		 *	or just set active target to dummy target.
		 */
		this.renderer.setRenderTarget( this.dummyRenderTarget );

	}


};


function FBOPass( name, vertexShader, fragmentSahader, bufferSize ) {

	this.name = name;
	this.vertexShader = vertexShader;
	this.fragmentSahader = fragmentSahader;
	this.bufferSize = bufferSize;

	this.currentBuffer = 0;
	this.doubleBuffer = []; //  single FBO cannot act as input (texture) and output (render target) at the same time, we take the double-buffer approach
	this.doubleBuffer[ 0 ] = this.generateRenderTarget();
	this.doubleBuffer[ 1 ] = this.generateRenderTarget();

	this.inputTargetList = {};

	this.uniforms = {

		resolution: {
			type: 'v2',
			value: new THREE.Vector2( this.bufferSize, this.bufferSize )
		},
		time: {
			type: 'f',
			value: 0
		},
		mirrorBuffer: {
			type: 't',
			value: this.doubleBuffer[ 1 ]
		}

	};

	this.shader = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.vertexShader,
		fragmentShader: this.fragmentSahader

	} );

}

FBOPass.prototype = {

	getShader: function () {
		return this.shader;
	},
	getRenderTarget: function () {
		return this.doubleBuffer[ this.currentBuffer ];
	},
	setInputTarget: function ( shaderInputName, inputTarget ) {
		this.uniforms[ shaderInputName ] = {
			type: 't',
			value: inputTarget
		};
	},
	swapBuffer: function () {

		this.uniforms.mirrorBuffer.value = this.doubleBuffer[ this.currentBuffer ];
		this.currentBuffer ^= 1; // toggle between 0 and 1

	},
	generateRenderTarget: function () {

		var target = new THREE.WebGLRenderTarget( this.bufferSize, this.bufferSize, {

			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false,

		} );

		return target;

	}

};

// Source: js/hud.js

function HUD( renderer ) {

	this.renderer = renderer;
	this.HUDMargin = 0.05;
	var hudHeight = 2.0 / 4.0;
	var hudWidth = hudHeight;

	this.HUDCam = new THREE.OrthographicCamera( -screenRatio, screenRatio, 1, -1, 1, 10 );
	this.HUDCam.position.z = 5;

	this.hudMaterial = new THREE.ShaderMaterial( {

		uniforms: {
			tDiffuse: {
				type: "t",
				value: this.tTarget
			}
		},
		vertexShader: SHADER_CONTAINER.hudVert,
		fragmentShader: SHADER_CONTAINER.hudFrag,
		depthWrite: false,
		depthTest: false,
		side: THREE.DoubleSide

	} );


	this.hudGeo = new THREE.PlaneBufferGeometry( hudWidth, hudHeight );
	this.hudGeo.applyMatrix( new THREE.Matrix4().makeTranslation( hudWidth / 2, hudHeight / 2, 0 ) );

	this.HUDMesh = new THREE.Mesh( this.hudGeo, this.hudMaterial );
	this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
	this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

	this.HUDScene = new THREE.Scene();
	this.HUDScene.add( this.HUDMesh );

}



HUD.prototype = {

	setInputTexture: function ( target ) {

		this.hudMaterial.uniforms.tDiffuse.value = target;

	},

	render: function () {

		this.renderer.clearDepth();
		this.renderer.render( this.HUDScene, this.HUDCam );

	},

	update: function () { // call on window resize

		// match aspect ratio to prevent distortion
		this.HUDCam.left = -screenRatio;
		this.HUDCam.right = screenRatio;

		this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
		this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

		this.HUDCam.updateProjectionMatrix();

	}

};

// Source: js/particle.js
function ParticleSystem( _size ) {

	this.size = _size;
	this.halfSize = this.size * 0.5;

	this.geom = new THREE.BufferGeometry();

	this.position = new Float32Array( this.size * this.size * 3 );

	var vertexHere = [];
	var normalizedSpacing = 1.0 / this.size;
	for ( r = 0; r < this.size; r++ ) {
		for ( c = 0; c < this.size; c++ ) {

			vertexHere.push( [ normalizedSpacing * c, 1.0 - normalizedSpacing * r, 0 ] );

		}
	}

	// transfer to typed array
	var buffHere = new Float32Array( vertexHere.length * 3 );

	for ( i = 0; i < vertexHere.length; i++ ) {

		buffHere[ i * 3 + 0 ] = vertexHere[ i ][ 0 ];
		buffHere[ i * 3 + 1 ] = vertexHere[ i ][ 1 ];
		buffHere[ i * 3 + 2 ] = vertexHere[ i ][ 2 ];

	}

	this.geom.addAttribute( 'here', new THREE.BufferAttribute( buffHere, 3 ) );
	this.geom.addAttribute( 'position', new THREE.BufferAttribute( this.position, 3 ) );
	this.geom.computeBoundingSphere();


	this.material = new THREE.ShaderMaterial( {

		attributes: {
			here: {
				type: 'v3',
				value: null
			}
		},

		uniforms: {
			size: {
				type: 'f',
				value: 2.0
			},
			particleTexture: {
				type: 't',
				value: TEXTURES.electric
			},
			positionBuffer: {
				type: 't',
				value: null
			},
			velocityBuffer: {
				type: 't',
				value: null
			}
		},

		vertexShader: SHADER_CONTAINER.particleVert,
		fragmentShader: SHADER_CONTAINER.particleFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.AdditiveBlending

	} );

	this.particleSystem = new THREE.PointCloud( this.geom, this.material );
	this.particleSystem.frustumCulled = false;
	scene.add( this.particleSystem );

}

ParticleSystem.prototype.setPositionBuffer = function ( inputBuffer ) {

	this.material.uniforms.positionBuffer.value = inputBuffer;

};

ParticleSystem.prototype.generatePositionTexture = function () {

	var data = new Float32Array( this.size * this.size * 4 );

	var fieldSize = 25.0;

	for ( var i = 0; i < data.length; i += 4 ) {

		// position x, y, z, w

		// data[ i + 0 ] = THREE.Math.randFloat( -this.halfSize, this.halfSize );
		// data[ i + 1 ] = THREE.Math.randFloat( -this.halfSize, this.halfSize );
		// data[ i + 2 ] = THREE.Math.randFloat( -this.halfSize, this.halfSize );
		// data[ i + 3 ] = 0.0;

		data[ i + 0 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 1 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 2 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 3 ] = 0.0;

	}

	var texture = new THREE.DataTexture( data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType );
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.needsUpdate = true;

	return texture;

};

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

	var halfBufferSize = bufferSize * 0.5;
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

	this.tQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.tShader );

	this.tScene.add( this.tQuad );

	this.simulate = function () {

		this.tRenderer.render( this.tScene, this.tCamera, this.tTarget );

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
/* exported grid */

function grid( _size, _segment ) {

	gridGeom = new THREE.BufferGeometry();
	var size = _size;
	var segment = _segment;
	var initialHeight = 0;
	var hs = size * 0.5;
	var spc = size / segment;

	var i, r, c;
	// arrange vertices like a grid
	var vertexPositions = [];
	for ( r = 0; r <= segment; r++ ) {
		for ( c = 0; c <= segment; c++ ) {

			vertexPositions.push( [ -hs + spc * c, -hs + spc * r, 0 ] );
			vertexPositions.push( [ -hs + spc * c, -hs + spc * r, initialHeight ] );

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
	 *	  │     /   │
	 *	  │   /     │
	 *	  │ /       │
	 *	  └─────────┘
	 * (0,0)
	 */

	var vertexHere = [];
	var normalizedSpacing = 1.0 / segment;
	for ( r = 0; r <= segment; r++ ) {
		for ( c = 0; c <= segment; c++ ) {

			vertexHere.push( [ normalizedSpacing * c, normalizedSpacing * r, 0 ] );
			vertexHere.push( [ normalizedSpacing * c, normalizedSpacing * r, 1.0 ] ); // flag a vertex to displace in a shader

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
	for ( r = 0; r <= segment; r++ ) {
		for ( c = 0; c <= segment; c++ ) {

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
		// transparent: true,
		// blending: THREE.AdditiveBlending,
		// depthWrite: false
		// depthTest: false,
		// side: THREE.DoubleSide,

	} );

	gridMesh = new THREE.Line( gridGeom, gridShader, THREE.LinePieces );

	scene.add( gridMesh );

}

// Source: js/main.js
/* exported main */

function main() {

		var numParSq = 512;
		fbor = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
		fbor.addPass( 'velocity', SHADER_CONTAINER.velocity, { positionBuffer: 'position' } );
		fbor.addPass( 'position', SHADER_CONTAINER.position, { velocityBuffer: 'velocity' } );
		fbor.updatePassDependencies();

		psys = new ParticleSystem( numParSq );
		var initialPositionDataTexture = psys.generatePositionTexture();
		fbor.renderInitialBuffer( initialPositionDataTexture, 'position' );


		hud = new HUD( renderer );

	var boxMesh = new THREE.Mesh( new THREE.BoxGeometry( numParSq, numParSq, numParSq), null );
	cube = new THREE.BoxHelper( boxMesh );
	cube.material.color.set( 0xffffff );
	scene.add( cube );


	initGui();

}

// Source: js/run.js
/* exported run */

function update() {

		fbor.getPass( 'velocity' ).uniforms.time.value = clock.getElapsedTime();

		fbor.tick();

		psys.setPositionBuffer( fbor.getFinalTarget() );
		psys.material.uniforms.velocityBuffer.value = fbor.getPass( 'velocity' ).getRenderTarget();
}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();
	update();
	renderer.render( scene, camera );

		// hud.setInputTexture( fbor.getFinalTarget() );
		hud.setInputTexture( fbor.getPass( 'velocity' ).getRenderTarget() );
		hud.render();
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

		hud.update();
}

//# sourceMappingURL=app.js.map