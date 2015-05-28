varying vec2 vUv;
uniform sampler2D tDiffuse;


void main() {

	// vec3 color = texture2D( tDiffuse, vUv ).rgb;
	vec3 color = texture2D( tDiffuse, vUv ).aaa * 0.5 + 0.5;

	gl_FragColor = vec4( color, 1.0 );

}
