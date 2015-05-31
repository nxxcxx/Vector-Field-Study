/* exported main */

function main() {


	//@ifdef PARTICLE_FIELD

		uniformsInput = {
			time     : { type: 'f', value: 0.0 },
			timeMult : { type: 'f', value: 0.05 },
			noiseFreq: { type: 'f', value: 2.5 },
			speed    : { type: 'f', value: 40.0 }
		};

		var numParSq = 512;
		FBOC = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
		FBOC.addPass( 'velocityPass', SHADER_CONTAINER.velocity, { positionBuffer: 'positionPass' } );
		FBOC.addPass( 'positionPass', SHADER_CONTAINER.position, { velocityBuffer: 'velocityPass' } );

		FBOC.getPass( 'velocityPass' ).attachUniform( uniformsInput );


		psys = new ParticleSystem( numParSq );
		var initialPositionDataTexture = psys.generatePositionTexture();
		FBOC.renderInitialBuffer( initialPositionDataTexture, 'positionPass' );


		hud = new HUD( renderer );

	//@endif

	var boxMesh = new THREE.Mesh( new THREE.BoxGeometry( 512, 512, 512 ), null );
	cube = new THREE.BoxHelper( boxMesh );
	cube.material.color.set( 0xffffff );
	scene.add( cube );


	initGui();

}
