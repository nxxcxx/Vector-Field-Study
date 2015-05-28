/* exported run */

function update() {

	// fbos.tUniforms.time.value = clock.getElapsedTime();
	// fbos.simulate();
	// gridShader.uniforms.heightMap.value = fbos.getOutput();

	fbor.getPass( 'velocity' ).uniforms.time.value = clock.getElapsedTime();

	fbor.tick();

	psys.setPositionBuffer( fbor.getFinalTarget() );
	psys.material.uniforms.velocityBuffer.value = fbor.getPass( 'velocity' ).getOutputTarget();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();
	update();
	// renderer.render( scene, camera );
	// fbos.renderHUD();

	renderer.render( scene, camera );

	// hud.setInputTexture( fbor.getFinalTarget() );
	// hud.setInputTexture( fbor.getPass( 'velocity' ).getOutputTarget() );
	// hud.render();

	stats.update();

}
