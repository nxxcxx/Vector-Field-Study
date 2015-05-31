/* exported main */

function main() {

	//@ifdef VECTOR_FIELD
		fbos = new FBOS( renderer, 512 );
		grid( 500, 100 );
	//@endif

	//@ifdef PARTICLE_FIELD
		var numParSq = 512;
		FBOC = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
		FBOC.addPass( 'velocityPass', SHADER_CONTAINER.velocity, { positionBuffer: 'positionPass' } );
		FBOC.addPass( 'positionPass', SHADER_CONTAINER.position, { velocityBuffer: 'velocityPass' } );

		psys = new ParticleSystem( numParSq );
		var initialPositionDataTexture = psys.generatePositionTexture();
		FBOC.renderInitialBuffer( initialPositionDataTexture, 'positionPass' );


		hud = new HUD( renderer );

	//@endif

	var boxMesh = new THREE.Mesh( new THREE.BoxGeometry( numParSq, numParSq, numParSq), null );
	cube = new THREE.BoxHelper( boxMesh );
	cube.material.color.set( 0xffffff );
	scene.add( cube );


	initGui();

}
