
attribute vec3 here;

uniform sampler2D heightMap;

varying vec3 vHere;
varying vec3 vcolor;
varying float vcolorIntensity;

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float divergence( vec2 p ) {

	float e = 1e-1;
	float e2 = e*2.0;
	vec2 dx = vec2( e, 0.0 );
	vec2 dy = vec2( 0.0, -e );

	float res = texture2D( heightMap, p + dx ).x - texture2D( heightMap, p - dx ).x
		       + texture2D( heightMap, p + dy ).y - texture2D( heightMap, p - dy ).y;

	return res / e2;

}

void main()	{

	vHere = here;

	//vcolor = color;
	vcolor = here.z > 0.5 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 );
	vcolorIntensity = here.z > 0.5 ? 1.0 : 0.0;

	vec3 newPosition = position;

	vec3 grad = texture2D( heightMap, here.xy ).rgb;

	if ( here.z > 0.5 ) { // z component use to flag the vertex that will be displaced

		newPosition.xz += normalize( grad.xy ) * 6.0;
		// newPosition.y += grad.z * 10.0;

	}

	//	the divergence result should be close to zero because curl of a potential field is divergence free.
	// we are using texture lookup, the potential field is discontinuous at the boundary
	// and the value will not be zero. consider using forward/backward finite differencs

	// float divg = divergence( here.xy );
	// if ( abs( divg ) < 1.0 ) divg = 0.0;	// floating point error
	// newPosition.y += divg * - 1.0;

	newPosition.y += grad.z * 25.0;
	// newPosition.y += grad.z * 25.0;


	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
