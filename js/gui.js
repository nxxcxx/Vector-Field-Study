/* exported gui, gui_display, gui_settings, initGui, updateGuiDisplay */

var gui, gui_display, gui_settings;

function initGui() {

	// gui_settings.add( Object, property, min, max, step ).name( 'name' );

	gui = new dat.GUI();
	gui.width = 300;

	gui_display = gui.addFolder( 'Display' );
		gui_display.autoListen = false;

	gui_settings = gui.addFolder( 'Settings' );
		gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );
		gui_settings.add( camera, 'fov', 25, 120, 1 ).name( 'FOV' );

		gui_settings.add( uniformsInput.timeMult, 'value', 0.0, 0.5, 0.01 ).name( 'Time Multiplier' );
		gui_settings.add( uniformsInput.noiseFreq, 'value', 0.0, 20.0, 0.01 ).name( 'Frequency' );
		gui_settings.add( uniformsInput.speed, 'value', 0.0, 200.0, 0.01 ).name( 'Speed' );
		gui_settings.add( psys.material.uniforms.size, 'value', 0.0, 10.0, 0.01 ).name( 'Size' );
		gui_settings.add( psys.material.uniforms.luminance, 'value', 0.0, 5.0, 0.01 ).name( 'Luminance' );
		gui_settings.add( sceneSettings, 'showFrameBuffer' ).name( 'Show Frame Buffer' );


	gui_display.open();
	gui_settings.open();

	gui_settings.__controllers.forEach( function ( controller ) {
		controller.onChange( updateSettings );
	} );

}

function updateSettings() {

	camera.updateProjectionMatrix();
	renderer.setClearColor( sceneSettings.bgColor , 1.0 );

}

function updateGuiDisplay() {

	gui_display.__controllers.forEach( function ( controller ) {
		controller.updateDisplay();
	} );

}
