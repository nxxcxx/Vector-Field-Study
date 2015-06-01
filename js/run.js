/* exported run */

function update() {

	uniformsInput.time.value = clock.getElapsedTime();

	FBOC.step();

	psys.setPositionBuffer( FBOC.getPass( 'positionPass' ).getRenderTarget() );
	psys.material.uniforms.velocityBuffer.value = FBOC.getPass( 'velocityPass' ).getRenderTarget();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();

	if ( !sceneSettings.pause ) {
		update();
	}

	renderer.render( scene, camera );

	if ( sceneSettings.showFrameBuffer ) {
		hud.setInputTexture( FBOC.getPass( 'velocityPass' ).getRenderTarget() );
		hud.render();
	}

	stats.update();

}
