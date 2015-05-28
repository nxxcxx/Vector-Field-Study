varying vec2 vUv;
uniform sampler2D tDiffuse;


void main() {

	gl_FragColor = vec4( texture2D( tDiffuse, vUv ).rgb, 1.0 );

}
