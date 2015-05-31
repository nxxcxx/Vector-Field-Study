/* exported run */

function update() {

	//@ifdef PARTICLE_FIELD
		uniformsInput.time.value = clock.getElapsedTime();

		FBOC.step();

		psys.setPositionBuffer( FBOC.getPass( 'positionPass' ).getRenderTarget() );
		psys.material.uniforms.velocityBuffer.value = FBOC.getPass( 'velocityPass' ).getRenderTarget();
	//@endif

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();

	if ( !sceneSettings.pause ) {
		update();
	}

	renderer.render( scene, camera );

	//@ifdef PARTICLE_FIELD
		if ( sceneSettings.showFrameBuffer ) {
			hud.setInputTexture( FBOC.getPass( 'velocityPass' ).getRenderTarget() );
			hud.render();
		}
	//@endif

	stats.update();

}
