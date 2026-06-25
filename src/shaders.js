'use strict';

const StandardShaderSource = {
  vertex: `
    precision highp float;

    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform mat3 uNormalMatrix;
    uniform vec2 uTexScale;

    varying vec3 vFragPos;
    varying vec3 vNormal;
    varying vec2 vTexCoord;

    void main() {
      vec4 worldPos = uModel * vec4(aPosition, 1.0);
      vFragPos = worldPos.xyz;
      vNormal = normalize(uNormalMatrix * aNormal);
      vTexCoord = aTexCoord * uTexScale;
      gl_Position = uProjection * uView * worldPos;
    }
  `,

  fragment: `
    precision highp float;

    varying vec3 vFragPos;
    varying vec3 vNormal;
    varying vec2 vTexCoord;

    uniform vec3 uCameraPosition;
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform vec3 uMoonDirection;
    uniform vec3 uMoonColor;
    uniform vec3 uMaterialColor;
    uniform sampler2D uTexture;
    uniform bool uUseTexture;
    uniform float uAmbientStrength;
    uniform float uSpecularStrength;
    uniform float uShininess;
    uniform float uAlpha;
    uniform float uEmissive;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;
    uniform vec3 uFlashlightPosition;
    uniform vec3 uFlashlightDirection;
    uniform float uFlashlightStrength;
    uniform vec3 uRedLightPosition;
    uniform float uRedLightIntensity;
    uniform vec3 uAuxLight0Position;
    uniform vec3 uAuxLight0Color;
    uniform float uAuxLight0Intensity;
    uniform vec3 uAuxLight1Position;
    uniform vec3 uAuxLight1Color;
    uniform float uAuxLight1Intensity;
    uniform vec3 uAuxLight2Position;
    uniform vec3 uAuxLight2Color;
    uniform float uAuxLight2Intensity;

    vec3 computePointLight(vec3 lightPos, vec3 lightCol, float intensity, vec3 baseColor, vec3 norm, vec3 viewDir) {
      vec3 lightDir = normalize(lightPos - vFragPos);
      float diff = max(dot(norm, lightDir), 0.0);
      vec3 reflectDir = reflect(-lightDir, norm);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
      float d = length(lightPos - vFragPos);
      float attenuation = 1.0 / (1.0 + 0.018 * d + 0.0017 * d * d);
      return intensity * attenuation * ((diff * baseColor * lightCol) + (uSpecularStrength * spec * lightCol));
    }

    void main() {
      vec4 tex = vec4(1.0);
      if (uUseTexture) {
        tex = texture2D(uTexture, vTexCoord);
      }
      vec3 baseColor = tex.rgb * uMaterialColor;

      vec3 norm = normalize(vNormal);
      vec3 viewDir = normalize(uCameraPosition - vFragPos);

      vec3 pointLight = computePointLight(uLightPosition, uLightColor, 1.0, baseColor, norm, viewDir);
      pointLight += computePointLight(uAuxLight0Position, uAuxLight0Color, uAuxLight0Intensity, baseColor, norm, viewDir);
      pointLight += computePointLight(uAuxLight1Position, uAuxLight1Color, uAuxLight1Intensity, baseColor, norm, viewDir);
      pointLight += computePointLight(uAuxLight2Position, uAuxLight2Color, uAuxLight2Intensity, baseColor, norm, viewDir);

      vec3 moonDir = normalize(-uMoonDirection);
      float moonDiff = max(dot(norm, moonDir), 0.0);
      vec3 moonHalf = normalize(moonDir + viewDir);
      float moonSpec = pow(max(dot(norm, moonHalf), 0.0), max(4.0, uShininess * 0.42));
      vec3 moonLight = 0.36 * moonDiff * baseColor * uMoonColor + 0.22 * uSpecularStrength * moonSpec * uMoonColor;

      // Lanterna automática da sala escura: cone real em torno da direção da câmera.
      vec3 flashToFrag = vFragPos - uFlashlightPosition;
      float flashDist = length(flashToFrag);
      vec3 flashRay = normalize(flashToFrag);
      float coneBase = smoothstep(0.50, 0.88, dot(flashRay, normalize(uFlashlightDirection)));
      float cone = coneBase * (0.78 + 0.22 * coneBase);
      vec3 flashDir = normalize(uFlashlightPosition - vFragPos);
      float flashDiff = 0.10 + 0.55 * max(dot(norm, flashDir), 0.0);
      vec3 flashReflect = reflect(-flashDir, norm);
      float flashSpec = pow(max(dot(viewDir, flashReflect), 0.0), max(10.0, uShininess * 0.85));
      float flashAtt = 1.0 / (1.0 + 0.045 * flashDist + 0.018 * flashDist * flashDist);
      vec3 flashDiffuse = flashDiff * baseColor * vec3(1.0, 0.95, 0.84);
      vec3 flashHighlight = 0.20 * flashSpec * uSpecularStrength * vec3(1.0, 0.94, 0.80);
      vec3 flashlight = uFlashlightStrength * cone * flashAtt * (flashDiffuse + flashHighlight);

      // Canal vermelho opcional desativado nesta revisão; intensidade fica zero por padrão.
      vec3 redDir = normalize(uRedLightPosition - vFragPos);
      float redDiff = max(dot(norm, redDir), 0.0);
      float redDist = length(uRedLightPosition - vFragPos);
      float redAtt = 1.0 / (1.0 + 0.035 * redDist + 0.012 * redDist * redDist);
      vec3 redLight = uRedLightIntensity * redAtt * (0.25 + redDiff) * baseColor * vec3(1.0, 0.05, 0.025);

      // Oclusão falsa nos cantos da arquitetura, dá mais peso visual aos blocos feitos manualmente.
      float grime = 1.0 - 0.08 * smoothstep(0.0, 0.4, abs(vNormal.y));
      vec3 ambient = uAmbientStrength * baseColor * grime;
      vec3 color = ambient + pointLight + moonLight + flashlight + redLight + baseColor * uEmissive;

      float distCam = length(uCameraPosition - vFragPos);
      float fogFactor = smoothstep(uFogNear, uFogFar, distCam);
      color = mix(color, uFogColor, fogFactor * 0.52);

      gl_FragColor = vec4(color, uAlpha * tex.a);
    }
  `
};

