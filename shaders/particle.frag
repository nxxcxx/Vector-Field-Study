
uniform sampler2D particleTexture;

varying vec3 vColor;

float square(float s) { return s * s; }
vec3 square(vec3 s) { return s * s; }
vec3 electricGradient(float t) {
	return clamp( vec3(t * 8.0 - 6.3, square(smoothstep(0.6, 0.9, t)), pow(abs(t), 3.0) * 1.7), 0.0, 1.0);
}
vec3 heatmapGradient(float t) {
	return clamp((pow(abs(t), 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
}

float easeOutQuint( float t ) {
	return (t=t-1.0)*t*t*t*t + 1.0;
}
float easeOutQuad( float t ) {
	return -t*(t-2.0);
}
float easeOutCirc( float t ) {
	return sqrt( 1.0 - (t-1.0)*(t-1.0) );
}


void main() {


	vec4 pColor = texture2D( particleTexture, gl_PointCoord ).rgba;

	vec3 luminanceCoef = vec3( 0.299, 0.587, 0.114 );
	float luminance = clamp( dot( pColor.rgb, luminanceCoef ), 0.0, 1.0 );

	float nVel = length( vColor ) * 0.09;

	vec3 colA = vec3( 0.0, 0.0, 0.0 );
	vec3 colB = vec3( 0.02, 0.04, 0.1 );

	// pColor.rgb = mix( colB, colA, nVel );
	// pColor.rgb = sqrt( pColor.rgb ) * luminance;

	pColor.rgb = heatmapGradient( easeOutQuint( nVel ) );

	gl_FragColor = pColor.rgba;

}
