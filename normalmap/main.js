if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var stats;

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */
THREE.NormalMapShader = {
  uniforms: {
    "heightMap":  { type: "t", value: null },
    "resolution": { type: "v2", value: new THREE.Vector2(256, 256) }
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "uniform float height;",
    "uniform vec2 resolution;",
    "uniform sampler2D heightMap;",
    "varying vec2 vUv;",
    "void main() {",
    "float val = texture2D( heightMap, vUv ).x;",
    "float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
    "float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",
    "gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, 0.05 ) ) + 0.5 ), 1.0 );",
    "}"
  ].join("\n")
};

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(- window.innerWidth / 2, window.innerWidth / 2,
                                        window.innerHeight / 2, - window.innerHeight / 2,
                                        -100, 100);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
                             new THREE.ShaderMaterial({
                               uniforms: { time: { type: "f", value: 1.0 } },
                               vertexShader: document.getElementById('vertexShader').textContent,
                               fragmentShader: document.getElementById('heightmapFragmentShader').textContent
                             }));
  scene.add(plane);

  var renderTarget = new THREE.WebGLRenderTarget(256, 256, { 
    minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat 
  });
  renderer.render(scene, camera, renderTarget, true);

  THREE.NormalMapShader.uniforms.heightMap.value = renderTarget;
  plane.material = new THREE.ShaderMaterial(THREE.NormalMapShader);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  document.body.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}

function onWindowResize() {
  camera.left = - window.innerWidth / 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = - window.innerHeight / 2;  
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
