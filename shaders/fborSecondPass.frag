
uniform vec2 resolution;
uniform sampler2D tInput;

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 color = texture2D( tInput, uv ).rgb;

	color.b = 0.0;

	gl_FragColor = vec4( color, 1.0 );

}
