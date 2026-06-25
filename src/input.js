'use strict';

class InputController {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.keys = new Set();
    this.enabled = false;

    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    document.addEventListener('pointerlockchange', () => {
      const wasEnabled = this.enabled;
      this.enabled = document.pointerLockElement === this.canvas;
      if (wasEnabled && !this.enabled && typeof window.handleGameplayPointerUnlock === 'function') {
        window.handleGameplayPointerUnlock();
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (this.enabled && window.gameState === 'game') {
        this.camera.rotate(event.movementX, event.movementY);
      }
    });

    canvas.addEventListener('click', () => {
      if (window.gameState === 'game') this.requestPointerLock();
    });
  }

  isDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  clear() {
    this.keys.clear();
  }

  requestPointerLock() {
    if (this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }
}

window.InputController = InputController;
