/* exported run */

function update() {

	fbos.tUniforms.time.value = clock.getElapsedTime();
	fbos.simulate();
	gridShader.uniforms.heightMap.value = fbos.getOutput();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();
	update();
	renderer.render( scene, camera );
	fbos.renderHUD();
	stats.update();

}
