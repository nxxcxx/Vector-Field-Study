uniform float time;
uniform float noiseScale;
uniform vec2 resolution;


// https://www.shadertoy.com/view/Ms2SD1 "Seascape" by Alexander Alekseev aka TDM - 2014
	float hash( vec2 p ) {
		float h = dot(p,vec2(127.1,311.7));
		return fract(sin(h)*43758.5453123);
	}

	float noise( in vec2 p ) {
		vec2 i = floor( p );
		vec2 f = fract( p );
		vec2 u = f*f*(3.0-2.0*f);
		return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
									hash( i + vec2(1.0,0.0) ), u.x),
									mix( hash( i + vec2(0.0,1.0) ),
									hash( i + vec2(1.0,1.0) ), u.x), u.y);
	}

	float sea_octave(vec2 uv, float choppy) {
		uv += noise(uv);
		vec2 wv = 1.0-abs(sin(uv));
		vec2 swv = abs(cos(uv));
		wv = mix(wv,swv,wv);
		return pow( abs( 1.0 - pow( abs(wv.x * wv.y),
			                     0.65 ) ),
			         choppy);
	}

	float fsea(vec2 p) {

		float sFre = 0.0125;
		float sCho = 2.0;
		float sAmp = 1.0;

		float res = 0.0;

		for (int i=0; i<2; i++) {

			float t = time * 25.0;
			res += sea_octave( (p+t)*sFre, sCho );
			res += sea_octave( (p-t)*sFre, sCho );
			res *= sAmp;

			sFre *= 1.5;
			sAmp *= 0.3;
			sCho *= 1.2;

		}

		return res;
	}

	// ashma's webGL noise
	vec3 mod289(vec3 x) {
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 mod289(vec4 x) {
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 permute(vec4 x) {
	     return mod289(((x*34.0)+1.0)*x);
	}

	vec4 taylorInvSqrt(vec4 r) {
	  return 1.79284291400159 - 0.85373472095314 * r;
	}

	float snoise(vec3 v) {
	  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
	  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

	  vec3 i  = floor(v + dot(v, C.yyy) );
	  vec3 x0 =   v - i + dot(i, C.xxx) ;

	  vec3 g = step(x0.yzx, x0.xyz);
	  vec3 l = 1.0 - g;
	  vec3 i1 = min( g.xyz, l.zxy );
	  vec3 i2 = max( g.xyz, l.zxy );

	  vec3 x1 = x0 - i1 + C.xxx;
	  vec3 x2 = x0 - i2 + C.yyy;
	  vec3 x3 = x0 - D.yyy;


	  i = mod289(i);
	  vec4 p = permute( permute( permute(
	             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
	           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
	           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));


	  float n_ = 0.142857142857;
	  vec3  ns = n_ * D.wyz - D.xzx;

	  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	  vec4 x_ = floor(j * ns.z);
	  vec4 y_ = floor(j - 7.0 * x_ );

	  vec4 x = x_ *ns.x + ns.yyyy;
	  vec4 y = y_ *ns.x + ns.yyyy;
	  vec4 h = 1.0 - abs(x) - abs(y);

	  vec4 b0 = vec4( x.xy, y.xy );
	  vec4 b1 = vec4( x.zw, y.zw );

	  vec4 s0 = floor(b0)*2.0 + 1.0;
	  vec4 s1 = floor(b1)*2.0 + 1.0;
	  vec4 sh = -step(h, vec4(0.0));

	  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
	  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

	  vec3 p0 = vec3(a0.xy,h.x);
	  vec3 p1 = vec3(a0.zw,h.y);
	  vec3 p2 = vec3(a1.xy,h.z);
	  vec3 p3 = vec3(a1.zw,h.w);

	  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	  p0 *= norm.x;
	  p1 *= norm.y;
	  p2 *= norm.z;
	  p3 *= norm.w;

	  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	  m = m * m;
	  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
	                                dot(p2,x2), dot(p3,x3) ) );
	}

float fbm( vec2 p ) {

	float freq = noiseScale;
	float z = 33.0 + time * 0.25;
	return snoise( vec3( p * freq, z )  ) * 0.5 + 0.5;

}

vec2 gradient( vec2 p ) {

	float e = 1e-1;
	vec2 dx = vec2( e, 0.0 );
	vec2 dy = vec2( 0.0, -e ); // y coordinate is flipped?
	float nz = 33.0;

	// finite difference approximation
	vec2 res = vec2(
		fbm( p + dx ) - fbm( p - dx ),
		fbm( p + dy ) - fbm( p - dy )
	);

	return res / ( e * 2.0 );

}

void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec3 color = vec3( 0.0 );

	// noise
		// float height = snoise( vec3( (uv/*+vec2(time*0.1, time*0.1)*/) * freq , 33.0 )  ) * 0.5 + 0.5;
		// color = vec3( height );

	// gradient
		vec2 grad = gradient( uv );
		// curl
		grad = vec2( grad.y, -grad.x );

		float height = fbm( uv );
		color = vec3( grad, height );


	gl_FragColor = vec4( color, 1.0 );

}
