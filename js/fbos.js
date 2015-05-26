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

		// wrapS: THREE.MirroredRepeatWrapping,
		// wrapT: THREE.MirroredRepeatWrapping,
		// minFilter: THREE.LinearFilter,
		// magFilter: THREE.LinearFilter,

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
