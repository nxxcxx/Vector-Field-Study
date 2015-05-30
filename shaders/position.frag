
uniform vec2 resolution;
uniform sampler2D velocityBuffer;
uniform sampler2D mirrorBuffer;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 pos = texture2D( mirrorBuffer, uv ).xyz;

	vec3 vel = texture2D( velocityBuffer, uv ).xyz;

	pos.xyz += vel.xyz;


	// respawn at random location within spawnSize
	vec3 killRange = vec3( 512.0 ) * 0.5;
	float spawnRange = 25.0;
	if (
		any( greaterThan( pos,  killRange ) ) ||
		any(    lessThan( pos, -killRange ) )
	) {

		pos.x = rand( uv + 111.0 ) * spawnRange - ( spawnRange * 0.5 );
		pos.y = rand( uv + 222.0 ) * spawnRange - ( spawnRange * 0.5 );
		pos.z = rand( uv + 333.0 ) * spawnRange - ( spawnRange * 0.5 );

	}

	gl_FragColor = vec4( pos, 1.0 );

}
