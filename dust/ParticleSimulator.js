THREE.ParticleSimulator = function(shader, renderer, renderTarget) {
  this.material = new THREE.ShaderMaterial(shader);
//  this.material.needsUpdate = true;

  this.scene  = new THREE.Scene();
  this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  this.renderer = renderer;
  this.input = renderTarget.clone();
  this.output = renderTarget.clone();
};

THREE.ParticleSimulator.prototype = {
  swapBuffers: function() {
    var tmp = this.input;
    this.input = this.output;
    this.output = tmp;        
  },
  update: function() {
    this.swapBuffers();
	this.renderer.render(this.scene, this.camera, this.output, false);
	this.material.uniforms.tPositions.value = this.output;
    return this.output;
  }
};
