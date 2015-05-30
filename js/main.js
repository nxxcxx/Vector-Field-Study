/* exported main */

function main() {

	//@ifdef VECTOR_FIELD
		fbos = new FBOS( renderer, 512 );
		grid( 500, 100 );
	//@endif

	//@ifdef PARTICLE_FIELD
		fbor = new FBOCompositor( renderer, 512, SHADER_CONTAINER.passVert );
		fbor.addPass( 'velocity', SHADER_CONTAINER.velocity );
		fbor.addPass( 'position', SHADER_CONTAINER.position, { velocityBuffer: 'velocity' } );


		psys = new ParticleSystem();
		var initialPositionDataTexture = psys.generatePositionTexture();
		fbor.renderInitialBuffer( initialPositionDataTexture, 'position' );


		hud = new HUD( renderer );

	//@endif

	initGui();

}
