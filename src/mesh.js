'use strict';

class Mesh {
  constructor(gl, geometry) {
    this.gl = gl;
    this.indexCount = geometry.indices.length;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);

    this.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.texcoords), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
  }

  draw(shader) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(shader.attrib.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.attrib.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(shader.attrib.normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.attrib.normal);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.vertexAttribPointer(shader.attrib.texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader.attrib.texCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }
}

class SceneObject {
  constructor({ name, mesh, material, position = [0,0,0], rotation = [0,0,0], scale = [1,1,1], update = null }) {
    this.name = name;
    this.mesh = mesh;
    this.material = material;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.update = update;
  }

  getModelMatrix() {
    return Mat4.compose(this.position, this.rotation, this.scale);
  }
}

window.Mesh = Mesh;
window.SceneObject = SceneObject;
