
uniform vec2 resolution;

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 color = vec3( uv.xy, 1.0 );

	gl_FragColor = vec4( color, 1.0 );

}
