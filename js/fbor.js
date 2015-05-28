function FBOR( renderer, bufferSize, vertexPass ) {

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

	this.passShader = new THREE.ShaderMaterial( {

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

// end of FBOR

FBOR.prototype = {

	tick: function () {

		for ( var i = 0; i < this.passes.length; i++ ) {

			var currPass = this.passes[ i ];
			this.quad.material = currPass.getShader();
			this.renderer.render( this.scene, this.camera, currPass.getOutputTarget() );
			currPass.swapBuffer();

		}

	},

	getFinalTarget: function () {

		var finalPass = this.passes[ this.passes.length - 1 ];
		return finalPass.getOutputTarget();

	},

	getTarget: function ( name ) {

		return this.getPass( name ).getOutputTarget();

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

		var self = this;
		var pass = new FBOPass( name, this.vertexPass, fragmentSahader, this.bufferSize );

		Object.keys( inputTargets || {} ).forEach( function ( shaderInputName ) {

			pass.setInputTarget( shaderInputName, self.getTarget( inputTargets[ shaderInputName ] ) );

		} );

		this.passes.push( pass );
		return pass;

	},

	renderTexture: function ( inputTexture, outPass ) {

		var pass = this.getPass( outPass );
		this.passShader.uniforms.passTexture.value = inputTexture;
		this.quad.material = this.passShader;
		this.renderer.render( this.scene, this.camera, pass.target2 );
		this.renderer.render( this.scene, this.camera, pass.target );


	}


};



function FBOPass( name, vertexShader, fragmentSahader, bufferSize ) {

	this.name = name;
	this.vertexShader = vertexShader;
	this.fragmentSahader = fragmentSahader;
	this.bufferSize = bufferSize;
	this.currentTarget = 1;

	this.target = new THREE.WebGLRenderTarget( this.bufferSize, this.bufferSize, {

		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		stencilBuffer: false,
		depthBuffer: false,

	} );

	this.target2 = this.target.clone();

	this.target.id = 1;
	this.target2.id = 2;

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
			value: this.target2
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
	getOutputTarget: function () {
		return ( this.currentTarget === 1 ) ? this.target : this.target2;
	},
	setInputTarget: function ( shaderInputName, inputTarget ) {
		this.uniforms[ shaderInputName ] = {
			type: 't',
			value: inputTarget
		};
	},
	swapBuffer: function () {

		this.uniforms.mirrorBuffer.value = ( this.currentTarget === 1 ) ? this.target : this.target2;
		this.currentTarget *= -1;

	},
	debugBuffer: function () {
		console.log( this.currentTarget );
		console.log( this.uniforms.mirrorBuffer.value.id );
		console.log( this.getOutputTarget().id );
	}

};


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
