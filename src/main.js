'use strict';

// Estado inicial leve: a interface precisa funcionar mesmo se o WebGL falhar.
window.gameState = 'menu';

const canvas = document.getElementById('glCanvas');
const menu = document.getElementById('menu');
const endScreen = document.getElementById('endScreen');
const pauseScreen = document.getElementById('pauseScreen');
const hud = document.getElementById('hud');
const statusText = document.getElementById('statusText');
const zoneText = document.getElementById('zoneText');
const coordsText = document.getElementById('coordsText');
const progressFill = document.getElementById('progressFill');
const crosshair = document.getElementById('crosshair');
const cinematicOverlay = document.getElementById('cinematicOverlay');
const cinematicText = document.getElementById('cinematicText');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const exitButton = document.getElementById('exitButton');
const resumeButton = document.getElementById('resumeButton');
const pauseRestartButton = document.getElementById('pauseRestartButton');
const pauseMenuButton = document.getElementById('pauseMenuButton');
const qualityBadge = document.getElementById('qualityBadge');

function layoutScreenHotspots() {
  const designWidth = 1672;
  const designHeight = 941;
  document.querySelectorAll('.screen-hotspot[data-x]').forEach((button) => {
    const screen = button.closest('.screen');
    if (!screen) return;
    const bg = screen.querySelector('.screen-bg');
    const rect = screen.getBoundingClientRect();
    const naturalWidth = (bg && bg.naturalWidth) || designWidth;
    const naturalHeight = (bg && bg.naturalHeight) || designHeight;
    if (!rect.width || !rect.height) return;

    const scale = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;

    const objectPosition = bg ? getComputedStyle(bg).objectPosition.split(/\s+/) : ['50%', '50%'];
    const parseObjectPosition = (value, fallback = 0.5) => {
      if (!value) return fallback;
      if (value === 'left' || value === 'top') return 0;
      if (value === 'center') return 0.5;
      if (value === 'right' || value === 'bottom') return 1;
      if (value.endsWith('%')) return Math.max(0, Math.min(1, parseFloat(value) / 100));
      return fallback;
    };
    const posX = parseObjectPosition(objectPosition[0], 0.5);
    const posY = parseObjectPosition(objectPosition[1], 0.5);
    const offsetX = (rect.width - renderedWidth) * posX;
    const offsetY = (rect.height - renderedHeight) * posY;

    const x = Number(button.dataset.x || 0);
    const y = Number(button.dataset.y || 0);
    const w = Number(button.dataset.w || 0);
    const h = Number(button.dataset.h || 0);

    button.style.left = `${offsetX + x * scale}px`;
    button.style.top = `${offsetY + y * scale}px`;
    button.style.width = `${w * scale}px`;
    button.style.height = `${h * scale}px`;
  });
}

document.querySelectorAll('.screen-bg').forEach((img) => {
  img.addEventListener('load', layoutScreenHotspots);
});
requestAnimationFrame(layoutScreenHotspots);

let gl = null;
let standardShader = null;
let skyShader = null;
let waterShader = null;
let camera = null;
let input = null;
let scene = null;
let initialized = false;
let renderStarted = false;
let renderFailed = false;
let lastTime = 0;
let projectionMatrix = Mat4.identity();
let frameCounter = 0;
let fpsTimer = 0;
let fps = 0;
let fpsEma = 0;
let lastFpsSampleMs = 0;
let cinematicElapsed = 0;
const cinematicDuration = 11.4;
let resumeStateBeforePause = 'game';
let suppressPauseOnPointerUnlock = false;

function showRuntimeError(message) {
  console.error(message);
  let box = document.getElementById('runtimeError');
  if (!box) {
    box = document.createElement('div');
    box.id = 'runtimeError';
    box.className = 'runtime-error';
    document.body.appendChild(box);
  }
  box.innerHTML = `
    <strong>Não foi possível iniciar o passeio 3D.</strong>
    <span>${String(message).replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</span>
    <small>Abra pelo Chrome/Edge/Firefox atualizado. Se estiver abrindo direto pelo arquivo, prefira executar com <code>python -m http.server 8000</code>.</small>
  `;
  startButton.disabled = false;
  startButton.textContent = 'Tentar iniciar novamente';
}

