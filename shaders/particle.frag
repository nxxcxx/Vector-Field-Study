
uniform sampler2D particleTexture;

varying vec3 vcolor;


void main() {


	vec4 pColor = texture2D( particleTexture, gl_PointCoord ).rgba;

	vec3 luminanceCoef = vec3( 0.299, 0.587, 0.114 );
	float luminance = dot( pColor.rgb, luminanceCoef );


	vec3 colA = vec3( 0.0, 0.0, 0.02 );
	vec3 colB = vec3( 0.25, 0.06, 0.01 );

	pColor.rgb = mix( colA, colB, luminance*3.0 );

	gl_FragColor = pColor.rgba;

}