const WaterShaderSource = {
  vertex: `
    precision highp float;

    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform float uTime;

    varying vec3 vFragPos;
    varying vec2 vTexCoord;
    varying float vWave;
    varying float vTurbulence;

    float waveHeight(vec2 p, float t) {
      float h = 0.0;
      h += sin(dot(p, normalize(vec2( 0.86,  0.50))) * 0.42 + t * 1.35) * 0.30;
      h += sin(dot(p, normalize(vec2(-0.32,  0.95))) * 0.68 + t * 1.82) * 0.18;
      h += sin(dot(p, normalize(vec2( 0.12, -0.99))) * 1.15 + t * 2.28) * 0.09;
      h += sin(dot(p, normalize(vec2(-0.76, -0.64))) * 1.85 + t * 2.95) * 0.045;
      return h;
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 flatWorld = uModel * vec4(aPosition, 1.0);
      vec2 p = flatWorld.xz;
      float micro = hash(floor((p + uTime * 0.35) * 0.95)) * 0.035;
      float wave = waveHeight(p, uTime) + micro;

      vec3 pos = aPosition;
      pos.y += wave;
      vec4 worldPos = uModel * vec4(pos, 1.0);
      vFragPos = worldPos.xyz;
      vTexCoord = aTexCoord;
      vWave = wave;
      vTurbulence = abs(waveHeight(p + vec2(0.7, -0.4), uTime * 1.13));
      gl_Position = uProjection * uView * worldPos;
    }
  `,

  fragment: `
    precision highp float;

    varying vec3 vFragPos;
    varying vec2 vTexCoord;
    varying float vWave;
    varying float vTurbulence;

    uniform vec3 uCameraPosition;
    uniform vec3 uLightPosition;
    uniform float uTime;
    uniform vec3 uFogColor;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += noise(p) * a;
        p *= 2.03;
        a *= 0.5;
      }
      return v;
    }

    float waveHeight(vec2 p, float t) {
      float h = 0.0;
      h += sin(dot(p, normalize(vec2( 0.86,  0.50))) * 0.42 + t * 1.35) * 0.30;
      h += sin(dot(p, normalize(vec2(-0.32,  0.95))) * 0.68 + t * 1.82) * 0.18;
      h += sin(dot(p, normalize(vec2( 0.12, -0.99))) * 1.15 + t * 2.28) * 0.09;
      h += sin(dot(p, normalize(vec2(-0.76, -0.64))) * 1.85 + t * 2.95) * 0.045;
      h += (fbm(p * 0.22 + vec2(t * 0.08, -t * 0.05)) - 0.5) * 0.12;
      return h;
    }

    void main() {
      vec2 p = vFragPos.xz;
      float e = 0.38;
      float h = waveHeight(p, uTime);
      float hx = waveHeight(p + vec2(e, 0.0), uTime) - h;
      float hz = waveHeight(p + vec2(0.0, e), uTime) - h;
      vec3 normal = normalize(vec3(-hx / e, 1.0, -hz / e));

      float islandEllipse = length(vec2(p.x / 28.0, (p.y + 12.0) / 78.0));
      // Empurra a água animada ainda mais para a borda da ilha para cobrir a faixa escura
      // perto do barco, mas continua ocultando a água no interior da ilha.
      if (islandEllipse < 0.84) discard;
      float shallow = 1.0 - smoothstep(0.84, 1.18, islandEllipse);
      float shoreBand = smoothstep(0.84, 1.01, islandEllipse) * (1.0 - smoothstep(1.01, 1.16, islandEllipse));
      float whitecap = smoothstep(0.42, 0.78, abs(vWave) + vTurbulence * 0.55);
      float foamNoise = fbm(p * 0.55 + vec2(uTime * 0.15, -uTime * 0.20));
      float foam = max(whitecap * smoothstep(0.48, 0.78, foamNoise), shoreBand * smoothstep(0.25, 0.82, foamNoise));

      vec3 deep = vec3(0.012, 0.075, 0.145);
      vec3 mid = vec3(0.020, 0.205, 0.310);
      vec3 shallowColor = vec3(0.055, 0.360, 0.390);
      vec3 color = mix(deep, mid, 0.45 + h * 0.55);
      color = mix(color, shallowColor, shallow * 0.50);
      color = mix(color, vec3(0.88, 0.97, 1.0), foam * 0.78);

      vec3 viewDir = normalize(uCameraPosition - vFragPos);
      vec3 lightDir = normalize(uLightPosition - vFragPos);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 88.0);
      float sparkle = smoothstep(0.88, 1.0, noise(p * 1.65 + uTime * 0.8)) * spec;
      color += vec3(0.16, 0.36, 0.55) * fresnel;
      color += vec3(1.0, 0.92, 0.70) * (spec * 0.82 + sparkle * 0.65);

      float distCam = length(uCameraPosition - vFragPos);
      float fogFactor = smoothstep(38.0, 145.0, distCam);
      color = mix(color, uFogColor, fogFactor * 0.42);

      gl_FragColor = vec4(color, 0.965);
    }
  `
};




