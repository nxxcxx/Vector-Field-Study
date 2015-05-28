
uniform vec2 resolution;
uniform sampler2D velocityBuffer;
uniform sampler2D mirrorBuffer;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 pos = texture2D( mirrorBuffer, uv ).xyz;

	vec2 texHere = (pos.xz / ( 512.0 * 0.5 )) * 0.5 + 0.5;

	vec2 vel = texture2D( velocityBuffer, texHere ).xy;

	float velScale = 0.03;
	pos.x +=  vel.x * velScale;
	pos.z += -vel.y * velScale;	// y coodinate here is z coordinate in scene so flip it


	float halfDimension = resolution.x * 0.5;
	if ( pos.x > halfDimension || pos.x < -halfDimension ||  pos.z > halfDimension || pos.z < -halfDimension) {
		// respawn at random location
		pos.x = rand( vel.xy + texHere ) * 512.0 - ( 512.0 * 0.5 );
		pos.z = rand( vel.yx + texHere ) * 512.0 - ( 512.0 * 0.5 );
	}



	gl_FragColor = vec4( pos, 1.0 );

}
