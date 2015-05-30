
window.addEventListener( 'keypress', function ( event ) {

	var key = event.keyCode;

	switch( key ) {

		case 65:/*A*/
		case 97:/*a*/ sceneSettings.enableGridHelper = !sceneSettings.enableGridHelper; updateHelpers();
		break;

		case 83 :/*S*/
		case 115:/*s*/ sceneSettings.enableAxisHelper = !sceneSettings.enableAxisHelper; updateHelpers();
		break;

	}

} );


var timerID;
window.addEventListener( 'resize', function () {

	clearTimeout( timerID );
	timerID = setTimeout( function () {
		onWindowResize();
	}, 100 );

} );


function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	pixelRatio = window.devicePixelRatio || 1;
	screenRatio = WIDTH/HEIGHT;

	camera.aspect = screenRatio;
	camera.updateProjectionMatrix();

	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );

	//@ifdef VECTOR_FIELD
		fbos.updateHUD();
	//@endif

	//@ifdef PARTICLE_FIELD
		hud.update();
	//@endif

}