const SkyShaderSource = {
  vertex: `
    precision highp float;

    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    varying vec3 vDirection;

    void main() {
      vec4 worldPos = uModel * vec4(aPosition, 1.0);
      vDirection = normalize(aPosition);
      gl_Position = uProjection * uView * worldPos;
    }
  `,

  fragment: `
    precision highp float;

    varying vec3 vDirection;

    uniform sampler2D uSkyTexture;
    uniform float uTime;
    uniform vec3 uMoonDirection;

    const float PI = 3.14159265358979323846;

    vec2 directionToEquirectUV(vec3 dir) {
      dir = normalize(dir);
      float u = atan(dir.z, dir.x) / (2.0 * PI) + 0.5;
      float v = acos(clamp(dir.y, -1.0, 1.0)) / PI;
      return vec2(fract(u + 0.30), clamp(v, 0.001, 0.999));
    }

    void main() {
      vec3 dir = normalize(vDirection);
      vec2 uv = directionToEquirectUV(dir);
      vec3 sky = texture2D(uSkyTexture, uv).rgb;

      // Integração cinematográfica: horizonte um pouco mais frio e céu discretamente mais escuro.
      float horizon = 1.0 - smoothstep(-0.16, 0.20, dir.y);
      sky += vec3(0.006, 0.011, 0.020) * horizon * 0.28;

      float zenith = smoothstep(0.18, 0.98, dir.y);
      sky *= mix(0.96, 0.88, zenith * 0.32);
      sky = pow(max(sky, vec3(0.0)), vec3(1.03));

      gl_FragColor = vec4(min(sky, vec3(1.0)), 1.0);
    }
  `
};

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Erro ao compilar shader: ' + error);
  }
  return shader;
}

function linkProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Erro ao linkar programa WebGL: ' + error);
  }
  return program;
}

