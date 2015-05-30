varying vec2 vUv;
uniform sampler2D tDiffuse;


void main() {

	vec3 color = texture2D( tDiffuse, vUv ).rgb * 0.5 + 0.5;
	// vec3 color = texture2D( tDiffuse, vUv ).rgb;

	gl_FragColor = clamp( vec4( color, 1.0 ), 0.0, 1.0 );

}
