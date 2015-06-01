var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	main();
	run();

};

loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded + '/' + total, item );

};

var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );
shaderLoader.showStatus = true;

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	Object.keys( urlObj ).forEach( function ( key ) {

		shaderLoader.load( urlObj[ key ], function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		} );

	} );

};

var SHADER_CONTAINER = {};
shaderLoader.loadMultiple( SHADER_CONTAINER, {

	passVert: 'shaders/pass.vert',
	passFrag: 'shaders/pass.frag',

	hudVert: 'shaders/hud.vert',
	hudFrag: 'shaders/hud.frag',

	particleVert: 'shaders/particle.vert',
	particleFrag: 'shaders/particle.frag',

	velocity: 'shaders/velocity.frag',
	position: 'shaders/position.frag'

} );

var TEXTURES = {};
var textureLoader = new THREE.TextureLoader( loadingManager );
textureLoader.load( 'sprites/electric.png', function ( tex ) {

	TEXTURES.electric = tex;

} );
