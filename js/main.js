/* exported main */

function main() {

	//@ifdef VECTOR_FIELD
		fbos = new FBOS( renderer, 512 );
		grid( 500, 100 );
	//@endif

	//@ifdef PARTICLE_FIELD
		var numParSq = 512;
		fbor = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
		fbor.addPass( 'velocity', SHADER_CONTAINER.velocity, { positionBuffer: 'position' } );
		fbor.addPass( 'position', SHADER_CONTAINER.position, { velocityBuffer: 'velocity' } );
		fbor.updatePassDependencies();

		psys = new ParticleSystem( numParSq );
		var initialPositionDataTexture = psys.generatePositionTexture();
		fbor.renderInitialBuffer( initialPositionDataTexture, 'position' );


		hud = new HUD( renderer );

	//@endif

	var boxMesh = new THREE.Mesh( new THREE.BoxGeometry( numParSq, numParSq, numParSq), null );
	cube = new THREE.BoxHelper( boxMesh );
	cube.material.color.set( 0xffffff );
	scene.add( cube );


	initGui();

}
