
attribute vec3 here;

uniform sampler2D heightMap;

varying vec3 vHere;
varying vec3 vcolor;
varying float vcolorInterpolate;



float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()	{

	vHere = here;

	vcolor = here.z > 0.5 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 );
	vcolorInterpolate = here.z > 0.5 ? 1.0 : 0.0;

	vec3 newPosition = position;

	vec3 grad = texture2D( heightMap, here.xy ).rgb;

	if ( here.z > 0.5 ) { // z component use to flag the vertex that will be displaced

		newPosition.xy += clamp( grad.xy * 5.1, -5.1, 5.1 );

	}

	// #define HEIGHT_DISPLACE
	#ifdef HEIGHT_DISPLACE
		newPosition.z += grad.z * 50.0;
	#endif

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
