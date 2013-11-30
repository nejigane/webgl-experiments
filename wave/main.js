if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var wave, wall;
var stats;
var noise;
var segment;
var time;

init();
animate();

function init() {
  time = 0;
  segment = { x: 128, y: 16 };

  noise = new SimplexNoise();
  scene = new THREE.Scene();
  wave = new THREE.PlaneGeometry(2048, 256, segment.x, segment.y);
  wall = new THREE.PlaneGeometry(2048, 256, segment.x, 1);

  var wallMesh = new THREE.Mesh(wall, new THREE.MeshBasicMaterial({
    color: 0x002288
  }));
  wallMesh.rotation.x = Math.PI;
  wallMesh.position.z = -128;
  scene.add(wallMesh);

  var mesh = new THREE.Mesh(wave,  new THREE.MeshPhongMaterial({
    color: 0x0033ff,
    specular: 0x0033ff,
    emissive: 0x002266,
    side: THREE.DoubleSide
  }));
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.y = 100;
  scene.add(light);

  var h = 1024 * window.innerHeight / window.innerWidth;
  camera = new THREE.OrthographicCamera(-1024, 1024, -h, h, -1024, 1024);
  camera.position.z = 100;
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  document.body.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  time += 0.005;
  requestAnimationFrame(animate);
  for (var i = 0; i < wave.vertices.length; i++ ) {
    var vertex = wave.vertices[i];
    vertex.z = noise.noise3d(vertex.x/1500, vertex.y/100, time) * 120;
  }
  wave.computeFaceNormals();
  wave.computeVertexNormals();
  wave.verticesNeedUpdate = true;

  var h = 1024 * window.innerHeight / window.innerWidth;
  for (var i = 0; i <= segment.x; i++) {
    wall.vertices[i].y = wave.vertices[i].z;
    wall.vertices[i+segment.x+1].y = -h;
  }
  wall.verticesNeedUpdate = true;

  renderer.render(scene, camera);
  stats.update();
}

function onWindowResize() {
  var h = 1024 * window.innerHeight / window.innerWidth;
  camera.top = -h;
  camera.bottom = h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
