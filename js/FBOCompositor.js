/*
 * TODO: Fix updating buffer dependencies
 */
function FBOCompositor( renderer, bufferSize, passThruVertexShader ) {

	this.renderer = renderer;

	this._getWebGLExtensions();
	this.bufferSize = bufferSize;
	this.passThruVertexShader = passThruVertexShader;
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

	_getWebGLExtensions: function() {

		var gl = this.renderer.getContext();
		if ( !gl.getExtension( "OES_texture_float" ) ) {
			console.error( "No support for float textures!" );
		}

		if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
			console.error( "No support for vertex shader textures!" );
		}

	},

	getPass: function ( name ) {
		/* TODO: update to ECMA6 Array.find() */
		var pass = null;
		this.passes.some( function ( currPass ) {

			var test = currPass.name === name;
			if ( test ) pass = currPass;
			return test;

		} );

		if ( pass === null ) console.warn( "FBOCompositor.getPass() should not return null" );
		return pass;

	},

	addPass: function ( name, fragmentSahader, inputTargets ) {

		var pass = new FBOPass( name, this.passThruVertexShader, fragmentSahader, this.bufferSize );
		pass.inputTargetList = inputTargets;
		this.passes.push( pass );
		return pass;

	},

	updatePassDependencies: function () {

		var self = this;
		this.passes.forEach( function ( currPass ) {

			Object.keys( currPass.inputTargetList ).forEach( function ( shaderInputName ) {

				var targetPass = currPass.inputTargetList[ shaderInputName ];
				currPass.setInputTarget( shaderInputName, self.getPass( targetPass ).getRenderTarget() );

			} );

		} );

	},

	_renderPass: function ( shader, passTarget ) {

		this.quad.material = shader;
		this.renderer.render( this.scene, this.camera, passTarget, true );

	},

	renderInitialBuffer: function ( dataTexture, toPass ) {

		var pass = this.getPass( toPass );
		this.passThruShader.uniforms.passTexture.value = dataTexture;
		this._renderPass( this.passThruShader, pass.doubleBuffer[ 1 ] ); // render to secondary buffer which is already set as input to first buffer.
		this._renderPass( this.passThruShader, pass.doubleBuffer[ 0 ] ); // or just render to both
		/*!
		 *	dont call renderer.clear() before updating the simulation it will clear current active buffer which is the render target that we previously rendered to.
		 *	or just set active target to dummy target.
		 */
		this.renderer.setRenderTarget( this.dummyRenderTarget );

	},

	step: function () {

		for ( var i = 0; i < this.passes.length; i++ ) {

			this.updatePassDependencies();
			var currPass = this.passes[ i ];
			this._renderPass( currPass.getShader(), currPass.getRenderTarget() );
			currPass.swapBuffer();

		}

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
