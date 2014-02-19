if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var particleSimulator, particleSystem;
var stats;

THREE.SimulationShader = {
  uniforms: {
    resolution: { type: "v2", value: null },
    tPositions: { type: "t", value: null }
  },
  vertexShader: document.getElementById('texture_vertex_simulation_shader').textContent,
  fragmentShader:  document.getElementById('texture_fragment_simulation_shader').textContent
};

THREE.ParticleShader = {
  depthTest: false,
  depthWrite: false,
  transparent: true,
  blending: THREE.AdditiveBlending,
  uniforms: {
    data: { type: 't', value: null }
  },
  vertexShader: [
    "uniform sampler2D data;",
    "void main() {",
    "vec4 p = texture2D(data, position.xy / 256.);",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(p.x, p.y, 0., 1.);",
    "gl_PointSize = 2.;",
    "}"
  ].join("\n"),
  fragmentShader: [
    "void main() {",
    "gl_FragColor = vec4(1.0, 0.4, 0.7, 0.5);",
    "}"
  ].join("\n")
};

init();
animate();

function init() {
  scene = new THREE.Scene();

  var width = 256; 
  var height = 256;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  var data = new Float32Array(4 * width * height);
  for (var i = 0; i < width * height; ++i) {
    data[i * 4] = i * window.innerWidth / (width * height) + (Math.random() - 0.5) * 200;
    data[i * 4 + 1] = (Math.sin(4 * i * Math.PI / (width * height)) * 0.3 + 0.5) * window.innerHeight + (Math.random() - 0.5) * 200;
    data[i * 4 + 2] = (Math.random() - 0.5) * 0.1;
    data[i * 4 + 3] = (Math.random() - 0.5) * 0.1;
  }
  var particles = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  particles.minFilter = THREE.NearestFilter;
  particles.magFilter = THREE.NearestFilter;
  particles.needsUpdate = true;
  THREE.SimulationShader.uniforms.tPositions.value = particles;
  THREE.SimulationShader.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);

  var target = new THREE.WebGLRenderTarget(width, height, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false    
  });
  particleSimulator = new THREE.ParticleSimulator(THREE.SimulationShader, renderer, target);

  var geometry = new THREE.Geometry();
  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x)  {
      geometry.vertices.push(new THREE.Vector3(x, y, 0));
    }
  }
  particleSystem = new THREE.ParticleSystem(geometry, new THREE.ShaderMaterial(THREE.ParticleShader));
  scene.add(particleSystem);

  camera = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -100, 100);
  camera.position.z = 100;

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  document.body.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  requestAnimationFrame(animate);
  particleSystem.material.uniforms.data.value = particleSimulator.update();
  renderer.render(scene, camera);
  stats.update();
}

function onWindowResize() {
  camera.right = window.innerWidth;
  camera.top = window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
