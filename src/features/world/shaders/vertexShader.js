const vert = `
precision highp float;

varying vec2 v_texcoord;

void main() {

    // pass Three.js built-in uv attribute
    v_texcoord = uv;

    // standard Three.js transform
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
`
export default vert
