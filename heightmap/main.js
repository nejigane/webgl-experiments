if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var stats;

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

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(512, 512),
                             new THREE.ShaderMaterial({
                               uniforms: { time: { type: "f", value: 1.0 } },
                               vertexShader: document.getElementById('vertexShader').textContent,
                               fragmentShader: document.getElementById('heightmapFragmentShader').textContent
                             }));
  scene.add(plane);

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
