function ParticleSystem() {

	this.size = 512;
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

	// this.material = new THREE.PointCloudMaterial( { size: 1 } );
	this.material = new THREE.ShaderMaterial( {

		attributes: {
			here: {
				type: 'v3',
				value: null
			}
		},

		uniforms: {
			dimension: {
				type: 'f',
				value: this.size
			},
			size: {
				type: 'f',
				value: 3.0
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

	var data = new Float32Array( this.size * this.size * 3 );

	for ( var i = 0; i < data.length; i += 3 ) {

		data[ i + 0 ] = THREE.Math.randFloat( -this.halfSize, this.halfSize );
		data[ i + 1 ] = 0;
		data[ i + 2 ] = THREE.Math.randFloat( -this.halfSize, this.halfSize );

	}

	var texture = new THREE.DataTexture( data, this.size, this.size, THREE.RGBFormat, THREE.FloatType );
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.needsUpdate = true;
	texture.flipY = false;

	return texture;

};
