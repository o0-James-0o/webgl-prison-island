'use strict';

const Vec3 = {
  create(x = 0, y = 0, z = 0) { return [x, y, z]; },
  add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
  sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
  scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; },
  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  },
  length(a) { return Math.hypot(a[0], a[1], a[2]); },
  normalize(a) {
    const len = Vec3.length(a);
    if (len < 0.00001) return [0, 0, 0];
    return [a[0] / len, a[1] / len, a[2] / len];
  },
  distance(a, b) { return Vec3.length(Vec3.sub(a, b)); }
};

const Mat4 = {
  identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  },

  multiply(a, b) {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        out[col * 4 + row] =
          a[0 * 4 + row] * b[col * 4 + 0] +
          a[1 * 4 + row] * b[col * 4 + 1] +
          a[2 * 4 + row] * b[col * 4 + 2] +
          a[3 * 4 + row] * b[col * 4 + 3];
      }
    }
    return out;
  },

  translation(tx, ty, tz) {
    const out = Mat4.identity();
    out[12] = tx; out[13] = ty; out[14] = tz;
    return out;
  },

  scaling(sx, sy, sz) {
    const out = Mat4.identity();
    out[0] = sx; out[5] = sy; out[10] = sz;
    return out;
  },

  rotationX(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ]);
  },

  rotationY(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ]);
  },

  rotationZ(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  },

  perspective(fovYRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovYRad / 2);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = (2 * far * near) * nf;
    return out;
  },

  lookAt(eye, center, up) {
    const zAxis = Vec3.normalize(Vec3.sub(eye, center));
    const xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
    const yAxis = Vec3.cross(zAxis, xAxis);

    const out = Mat4.identity();
    out[0] = xAxis[0]; out[4] = xAxis[1]; out[8] = xAxis[2];
    out[1] = yAxis[0]; out[5] = yAxis[1]; out[9] = yAxis[2];
    out[2] = zAxis[0]; out[6] = zAxis[1]; out[10] = zAxis[2];
    out[12] = -Vec3.dot(xAxis, eye);
    out[13] = -Vec3.dot(yAxis, eye);
    out[14] = -Vec3.dot(zAxis, eye);
    return out;
  },

  compose(position, rotation, scale) {
    let m = Mat4.translation(position[0], position[1], position[2]);
    m = Mat4.multiply(m, Mat4.rotationY(rotation[1]));
    m = Mat4.multiply(m, Mat4.rotationX(rotation[0]));
    m = Mat4.multiply(m, Mat4.rotationZ(rotation[2]));
    m = Mat4.multiply(m, Mat4.scaling(scale[0], scale[1], scale[2]));
    return m;
  },

  normalFromMat4(m) {
    const a00 = m[0], a01 = m[4], a02 = m[8];
    const a10 = m[1], a11 = m[5], a12 = m[9];
    const a20 = m[2], a21 = m[6], a22 = m[10];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) return new Float32Array([1,0,0, 0,1,0, 0,0,1]);
    det = 1.0 / det;

    const inv00 = b01 * det;
    const inv01 = (-a22 * a01 + a02 * a21) * det;
    const inv02 = (a12 * a01 - a02 * a11) * det;
    const inv10 = b11 * det;
    const inv11 = (a22 * a00 - a02 * a20) * det;
    const inv12 = (-a12 * a00 + a02 * a10) * det;
    const inv20 = b21 * det;
    const inv21 = (-a21 * a00 + a01 * a20) * det;
    const inv22 = (a11 * a00 - a01 * a10) * det;

    return new Float32Array([
      inv00, inv10, inv20,
      inv01, inv11, inv21,
      inv02, inv12, inv22
    ]);
  }
};

window.Vec3 = Vec3;
window.Mat4 = Mat4;
