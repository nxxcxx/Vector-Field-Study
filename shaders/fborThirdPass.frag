
uniform vec2 resolution;
uniform sampler2D tInput1;
uniform sampler2D tInput2;

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 color = vec3( 0.0 );
	if ( uv.x > 0.5 ) {
		color = texture2D( tInput1, uv ).rgb;
	} else {
		color = texture2D( tInput2, uv ).rgb;
	}

	gl_FragColor = vec4( color, 1.0 );

}
