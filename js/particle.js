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
				value: 2.5
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
