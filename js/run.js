/* exported run */

function update() {

	//@ifdef VECTOR_FIELD
		fbos.tUniforms.time.value = clock.getElapsedTime();
		fbos.simulate();
		gridShader.uniforms.heightMap.value = fbos.getOutput();
	//@endif

	//@ifdef PARTICLE_FIELD
		FBOC.getPass( 'velocityPass' ).uniforms.time.value = clock.getElapsedTime();
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

	//@ifdef VECTOR_FIELD
		fbos.renderHUD();
	//@endif

	//@ifdef PARTICLE_FIELD
		hud.setInputTexture( FBOC.getPass( 'velocityPass' ).getRenderTarget() );
		hud.render();
	//@endif

	stats.update();

}
