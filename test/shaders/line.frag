precision highp float;
uniform vec2 seed;

float rand(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  gl_FragColor = vec4( 2.9 / 10.0, 0.0, 0.0, 1.0);
}