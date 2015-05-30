
uniform sampler2D heightMap;

varying vec3 vHere;
varying vec3 vcolor;
varying float vcolorInterpolate; // vcolorInterpolate is interpolated value from vertex shader range [0.0, 1.0]

float square(float s) { return s * s; }
vec3 square(vec3 s) { return s * s; }

float map( float x, float a, float b, float c, float d ) {
	return clamp( (x-a)/(b-a)*(d-c) + c, c, d );
}

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 heatmapGradient( float t ) {
	return clamp((pow(abs(t), 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
}

vec3 electricGradient( float t ) {
	return clamp( vec3(t * 8.0 - 6.3, square(smoothstep(0.6, 0.9, t)), pow(t, 3.0) * 1.7), 0.0, 1.0);
}

float easeOutQuint( float t ) {
	return (t=t-1.0)*t*t*t*t + 1.0;
}

void main() {

	vec3 color = vec3( 0.0 );

	#define COLOR
	#ifdef COLOR
		color = electricGradient(  sqrt( vcolorInterpolate ) );
		color.r = 1.0 - texture2D( heightMap, vHere.xy ).b;
	#else
		color = vec3( texture2D( heightMap, vHere.xy ).w );
	#endif

	gl_FragColor = vec4( color, 1.0 );

}