function createStandardShaderProgram(gl) {
  const program = linkProgram(gl, StandardShaderSource.vertex, StandardShaderSource.fragment);
  return {
    program,
    attrib: {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      texCoord: gl.getAttribLocation(program, 'aTexCoord')
    },
    uniform: {
      model: gl.getUniformLocation(program, 'uModel'),
      view: gl.getUniformLocation(program, 'uView'),
      projection: gl.getUniformLocation(program, 'uProjection'),
      normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
      cameraPosition: gl.getUniformLocation(program, 'uCameraPosition'),
      lightPosition: gl.getUniformLocation(program, 'uLightPosition'),
      lightColor: gl.getUniformLocation(program, 'uLightColor'),
      moonDirection: gl.getUniformLocation(program, 'uMoonDirection'),
      moonColor: gl.getUniformLocation(program, 'uMoonColor'),
      materialColor: gl.getUniformLocation(program, 'uMaterialColor'),
      texture: gl.getUniformLocation(program, 'uTexture'),
      useTexture: gl.getUniformLocation(program, 'uUseTexture'),
      texScale: gl.getUniformLocation(program, 'uTexScale'),
      ambientStrength: gl.getUniformLocation(program, 'uAmbientStrength'),
      specularStrength: gl.getUniformLocation(program, 'uSpecularStrength'),
      shininess: gl.getUniformLocation(program, 'uShininess'),
      alpha: gl.getUniformLocation(program, 'uAlpha'),
      emissive: gl.getUniformLocation(program, 'uEmissive'),
      fogColor: gl.getUniformLocation(program, 'uFogColor'),
      fogNear: gl.getUniformLocation(program, 'uFogNear'),
      fogFar: gl.getUniformLocation(program, 'uFogFar'),
      flashlightPosition: gl.getUniformLocation(program, 'uFlashlightPosition'),
      flashlightDirection: gl.getUniformLocation(program, 'uFlashlightDirection'),
      flashlightStrength: gl.getUniformLocation(program, 'uFlashlightStrength'),
      redLightPosition: gl.getUniformLocation(program, 'uRedLightPosition'),
      redLightIntensity: gl.getUniformLocation(program, 'uRedLightIntensity'),
      auxLight0Position: gl.getUniformLocation(program, 'uAuxLight0Position'),
      auxLight0Color: gl.getUniformLocation(program, 'uAuxLight0Color'),
      auxLight0Intensity: gl.getUniformLocation(program, 'uAuxLight0Intensity'),
      auxLight1Position: gl.getUniformLocation(program, 'uAuxLight1Position'),
      auxLight1Color: gl.getUniformLocation(program, 'uAuxLight1Color'),
      auxLight1Intensity: gl.getUniformLocation(program, 'uAuxLight1Intensity'),
      auxLight2Position: gl.getUniformLocation(program, 'uAuxLight2Position'),
      auxLight2Color: gl.getUniformLocation(program, 'uAuxLight2Color'),
      auxLight2Intensity: gl.getUniformLocation(program, 'uAuxLight2Intensity')
    }
  };
}


function createSkyShaderProgram(gl) {
  const program = linkProgram(gl, SkyShaderSource.vertex, SkyShaderSource.fragment);
  return {
    program,
    attrib: {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      texCoord: gl.getAttribLocation(program, 'aTexCoord')
    },
    uniform: {
      model: gl.getUniformLocation(program, 'uModel'),
      view: gl.getUniformLocation(program, 'uView'),
      projection: gl.getUniformLocation(program, 'uProjection'),
      skyTexture: gl.getUniformLocation(program, 'uSkyTexture'),
      time: gl.getUniformLocation(program, 'uTime'),
      moonDirection: gl.getUniformLocation(program, 'uMoonDirection')
    }
  };
}

function createWaterShaderProgram(gl) {
  const program = linkProgram(gl, WaterShaderSource.vertex, WaterShaderSource.fragment);
  return {
    program,
    attrib: {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      texCoord: gl.getAttribLocation(program, 'aTexCoord')
    },
    uniform: {
      model: gl.getUniformLocation(program, 'uModel'),
      view: gl.getUniformLocation(program, 'uView'),
      projection: gl.getUniformLocation(program, 'uProjection'),
      time: gl.getUniformLocation(program, 'uTime'),
      cameraPosition: gl.getUniformLocation(program, 'uCameraPosition'),
      lightPosition: gl.getUniformLocation(program, 'uLightPosition'),
      fogColor: gl.getUniformLocation(program, 'uFogColor')
    }
  };
}

window.createShaderProgram = createStandardShaderProgram;
window.createStandardShaderProgram = createStandardShaderProgram;
window.createSkyShaderProgram = createSkyShaderProgram;
window.createWaterShaderProgram = createWaterShaderProgram;
