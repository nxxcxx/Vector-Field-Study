
uniform float size;
uniform sampler2D positionBuffer;
uniform sampler2D velocityBuffer;

attribute vec3 here;

varying vec3 vVel;
varying float vLife;
varying float vDepth;


float rand( vec2 p ){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

   vVel = texture2D( velocityBuffer, here.xy ).rgb;

   vLife = texture2D( positionBuffer, here.xy ).a;

	vec3 newPosition = texture2D( positionBuffer, here.xy ).rgb;


	vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );


	gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );  // size attenuation


	gl_Position = projectionMatrix * mvPosition;

   vDepth = gl_Position.z;

}
