if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var covers, target, coverSize;
var stats;

init();
animate();

function createCoverMesh(size, url) {
  var geometry = new THREE.PlaneGeometry(size, size, 1, 1);
  var texture  = new THREE.ImageUtils.loadTexture(url, undefined, function(t) {
    var w = t.image.naturalWidth / 2, h = t.image.naturalHeight / 2;
    if (w > h) {
      h = size * h / w;
      w = size;
    } else {
      w = size * w / h;
      h = size;
    }
    geometry.vertices[0].set(-w, 2 * h, 0);
    geometry.vertices[1].set(w, 2 * h, 0);
    geometry.vertices[2].set(-w, -2 * h, 0);
    geometry.vertices[3].set(w, -2 * h, 0);
    geometry.verticesNeedUpdate = true;
  });

  return new THREE.Mesh(geometry, new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vshader').textContent,
    fragmentShader: document.getElementById('fshader').textContent,
    uniforms: {
      map: { type: 't', value: texture },
      backgroundColor: { type: 'v4', value: new THREE.Vector4(0, 0, 0, 1.0) },
      darkness: { type: 'f', value: 0.0 }
    },
    attributes: {}
  }));  
}

function updateDestination() {
  var leftOffset = - coverSize * 2;
  for (var i = 0; i < target; i++) {
    covers[i].position.x = leftOffset - (target - i) * 30;
    covers[i].position.z = 0;
    covers[i].rotation.y = Math.PI / 2;
  }

  covers[target].position.x = 0;
  covers[target].position.z = 150;
  covers[target].rotation.y = 0;

  var rightOffset = coverSize * 2;
  for (var i = target + 1; i < covers.length; i++) {
    covers[i].position.x = rightOffset + (i - target) * 30;
    covers[i].position.z = 0;
    covers[i].rotation.y = - Math.PI / 2;
  }
}

function updateDarkness() {
  var r = Math.pow(window.innerHeight / window.innerWidth, 2);
  for (var i = target - 1; i >= 0; i--) {
    covers[i].darkness = Math.min(1, r * (target - i));
  }
  covers[target].darkness = 0;
  for (var i = target + 1; i < covers.length; i++) {
    covers[i].darkness = Math.min(1, r * (i - target));
  }  
}

function init() {
  scene = new THREE.Scene();
  coverSize = 128;
  target = 0;
 
  covers = [];
  for (var i = 0; i < 30; i++) {
    covers.push({
      mesh: createCoverMesh(coverSize, 'images/0' + (i % 10) + '.jpg'),
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Vector3(0, 0, 0),
      darkness: 0
    });
  }
  updateDestination();
  updateDarkness();
  for (var i = 0; i < 30; i++) {
    covers[i].mesh.position.x = covers[i].position.x;
    covers[i].mesh.position.z = covers[i].position.z;
    covers[i].mesh.rotation.y = covers[i].rotation.y;
    scene.add(covers[i].mesh);
  }

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 5, 3000);
  camera.position.y = coverSize / 2;
  camera.position.z = 400;
  camera.lookAt(new THREE.Vector3(0, coverSize / 2, 0));

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  document.body.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('keydown' , onKeyDown, false);

  console.log(covers[0].mesh.material.uniforms);
}

function animate() {
  requestAnimationFrame(animate);
  for (var i = 0; i < covers.length; i++) {
    var destPosition = covers[i].position;
    var destYRotation = covers[i].rotation.y;
    var mesh = covers[i].mesh;
    mesh.position.x += (destPosition.x - mesh.position.x) / 6;
    mesh.position.z += (destPosition.z - mesh.position.z) / 6;
    mesh.rotation.y += (destYRotation - mesh.rotation.y) / 3;
    mesh.material.uniforms.darkness.value += (covers[i].darkness - mesh.material.uniforms.darkness.value) / 6;
  }
  renderer.render(scene, camera);
  stats.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  updateDarkness();
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
  if (e.keyCode == 37 || e.keyCode == 38) {
    target -= 1;
    e.preventDefault();
  } else if (e.keyCode == 39 || e.keyCode == 40) {
    target += 1;
    e.preventDefault();
  }

  target = Math.max(0, Math.min(target, covers.length - 1));
  updateDestination();
  updateDarkness();
}
