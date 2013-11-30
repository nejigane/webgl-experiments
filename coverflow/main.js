if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, scene, renderer;
var stats;

init();
animate();

function createCover(size, url) {
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
      backgroundColor: { type: 'v4', value: new THREE.Vector4(0, 0, 0, 1.0) }
    },
    attributes: {}
  }));  
}

function init() {
  scene = new THREE.Scene();
  var coverSize = 128;
  for (var i = 1; i <= 10; i++) {
    var name = (i < 10 ? '0' : '')  + i + '.jpg';
    var mesh = createCover(coverSize, 'images/' + name);
    mesh.position.x = - i * 30;
    mesh.rotation.y = Math.PI / 3;
    scene.add(mesh);    
  }

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 5, 3000);
  camera.position.y = coverSize / 2;
  camera.position.z = 300;
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
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
