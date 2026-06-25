'use strict';

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.floor(value)));
}

function createTextureFromData(gl, width, height, data, options = {}) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!options.flipY);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.clamp ? gl.CLAMP_TO_EDGE : gl.REPEAT);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function makeTexture(width, height, sampler) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a = 255] = sampler(x, y, width, height);
      const i = (y * width + x) * 4;
      data[i] = clampColor(r);
      data[i + 1] = clampColor(g);
      data[i + 2] = clampColor(b);
      data[i + 3] = clampColor(a);
    }
  }
  return data;
}

function noise(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const fade = (t) => t * t * (3.0 - 2.0 * t);
  const a = noise(xi, yi);
  const b = noise(xi + 1, yi);
  const c = noise(xi, yi + 1);
  const d = noise(xi + 1, yi + 1);
  const ux = fade(xf), uy = fade(yf);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}

function fractal(x, y) {
  let total = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    total += valueNoise(x * freq, y * freq) * amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return total;
}

function createSolidTexture(gl, color) {
  return createTextureFromData(gl, 1, 1, new Uint8Array([color[0], color[1], color[2], color[3] ?? 255]), { clamp: true });
}

function createImageTexture(gl, url) {
  // Começa com uma textura válida; assim o jogo inicia mesmo antes do JPG terminar de carregar.
  const texture = createSolidTexture(gl, [210, 210, 210, 255]);
  const image = new Image();
  image.onload = () => {
    try {
      // WebGL 1 exige dimensões power-of-two para mipmap/repeat em vários navegadores.
      // Por isso o retrato é normalizado em um canvas 256x256 antes de ir para a GPU.
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 256;
      faceCanvas.height = 256;
      const ctx = faceCanvas.getContext('2d');
      ctx.fillStyle = '#d2d2d2';
      ctx.fillRect(0, 0, 256, 256);

      const srcSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
      const sx = ((image.naturalWidth || image.width) - srcSize) * 0.5;
      const sy = ((image.naturalHeight || image.height) - srcSize) * 0.34;
      ctx.drawImage(image, sx, sy, srcSize, srcSize, 0, 0, 256, 256);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, faceCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } catch (err) {
      console.warn('Textura de retrato manteve placeholder por segurança:', url, err);
    }
  };
  image.onerror = () => console.warn('Não foi possível carregar textura:', url);
  image.src = url;
  return texture;
}



function createTextureFromCanvas(gl, canvas, options = {}) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!options.flipY);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}



function createSkyTextureFromCanvas(gl, canvas) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // O céu precisa repetir horizontalmente para esconder a costura do skydome.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}


function createNightSkyTexture(gl) {
  // Usamos a versão 4K tone-mapped do HDRI enviado pelo usuário.
  // Para o céu, evitamos mipmaps e redimensionamentos, preservando nitidez e estrelas pequenas.
  const texture = createSolidTexture(gl, [3, 8, 16, 255]);
  const image = new Image();
  image.onload = () => {
    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } catch (err) {
      console.warn('Textura HDRI 4K do céu manteve placeholder por segurança:', err);
    }
  };
  image.onerror = () => console.warn('Não foi possível carregar a textura 4K convertida do céu.');
  image.src = 'assets/qwantani_night_puresky_4k_tonemapped_refined.png';
  return texture;
}

