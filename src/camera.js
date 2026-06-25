'use strict';

class FirstPersonCamera {
  constructor() {
    this.position = [0, 1.75, 52.8];
    this.yaw = 0.0;
    this.pitch = -0.025;
    this.walkSpeed = 5.4;
    this.runMultiplier = 1.65;
    this.mouseSensitivity = 0.0022;
  }

  reset() {
    this.position = [0, 1.75, 52.8];
    this.yaw = 0.0;
    this.pitch = -0.025;
  }

  getForward() {
    return Vec3.normalize([
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ]);
  }

  getForwardFlat() {
    const forward = this.getForward();
    return Vec3.normalize([forward[0], 0, forward[2]]);
  }

  getRight() {
    return Vec3.normalize(Vec3.cross(this.getForwardFlat(), [0, 1, 0]));
  }

  getViewMatrix() {
    const forward = this.getForward();
    const center = Vec3.add(this.position, forward);
    return Mat4.lookAt(this.position, center, [0, 1, 0]);
  }

  rotate(deltaX, deltaY) {
    this.yaw += deltaX * this.mouseSensitivity;
    this.pitch -= deltaY * this.mouseSensitivity;
    const limit = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
  }

  update(dt, input, scene = null) {
    let direction = [0, 0, 0];
    const forward = this.getForwardFlat();
    const right = this.getRight();

    if (input.isDown('w') || input.isDown('arrowup')) direction = Vec3.add(direction, forward);
    if (input.isDown('s') || input.isDown('arrowdown')) direction = Vec3.sub(direction, forward);
    if (input.isDown('d') || input.isDown('arrowright')) direction = Vec3.add(direction, right);
    if (input.isDown('a') || input.isDown('arrowleft')) direction = Vec3.sub(direction, right);

    let desired = this.position.slice();
    if (Vec3.length(direction) > 0.001) {
      direction = Vec3.normalize(direction);
      const speed = this.walkSpeed * (input.isDown('shift') ? this.runMultiplier : 1.0);
      desired = Vec3.add(this.position, Vec3.scale(direction, speed * dt));
    }

    desired[1] = 1.75;
    if (scene && typeof scene.resolveCameraPosition === 'function') {
      this.position = scene.resolveCameraPosition(this.position, desired);
    } else {
      this.position = desired;
    }
    this.position[1] = 1.75;
  }
}

window.FirstPersonCamera = FirstPersonCamera;
