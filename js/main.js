 /* exported main */

function main() {

   // fbos = new FBOS( renderer, 512 );
   // grid( 500, 100 );



   fbor = new FBOR( renderer, 512, SHADER_CONTAINER.passVert );
   fbor.addPass( 'velocity', SHADER_CONTAINER.velocity );
   fbor.addPass( 'position', SHADER_CONTAINER.position, { velocityBuffer: 'velocity' } );


   psys = new ParticleSystem();
   var initialPositionDataTexture = psys.generatePositionTexture();
   fbor.renderTexture( initialPositionDataTexture, 'position' );


   hud = new HUD( renderer );


   // initGui();

}