function createOvalImageTexture(gl, url) {
  // Textura facial RGBA com máscara oval: elimina o efeito de "quadrado colado" no rosto.
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(128, 130, 88, 100, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#b98a68';
  ctx.fillRect(0, 0, 256, 256);
  ctx.restore();

  const texture = createTextureFromCanvas(gl, canvas, { flipY: true });
  const image = new Image();
  image.onload = () => {
    try {
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 256;
      faceCanvas.height = 256;
      const c = faceCanvas.getContext('2d');
      c.clearRect(0, 0, 256, 256);
      c.save();
      c.beginPath();
      c.ellipse(128, 130, 91, 103, 0, 0, Math.PI * 2);
      c.clip();
      const w = image.naturalWidth || image.width;
      const h = image.naturalHeight || image.height;
      const srcSize = Math.min(w, h);
      const sx = (w - srcSize) * 0.5;
      const sy = (h - srcSize) * 0.32;
      c.drawImage(image, sx, sy, srcSize, srcSize, 30, 20, 196, 216);
      // Vinheta suave nas bordas para parecer pintura/tecido aderido à cabeça.
      const grad = c.createRadialGradient(128, 132, 55, 128, 132, 108);
      grad.addColorStop(0.0, 'rgba(255,255,255,0.00)');
      grad.addColorStop(1.0, 'rgba(0,0,0,0.22)');
      c.fillStyle = grad;
      c.fillRect(0, 0, 256, 256);
      c.restore();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, faceCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } catch (err) {
      console.warn('Textura oval de retrato manteve placeholder:', url, err);
    }
  };
  image.onerror = () => console.warn('Não foi possível carregar retrato oval:', url);
  image.src = url;
  return texture;
}


function createOvalFrameTexture(gl) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(128, 130, 96, 108, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f6eed7';
  ctx.fill();
  ctx.restore();

  // Retira o miolo para virar apenas uma moldura oval translúcida.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(128, 130, 84, 96, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Borda dourada mais fina para realçar a leitura do rosto.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(128, 130, 95, 107, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#d8b76a';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  return createTextureFromCanvas(gl, canvas, { flipY: true });
}

function createProceduralFaceTexture(gl, seed = 1, label = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(128, 130, 88, 100, 0, 0, Math.PI * 2);
  ctx.clip();
  const hue = (seed * 47) % 360;
  ctx.fillStyle = `hsl(${24 + (seed % 5) * 5}, 42%, ${58 + (seed % 4) * 4}%)`;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.035)';
    ctx.fillRect(x, y, Math.random() * 2.0, Math.random() * 2.0);
  }
  ctx.fillStyle = '#18110d';
  ctx.beginPath(); ctx.ellipse(92, 116, 10, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(164, 116, 10, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1710';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(74, 92); ctx.quadraticCurveTo(96, 82, 118, 92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(140, 92); ctx.quadraticCurveTo(164, 82, 184, 92); ctx.stroke();
  ctx.strokeStyle = '#612718';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(92, 169); ctx.quadraticCurveTo(128, 190 + (seed % 3) * 4, 164, 169); ctx.stroke();
  ctx.fillStyle = `hsl(${hue}, 48%, 27%)`;
  ctx.fillRect(48, 30, 160, 38);
  if (label) {
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.font = '900 24px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label.slice(0, 3), 128, 232);
  }
  const grad = ctx.createRadialGradient(128, 132, 45, 128, 132, 108);
  grad.addColorStop(0.0, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  ctx.restore();
  return createTextureFromCanvas(gl, canvas, { flipY: true });
}

function createTextTexture(gl, text, options = {}) {
  const width = options.width || 512;
  const height = options.height || 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bg = options.bg || '#b99a38';
  const fg = options.fg || '#101014';
  const border = options.border || '#181818';
  const fontSize = options.fontSize || Math.floor(height * 0.42);
  const subtitle = options.subtitle || '';

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, options.bg2 || '#e0c25b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Desgaste procedural: deixa as placas com aparência de tinta antiga.
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.8;
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#ffffff';
    ctx.fillRect(x, y, r, r);
  }
  ctx.globalAlpha = 1.0;

  ctx.strokeStyle = border;
  ctx.lineWidth = Math.max(5, height * 0.055);
  ctx.strokeRect(ctx.lineWidth * 0.5, ctx.lineWidth * 0.5, width - ctx.lineWidth, height - ctx.lineWidth);

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.shadowColor = 'rgba(255,255,255,0.25)';
  ctx.shadowBlur = 2;
  ctx.fillText(text, width * 0.5, subtitle ? height * 0.44 : height * 0.52);
  if (subtitle) {
    ctx.font = `700 ${Math.floor(fontSize * 0.42)}px Arial, Helvetica, sans-serif`;
    ctx.shadowBlur = 0;
    ctx.fillText(subtitle, width * 0.5, height * 0.78);
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function createProceduralTextures(gl) {
  const size = 256;
  const textures = {
    concrete: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y, w, h) => {
      const n = fractal(x / 30, y / 30);
      const verticalStain = Math.max(0, Math.sin(x * 0.11 + valueNoise(x / 16, y / 18) * 3.0) - 0.82) * -45;
      const crack = (Math.abs((x + Math.floor(valueNoise(y / 8, x / 8) * 18)) % 83 - 42) < 0.7) ? -55 : 0;
      const age = y / h * -18;
      const v = 88 + n * 58 + verticalStain + crack + age;
      return [v, v + 3, v + 7, 255];
    })),

    darkConcrete: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 18, y / 18);
      const stains = valueNoise(x / 10, y / 28) > 0.64 ? -28 : 0;
      const v = 45 + n * 42 + stains;
      return [v, v + 2, v + 6, 255];
    })),

    floorStone: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const tileX = Math.floor(x / 32);
      const tileY = Math.floor(y / 32);
      const mortar = (x % 32 < 2 || y % 32 < 2) ? -60 : 0;
      const shade = ((tileX + tileY) % 2) * 8;
      const chips = valueNoise(x / 5, y / 5) > 0.80 ? -35 : 0;
      const n = fractal((x + tileX * 7) / 15, (y + tileY * 11) / 15) * 42;
      const v = 92 + n + shade + mortar + chips;
      return [v, v - 4, v - 9, 255];
    })),

    cobblePath: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const bx = Math.floor(x / 24);
      const by = Math.floor(y / 18);
      const offset = (by % 2) * 12;
      const localX = (x + offset) % 24;
      const localY = y % 18;
      const mortar = (localX < 2 || localY < 2) ? -62 : 0;
      const n = fractal((x + bx * 9) / 11, (y + by * 5) / 11) * 52;
      const v = 108 + n + mortar;
      return [v, v - 2, v - 8, 255];
    })),

    sandGrass: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 18, y / 18);
      const patch = valueNoise(x / 38, y / 38);
      if (patch > 0.55) return [72 + n * 38, 103 + n * 40, 55 + n * 22, 255];
      return [150 + n * 54, 130 + n * 40, 78 + n * 25, 255];
    })),

    wood: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const grain = Math.sin(x * 0.18 + fractal(x / 12, y / 30) * 7.0) * 22;
      const plank = (x % 42 < 3) ? -34 : 0;
      const knots = valueNoise(x / 22, y / 22) > 0.76 ? -28 : 0;
      return [96 + grain + plank + knots, 59 + grain * 0.56 + plank, 31 + grain * 0.28 + plank, 255];
    })),

    metal: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const brushed = Math.sin(y * 0.45) * 8 + valueNoise(x / 7, y / 4) * 18;
      const rust = valueNoise(x / 18, y / 18) > 0.74 ? 34 : 0;
      const v = 72 + brushed;
      return [v + rust, v + 2 - rust * 0.35, v + 6 - rust * 0.55, 255];
    })),

    blackMetal: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const scratch = (valueNoise(x / 3, y / 13) > 0.82) ? 25 : 0;
      const v = 22 + fractal(x / 9, y / 9) * 24 + scratch;
      return [v, v + 1, v + 4, 255];
    })),

    roof: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const seam = (x % 26 < 2) ? -32 : 0;
      const n = fractal(x / 20, y / 18) * 26;
      return [48 + n + seam, 55 + n + seam, 58 + n + seam, 255];
    })),

    rock: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 13, y / 13);
      const veins = Math.abs(Math.sin(x * 0.10 + y * 0.07 + n * 4.0)) < 0.08 ? 35 : 0;
      const v = 74 + n * 58 + veins;
      return [v, v, v - 5, 255];
    })),

    hazard: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const stripe = ((x + y) % 64) < 32;
      const n = fractal(x / 8, y / 8) * 16;
      return stripe ? [205 + n, 155 + n, 26, 255] : [24 + n, 24 + n, 24 + n, 255];
    })),

    clothRed: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const weave = Math.sin(x * 1.4) * 6 + Math.sin(y * 1.2) * 4 + fractal(x / 8, y / 8) * 18;
      return [130 + weave, 31 + weave * 0.35, 28 + weave * 0.22, 255];
    })),

    orangeCloth: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const weave = Math.sin(x * 1.1) * 4 + Math.sin(y * 1.3) * 5 + fractal(x / 10, y / 10) * 16;
      return [180 + weave, 86 + weave * 0.45, 22 + weave * 0.22, 255];
    })),

    blueCloth: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const weave = Math.sin(x * 1.2) * 5 + Math.sin(y * 1.0) * 4 + fractal(x / 10, y / 10) * 14;
      return [35 + weave * 0.25, 70 + weave * 0.55, 118 + weave, 255];
    })),

    skin: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 24, y / 24) * 18;
      return [189 + n, 137 + n * 0.72, 103 + n * 0.55, 255];
    })),

    caramelFur: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 14, y / 16) * 35;
      const strand = Math.sin(x * 0.45 + y * 0.06) * 10;
      return [156 + n + strand, 94 + n * 0.55 + strand * 0.35, 38 + n * 0.28, 255];
    })),


    brick: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const rowH = 22;
      const colW = 46;
      const row = Math.floor(y / rowH);
      const offset = (row % 2) * Math.floor(colW / 2);
      const lx = (x + offset) % colW;
      const ly = y % rowH;
      const mortar = (lx < 3 || ly < 3) ? -70 : 0;
      const n = fractal((x + row * 13) / 13, (y + row * 5) / 13) * 42;
      const stain = valueNoise(x / 32, y / 45) > 0.72 ? -26 : 0;
      return [112 + n + mortar + stain, 71 + n * 0.55 + mortar, 52 + n * 0.35 + mortar, 255];
    })),

    oldPlaster: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 22, y / 22);
      const peeled = valueNoise(x / 24, y / 18) > 0.72 ? -48 : 0;
      const crack = Math.abs(Math.sin(x * 0.035 + y * 0.09 + valueNoise(x / 18, y / 18) * 4.0)) < 0.018 ? -72 : 0;
      const v = 122 + n * 54 + peeled + crack;
      return [v, v - 1, v - 6, 255];
    })),

    rustMetal: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 10, y / 10) * 35;
      const rust = valueNoise(x / 15, y / 15) > 0.55 ? 60 : 0;
      const scratch = (valueNoise(x / 3, y / 28) > 0.85) ? 35 : 0;
      return [58 + n + rust + scratch, 60 + n * 0.75 + rust * 0.35, 58 + n * 0.65 - rust * 0.25, 255];
    })),

    gravel: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 8, y / 8);
      const pebble = valueNoise(x / 4, y / 4) > 0.62 ? 36 : -8;
      const v = 82 + n * 52 + pebble;
      return [v, v - 3, v - 8, 255];
    })),

    weeds: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const n = fractal(x / 14, y / 14);
      const blade = Math.abs(Math.sin((x + valueNoise(x / 8, y / 8) * 15.0) * 0.45)) < 0.10 ? 38 : 0;
      return [45 + n * 35, 88 + n * 65 + blade, 38 + n * 28, 255];
    })),

    signPaint: createTextureFromData(gl, size, size, makeTexture(size, size, (x, y) => {
      const faded = fractal(x / 20, y / 20) * 28;
      const edge = (x < 8 || y < 8 || x > 247 || y > 247) ? -50 : 0;
      return [210 + faded + edge, 180 + faded * 0.5 + edge, 85 + faded * 0.22 + edge, 255];
    })),

    nightSky: createNightSkyTexture(gl),

    faceFrame: createOvalFrameTexture(gl),
    faceLula: createOvalImageTexture(gl, 'assets/lula_portrait.jpg'),
    faceBolsonaro: createOvalImageTexture(gl, 'assets/bolsonaro_portrait.jpg'),
    faceCaneta: createOvalImageTexture(gl, 'assets/caneta_azul_portrait.jpg'),
    faceLuva: createOvalImageTexture(gl, 'assets/luva_de_pedreiro_portrait.jpg'),
    faceNilson: createOvalImageTexture(gl, 'assets/nilson_papinho_portrait.jpg'),
    faceBeto: createOvalImageTexture(gl, 'assets/beto_carrapato_portrait.jpg'),
    facePix: createOvalImageTexture(gl, 'assets/zezinho_do_pix_portrait.jpg'),
    faceChico: createOvalImageTexture(gl, 'assets/chico_moedas_portrait.jpg'),
    faceNabuco: createOvalImageTexture(gl, 'assets/nabucodonosor_portrait.jpg'),
    faceToninho: createOvalImageTexture(gl, 'assets/toninho_tornado_portrait.jpg'),
    facePastel: createOvalImageTexture(gl, 'assets/pastel_de_feira_portrait.jpg')
  };
  return textures;
}

window.createTextureFromData = createTextureFromData;
window.createImageTexture = createImageTexture;
window.createNightSkyTexture = createNightSkyTexture;
window.createSkyTextureFromCanvas = createSkyTextureFromCanvas;
window.createOvalImageTexture = createOvalImageTexture;
window.createProceduralFaceTexture = createProceduralFaceTexture;
window.createTextTexture = createTextTexture;
window.createProceduralTextures = createProceduralTextures;