function resizeCanvas() {
  if (!gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(window.innerWidth * dpr));
  const height = Math.max(1, Math.floor(window.innerHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  projectionMatrix = Mat4.perspective(65 * Math.PI / 180, canvas.width / canvas.height, 0.08, 240.0);
}

function setGameState(state) {
  window.gameState = state;
  menu.classList.toggle('active', state === 'menu');
  pauseScreen.classList.toggle('active', state === 'pause');
  endScreen.classList.toggle('active', state === 'end');
  hud.classList.toggle('hidden', state !== 'game');
  crosshair.classList.toggle('hidden', state !== 'game');
  if (cinematicOverlay) {
    cinematicOverlay.classList.toggle('hidden', state !== 'cinematic');
    cinematicOverlay.classList.toggle('active', state === 'cinematic');
  }

  layoutScreenHotspots();

  if (state !== 'game' && state !== 'cinematic') {
    if (input) input.clear();
    try {
      if (document.exitPointerLock && document.pointerLockElement) {
        suppressPauseOnPointerUnlock = true;
        document.exitPointerLock();
      }
    } catch (err) {
      console.warn('Pointer lock não pôde ser encerrado:', err);
    }
  }
}

function initializeEngine() {
  if (initialized) return true;

  try {
    startButton.disabled = true;
    startButton.textContent = 'Carregando WebGL...';

    gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) {
      throw new Error('WebGL não está disponível neste navegador ou está desativado na placa de vídeo.');
    }

    standardShader = createStandardShaderProgram(gl);
    skyShader = createSkyShaderProgram(gl);
    waterShader = createWaterShaderProgram(gl);
    camera = new FirstPersonCamera();
    input = new InputController(canvas, camera);
    scene = new AlcatrazScene(gl);

    window.__alcatrazDebug = { gl, camera, input, scene, skyShader, standardShader, waterShader };
    initialized = true;
    startButton.disabled = false;
    startButton.textContent = 'Começar passeio';
    resizeCanvas();

    if (!renderStarted) {
      renderStarted = true;
      requestAnimationFrame(render);
    }
    return true;
  } catch (err) {
    initialized = false;
    showRuntimeError(err && err.stack ? err.stack : err);
    return false;
  }
}

function requestMouseCapture() {
  if (!input) return;
  try {
    input.requestPointerLock();
  } catch (err) {
    console.warn('Pointer lock indisponível. O jogo continua com WASD/setas:', err);
  }
}

window.handleGameplayPointerUnlock = function handleGameplayPointerUnlock() {
  if (suppressPauseOnPointerUnlock) {
    suppressPauseOnPointerUnlock = false;
    return;
  }
  if (window.gameState === 'game' || window.gameState === 'cinematic') {
    pauseGame();
  }
};

function pauseGame() {
  if (window.gameState !== 'game' && window.gameState !== 'cinematic') return;
  resumeStateBeforePause = window.gameState;
  setGameState('pause');
}

function resumeFromPause() {
  if (window.gameState !== 'pause') return;
  setGameState(resumeStateBeforePause || 'game');
  if (resumeStateBeforePause === 'game' || resumeStateBeforePause === 'cinematic') {
    requestMouseCapture();
  }
}

function startGame() {
  if (!initializeEngine()) return;
  camera.reset();
  if (scene && typeof scene.resetLifeboatPose === 'function') scene.resetLifeboatPose();
  cinematicElapsed = 0;
  frameCounter = 0;
  fpsTimer = 0;
  fps = 0;
  fpsEma = 0;
  lastFpsSampleMs = 0;
  if (qualityBadge) qualityBadge.textContent = 'WebGL · -- FPS';
  resumeStateBeforePause = 'game';
  setGameState('cinematic');
  requestMouseCapture();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
exitButton.addEventListener('click', () => setGameState('menu'));
resumeButton.addEventListener('click', () => resumeFromPause());
pauseRestartButton.addEventListener('click', startGame);
pauseMenuButton.addEventListener('click', () => setGameState('menu'));

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (window.gameState === 'pause') {
    event.preventDefault();
    resumeFromPause();
    return;
  }

  if (window.gameState === 'game' || window.gameState === 'cinematic') {
    if (!document.pointerLockElement) {
      event.preventDefault();
      pauseGame();
    }
  }
});
window.addEventListener('resize', () => {
  resizeCanvas();
  layoutScreenHotspots();
});

// Fallback útil para testes manuais pelo console e para garantir que o clique nunca fique sem handler.
window.startAlcatrazGame = startGame;

