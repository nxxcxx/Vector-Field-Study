
uniform vec2 resolution;
uniform float time;
uniform sampler2D positionBuffer;

	// ashma's webGL noise https://github.com/ashima/webgl-noise
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

		float sFre = 10.0;
		float sCho = 5.0;
		float sAmp = 1.0;

		float res = 0.0;

		for (int i=0; i<2; i++) {

			float t = time * 0.025;
			res += sea_octave( (p+t)*sFre, sCho );
			res += sea_octave( (p-t)*sFre, sCho );
			res *= sAmp;

			sFre *= 1.5;
			sAmp *= 0.3;
			sCho *= 1.2;

		}

		return res;
	}


float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float fbm( vec3 p ) {

	float freq = 5.0;
	return snoise( p * freq );

}

vec3 gradient( vec3 p ) {

	float e = 1e-4;
	vec3 dx = vec3( e, 0.0, 0.0 );
	vec3 dy = vec3( 0.0, e, 0.0 );
	vec3 dz = vec3( 0.0, 0.0, e );

	vec3 res = vec3(
		fbm( p + dx ) - fbm( p - dx ),
		fbm( p + dy ) - fbm( p - dy ),
		fbm( p + dz ) - fbm( p - dz )
	);

	return res / ( e * 2.0 );

}

vec3 potential( vec3 p ) {

	vec3 res = vec3(
		fbm( p + 00.0 ),
		fbm( p + 10.0 ),
		fbm( p + 20.0 )
	);
	return res;
}

vec3 curl( vec3 p ) {

	float e = 1e-4;
	vec3 dx = vec3( e, 0.0, 0.0 );
	vec3 dy = vec3( 0.0, e, 0.0 );
	vec3 dz = vec3( 0.0, 0.0, e );

	vec3 res = vec3(

		  potential( p + dy ).z - potential( p - dy ).z
		- potential( p + dz ).y + potential( p - dz ).y,

		  potential( p + dz ).x - potential( p - dz ).x
		- potential( p + dx ).z + potential( p - dx ).z,

		  potential( p + dx ).y - potential( p - dx ).y
		- potential( p + dy ).x + potential( p - dy ).x

	);

	return res / ( e * 2.0 );

}


void main()	{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec3 pos = texture2D( positionBuffer, uv ).xyz;

	pos /= resolution.xxx; // need to map position range to [0, 1] dont use normalize() it normalize the length thats not what we want
	// pos is an input to noise function


	vec3 field = curl( pos ) * 0.05;


	gl_FragColor = vec4( field.xyz, 0.0 );

}
