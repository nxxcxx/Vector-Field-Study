
uniform sampler2D particleTexture;

varying vec3 vcolor;

void main() {

	vec3 color = vec3( 1.0 );

	vec4 particleColor = texture2D( particleTexture, gl_PointCoord ).rgba;

	color = vec3( 0.2, 0.07, 0.01 ) / particleColor.b;
	particleColor.rgb = mix( vec3(0.0), color, particleColor.b );

	gl_FragColor = particleColor;

}
