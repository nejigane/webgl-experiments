if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var particleSimulator, particleSystem;
var stats;

THREE.HeightMapShader = {
  uniforms: {
    time: { type: "f", value: 1.0 }
  },
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('heightmapFragmentShader').textContent  
};

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
    "gl_FragColor = vec4( ( 0.5 * normalize( vec3(val - valU, val - valV, 0.05) ) + 0.5 ), 1.0 );",
    "}"
  ].join("\n")
};

THREE.SimulationShader = {
  uniforms: {
    "resolution": { type: "v2", value: null },
    tPositions: { type: "t", value: null },
    tNormalMap: { type: "t", value: null }
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
    "vec4 p = texture2D(data, position.xy / 64.);",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(p.x, p.y, 0., 1.);",
    "gl_PointSize = 2.;",
    "}"
  ].join("\n"),
  fragmentShader: [
    "void main() {",
    "gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5);",
    "}"
  ].join("\n")
};

init();
animate();

function renderNormalMap(renderer, renderTarget) {
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(256, 256),
                              new THREE.ShaderMaterial(THREE.HeightMapShader));

  var camera = new THREE.OrthographicCamera(-128, 128, 128, -128, 0, 1);
  var scene = new THREE.Scene();
  scene.add(plane);

  var heightMap = renderTarget.clone();
  renderer.render(scene, camera, heightMap, false);

  THREE.NormalMapShader.uniforms.heightMap.value = heightMap;
  plane.material = new THREE.ShaderMaterial(THREE.NormalMapShader);
  renderer.render(scene, camera, renderTarget, false);
};

function init() {
  scene = new THREE.Scene();

  var width = 64; 
  var height = 64;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  var normalMap = new THREE.WebGLRenderTarget(256, 256, { 
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter, 
    format: THREE.RGBFormat 
  });
  renderNormalMap(renderer, normalMap);

  var data = new Float32Array(4 * width * height);
  for (var i = 0; i < width * height; ++i) {
    data[i * 4] = (Math.random() - 0.5) * window.innerWidth;
    data[i * 4 + 1] = (Math.random() - 0.5) * window.innerHeight;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 0;
  }
  var particles = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  particles.minFilter = THREE.NearestFilter;
  particles.magFilter = THREE.NearestFilter;
  particles.needsUpdate = true;
  THREE.SimulationShader.uniforms.tPositions.value = particles;
  THREE.SimulationShader.uniforms.tNormalMap.value = normalMap;
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

  camera = new THREE.OrthographicCamera(- window.innerWidth / 2, window.innerWidth / 2,
                                        window.innerHeight / 2, - window.innerHeight / 2,
                                        -100, 100);
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
  camera.left = - window.innerWidth / 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = - window.innerHeight / 2;  
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
