
attribute vec3 here;

uniform sampler2D heightMap;

varying vec3 vcolor;
varying float vcolorIntensity;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 gradient( vec2 p ) {

	float e = 1e-2;
	vec2 dx = vec2( e, 0.0 );
	vec2 dy = vec2( 0.0, e );

	// finite difference approximation
	vec2 res = vec2(
		texture2D( heightMap, p + dx ).r - texture2D( heightMap, p - dx ).r,
		texture2D( heightMap, p + dy ).r - texture2D( heightMap, p - dy ).r
	);

	return res / ( e * 2.0 );

}

void main()	{

	//vcolor = color;
	vcolor = here.z > 0.5 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 );
	vcolorIntensity = here.z > 0.5 ? 1.0 : 0.0;

	vec3 newPosition = position;

	float rAmt = 5.0;
	float rHalf = rAmt/2.0;


	vec3 grad = texture2D( heightMap, here.xy ).rgb;


	if ( here.z > 0.5 ) { // z component used to flag the vertex that will be displaced

		// newPosition.xz += grad.xy * 6.0;
		newPosition.xz += gradient( here.xy ) * 1.0;
		// newPosition.y += 5.0;

	}

	newPosition.y += texture2D( heightMap, here.xy ).r * 50.0;


	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