function clearFrame() {
  gl.clearColor(0.025, 0.038, 0.055, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function updateHud(dt) {
  const progress = scene.getProgress(camera.position);
  statusText.textContent = scene.getStatus(camera.position);
  zoneText.textContent = scene.getZone(camera.position);
  coordsText.textContent = `x ${camera.position[0].toFixed(1)} · z ${camera.position[2].toFixed(1)} · yaw ${(camera.yaw * 180 / Math.PI).toFixed(0)}°`;
  progressFill.style.width = `${Math.round(progress * 100)}%`;

  frameCounter++;
  const nowMs = performance.now();
  const rawDt = lastFpsSampleMs ? Math.max(0.001, (nowMs - lastFpsSampleMs) / 1000) : Math.max(dt, 0.001);
  lastFpsSampleMs = nowMs;
  fpsTimer += rawDt;
  const instantFps = 1 / rawDt;
  fpsEma = fpsEma ? (fpsEma * 0.84 + instantFps * 0.16) : instantFps;
  if (fpsTimer > 0.18) {
    fps = fpsEma || (frameCounter / Math.max(fpsTimer, 0.001));
    frameCounter = 0;
    fpsTimer = 0;
    qualityBadge.textContent = `WebGL · ${fps.toFixed(1)} FPS`;
  }
}

function smoothstep01(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function setCameraLookAt(position, target) {
  camera.position = position.slice();
  const dx = target[0] - position[0];
  const dy = target[1] - position[1];
  const dz = target[2] - position[2];
  camera.yaw = Math.atan2(dx, -dz);
  camera.pitch = Math.max(-1.12, Math.min(1.12, Math.atan2(dy, Math.hypot(dx, dz))));
}

function updateIntroCinematic(time, dt) {
  cinematicElapsed = Math.min(cinematicDuration, cinematicElapsed + dt);
  const t = cinematicElapsed;
  const wave = Math.sin(time * 2.8) * 0.055 + Math.sin(time * 5.4) * 0.025;

  if (t < 6.6) {
    const p = smoothstep01(t / 6.6);
    const boatZ = lerp(82.0, 64.5, p);
    const sway = Math.sin(time * 1.25) * 0.045;
    if (scene && typeof scene.setLifeboatPose === 'function') {
      scene.setLifeboatPose([0.0, -0.78, boatZ], wave * 0.75, sway);
    }
    const cam = [Math.sin(time * 1.1) * 0.06, 1.22 + wave, boatZ - 1.08];
    const target = [0.0, 1.42, 52.8];
    setCameraLookAt(cam, target);
    if (cinematicText) cinematicText.textContent = 'CHEGADA À ILHA';
  } else if (t < 9.2) {
    const p = smoothstep01((t - 6.6) / 2.6);
    if (scene && typeof scene.setLifeboatPose === 'function') {
      scene.setLifeboatPose([0.0, -0.78, 64.5], wave * 0.35, 0);
    }
    const jumpArc = Math.sin(p * Math.PI) * 0.78;
    const cam = [0.0, 1.42 + jumpArc, lerp(63.2, 52.8, p)];
    const target = [0.0, 1.58, lerp(52.0, 27.0, p)];
    setCameraLookAt(cam, target);
    if (cinematicText) cinematicText.textContent = 'DESEMBARQUE';
  } else {
    const p = smoothstep01((t - 9.2) / (cinematicDuration - 9.2));
    if (scene && typeof scene.resetLifeboatPose === 'function') scene.resetLifeboatPose();
    const settle = Math.sin((1 - p) * Math.PI * 2.0) * 0.045;
    const cam = [0.0, 1.75 + settle, 52.8];
    const target = [0.0, 1.72, -2.0];
    setCameraLookAt(cam, target);
    if (cinematicText) cinematicText.textContent = 'CONTROLES LIBERADOS';
  }

  if (cinematicElapsed >= cinematicDuration) {
    camera.reset();
    if (scene && typeof scene.resetLifeboatPose === 'function') scene.resetLifeboatPose();
    setGameState('game');
  }
}

function updateGame(time, dt) {
  if (window.gameState === 'cinematic') {
    updateIntroCinematic(time, dt);
  } else if (window.gameState === 'game') {
    camera.update(dt, input, scene);
    updateHud(dt);
    if (camera.position[2] < -84.25 && Math.abs(camera.position[0]) < 3.2) {
      setGameState('end');
    }
  }
  if (window.gameState !== 'pause') {
    scene.update(time, camera ? camera.position : null);
  }
}

function render(timeMs) {
  if (!initialized || renderFailed) return;

  try {
    resizeCanvas();
    const time = timeMs * 0.001;
    const dt = Math.min(0.05, time - lastTime || 0.016);
    lastTime = time;

    updateGame(time, dt);
    clearFrame();
    scene.draw(skyShader, standardShader, waterShader, camera, projectionMatrix, time);

    requestAnimationFrame(render);
  } catch (err) {
    renderFailed = true;
    showRuntimeError(err && err.stack ? err.stack : err);
  }
}

setGameState('menu');
