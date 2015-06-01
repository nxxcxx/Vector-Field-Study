
uniform vec2 resolution;
uniform sampler2D velocityBuffer;
uniform sampler2D mirrorBuffer;

#define PI 3.141592;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 pos = texture2D( mirrorBuffer, uv ).xyz;

	float life = texture2D( mirrorBuffer, uv ).w;
	life -= 0.2;

	vec3 vel = texture2D( velocityBuffer, uv ).xyz;

	pos.xyz += vel.xyz;


	if ( life <= 0.0 ) {

		float spawnRange = 10.0;
		float r  = rand( uv ) * spawnRange + 5.0;
		float th = rand( uv + 111.0 ) * PI;
		float ph = rand( uv + 222.0 ) * 2.0 * PI;

		pos.x = r * sin( th ) * cos( ph );
		pos.y = r * sin( th ) * sin( ph );
		pos.z = r * cos( th );

		life = rand( uv ) * 250.0 + 350.0;

	}

	// respawn at random location within spawnSize
	// vec3 killRange = vec3( 1500.0 ) * 0.5;
	// float spawnRange = 50.0;
	// if (
	// 	any( greaterThan( pos,  killRange ) ) ||
	// 	any(    lessThan( pos, -killRange ) )
	// 	// length( pos ) > 200.0
	// ) {
	//
	// 	// sphere spawn
	// 	float r =  rand( uv + 000.0 ) * spawnRange;
	// 	float th = rand( uv + 111.0 ) * PI;
	// 	float ph = rand( uv + 222.0 ) * 2.0 * PI;
	//
	// 	pos.x = r * sin( th ) * cos( ph );
	// 	pos.y = r * sin( th ) * sin( ph );
	// 	pos.z = r * cos( th );
	//
	// 	// box spawn
	// 	// pos.x = rand( uv + 111.0 ) * spawnRange - ( spawnRange * 0.5 );
	// 	// pos.y = rand( uv + 222.0 ) * spawnRange - ( spawnRange * 0.5 );
	// 	// pos.z = rand( uv + 333.0 ) * spawnRange - ( spawnRange * 0.5 );
	//
	// }

	gl_FragColor = vec4( pos, life );

}
