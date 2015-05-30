
uniform vec2 resolution;
uniform sampler2D velocityBuffer;
uniform sampler2D mirrorBuffer;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	float dimension = 512.0;

	vec3 pos = texture2D( mirrorBuffer, uv ).xyz;

	// texel is normalized position range [0, 1]. use to sample velocity texture
	vec2 texel = (pos.xy / ( dimension * 0.5 )) * 0.5 + 0.5;

	vec2 vel = texture2D( velocityBuffer, texel ).xy;


	float velScale = 0.07;
	pos.xy += vel.xy * velScale;

	// #define HEIGHT_DISPLACE
	#ifdef HEIGHT_DISPLACE
		float height = texture2D( velocityBuffer, texel ).w;
		pos.z = height * 15.0;
	#endif

	// respawn at random location
	float halfDimension = resolution.x * 0.5;
	if ( pos.x > halfDimension || pos.x < -halfDimension ||  pos.y > halfDimension || pos.y < -halfDimension) {

		pos.x = rand( vel.xy + texel ) * dimension - ( dimension * 0.5 );
		pos.y = rand( vel.yx + texel ) * dimension - ( dimension * 0.5 );
	}

	gl_FragColor = vec4( pos, 1.0 );

}
