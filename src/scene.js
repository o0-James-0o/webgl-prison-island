'use strict';

class AlcatrazScene {
  constructor(gl) {
    this.gl = gl;
    this.textures = createProceduralTextures(gl);
    this.meshes = {
      cube: new Mesh(gl, Geometry.cube()),
      plane: new Mesh(gl, Geometry.plane()),
      verticalPlane: new Mesh(gl, Geometry.verticalPlane()),
      waterGrid: new Mesh(gl, Geometry.gridPlane(144, 58)),
      island: new Mesh(gl, Geometry.island(160, 22)),
      cylinder: new Mesh(gl, Geometry.cylinder(64)),
      sphere: new Mesh(gl, Geometry.sphere(28, 38)),
      skySphere: new Mesh(gl, Geometry.sphere(40, 64)),
      facePatch: new Mesh(gl, Geometry.curvedFacePatch(22, 22)),
      cone: new Mesh(gl, Geometry.cone(64)),
      beaconBeam: new Mesh(gl, Geometry.beaconBeam(64)),
      prism: new Mesh(gl, Geometry.triangularPrism())
    };

    this.objects = [];
    this.transparentObjects = [];
    this.waterObjects = [];
    this.colliders = [];
    this.interestZones = [];

    this.islandRadiusX = 26.2;
    this.islandRadiusZ = 76.8;
    this.lighthouseX = 19.0;
    this.lighthouseLeftX = -19.0;
    this.lighthouseZ = 3.8;
    this.beaconCenter = [this.lighthouseX, 8.35, this.lighthouseZ];
    this.leftBeaconCenter = [this.lighthouseLeftX, 8.35, this.lighthouseZ];
    // O farol passa a ser cenográfico: continua visível e com feixe animado,
    // mas a iluminação real do interior vem de três pontos físicos.
    this.scenicLightPosition = this.beaconCenter.slice();
    // Luz real 3: corredor de controle / distribuição geral do bloco interno.
    this.lightPosition = [0.0, 4.10, -18.0];
    this.lightColor = [0.92, 0.96, 1.0];
    // Luzes reais 1 e 2: acima das placas do refeitório esquerdo e direito.
    this.messHallLights = [
      { position: [-10.06, 2.96, -5.80], color: [1.0, 0.90, 0.68], intensity: 1.95 },
      { position: [ 10.06, 2.96, -5.80], color: [1.0, 0.90, 0.68], intensity: 1.95 },
      { position: [  0.00, 4.10, -18.0], color: [0.92, 0.96, 1.0], intensity: 1.15 }
    ];
    this.defaultMainLight = { position: [0.0, 4.10, -18.0], color: [0.92, 0.96, 1.0] };
    this.defaultAuxLights = [
      { position: [-10.06, 2.96, -5.80], color: [1.0, 0.90, 0.68], intensity: 1.95 },
      { position: [ 10.06, 2.96, -5.80], color: [1.0, 0.90, 0.68], intensity: 1.95 },
      { position: [  0.00, 4.10, -18.0], color: [0.92, 0.96, 1.0], intensity: 1.15 }
    ];
    // Ala das celas: sem pontos de luz reais; a leitura visual fica a cargo da lanterna.
    this.cellWingLighting = {
      main: { position: [0.0, 3.20, -58.5], color: [0.0, 0.0, 0.0] },
      aux: [
        { position: [-4.85, 2.95, -45.4], color: [0.0, 0.0, 0.0], intensity: 0.0 },
        { position: [ 4.85, 2.95, -56.2], color: [0.0, 0.0, 0.0], intensity: 0.0 },
        { position: [ 0.00, 2.95, -69.2], color: [0.0, 0.0, 0.0], intensity: 0.0 }
      ]
    };
    this.moonDirection = [-0.35, -1.0, -0.25];
    this.moonColor = [0.45, 0.57, 0.78];
    this.fogColor = [0.032, 0.052, 0.072];

    this.outerGateAmount = 0;
    this.innerGateAmount = 0;
    this.outerGateLeft = null;
    this.outerGateRight = null;
    this.innerGateLeft = null;
    this.innerGateRight = null;
    this.darkGateAmount = 0;
    this.darkGateLeft = null;
    this.darkGateRight = null;
    this.exitGateAmount = 0;
    this.exitGateLeft = null;
    this.exitGateRight = null;
    this.exitDoor = null;
    this.infirmaryDoorAmount = 0;
    this.infirmaryDoor = null;
    this.controlDoorAmount = 0;
    this.controlDoor = null;
    this.fiscalDoorAmount = 0;
    this.fiscalDoor = null;
    this.flashlightEnabled = 0;
    this.redLightPosition = [0, 2.2, -61.0];
    this.redLightIntensity = 0;
    this.labelCache = {};
    this.searchlightHead = null;
    this.searchBeam = null;
    this.searchLens = null;
    this.leftSearchlightHead = null;
    this.leftSearchBeam = null;
    this.leftSearchLens = null;
    this.lifeboatObjects = [];
    this.lifeboatBasePosition = [0.0, -0.78, 64.5];
    this.lifeboatBaseRotation = [0, Math.PI, 0];
    this.lifeboatBaseScale = [9.0, 9.0, 9.0];

    this.materials = this.createMaterials();
    this.skyObject = new SceneObject({
      name: 'Céu noturno realista em skydome',
      mesh: this.meshes.skySphere,
      material: { texture: this.textures.nightSky },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [220, 220, 220]
    });
    this.buildScene();
  }

  createMaterials() {
    const t = this.textures;
    return {
      concrete: { color: [0.90, 0.91, 0.90], texture: t.concrete, specular: 0.12, shininess: 18, texScale: [2.0, 2.0], alpha: 1, emissive: 0 },
      darkConcrete: { color: [0.66, 0.69, 0.72], texture: t.darkConcrete, specular: 0.14, shininess: 20, texScale: [2.8, 2.8], alpha: 1, emissive: 0 },
      oldPlaster: { color: [0.84, 0.83, 0.78], texture: t.oldPlaster || t.concrete, specular: 0.10, shininess: 16, texScale: [2.5, 2.5], alpha: 1, emissive: 0 },
      brick: { color: [0.93, 0.84, 0.76], texture: t.brick || t.concrete, specular: 0.08, shininess: 12, texScale: [3.5, 3.0], alpha: 1, emissive: 0 },
      stone: { color: [0.95, 0.94, 0.91], texture: t.floorStone, specular: 0.18, shininess: 22, texScale: [3.3, 3.3], alpha: 1, emissive: 0 },
      path: { color: [0.96, 0.94, 0.86], texture: t.cobblePath, specular: 0.10, shininess: 14, texScale: [3.0, 8.0], alpha: 1, emissive: 0 },
      gravel: { color: [0.85, 0.84, 0.80], texture: t.gravel || t.rock, specular: 0.05, shininess: 10, texScale: [5.0, 5.0], alpha: 1, emissive: 0 },
      island: { color: [0.82, 0.92, 0.70], texture: t.sandGrass, specular: 0.04, shininess: 8, texScale: [10.0, 10.0], alpha: 1, emissive: 0 },
      weeds: { color: [0.82, 0.96, 0.72], texture: t.weeds || t.sandGrass, specular: 0.03, shininess: 8, texScale: [5.0, 5.0], alpha: 1, emissive: 0 },
      wood: { color: [1.0, 0.92, 0.78], texture: t.wood, specular: 0.22, shininess: 26, texScale: [3.0, 2.0], alpha: 1, emissive: 0 },
      lifeboatRed: { color: [0.92, 0.08, 0.045], texture: t.metal, specular: 0.42, shininess: 48, texScale: [1.8, 1.8], alpha: 1, emissive: 0 },
      lifeboatDarkRed: { color: [0.42, 0.035, 0.025], texture: t.metal, specular: 0.36, shininess: 42, texScale: [1.8, 1.8], alpha: 1, emissive: 0 },
      lifeboatWhite: { color: [0.96, 0.94, 0.86], texture: t.concrete, specular: 0.30, shininess: 34, texScale: [1.4, 1.4], alpha: 1, emissive: 0 },
      lifeboatBlack: { color: [0.04, 0.04, 0.045], texture: t.blackMetal, specular: 0.70, shininess: 78, texScale: [1.5, 1.5], alpha: 1, emissive: 0 },
      metal: { color: [0.84, 0.84, 0.82], texture: t.metal, specular: 0.84, shininess: 88, texScale: [3.0, 3.0], alpha: 1, emissive: 0 },
      rustMetal: { color: [0.85, 0.76, 0.66], texture: t.rustMetal || t.metal, specular: 0.54, shininess: 64, texScale: [3.5, 3.5], alpha: 1, emissive: 0 },
      blackMetal: { color: [0.20, 0.21, 0.23], texture: t.blackMetal, specular: 0.88, shininess: 96, texScale: [3.0, 3.0], alpha: 1, emissive: 0 },
      roof: { color: [0.72, 0.78, 0.82], texture: t.roof, specular: 0.48, shininess: 54, texScale: [4.0, 1.5], alpha: 1, emissive: 0 },
      rock: { color: [0.84, 0.84, 0.80], texture: t.rock, specular: 0.12, shininess: 16, texScale: [2.0, 2.0], alpha: 1, emissive: 0 },
      hazard: { color: [1.0, 1.0, 1.0], texture: t.hazard, specular: 0.36, shininess: 38, texScale: [3.0, 1.0], alpha: 1, emissive: 0 },
      signPaint: { color: [1.0, 1.0, 1.0], texture: t.signPaint || t.hazard, specular: 0.18, shininess: 16, texScale: [1.0, 1.0], alpha: 1, emissive: 0.04 },
      orangeSuit: { color: [1.0, 0.86, 0.58], texture: t.orangeCloth, specular: 0.56, shininess: 58, texScale: [1.5, 1.5], alpha: 1, emissive: 0.080 },
      blueSuit: { color: [0.68, 0.84, 1.0], texture: t.blueCloth, specular: 0.56, shininess: 60, texScale: [1.5, 1.5], alpha: 1, emissive: 0.080 },
      skin: { color: [1.0, 0.95, 0.86], texture: t.skin, specular: 0.62, shininess: 64, texScale: [1.0, 1.0], alpha: 1, emissive: 0.060 },
      caramelFur: { color: [1.0, 0.82, 0.54], texture: t.caramelFur, specular: 0.18, shininess: 22, texScale: [1.4, 1.4], alpha: 1, emissive: 0 },
      faceFrame: { color: [1.0, 1.0, 1.0], texture: t.faceFrame, specular: 0.34, shininess: 46, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.060 },
      faceLula: { color: [1.0, 1.0, 1.0], texture: t.faceLula, specular: 0.78, shininess: 88, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.220 },
      faceBolsonaro: { color: [1.0, 1.0, 1.0], texture: t.faceBolsonaro, specular: 0.78, shininess: 88, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.220 },
      faceCaneta: { color: [1.0, 1.0, 1.0], texture: t.faceCaneta, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceLuva: { color: [1.0, 1.0, 1.0], texture: t.faceLuva, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceNilson: { color: [1.0, 1.0, 1.0], texture: t.faceNilson, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceBeto: { color: [1.0, 1.0, 1.0], texture: t.faceBeto, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      facePix: { color: [1.0, 1.0, 1.0], texture: t.facePix, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceChico: { color: [1.0, 1.0, 1.0], texture: t.faceChico, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceNabuco: { color: [1.0, 1.0, 1.0], texture: t.faceNabuco, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      faceToninho: { color: [1.0, 1.0, 1.0], texture: t.faceToninho, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      facePastel: { color: [1.0, 1.0, 1.0], texture: t.facePastel, specular: 0.64, shininess: 74, texScale: [1.0, 1.0], alpha: 0.998, emissive: 0.180 },
      redCloth: { color: [1.0, 0.82, 0.82], texture: t.clothRed, specular: 0.17, shininess: 18, texScale: [1.0, 1.0], alpha: 1, emissive: 0 },
      light: { color: [1.0, 0.78, 0.36], texture: null, specular: 0.95, shininess: 100, texScale: [1, 1], alpha: 1, emissive: 1.2 },
      redLight: { color: [1.0, 0.12, 0.08], texture: null, specular: 0.7, shininess: 80, texScale: [1, 1], alpha: 1, emissive: 0.0 },
      final: { color: [0.22, 0.86, 0.66], texture: null, specular: 0.6, shininess: 60, texScale: [1, 1], alpha: 1, emissive: 0.15 },
      darkDoor: { color: [0.08, 0.075, 0.08], texture: t.blackMetal, specular: 0.55, shininess: 72, texScale: [1.4, 2.0], alpha: 1, emissive: 0 },
      black: { color: [0.018, 0.018, 0.023], texture: null, specular: 0.35, shininess: 50, texScale: [1, 1], alpha: 1, emissive: 0 },
      white: { color: [0.86, 0.88, 0.86], texture: null, specular: 0.3, shininess: 28, texScale: [1, 1], alpha: 1, emissive: 0 },
      glass: { color: [0.42, 0.72, 0.95], texture: null, specular: 0.95, shininess: 120, texScale: [1, 1], alpha: 0.36, emissive: 0.05 },
      smokeGlass: { color: [0.18, 0.26, 0.32], texture: null, specular: 0.92, shininess: 120, texScale: [1, 1], alpha: 0.24, emissive: 0.015 },
      beam: { color: [1.0, 0.86, 0.42], texture: null, specular: 0.0, shininess: 4, texScale: [1, 1], alpha: 0.20, emissive: 0.82 }
    };
  }

  labelMaterial(text, options = {}) {
    const key = JSON.stringify({ text, options });
    if (!this.labelCache[key]) {
      this.labelCache[key] = {
        color: [1.0, 1.0, 1.0],
        texture: createTextTexture(this.gl, text, options),
        specular: options.specular ?? 0.48,
        shininess: options.shininess ?? 52,
        texScale: [1, 1],
        alpha: 1,
        emissive: options.emissive ?? 0.07
      };
    }
    return this.labelCache[key];
  }

  brazilFlagMaterial() {
    if (!this.labelCache.brazilFlag) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#009739';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fedd00';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 46);
      ctx.lineTo(canvas.width - 82, canvas.height / 2);
      ctx.lineTo(canvas.width / 2, canvas.height - 46);
      ctx.lineTo(82, canvas.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#012169';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-0.18);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-92, -10, 184, 20);
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 18; i++) {
        const x = canvas.width / 2 + Math.cos(i * 2.1) * (22 + (i % 4) * 13);
        const y = canvas.height / 2 + Math.sin(i * 1.7) * (18 + (i % 5) * 9);
        ctx.fillRect(x, y, 3, 3);
      }
      this.labelCache.brazilFlag = {
        color: [1, 1, 1],
        texture: createTextureFromCanvas(this.gl, canvas, { flipY: true }),
        specular: 0.42,
        shininess: 48,
        texScale: [1, 1],
        alpha: 1,
        emissive: 0.22
      };
    }
    return this.labelCache.brazilFlag;
  }

  add(name, meshName, materialName, position, rotation, scale, update = null, options = {}) {
    const obj = new SceneObject({
      name,
      mesh: this.meshes[meshName],
      material: (typeof materialName === 'string') ? this.materials[materialName] : materialName,
      position: position.slice(),
      rotation: rotation.slice(),
      scale: scale.slice(),
      update
    });
    obj.options = options;
    if ((obj.material.alpha ?? 1) < 0.999 || options.transparent) this.transparentObjects.push(obj);
    else this.objects.push(obj);
    return obj;
  }

  addWater(name, position, rotation, scale) {
    const obj = new SceneObject({
      name,
      mesh: this.meshes.waterGrid,
      material: null,
      position: position.slice(),
      rotation: rotation.slice(),
      scale: scale.slice()
    });
    this.waterObjects.push(obj);
    return obj;
  }

  addCollider(name, centerX, centerZ, halfX, halfZ, options = {}) {
    this.colliders.push({ name, centerX, centerZ, halfX, halfZ, options });
  }

  colliderActive(c) {
    if (c.options.gate === 'outer') return this.outerGateAmount < 0.82;
    if (c.options.gate === 'inner') return this.innerGateAmount < 0.82;
    if (c.options.gate === 'dark') return this.darkGateAmount < 0.82;
    if (c.options.gate === 'exit') return this.exitGateAmount < 0.82;
    if (c.options.gate === 'infirmary') return this.infirmaryDoorAmount < 0.82;
    if (c.options.gate === 'control') return this.controlDoorAmount < 0.82;
    if (c.options.gate === 'fiscal') return this.fiscalDoorAmount < 0.82;
    return true;
  }

  collidesAt(pos) {
    const r = 0.34;
    const x = pos[0], z = pos[2];
    for (const c of this.colliders) {
      if (!this.colliderActive(c)) continue;
      if (x + r > c.centerX - c.halfX && x - r < c.centerX + c.halfX &&
          z + r > c.centerZ - c.halfZ && z - r < c.centerZ + c.halfZ) {
        return true;
      }
    }
    return false;
  }

  resolveCameraPosition(oldPos, desired) {
    let d = desired.slice();
    d[1] = 1.75;

    // A ilha é alongada e está deslocada para z=-12. A colisão de costa considera esse centro,
    // permitindo chegar à porta SAÍDA no fundo sem sair da ilha.
    const islandCenterZ = -12.0;
    const dzIsland = d[2] - islandCenterZ;
    const ellipse = Math.sqrt((d[0] * d[0]) / (this.islandRadiusX * this.islandRadiusX) + (dzIsland * dzIsland) / (this.islandRadiusZ * this.islandRadiusZ));
    if (ellipse > 0.985) {
      const s = 0.985 / ellipse;
      d[0] *= s;
      d[2] = islandCenterZ + dzIsland * s;
    }

    if (!this.collidesAt(d)) return d;

    const slideX = [d[0], 1.75, oldPos[2]];
    const slideZ = [oldPos[0], 1.75, d[2]];
    if (!this.collidesAt(slideX)) return slideX;
    if (!this.collidesAt(slideZ)) return slideZ;
    return oldPos.slice();
  }

  buildScene() {
    this.addWater('Oceano procedural com ondas imprevisíveis e espuma costeira', [0, -0.68, 0], [0, 0, 0], [210, 1, 210]);
    this.add('Ilha alongada inspirada em Alcatraz', 'island', 'island', [0, -0.24, -12.0], [0, 0, 0], [27.0, 1.0, 74.5]);

    this.buildVegetationAndGroundDetails();
    this.buildDockAndBoat();
    this.buildAlcatrazLowerIsland();
    this.buildExteriorPath();
    this.buildLighthouse();
    this.buildCellhouseComplex();

    this.interestZones = [
      { z: 53.0, text: 'Chegada pelo mar: rodovia estendida próxima da costa e Lifeboat alinhado ao caminho.' },
      { z: 18.0, text: 'Base da ilha: Building 64/barracas e caminho de pedra em aclive.' },
      { z: 10.0, text: 'Sally Port: o portão abre automaticamente por proximidade.' },
      { z: 4.2, text: 'Entrada do Cellhouse: edifício maior, três níveis e torres laterais.' },
      { z: -5.0, text: 'Refeitório primeiro: mesas dos dois lados, refeitório esquerda e direita.' },
      { z: -24.0, text: 'Área de controle/triagem/enfermaria antes das celas.' },
      { z: -35.0, text: 'Porta preta CELAS: abre automaticamente e conduz à sala escura.' },
      { z: -58.0, text: 'Sala grande das celas: lanterna automática e avatares nomeados.' },
      { z: -80.0, text: 'Porta SAÍDA: abre automaticamente para encerrar o passeio.' }
    ];
  }

  buildShorelineRocks() {
    // Rochas costeiras removidas para não aparecerem boiando/no mar.
    // Mantemos apenas os marcos de pedra posicionados sobre o solo da ilha.
  }

  buildVegetationAndGroundDetails() {
    this.add('Faixa de cascalho principal da ilha', 'cube', 'gravel', [0, -0.02, 6.0], [0, 0, 0], [7.4, 0.06, 44.0]);
    this.add('Parade Ground lateral', 'cube', 'gravel', [-10.2, 0.03, -10.0], [0, 0.06, 0], [8.2, 0.07, 13.0]);

    for (let i = 0; i < 10; i++) {
      const x = (i % 2 ? -1 : 1) * (4.9 + (i % 5) * 0.45);
      const z = 24.5 - i * 1.55;
      if (z < 9.4) continue;
      this.add('Marco de pedra no caminho externo', 'cube', 'rock', [x, 0.28, z], [0, i * 0.3, 0], [0.28, 0.55, 0.28]);
    }
  }

  buildDockAndBoat() {
    // Barco salva-vidas OBJ enviado pelo usuário, alinhado ao eixo da estrada e posicionado no mar.
    const boatObjText = window.LIFEBOAT_OBJ || '';
    const boatGroups = Geometry.objGroups(boatObjText);
    const materialMap = {
      Red: 'lifeboatRed',
      DarkRed: 'lifeboatDarkRed',
      White: 'lifeboatWhite',
      Black: 'lifeboatBlack'
    };
    const boatPosition = this.lifeboatBasePosition;
    const boatRotation = this.lifeboatBaseRotation;
    const boatScale = this.lifeboatBaseScale;
    for (const group of boatGroups) {
      const meshName = `lifeboatOBJ_${group.material}`;
      if (!this.meshes[meshName]) this.meshes[meshName] = new Mesh(this.gl, group.geometry);
      const part = this.add(`Lifeboat OBJ no mar - ${group.material}`, meshName, materialMap[group.material] || 'lifeboatRed', boatPosition, boatRotation, boatScale);
      this.lifeboatObjects.push(part);
    }
  }

  setLifeboatPose(position = this.lifeboatBasePosition, bob = 0, yawOffset = 0) {
    for (const part of this.lifeboatObjects) {
      part.position = [position[0], position[1] + bob, position[2]];
      part.rotation = [this.lifeboatBaseRotation[0], this.lifeboatBaseRotation[1] + yawOffset, this.lifeboatBaseRotation[2]];
      part.scale = this.lifeboatBaseScale.slice();
    }
  }

  resetLifeboatPose() {
    this.setLifeboatPose(this.lifeboatBasePosition, 0, 0);
  }

  buildAlcatrazLowerIsland() {
    // Posto de Fiscalização na chegada: afastado da estrada, sem relevo de tijolos e com frente de vidro para o mar.
    const fx = -7.70;
    const fz = 21.60;
    this.add('Posto de Fiscalização - piso interno', 'cube', 'stone', [fx, -0.02, fz], [0, 0, 0], [6.75, 0.07, 4.60]);
    this.add('Posto de Fiscalização - parede traseira', 'cube', 'oldPlaster', [fx, 1.50, fz - 2.28], [0, 0, 0], [6.90, 3.20, 0.24]);
    this.add('Posto de Fiscalização - parede lateral esquerda', 'cube', 'oldPlaster', [fx - 3.38, 1.50, fz], [0, 0, 0], [0.24, 3.20, 4.60]);
    this.add('Posto de Fiscalização - parede lateral da estrada traseira', 'cube', 'oldPlaster', [fx + 3.38, 1.50, fz - 1.24], [0, 0, 0], [0.24, 3.20, 2.05]);
    this.add('Posto de Fiscalização - parede lateral da estrada frontal', 'cube', 'oldPlaster', [fx + 3.38, 1.50, fz + 1.42], [0, 0, 0], [0.24, 3.20, 1.70]);
    this.add('Posto de Fiscalização - lintel da porta lateral', 'cube', 'oldPlaster', [fx + 3.38, 2.52, fz + 0.12], [0, 0, 0], [0.24, 0.92, 1.22]);
    this.add('Posto de Fiscalização - jamb frontal porta', 'cube', 'oldPlaster', [fx + 3.38, 0.94, fz + 0.78], [0, 0, 0], [0.24, 2.18, 0.08]);
    this.add('Posto de Fiscalização - jamb traseiro porta', 'cube', 'oldPlaster', [fx + 3.38, 0.94, fz - 0.54], [0, 0, 0], [0.24, 2.18, 0.08]);
    this.add('Posto de Fiscalização - frente inferior', 'cube', 'oldPlaster', [fx, 0.50, fz + 2.28], [0, 0, 0], [6.90, 0.92, 0.24]);
    this.add('Posto de Fiscalização - frente superior', 'cube', 'oldPlaster', [fx, 2.36, fz + 2.28], [0, 0, 0], [6.90, 0.72, 0.24]);
    this.add('Posto de Fiscalização - pilar frontal esquerdo', 'cube', 'oldPlaster', [fx - 3.38, 1.50, fz + 2.28], [0, 0, 0], [0.24, 3.20, 0.24]);
    this.add('Posto de Fiscalização - pilar frontal direito', 'cube', 'oldPlaster', [fx + 3.38, 1.50, fz + 2.28], [0, 0, 0], [0.24, 3.20, 0.24]);
    // Vidro recuado para parecer instalado no vão, em vez de flutuando para fora da fachada.
    this.add('Posto de Fiscalização - janela de vidro frontal voltada para o mar', 'cube', 'smokeGlass', [fx, 1.40, fz + 2.15], [0, 0, 0], [6.15, 1.28, 0.05], null, { transparent: true });
    this.add('Posto de Fiscalização - moldura superior janela', 'cube', 'metal', [fx, 2.06, fz + 2.17], [0, 0, 0], [6.15, 0.06, 0.06]);
    this.add('Posto de Fiscalização - moldura inferior janela', 'cube', 'metal', [fx, 0.74, fz + 2.17], [0, 0, 0], [6.15, 0.06, 0.06]);
    this.add('Posto de Fiscalização - moldura esquerda janela', 'cube', 'metal', [fx - 3.05, 1.40, fz + 2.17], [0, 0, 0], [0.06, 1.28, 0.06]);
    this.add('Posto de Fiscalização - moldura direita janela', 'cube', 'metal', [fx + 3.05, 1.40, fz + 2.17], [0, 0, 0], [0.06, 1.28, 0.06]);
    this.add('Posto de Fiscalização - telhado', 'cube', 'roof', [fx, 3.16, fz], [0, 0, 0], [7.25, 0.22, 4.95]);
    // Placa mais baixa e centrada dentro da faixa superior da fachada.
    this.add('Placa FISCALIZAÇÃO na frente do posto', 'verticalPlane', this.labelMaterial('FISCALIZAÇÃO', { width: 1024, height: 128, fontSize: 58, bg: '#b99938', bg2: '#e2c65d', fg: '#101417', border: '#4f4532', specular: 0.62, shininess: 58, emissive: 0.12 }), [fx, 2.36, fz + 2.41], [0, 0, 0], [3.35, 0.42, 1]);
    this.fiscalDoor = this.add('Porta automática lateral do Posto de Fiscalização', 'cube', 'wood', [fx + 3.50, 0.96, fz + 0.12], [0, 0, 0], [0.18, 2.20, 1.20]);
    this.add('Dobradiça superior da porta de fiscalização', 'cylinder', 'blackMetal', [fx + 3.52, 1.58, fz - 0.48], [Math.PI / 2, 0, 0], [0.045, 0.18, 0.045]);
    this.add('Dobradiça inferior da porta de fiscalização', 'cylinder', 'blackMetal', [fx + 3.52, 0.62, fz - 0.48], [Math.PI / 2, 0, 0], [0.045, 0.18, 0.045]);

    // Instrumentos de navegação e fiscalização interna.
    this.add('Balcão de fiscalização náutica', 'cube', 'wood', [fx, 0.64, fz + 1.10], [0, 0, 0], [4.20, 0.16, 0.76]);
    // Bases encurtadas para sustentar o balcão sem atravessar o tampo de madeira.
    for (const x of [fx - 1.55, fx + 1.55]) this.add('Base do balcão de fiscalização', 'cube', 'blackMetal', [x, 0.34, fz + 1.10], [0, 0, 0], [0.16, 0.44, 0.62]);
    this.add('Pé central do balcão de fiscalização', 'cube', 'blackMetal', [fx, 0.34, fz + 1.10], [0, 0, 0], [0.18, 0.44, 0.62]);

    // Cadeira posicionada de frente para o balcão principal, evitando a aparência de sala vazia.
    const fiscalChairX = fx;
    const fiscalChairZ = fz + 0.22;
    this.add('Cadeira da sala de fiscalização - assento', 'cube', 'blackMetal', [fiscalChairX, 0.54, fiscalChairZ], [0, 0, 0], [0.62, 0.10, 0.62]);
    this.add('Cadeira da sala de fiscalização - encosto', 'cube', 'blackMetal', [fiscalChairX, 0.96, fiscalChairZ - 0.30], [0, 0, 0], [0.62, 0.70, 0.10]);
    for (const lx of [-0.22, 0.22]) {
      for (const lz of [-0.22, 0.22]) {
        this.add('Perna da cadeira da sala de fiscalização', 'cube', 'blackMetal', [fiscalChairX + lx, 0.30, fiscalChairZ + lz], [0, 0, 0], [0.08, 0.42, 0.08]);
      }
    }

    this.add('Radar circular de navegação', 'cylinder', 'glass', [fx + 1.20, 1.28, fz + 1.03], [Math.PI / 2, 0, 0], [0.52, 0.05, 0.52], null, { transparent: true });
    this.add('Base do radar de navegação', 'cube', 'blackMetal', [fx + 1.20, 0.85, fz + 1.03], [0, 0, 0], [0.12, 0.56, 0.12]);
    this.add('Monitor de chegada marítima 1', 'cube', 'blackMetal', [fx + 0.10, 1.10, fz + 1.02], [0, 0, 0], [0.44, 0.28, 0.06]);
    this.add('Tela do monitor de chegada marítima 1', 'cube', 'glass', [fx + 0.10, 1.11, fz + 1.06], [0, 0, 0], [0.36, 0.21, 0.03], null, { transparent: true });
    this.add('Monitor de chegada marítima 2', 'cube', 'blackMetal', [fx + 0.62, 1.10, fz + 1.02], [0, 0, 0], [0.44, 0.28, 0.06]);
    this.add('Tela do monitor de chegada marítima 2', 'cube', 'glass', [fx + 0.62, 1.11, fz + 1.06], [0, 0, 0], [0.36, 0.21, 0.03], null, { transparent: true });
    this.add('Armário de registros da fiscalização', 'cube', 'rustMetal', [fx + 2.35, 0.92, fz - 1.45], [0, 0, 0], [0.75, 1.75, 0.45]);

    this.addCollider('Posto de Fiscalização parede traseira', fx, fz - 2.28, 3.45, 0.16);
    this.addCollider('Posto de Fiscalização lateral esquerda', fx - 3.38, fz, 0.16, 2.30);
    this.addCollider('Posto de Fiscalização lateral estrada traseira', fx + 3.38, fz - 1.24, 0.16, 1.00);
    this.addCollider('Posto de Fiscalização lateral estrada frontal', fx + 3.38, fz + 1.42, 0.16, 0.82);
    this.addCollider('Posto de Fiscalização frente de vidro', fx, fz + 2.35, 3.45, 0.16);
    this.addCollider('Porta lateral do Posto de Fiscalização', fx + 3.45, fz + 0.12, 0.20, 0.66, { gate: 'fiscal' });
    this.addCollider('Balcão do Posto de Fiscalização', fx, fz + 1.10, 2.10, 0.42);
  }

  buildExteriorPath() {
    // Estrada principal estendida em direção ao mar: chega perto da água, mas mantém uma faixa de ilha antes da costa.
    const roadCenterZ = 30.85;
    const roadLength = 47.4; // de z≈7.15 até z≈54.55, sem encostar no mar.
    this.add('Caminho de pedra detalhado até o sally port estendido até perto do mar', 'cube', 'path', [0, 0.08, roadCenterZ], [0, 0, 0], [4.0, 0.12, roadLength]);
    this.add('Calçada lateral esquerda contínua estendida até perto do mar', 'cube', 'stone', [-3.05, 0.09, roadCenterZ], [0, 0, 0], [1.45, 0.10, roadLength]);
    this.add('Calçada lateral direita contínua estendida até perto do mar', 'cube', 'stone', [3.05, 0.09, roadCenterZ], [0, 0, 0], [1.45, 0.10, roadLength]);
    // Faixas de concreto replicadas por toda a nova extensão, eliminando grama entre estrada e calçadas.
    this.add('Faixa de concreto contínua entre estrada e calçada esquerda estendida', 'cube', 'stone', [-2.18, 0.095, roadCenterZ], [0, 0, 0], [0.46, 0.11, roadLength]);
    this.add('Faixa de concreto contínua entre estrada e calçada direita estendida', 'cube', 'stone', [2.18, 0.095, roadCenterZ], [0, 0, 0], [0.46, 0.11, roadLength]);
    this.add('Rampa pavimentada de acesso à prisão', 'cube', 'path', [0, 0.12, 8.7], [0, 0, 0], [4.2, 0.12, 5.5]);
    for (let z = 11.0; z <= 53.0; z += 3.2) {
      for (const x of [-2.65, 2.65]) {
        this.add('Poste externo', 'cylinder', 'blackMetal', [x, 1.08, z], [0, 0, 0], [0.09, 2.25, 0.09]);
        this.add('Luminária externa quente', 'sphere', 'light', [x, 2.32, z], [0, 0, 0], [0.25, 0.25, 0.25]);
      }
    }

    // Sally Port / guarita com portão automático.
    this.add('Guardhouse / Sally Port esquerdo', 'cube', 'darkConcrete', [-4.5, 1.75, 8.6], [0, 0, 0], [3.6, 3.5, 3.0]);
    this.add('Guardhouse / Sally Port direito', 'cube', 'darkConcrete', [4.5, 1.75, 8.6], [0, 0, 0], [3.6, 3.5, 3.0]);
    this.add('Verga superior do Sally Port', 'cube', 'concrete', [0, 3.25, 8.6], [0, 0, 0], [5.4, 0.82, 3.0]);
    // A bandeira não deve ficar como placa baixa acima do portão frontal.
    // Ela será aplicada na verga superior alta visível da fachada principal (região superior central),
    // por isso removemos a versão baixa do Sally Port e colocamos a bandeira mais acima na verga frontal do conjunto principal.
    // Primeira porta/portão do Sally Port ampliada apenas na largura para cobrir as brechas laterais.
    this.outerGateLeft = this.add('Portão automático externo esquerdo ampliado', 'cube', 'blackMetal', [-1.35, 1.45, 10.25], [0, 0, 0], [2.70, 2.65, 0.14]);
    this.outerGateRight = this.add('Portão automático externo direito ampliado', 'cube', 'blackMetal', [1.35, 1.45, 10.25], [0, 0, 0], [2.70, 2.65, 0.14]);
    for (let x of [-5.9, 5.9]) this.addCollider('Sally Port lateral', x, 8.6, 1.75, 1.8);
    this.addCollider('Portão externo automático ampliado', 0, 10.25, 2.95, 0.28, { gate: 'outer' });
  }

  buildSingleLighthouse(lx, lz, beaconCenter, side = 'right') {
    this.add(`Base quadrada do farol ${side}`, 'cube', 'brick', [lx, 0.52, lz], [0, 0, 0], [3.2, 1.04, 3.2]);
    this.add(`Base octogonal do farol ${side}`, 'cylinder', 'darkConcrete', [lx, 1.48, lz], [0, 0, 0], [1.60, 1.92, 1.60]);
    this.add(`Corpo principal do farol ${side}`, 'cylinder', 'concrete', [lx, 4.38, lz], [0, 0, 0], [0.95, 5.25, 0.95]);
    this.add(`Anel metálico inferior do farol ${side}`, 'cylinder', 'blackMetal', [lx, 2.28, lz], [0, 0, 0], [1.15, 0.12, 1.15]);
    this.add(`Anel metálico superior do farol ${side}`, 'cylinder', 'blackMetal', [lx, 6.76, lz], [0, 0, 0], [1.18, 0.12, 1.18]);
    this.add(`Cabine de vidro do farol ${side}`, 'cylinder', 'glass', [lx, 7.55, lz], [0, 0, 0], [1.05, 1.2, 1.05], null, { transparent: true });
    this.add(`Teto metálico do farol ${side}`, 'cone', 'roof', [lx, 8.45, lz], [0, 0, 0], [1.48, 0.92, 1.48]);

    const lens = this.add(`Lente emissiva fixa no eixo central do farol ${side}`, 'sphere', 'light', beaconCenter.slice(), [0, 0, 0], [0.32, 0.32, 0.32]);
    const head = this.add(`Cabeça giratória do holofote ${side} no eixo fixo`, 'cylinder', 'metal', beaconCenter.slice(), [0, 0, Math.PI / 2], [0.42, 0.70, 0.42]);
    const beam = this.add(`Feixe volumétrico 360 preso ao pivô central do farol ${side}`, 'beaconBeam', 'beam', beaconCenter.slice(), [0, 0, 0], [1.35, 1.35, 14.0], null, { transparent: true });

    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      const x = lx + Math.cos(a) * 1.28;
      const z = lz + Math.sin(a) * 1.28;
      this.add(`Coluna fina do guarda-corpo do farol ${side}`, 'cube', 'blackMetal', [x, 7.55, z], [0, a, 0], [0.05, 0.9, 0.05]);
    }
    this.add(`Guarda-corpo superior do farol ${side}`, 'cylinder', 'blackMetal', [lx, 7.95, lz], [0, 0, 0], [2.75, 0.035, 2.75]);
    this.add(`Guarda-corpo inferior do farol ${side}`, 'cylinder', 'blackMetal', [lx, 7.25, lz], [0, 0, 0], [2.75, 0.035, 2.75]);
    // Removidos os pequenos degraus/arestas do corpo do farol.
    this.addCollider(`Farol ${side}`, lx, lz, 1.95, 1.95);

    if (side === 'right') {
      this.searchLens = lens;
      this.searchlightHead = head;
      this.searchBeam = beam;
    } else {
      this.leftSearchLens = lens;
      this.leftSearchlightHead = head;
      this.leftSearchBeam = beam;
    }
  }

  buildLighthouse() {
    this.buildSingleLighthouse(this.lighthouseX, this.lighthouseZ, this.beaconCenter, 'right');
    this.buildSingleLighthouse(this.lighthouseLeftX, this.lighthouseZ, this.leftBeaconCenter, 'left');
  }

  buildWaterTower() {
    // Caixa d’água reposicionada para fora do miolo da prisão; não invade mais refeitório/corredor.
    const tx = -16.4;
    const tz = -18.5;
    this.add('Base estrutural externa da caixa d’água', 'cylinder', 'blackMetal', [tx, 2.45, tz], [0, 0, 0], [1.65, 4.9, 1.65]);
    this.add('Reservatório externo da caixa d’água', 'cylinder', 'rustMetal', [tx, 5.45, tz], [0, 0, Math.PI / 2], [1.65, 2.6, 1.65]);
    this.add('Tampa externa da caixa d’água', 'cylinder', 'blackMetal', [tx, 6.82, tz], [0, 0, 0], [1.55, 0.16, 1.55]);
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + Math.PI / 4;
      this.add('Pé externo da caixa d’água', 'cube', 'blackMetal', [tx + Math.cos(a) * 1.1, 2.35, tz + Math.sin(a) * 1.1], [0.16, a, 0], [0.10, 4.2, 0.10]);
    }
    this.addCollider('Caixa d’água externa', tx, tz, 1.7, 1.7);
  }

  buildCellhouseComplex() {
    // Fluxo corrigido: entrada -> refeitório -> área técnica lógica -> porta CELAS -> sala grande escura de celas -> saída.
    this.add('Cellhouse - piso geral ampliado e reorganizado', 'cube', 'stone', [0, 0.04, -38.2], [0, 0, 0], [21.6, 0.18, 90.8]);
    this.add('Cellhouse - parede esquerda longa', 'cube', 'concrete', [-10.55, 3.05, -38.2], [0, 0, 0], [0.55, 6.1, 90.8]);
    this.add('Cellhouse - parede direita longa', 'cube', 'concrete', [10.55, 3.05, -38.2], [0, 0, 0], [0.55, 6.1, 90.8]);
    this.add('Cellhouse - parede traseira final esquerda com vão de saída', 'cube', 'concrete', [-6.85, 3.05, -83.4], [0, 0, 0], [7.9, 6.1, 0.55]);
    this.add('Cellhouse - parede traseira final direita com vão de saída', 'cube', 'concrete', [6.85, 3.05, -83.4], [0, 0, 0], [7.9, 6.1, 0.55]);
    this.add('Cellhouse - verga superior do vão de saída', 'cube', 'concrete', [0, 5.10, -83.4], [0, 0, 0], [5.8, 2.0, 0.55]);
    this.add('Cellhouse - fachada esquerda', 'cube', 'concrete', [-6.6, 3.05, 6.9], [0, 0, 0], [7.9, 6.1, 0.55]);
    this.add('Cellhouse - fachada direita', 'cube', 'concrete', [6.6, 3.05, 6.9], [0, 0, 0], [7.9, 6.1, 0.55]);
    // A verga frontal da bandeira desce mais para fechar o grande vão, deixando apenas uma fenda horizontal estreita para ventilação.
    this.add('Cellhouse - verga frontal', 'cube', 'concrete', [0, 4.75, 6.9], [0, 0, 0], [4.9, 2.7, 0.55]);
    this.add('Bandeira do Brasil na verga superior alta do Sally Port/fachada principal', 'verticalPlane', this.brazilFlagMaterial(), [0, 5.25, 7.24], [0, 0, 0], [4.72, 1.56, 1]);
    this.add('Telhado longo do Cellhouse reorganizado', 'cube', 'roof', [0, 6.28, -38.2], [0, 0, 0], [22.0, 0.36, 91.2]);
    this.add('Bloco superior central do Cellhouse reorganizado', 'cube', 'oldPlaster', [0, 7.05, -31.0], [0, 0, 0], [10.2, 1.2, 48.0]);
    this.add('Telhado do bloco superior central', 'cube', 'roof', [0, 7.75, -31.0], [0, 0, 0], [10.6, 0.28, 48.5]);

    this.addCollider('Cellhouse parede esquerda', -10.55, -38.2, 0.65, 45.6);
    this.addCollider('Cellhouse parede direita', 10.55, -38.2, 0.65, 45.6);
    this.addCollider('Cellhouse fundo esquerdo', -6.85, -83.4, 4.0, 0.65);
    this.addCollider('Cellhouse fundo direito', 6.85, -83.4, 4.0, 0.65);
    this.addCollider('Cellhouse fachada esquerda', -6.6, 6.9, 3.95, 0.65);
    this.addCollider('Cellhouse fachada direita', 6.6, 6.9, 3.95, 0.65);

    // Segunda porta interna ampliada somente na largura para eliminar as brechas laterais.
    this.innerGateLeft = this.add('Portão automático interno esquerdo ampliado', 'cube', 'blackMetal', [-1.28, 1.55, 7.15], [0, 0, 0], [2.55, 3.05, 0.13]);
    this.innerGateRight = this.add('Portão automático interno direito ampliado', 'cube', 'blackMetal', [1.28, 1.55, 7.15], [0, 0, 0], [2.55, 3.05, 0.13]);
    this.addCollider('Portão interno automático ampliado', 0, 7.15, 2.80, 0.24, { gate: 'inner' });

    for (let x = -8.4; x <= 8.41; x += 1.2) this.add('Coroamento/castelo do Cellhouse', 'cube', 'darkConcrete', [x, 6.85, 6.9], [0, 0, 0], [0.62, 0.82, 0.62]);

    this.add('Corredor central do roteiro reorganizado', 'cube', 'darkConcrete', [0, 0.16, -38.2], [0, 0, 0], [3.10, 0.08, 86.0]);
    this.add('Faixa amarela de segurança no chão', 'cube', 'hazard', [0, 0.21, 5.7], [0, 0, 0], [3.3, 0.04, 0.32]);
    this.add('Coluna esquerda do arco da placa de fluxo', 'cube', 'wood', [-4.95, 1.70, 3.95], [0, 0, 0], [0.18, 3.00, 0.18]);
    this.add('Coluna direita do arco da placa de fluxo', 'cube', 'wood', [4.95, 1.70, 3.95], [0, 0, 0], [0.18, 3.00, 0.18]);
    this.add('Travessa superior do arco da placa de fluxo', 'cube', 'wood', [0, 3.18, 3.95], [0, 0, 0], [10.10, 0.20, 0.18]);
    this.add('Placa de fluxo corrigida visível para quem entra na prisão', 'verticalPlane', this.labelMaterial('REFEITÓRIO  →  CONTROLE  →  CELAS', { width: 1024, height: 128, fontSize: 44, bg: '#b99938', bg2: '#e2c65d', specular: 0.58, shininess: 56, emissive: 0.11 }), [0, 2.80, 3.87], [0, 0, 0], [5.5, 0.65, 1]);

    this.buildMessHall();
    this.buildSecurityAndServiceArea();
    this.buildDarkWingGateAndRoom();

    // Passarelas superiores removidas: elas criavam extensões visíveis saindo das celas
    // e poluíam o corredor próximo da saída.
    // Iluminação geral antes da ala escura. A sala CELAS depende de lanterna automática.
    for (let z = 5.0; z >= -33.0; z -= 2.2) {
      this.add('Viga metálica do teto antes da ala escura', 'cube', 'blackMetal', [0, 5.72, z], [0, 0, 0], [17.8, 0.12, 0.15]);
      this.add('Luminária industrial antes da ala CELAS', 'sphere', 'light', [0, 5.35, z - 0.45], [0, 0, 0], [0.18, 0.18, 0.18]);
    }
    for (let z = -36.0; z >= -80.0; z -= 2.35) {
      this.add('Viga escura do teto da sala de celas', 'cube', 'blackMetal', [0, 5.72, z], [0, 0, 0], [17.8, 0.12, 0.15]);
    }
    for (let i = 0; i < 30; i++) {
      const z = 3.2 - i * 2.75;
      const side = i % 2 === 0 ? -1 : 1;
    }

    // Warden House externa removida: o volume ficava encostado na parede direita do refeitório.
  }


  buildSecurityAndServiceArea() {
    // Segundo setor lógico após o refeitório: controle/triagem e enfermaria.
    // A placa agora encosta na travessa do arco, sem flutuar.
    this.add('Coluna esquerda do arco da área de controle', 'cube', 'wood', [-4.70, 1.72, -17.82], [0, 0, 0], [0.18, 3.04, 0.18]);
    this.add('Coluna direita do arco da área de controle', 'cube', 'wood', [4.70, 1.72, -17.82], [0, 0, 0], [0.18, 3.04, 0.18]);
    this.add('Travessa superior do arco da área de controle', 'cube', 'wood', [0, 3.18, -17.82], [0, 0, 0], [9.58, 0.20, 0.18]);
    this.add('Portal da área de controle', 'verticalPlane', this.labelMaterial('CONTROLE  •  TRIAGEM  •  ENFERMARIA', { width: 1024, height: 128, fontSize: 38, bg: '#5c6f75', bg2: '#b6c5c8', fg: '#101417', specular: 0.66, shininess: 60, emissive: 0.10 }), [0, 2.80, -17.8], [0, 0, 0], [5.1, 0.56, 1]);
    this.add('Piso da área de controle e triagem', 'cube', 'stone', [0, 0.22, -24.8], [0, 0, 0], [18.2, 0.07, 13.8]);

    // POSTO DE CONTROLE (lado esquerdo) - ampliado, com vidro fumê frontal e porta lateral automática pelo lado interno.
    this.add('Piso interno do posto de controle', 'cube', 'stone', [-6.90, 0.26, -24.35], [0, 0, 0], [4.70, 0.04, 3.90]);
    this.add('Parede traseira do posto de controle', 'cube', 'concrete', [-6.90, 1.56, -26.25], [0, 0, 0], [4.90, 3.00, 0.20]);
    this.add('Parede lateral externa do posto de controle', 'cube', 'concrete', [-9.25, 1.56, -24.35], [0, 0, 0], [0.20, 3.00, 3.80]);
    this.add('Parede lateral interna traseira do posto de controle', 'cube', 'concrete', [-4.55, 1.56, -25.43], [0, 0, 0], [0.20, 3.00, 1.34]);
    this.add('Parede lateral interna frontal do posto de controle', 'cube', 'concrete', [-4.55, 1.56, -22.95], [0, 0, 0], [0.20, 3.00, 1.06]);
    this.add('Lintel da porta do posto de controle', 'cube', 'concrete', [-4.55, 2.58, -24.12], [0, 0, 0], [0.20, 0.98, 1.22]);
    this.add('Jamb esquerdo interno do posto de controle', 'cube', 'concrete', [-4.55, 1.12, -24.74], [0, 0, 0], [0.20, 2.12, 0.06]);
    this.add('Jamb direito interno do posto de controle', 'cube', 'concrete', [-4.55, 1.12, -23.50], [0, 0, 0], [0.20, 2.12, 0.06]);
    this.add('Frente inferior do posto de controle', 'cube', 'concrete', [-6.90, 0.92, -22.45], [0, 0, 0], [4.90, 0.72, 0.20]);
    this.add('Fechamento inferior extra do posto de controle', 'cube', 'concrete', [-6.90, 0.40, -22.45], [0, 0, 0], [4.90, 0.24, 0.20]);
    this.add('Frente superior do posto de controle', 'cube', 'concrete', [-6.90, 2.40, -22.45], [0, 0, 0], [4.90, 0.62, 0.20]);
    this.add('Fechamento superior extra do posto de controle', 'cube', 'concrete', [-6.90, 2.86, -22.45], [0, 0, 0], [4.90, 0.28, 0.20]);
    this.add('Pilar frontal esquerdo do posto de controle', 'cube', 'concrete', [-9.25, 1.58, -22.45], [0, 0, 0], [0.20, 2.38, 0.20]);
    this.add('Pilar frontal direito do posto de controle', 'cube', 'concrete', [-4.55, 1.58, -22.45], [0, 0, 0], [0.20, 2.38, 0.20]);
    this.add('Janela frontal fumê do posto de controle', 'cube', 'smokeGlass', [-6.90, 1.65, -22.42], [0, 0, 0], [4.30, 1.34, 0.05], null, { transparent: true });
    this.add('Moldura superior da janela do posto de controle', 'cube', 'metal', [-6.90, 2.33, -22.40], [0, 0, 0], [4.32, 0.05, 0.06]);
    this.add('Moldura inferior da janela do posto de controle', 'cube', 'metal', [-6.90, 0.97, -22.40], [0, 0, 0], [4.32, 0.05, 0.06]);
    this.add('Moldura esquerda da janela do posto de controle', 'cube', 'metal', [-9.05, 1.65, -22.40], [0, 0, 0], [0.05, 1.34, 0.06]);
    this.add('Moldura direita da janela do posto de controle', 'cube', 'metal', [-4.75, 1.65, -22.40], [0, 0, 0], [0.05, 1.34, 0.06]);
    this.add('Teto do posto de controle sem face preta', 'cube', 'concrete', [-6.90, 3.04, -24.35], [0, 0, 0], [4.90, 0.08, 3.90]);
    this.add('Placa Controle acima da janela no estilo do portal principal', 'verticalPlane', this.labelMaterial('CONTROLE', { width: 512, height: 128, fontSize: 60, bg: '#b31414', bg2: '#ff4a4a', fg: '#101417', border: '#6f0d0d', specular: 0.66, shininess: 60, emissive: 0.12 }), [-6.90, 2.45, -22.28], [0, 0, 0], [1.95, 0.34, 1]);
    this.add('Mesa principal do posto de controle', 'cube', 'wood', [-6.90, 0.86, -24.85], [0, 0, 0], [2.85, 0.12, 0.92]);
    this.add('Base esquerda da mesa do posto de controle', 'cube', 'blackMetal', [-7.85, 0.46, -24.85], [0, 0, 0], [0.12, 0.70, 0.82]);
    this.add('Base direita da mesa do posto de controle', 'cube', 'blackMetal', [-5.95, 0.46, -24.85], [0, 0, 0], [0.12, 0.70, 0.82]);
    this.add('Cadeira assento do posto de controle', 'cube', 'blackMetal', [-6.90, 0.54, -25.78], [0, 0, 0], [0.62, 0.10, 0.62]);
    this.add('Cadeira encosto do posto de controle', 'cube', 'blackMetal', [-6.90, 0.96, -26.03], [0, 0, 0], [0.62, 0.70, 0.10]);
    this.add('Perna traseira esquerda da cadeira do posto de controle', 'cube', 'blackMetal', [-7.12, 0.30, -26.00], [0, 0, 0], [0.08, 0.42, 0.08]);
    this.add('Perna traseira direita da cadeira do posto de controle', 'cube', 'blackMetal', [-6.68, 0.30, -26.00], [0, 0, 0], [0.08, 0.42, 0.08]);
    this.add('Perna frontal esquerda da cadeira do posto de controle', 'cube', 'blackMetal', [-7.12, 0.30, -25.56], [0, 0, 0], [0.08, 0.42, 0.08]);
    this.add('Perna frontal direita da cadeira do posto de controle', 'cube', 'blackMetal', [-6.68, 0.30, -25.56], [0, 0, 0], [0.08, 0.42, 0.08]);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const x = -7.80 + col * 0.45;
        const y = 1.18 + row * 0.34;
        this.add('Monitor do painel do posto de controle', 'cube', 'blackMetal', [x, y, -24.36], [0, 0, 0], [0.34, 0.22, 0.06]);
        this.add('Tela do monitor do posto de controle', 'cube', 'glass', [x, y + 0.01, -24.33], [0, 0, 0], [0.29, 0.17, 0.02], null, { transparent: true });
        this.add('Base do monitor do posto de controle', 'cube', 'blackMetal', [x, y - 0.18, -24.38], [0, 0, 0], [0.06, 0.12, 0.06]);
      }
    }
    this.add('Teclado do posto de controle', 'cube', 'blackMetal', [-6.90, 0.95, -25.02], [0, 0, 0], [1.18, 0.03, 0.22]);
    this.add('Rack técnico do posto de controle', 'cube', 'rustMetal', [-8.35, 1.08, -25.55], [0, 0, 0], [0.92, 1.88, 0.42]);
    for (let j = 0; j < 3; j++) this.add('Prateleira do rack técnico do posto de controle', 'cube', 'blackMetal', [-8.35, 0.58 + j * 0.48, -25.34], [0, 0, 0], [0.74, 0.05, 0.05]);
    this.controlDoor = this.add('Porta lateral pequena do posto de controle', 'cube', 'wood', [-4.55, 1.12, -24.12], [0, 0, 0], [0.18, 2.12, 1.20]);
    this.addCollider('Parede lateral externa do posto de controle', -9.25, -24.35, 0.15, 1.90);
    this.addCollider('Parede lateral interna traseira posto de controle', -4.55, -25.45, 0.15, 0.60);
    this.addCollider('Parede lateral interna frontal posto de controle', -4.55, -22.95, 0.15, 0.45);
    this.addCollider('Frente de vidro do posto de controle', -6.90, -22.45, 2.45, 0.14);
    this.addCollider('Porta lateral do posto de controle', -4.55, -24.12, 0.18, 0.66, { gate: 'control' });
    this.addCollider('Mesa do posto de controle', -6.90, -24.85, 1.45, 0.56);

    // POSTO DE ENFERMAGEM (lado direito) - ampliado, fechado, com janela frontal, placa e porta lateral automática pelo lado interno.
    this.add('Piso interno da enfermagem', 'cube', 'stone', [6.90, 0.26, -24.35], [0, 0, 0], [4.70, 0.04, 3.90]);
    this.add('Parede traseira da enfermagem', 'cube', 'concrete', [6.90, 1.56, -26.25], [0, 0, 0], [4.90, 3.00, 0.20]);
    this.add('Parede lateral interna traseira da enfermagem', 'cube', 'concrete', [4.55, 1.56, -25.43], [0, 0, 0], [0.20, 3.00, 1.34]);
    this.add('Parede lateral interna frontal da enfermagem', 'cube', 'concrete', [4.55, 1.56, -22.95], [0, 0, 0], [0.20, 3.00, 1.06]);
    this.add('Parede lateral externa da enfermagem', 'cube', 'concrete', [9.25, 1.56, -24.35], [0, 0, 0], [0.20, 3.00, 3.80]);
    this.add('Lintel da porta da enfermagem', 'cube', 'concrete', [4.55, 2.58, -24.12], [0, 0, 0], [0.20, 0.98, 1.22]);
    this.add('Jamb esquerdo interno da enfermagem', 'cube', 'concrete', [4.55, 1.12, -24.74], [0, 0, 0], [0.20, 2.12, 0.06]);
    this.add('Jamb direito interno da enfermagem', 'cube', 'concrete', [4.55, 1.12, -23.50], [0, 0, 0], [0.20, 2.12, 0.06]);
    this.add('Frente inferior da enfermagem', 'cube', 'concrete', [6.90, 0.92, -22.45], [0, 0, 0], [4.90, 0.72, 0.20]);
    this.add('Fechamento inferior extra da enfermagem', 'cube', 'concrete', [6.90, 0.40, -22.45], [0, 0, 0], [4.90, 0.24, 0.20]);
    this.add('Frente superior da enfermagem', 'cube', 'concrete', [6.90, 2.40, -22.45], [0, 0, 0], [4.90, 0.62, 0.20]);
    this.add('Fechamento superior extra da enfermagem', 'cube', 'concrete', [6.90, 2.86, -22.45], [0, 0, 0], [4.90, 0.28, 0.20]);
    this.add('Pilar frontal esquerdo da enfermagem', 'cube', 'concrete', [4.55, 1.58, -22.45], [0, 0, 0], [0.20, 2.38, 0.20]);
    this.add('Pilar frontal direito da enfermagem', 'cube', 'concrete', [9.25, 1.58, -22.45], [0, 0, 0], [0.20, 2.38, 0.20]);
    this.add('Janela frontal de vidro da enfermagem', 'cube', 'glass', [6.90, 1.65, -22.42], [0, 0, 0], [4.30, 1.34, 0.05], null, { transparent: true });
    this.add('Moldura superior da janela frontal da enfermagem', 'cube', 'metal', [6.90, 2.33, -22.40], [0, 0, 0], [4.32, 0.05, 0.06]);
    this.add('Moldura inferior da janela frontal da enfermagem', 'cube', 'metal', [6.90, 0.97, -22.40], [0, 0, 0], [4.32, 0.05, 0.06]);
    this.add('Moldura esquerda da janela frontal da enfermagem', 'cube', 'metal', [4.75, 1.65, -22.40], [0, 0, 0], [0.05, 1.34, 0.06]);
    this.add('Moldura direita da janela frontal da enfermagem', 'cube', 'metal', [9.05, 1.65, -22.40], [0, 0, 0], [0.05, 1.34, 0.06]);
    this.add('Teto da enfermagem sem face preta', 'cube', 'concrete', [6.90, 3.04, -24.35], [0, 0, 0], [4.90, 0.08, 3.90]);
    this.add('Placa Enfermagem acima da janela no estilo do portal principal', 'verticalPlane', this.labelMaterial('ENFERMAGEM', { width: 1024, height: 128, fontSize: 56, bg: '#b31414', bg2: '#ff4a4a', fg: '#101417', border: '#6f0d0d', specular: 0.66, shininess: 60, emissive: 0.12 }), [6.90, 2.45, -22.28], [0, 0, 0], [2.55, 0.34, 1]);
    this.add('Cruz vermelha vertical da placa da enfermagem', 'cube', 'redCloth', [6.90, 3.22, -22.36], [0, 0, 0], [0.14, 0.46, 0.04]);
    this.add('Cruz vermelha horizontal da placa da enfermagem', 'cube', 'redCloth', [6.90, 3.22, -22.36], [0, 0, 0], [0.46, 0.14, 0.04]);
    this.add('Cruz vermelha interna vertical da enfermagem', 'cube', 'redCloth', [5.60, 2.18, -26.08], [0, 0, 0], [0.22, 1.04, 0.06]);
    this.add('Cruz vermelha interna horizontal da enfermagem', 'cube', 'redCloth', [5.60, 2.18, -26.08], [0, 0, 0], [0.92, 0.22, 0.06]);
    this.add('Estrutura da maca da enfermagem', 'cube', 'metal', [6.00, 0.56, -24.95], [0, 0, 0], [2.05, 0.18, 0.72]);
    this.add('Colchão branco da maca da enfermagem', 'cube', 'white', [6.00, 0.74, -24.95], [0, 0, 0], [1.90, 0.16, 0.62]);
    this.add('Travesseiro da maca da enfermagem', 'cube', 'white', [6.00, 0.88, -24.38], [0, 0, 0], [0.78, 0.12, 0.24]);
    for (let dx of [-0.78, 0.78]) for (let dz of [-0.24, 0.24]) this.add('Perna da maca da enfermagem', 'cube', 'metal', [6.00 + dx, 0.28, -24.95 + dz], [0, 0, 0], [0.08, 0.44, 0.08]);
    this.add('Estante médica da enfermagem', 'cube', 'rustMetal', [8.15, 1.12, -25.55], [0, 0, 0], [1.05, 1.75, 0.38]);
    for (let y of [0.52, 1.04, 1.56]) this.add('Prateleira interna da estante médica da enfermagem', 'cube', 'blackMetal', [8.15, y, -25.26], [0, 0, 0], [0.86, 0.05, 0.05]);
    this.add('Mesa auxiliar da enfermagem', 'cube', 'metal', [7.85, 0.78, -23.95], [0, 0, 0], [1.24, 0.10, 0.58]);
    for (let dx of [-0.44, 0.44]) for (let dz of [-0.18, 0.18]) this.add('Perna da mesa auxiliar da enfermagem', 'cube', 'metal', [7.85 + dx, 0.36, -23.95 + dz], [0, 0, 0], [0.06, 0.72, 0.06]);
    this.add('Bandeja médica 1 da enfermagem', 'cube', 'white', [7.55, 0.90, -23.95], [0, 0, 0], [0.18, 0.04, 0.12]);
    this.add('Bandeja médica 2 da enfermagem', 'cube', 'white', [7.80, 0.90, -23.95], [0, 0, 0], [0.18, 0.04, 0.12]);
    this.add('Frasco médico pequeno 1 da enfermagem', 'cylinder', 'white', [8.06, 0.98, -24.08], [0, 0, 0], [0.07, 0.18, 0.07]);
    this.add('Frasco médico pequeno 2 da enfermagem', 'cylinder', 'white', [8.20, 0.98, -24.08], [0, 0, 0], [0.07, 0.18, 0.07]);
    this.add('Maleta médica da enfermagem', 'cube', 'redCloth', [8.28, 0.92, -23.82], [0, 0, 0], [0.28, 0.12, 0.16]);
    this.infirmaryDoor = this.add('Porta lateral pequena da enfermagem', 'cube', 'wood', [4.55, 1.12, -24.12], [0, 0, 0], [0.18, 2.12, 1.20]);
    this.addCollider('Parede lateral interna traseira enfermagem', 4.55, -25.45, 0.15, 0.60);
    this.addCollider('Parede lateral interna frontal enfermagem', 4.55, -22.95, 0.15, 0.45);
    this.addCollider('Parede lateral externa enfermagem', 9.25, -24.35, 0.15, 1.90);
    this.addCollider('Frente de vidro da enfermagem', 6.90, -22.45, 2.45, 0.14);
    this.addCollider('Porta lateral da enfermagem', 4.55, -24.12, 0.18, 0.66, { gate: 'infirmary' });
    this.addCollider('Cama enfermagem', 6.00, -24.95, 1.10, 0.45);
    this.addCollider('Mesa auxiliar enfermagem', 7.85, -23.95, 0.72, 0.36);

    // Elementos centrais de triagem removidos para ampliar a circulação entre os dois postos.
  }

  buildCell(side, centerZ, label, suitMaterial, skinMaterial, faceMaterial, special, displayName = 'SEM NOME', occupantType = 'human') {
    const frontX = side * 2.82;
    const innerX = side * 5.35;
    const wallX = side * 8.35;

    this.add(label + ' parede lateral', 'cube', 'concrete', [wallX, 2.0, centerZ], [0, 0, 0], [0.32, 3.85, 4.85]);
    this.add(label + ' parede divisória traseira', 'cube', 'concrete', [side * 5.6, 2.0, centerZ - 2.46], [0, 0, 0], [5.3, 3.85, 0.25]);
    this.add(label + ' parede divisória frontal', 'cube', 'concrete', [side * 5.6, 2.0, centerZ + 2.46], [0, 0, 0], [5.3, 3.85, 0.25]);
    this.add(label + ' piso individual', 'cube', 'stone', [side * 5.6, 0.18, centerZ], [0, 0, 0], [5.15, 0.08, 4.75]);
    // Teto individual de cada cela: cobre toda a área superior sem deixar frestas aparentes.
    this.add(label + ' teto fechado da cela', 'cube', 'roof', [side * 5.585, 3.96, centerZ], [0, 0, 0], [5.70, 0.14, 5.42]);

    this.addCollider(label + ' grade frontal', frontX, centerZ, 0.38, 2.38);
    this.addCollider(label + ' parede lateral', wallX, centerZ, 0.38, 2.50);

    // Grade frontal elevada até o teto: elimina o vão superior em todas as celas.
    // O topo da grade agora encosta visualmente no teto individual da cela.
    for (let z = centerZ - 1.95; z <= centerZ + 1.96; z += 0.68) {
      this.add(label + ' grade vertical estrutural', 'cube', 'blackMetal', [frontX, 1.91, z], [0, 0, 0], [0.085, 3.82, 0.075]);
    }
    for (let y of [0.82, 1.70, 2.58, 3.60]) this.add(label + ' barra horizontal da grade', 'cube', 'blackMetal', [frontX, y, centerZ], [0, 0, 0], [0.12, 0.085, 4.35]);

    this.add(label + ' cama metálica', 'cube', 'metal', [wallX - side * 0.92, 0.55, centerZ + 1.25], [0, 0, 0], [1.28, 0.32, 1.65]);
    this.add(label + ' colchão', 'cube', special ? 'orangeSuit' : 'blueSuit', [wallX - side * 0.92, 0.83, centerZ + 1.25], [0, 0, 0], [1.18, 0.18, 1.50]);
    this.add(label + ' travesseiro', 'cube', 'white', [wallX - side * 0.92, 0.98, centerZ + 1.92], [0, 0, 0], [0.78, 0.15, 0.34]);
    this.add(label + ' vaso/sanitário', 'cylinder', 'white', [wallX - side * 0.72, 0.42, centerZ - 1.55], [0, 0, 0], [0.48, 0.45, 0.48]);
    this.add(label + ' pia pequena', 'cube', 'metal', [wallX - side * 0.68, 1.08, centerZ - 0.72], [0, 0, 0], [0.52, 0.18, 0.72]);
    this.add(label + ' cano da pia', 'cylinder', 'metal', [wallX - side * 0.68, 0.82, centerZ - 0.72], [0, 0, 0], [0.08, 0.52, 0.08]);
    this.add(label + ' prateleira pequena', 'cube', 'wood', [wallX - side * 0.75, 1.82, centerZ + 0.2], [0, 0, 0], [0.78, 0.11, 0.5]);

    const signMaterial = this.labelMaterial(displayName, { width: 512, height: 128, fontSize: displayName.length > 11 ? 42 : 54, bg: '#c3a13b', bg2: '#e5c95d', specular: 0.72, shininess: 74, emissive: 0.30 });
    this.add(label + ' placa de identificação com nome', 'verticalPlane', signMaterial, [frontX - side * 0.11, 2.93, centerZ], [0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0], [1.35, 0.34, 1]);

    if (occupantType === 'dog') {
      this.buildDog(label, [innerX, 0.0, centerZ - 0.10], side);
    } else {
      this.buildAvatar(label, [innerX, 0.0, centerZ - 0.15], side, suitMaterial, skinMaterial, faceMaterial, special);
    }
  }

  buildAvatar(label, base, side, suitMaterial, skinMaterial, faceMaterial, special) {
    const x = base[0], z = base[2];
    const yaw = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    this.add(label + ' corpo detalhado do avatar', 'cube', suitMaterial, [x, 1.02, z], [0, yaw, 0], [0.68, 1.02, 0.40]);
    this.add(label + ' gola do uniforme', 'cube', 'blackMetal', [x, 1.56, z], [0, yaw, 0], [0.48, 0.08, 0.42]);
    this.add(label + ' cabeça 3D do avatar', 'sphere', skinMaterial, [x, 1.84, z], [0, yaw, 0], [0.56, 0.61, 0.56]);
    this.add(label + ' cabelo/cobertura da cabeça', 'sphere', special ? 'blackMetal' : 'rustMetal', [x - side * 0.03, 2.09, z], [0, yaw, 0], [0.50, 0.20, 0.48]);
    this.add(label + ' orelha esquerda', 'sphere', skinMaterial, [x, 1.84, z - 0.34], [0, yaw, 0], [0.085, 0.13, 0.055]);
    this.add(label + ' orelha direita', 'sphere', skinMaterial, [x, 1.84, z + 0.34], [0, yaw, 0], [0.085, 0.13, 0.055]);
    this.add(label + ' braço esquerdo', 'cube', suitMaterial, [x, 1.07, z - 0.43], [0, yaw, -0.08], [0.18, 0.78, 0.18]);
    this.add(label + ' braço direito', 'cube', suitMaterial, [x, 1.07, z + 0.43], [0, yaw, 0.08], [0.18, 0.78, 0.18]);
    this.add(label + ' mão esquerda', 'sphere', skinMaterial, [x, 0.64, z - 0.45], [0, yaw, 0], [0.13, 0.13, 0.13]);
    this.add(label + ' mão direita', 'sphere', skinMaterial, [x, 0.64, z + 0.45], [0, yaw, 0], [0.13, 0.13, 0.13]);
    this.add(label + ' perna esquerda', 'cube', 'blackMetal', [x, 0.42, z - 0.20], [0, yaw, 0], [0.22, 0.74, 0.18]);
    this.add(label + ' perna direita', 'cube', 'blackMetal', [x, 0.42, z + 0.20], [0, yaw, 0], [0.22, 0.74, 0.18]);
    this.add(label + ' sapato esquerdo', 'cube', 'black', [x - side * 0.03, 0.08, z - 0.20], [0, yaw, 0], [0.34, 0.12, 0.22]);
    this.add(label + ' sapato direito', 'cube', 'black', [x - side * 0.03, 0.08, z + 0.20], [0, yaw, 0], [0.34, 0.12, 0.22]);

    if (faceMaterial) {
      // Moldura oval sutil para melhorar a leitura do retrato, como nas versões iniciais do projeto.
      this.add(label + ' moldura oval do rosto', 'facePatch', 'faceFrame', [x - side * 0.314, 1.86, z], [0, yaw, 0], [1.10, 1.10, 1.10], null, { transparent: true });
      // Retrato oval aderido ao volume da cabeça.
      this.add(label + ' rosto oval pintado no volume da cabeça', 'facePatch', faceMaterial, [x - side * 0.322, 1.86, z], [0, yaw, 0], [1.0, 1.0, 1.0], null, { transparent: true });
    }

    if (special) {
      this.add(label + ' algema metálica esquerda', 'cube', 'metal', [x, 0.66, z - 0.45], [0, yaw, 0], [0.05, 0.05, 0.26]);
      this.add(label + ' algema metálica direita', 'cube', 'metal', [x, 0.66, z + 0.45], [0, yaw, 0], [0.05, 0.05, 0.26]);
      this.add(label + ' base de destaque', 'cylinder', 'hazard', [x, 0.08, z], [0, 0, 0], [0.92, 0.08, 0.92]);
    }
  }

  buildDog(label, base, side) {
    const x = base[0], z = base[2];
    const yaw = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    this.add(label + ' cachorro Caramelo corpo', 'sphere', 'caramelFur', [x, 0.66, z], [0, yaw, 0], [0.72, 0.42, 1.05]);
    this.add(label + ' cachorro Caramelo peito', 'sphere', 'white', [x - side * 0.03, 0.64, z - 0.07], [0, yaw, 0], [0.42, 0.30, 0.36]);
    this.add(label + ' cachorro Caramelo cabeça', 'sphere', 'caramelFur', [x - side * 0.50, 0.92, z], [0, yaw, 0], [0.42, 0.40, 0.42]);
    this.add(label + ' cachorro focinho', 'sphere', 'white', [x - side * 0.78, 0.84, z], [0, yaw, 0], [0.24, 0.18, 0.22]);
    this.add(label + ' cachorro nariz', 'sphere', 'black', [x - side * 0.93, 0.88, z], [0, yaw, 0], [0.06, 0.05, 0.05]);
    this.add(label + ' orelha esquerda do Caramelo', 'sphere', 'caramelFur', [x - side * 0.42, 1.05, z - 0.28], [0, yaw, 0.4], [0.16, 0.28, 0.09]);
    this.add(label + ' orelha direita do Caramelo', 'sphere', 'caramelFur', [x - side * 0.42, 1.05, z + 0.28], [0, yaw, -0.4], [0.16, 0.28, 0.09]);
    for (const dz of [-0.36, -0.12, 0.16, 0.40]) {
      this.add(label + ' pata do Caramelo', 'cube', 'caramelFur', [x + side * 0.08, 0.28, z + dz], [0, yaw, 0], [0.16, 0.40, 0.14]);
      this.add(label + ' patinha escura do Caramelo', 'cube', 'black', [x + side * 0.08, 0.06, z + dz], [0, yaw, 0], [0.20, 0.08, 0.18]);
    }
    this.add(label + ' rabo do Caramelo', 'cylinder', 'caramelFur', [x + side * 0.65, 0.82, z], [0.5, 0, Math.PI / 2], [0.08, 0.85, 0.08]);
  }

  buildDarkWingGateAndRoom() {
    // A sala de celas fica por último, atrás da porta preta CELAS. O jogador recebe lanterna ao entrar.
    // Revisão atual: porta central ampliada para cobrir as frestas laterais/superiores,
    // placa preta e bloco de madeira removidos, e marcação +18 aplicada diretamente no travessão.
    this.add('Coluna esquerda porta CELAS', 'cube', 'darkConcrete', [-2.35, 2.1, -35.3], [0, 0, 0], [0.44, 4.1, 0.35]);
    this.add('Coluna direita porta CELAS', 'cube', 'darkConcrete', [2.35, 2.1, -35.3], [0, 0, 0], [0.44, 4.1, 0.35]);
    this.add('Verga porta CELAS', 'cube', 'darkConcrete', [0, 3.95, -35.3], [0, 0, 0], [5.2, 0.48, 0.35]);

    // Fechamento frontal preto contínuo, alinhado aos pilares da porta e às paredes laterais do bloco.
    this.add('Fechamento preto frontal esquerdo contínuo do acesso às celas', 'cube', 'black', [-6.43, 2.54, -35.45], [0, 0, 0], [7.72, 5.10, 0.30]);
    this.add('Fechamento preto frontal direito contínuo do acesso às celas', 'cube', 'black', [6.43, 2.54, -35.45], [0, 0, 0], [7.72, 5.10, 0.30]);
    this.add('Fechamento preto superior contínuo do acesso às celas', 'cube', 'black', [0, 4.50, -35.45], [0, 0, 0], [5.18, 0.66, 0.30]);

    // Pequena placa vermelha "+18" centralizada no travessão do arco das celas.
    this.add('Placa vermelha +18 no travessão das celas', 'verticalPlane', this.labelMaterial('+18', { width: 256, height: 128, fontSize: 72, bg: '#b31414', bg2: '#ff4a4a', fg: '#fff4f4', border: '#5e0a0a', specular: 0.78, shininess: 72, emissive: 0.22 }), [0.00, 3.97, -35.10], [0, 0, 0], [0.95, 0.34, 1]);

    this.darkGateLeft = this.add('Porta automática preta CELAS esquerda', 'cube', 'darkDoor', [-1.02, 1.72, -34.95], [0, 0, 0], [2.02, 3.45, 0.18]);
    this.darkGateRight = this.add('Porta automática preta CELAS direita', 'cube', 'darkDoor', [1.02, 1.72, -34.95], [0, 0, 0], [2.02, 3.45, 0.18]);
    this.addCollider('Porta CELAS automática das celas', 0, -34.95, 2.34, 0.35, { gate: 'dark' });

    this.add('Sala grande escura das celas piso rachado', 'cube', 'darkConcrete', [0, 0.12, -59.2], [0, 0, 0], [19.2, 0.10, 45.8]);
    this.add('Sala grande escura parede esquerda interna', 'cube', 'black', [-9.3, 2.6, -59.2], [0, 0, 0], [0.35, 5.0, 45.8]);
    this.add('Sala grande escura parede direita interna', 'cube', 'black', [9.3, 2.6, -59.2], [0, 0, 0], [0.35, 5.0, 45.8]);
    this.add('Sala grande escura teto baixo', 'cube', 'black', [0, 4.95, -59.2], [0, 0, 0], [19.2, 0.25, 45.8]);

    // Arco interno das celas reposicionado exatamente no começo das paredes das primeiras celas,
    // indo da ponta da parede esquerda até a ponta equivalente da cela da direita.
    // Estrutura semelhante à referência: arco largo, claro/cinza e com placa vermelha centralizada.
    const cellArchZ = -40.58;
    this.add('Arco das celas - coluna esquerda no começo da parede da cela', 'cube', 'concrete', [-8.35, 2.08, cellArchZ], [0, 0, 0], [0.46, 4.16, 0.32]);
    this.add('Arco das celas - coluna direita no começo da parede da cela', 'cube', 'concrete', [8.35, 2.08, cellArchZ], [0, 0, 0], [0.46, 4.16, 0.32]);
    this.add('Arco das celas - travessão superior largo e claro', 'cube', 'concrete', [0, 4.03, cellArchZ], [0, 0, 0], [17.16, 0.46, 0.32]);
    this.add('Placa vermelha CELAS centralizada no travessão do arco interno', 'verticalPlane', this.labelMaterial('CELAS', { width: 512, height: 128, fontSize: 70, bg: '#a30d0d', bg2: '#ef3d3d', fg: '#fff6f6', border: '#5c0808', specular: 0.78, shininess: 76, emissive: 0.34 }), [0, 4.03, cellArchZ + 0.17], [0, 0, 0], [2.08, 0.44, 1]);

    this.redLightPosition = [0, 3.2, -58.5];

    const cells = [
      { side: -1, z: -43.0, name: 'LULA', suit: 'orangeSuit', face: 'faceLula', special: true, type: 'human' },
      { side:  1, z: -43.0, name: 'BOLSONARO', suit: 'blueSuit', face: 'faceBolsonaro', special: true, type: 'human' },
      { side: -1, z: -48.4, name: 'CANETA AZUL', suit: 'blueSuit', face: 'faceCaneta', special: false, type: 'human' },
      { side:  1, z: -48.4, name: 'LUVA DE PEDREIRO', suit: 'orangeSuit', face: 'faceLuva', special: false, type: 'human' },
      { side: -1, z: -53.8, name: 'NILSON PAPINHO', suit: 'orangeSuit', face: 'faceNilson', special: false, type: 'human' },
      { side:  1, z: -53.8, name: 'CARAMELO', suit: 'caramelFur', face: null, special: false, type: 'dog' },
      { side: -1, z: -59.2, name: 'BETO CARRAPATO', suit: 'blueSuit', face: 'faceBeto', special: false, type: 'human' },
      { side:  1, z: -59.2, name: 'ZEZINHO DO PIX', suit: 'orangeSuit', face: 'facePix', special: false, type: 'human' },
      { side: -1, z: -64.6, name: 'CHICO MOEDAS', suit: 'blueSuit', face: 'faceChico', special: false, type: 'human' },
      { side:  1, z: -64.6, name: 'NABUCODONOSOR', suit: 'orangeSuit', face: 'faceNabuco', special: false, type: 'human' },
      { side: -1, z: -70.0, name: 'TONINHO TORNADO', suit: 'orangeSuit', face: 'faceToninho', special: false, type: 'human' },
      { side:  1, z: -70.0, name: 'PASTEL DE FEIRA', suit: 'blueSuit', face: 'facePastel', special: false, type: 'human' }
    ];
    cells.forEach((cell, idx) => {
      this.buildCell(cell.side, cell.z, `Cela ${String(idx + 1).padStart(2, '0')} - ${cell.name}`, cell.suit, 'skin', cell.face, cell.special, cell.name, cell.type);
    });

    this.buildFinalArea();
  }


  buildWardenHouseAndYard() {
    // Elementos externos continuam fora do roteiro interno. Removido o pátio/banho de sol dentro da prisão.
    this.add('Warden House - ruína de três níveis externa', 'cube', 'oldPlaster', [11.8, 1.6, -2.2], [0, -0.04, 0], [4.6, 3.2, 6.2]);
    this.add('Warden House - parede vazada frontal', 'cube', 'concrete', [11.8, 3.35, 0.95], [0, -0.04, 0], [4.4, 2.1, 0.35]);
    this.add('Warden House - moldura de ruína esquerda', 'cube', 'concrete', [9.45, 2.2, -2.2], [0, -0.04, 0], [0.32, 4.4, 6.0]);
    this.add('Warden House - terraço externo abandonado', 'cube', 'weeds', [14.8, 0.12, -3.5], [0, 0.04, 0], [3.6, 0.08, 6.2]);
    this.addCollider('Warden House externa', 11.8, -2.2, 2.7, 3.6);
  }


  buildMessHall() {
    // Primeiro setor depois do portão: refeitório.
    this.add('Piso do refeitório amplo', 'cube', 'stone', [0, 0.22, -6.6], [0, 0, 0], [18.6, 0.07, 18.2]);
    this.add('Linha central livre do refeitório', 'cube', 'darkConcrete', [0, 0.26, -6.6], [0, 0, 0], [2.55, 0.035, 17.8]);

    // Lado esquerdo do refeitório.
    {
      const side = -1;
      const x = -8.25;
      const wallX = -10.18;
      this.add('Balcão base do refeitório lateral esquerdo', 'cube', 'rustMetal', [x, 0.36, -5.8], [0, 0, 0], [1.35, 0.34, 6.4]);
      this.add('Balcão superior do refeitório lateral esquerdo', 'cube', 'metal', [x + 0.04, 0.58, -5.8], [0, 0, 0], [1.55, 0.10, 6.7]);
      this.add('Janela de atendimento do refeitório esquerdo', 'cube', 'black', [x + 0.70, 1.14, -5.8], [0, 0, 0], [0.08, 0.82, 4.8]);
      this.add('Placa REFEITÓRIO lateral esquerda pregada na parede', 'verticalPlane', this.labelMaterial('REFEITÓRIO', { width: 512, height: 128, fontSize: 58, bg: '#9d7631', bg2: '#e2be58', specular: 0.86, shininess: 78, emissive: 0.42 }), [wallX, 3.34, -5.8], [0, Math.PI / 2, 0], [1.8, 0.44, 1]);
      this.add('Ponto de iluminação acima da placa do refeitório esquerdo', 'sphere', 'light', [-10.06, 2.98, -5.8], [0, 0, 0], [0.18, 0.18, 0.18]);
      this.add('Suporte metálico da luz do refeitório esquerdo', 'cube', 'blackMetal', [-10.09, 2.74, -5.8], [0, 0, 0], [0.06, 0.28, 0.18]);
      this.add('Fogão industrial do refeitório esquerdo', 'cube', 'blackMetal', [x, 0.54, -9.7], [0, 0, 0], [1.1, 0.48, 1.2]);
      this.add('Exaustor do refeitório esquerdo', 'cube', 'metal', [x, 1.78, -9.7], [0, 0, 0], [1.5, 0.22, 1.5]);
      this.addCollider('Refeitório lateral esquerdo', x, -5.8, 0.9, 3.6);
    }

    // Lado direito do refeitório. Sem volume externo em x≈8-12 / z≈-12.
    {
      const x = 8.25;
      const wallX = 10.18;
      this.add('Balcão base do refeitório lateral direito', 'cube', 'rustMetal', [x, 0.36, -5.8], [0, 0, 0], [1.35, 0.34, 6.4]);
      this.add('Balcão superior do refeitório lateral direito', 'cube', 'metal', [x - 0.04, 0.58, -5.8], [0, 0, 0], [1.55, 0.10, 6.7]);
      this.add('Janela de atendimento do refeitório direito', 'cube', 'black', [x - 0.70, 1.14, -5.8], [0, 0, 0], [0.08, 0.82, 4.8]);
      this.add('Placa REFEITÓRIO lateral direita pregada na parede', 'verticalPlane', this.labelMaterial('REFEITÓRIO', { width: 512, height: 128, fontSize: 58, bg: '#9d7631', bg2: '#e2be58', specular: 0.86, shininess: 78, emissive: 0.42 }), [wallX, 3.34, -5.8], [0, -Math.PI / 2, 0], [1.8, 0.44, 1]);
      this.add('Ponto de iluminação acima da placa do refeitório direito', 'sphere', 'light', [10.06, 2.98, -5.8], [0, 0, 0], [0.18, 0.18, 0.18]);
      this.add('Suporte metálico da luz do refeitório direito', 'cube', 'blackMetal', [10.09, 2.74, -5.8], [0, 0, 0], [0.06, 0.28, 0.18]);
      // Equipamentos deslocados para dentro, longe da parede externa.
      this.add('Fogão industrial do refeitório direito deslocado', 'cube', 'blackMetal', [6.95, 0.54, -8.9], [0, 0, 0], [1.0, 0.46, 1.0]);
      this.add('Exaustor do refeitório direito deslocado', 'cube', 'metal', [6.95, 1.74, -8.9], [0, 0, 0], [1.25, 0.20, 1.25]);
      this.addCollider('Refeitório lateral direito', x, -5.8, 0.9, 3.6);
    }

    // Mesas à esquerda e à direita, com pernas e altura correta.
    for (const side of [-1, 1]) {
      const x = side * 4.3;
      for (let i = 0; i < 5; i++) {
        const z = 0.0 - i * 2.7;
        this.add('Tampo da mesa lateral do refeitório', 'cube', 'metal', [x, 0.88, z], [0, 0, 0], [2.45, 0.14, 0.68]);
        for (const lx of [-1.03, 1.03]) for (const lz of [-0.22, 0.22]) {
          this.add('Perna da mesa do refeitório', 'cube', 'blackMetal', [x + lx, 0.47, z + lz], [0, 0, 0], [0.10, 0.72, 0.10]);
        }
        this.add('Banco interno do refeitório', 'cube', 'wood', [x - side * 1.22, 0.42, z], [0, 0, 0], [0.38, 0.14, 1.78]);
        this.add('Banco externo do refeitório', 'cube', 'wood', [x + side * 1.22, 0.42, z], [0, 0, 0], [0.38, 0.14, 1.78]);
        this.add('Bandeja metálica no refeitório', 'cube', 'metal', [x + side * 0.42, 0.99, z], [0, 0.2, 0], [0.42, 0.035, 0.28]);
        this.addCollider('Mesa refeitório ' + side + ' ' + i, x, z, 1.4, 0.55);
      }
    }
  }


  buildFinalArea() {
    // Saída final revisada: parede homogênea, placa SAÍDA encaixada no travessão do arco cinza
    // e porta um pouco mais alta para eliminar a pequena fresta superior.
    this.add('Fechamento lateral esquerdo homogêneo da parede da saída', 'cube', 'oldPlaster', [-5.95, 3.05, -83.18], [0, 0, 0], [7.48, 6.10, 0.24]);
    this.add('Fechamento lateral direito homogêneo da parede da saída', 'cube', 'oldPlaster', [5.95, 3.05, -83.18], [0, 0, 0], [7.48, 6.10, 0.24]);
    this.add('Fechamento superior homogêneo da parede da saída', 'cube', 'oldPlaster', [0, 5.00, -83.18], [0, 0, 0], [4.55, 2.20, 0.24]);
    this.add('Tampa homogênea de fresta esquerda entre parede e arco da saída', 'cube', 'oldPlaster', [-2.50, 3.05, -83.18], [0, 0, 0], [0.64, 6.10, 0.24]);
    this.add('Tampa homogênea de fresta direita entre parede e arco da saída', 'cube', 'oldPlaster', [2.50, 3.05, -83.18], [0, 0, 0], [0.64, 6.10, 0.24]);

    this.add('Moldura esquerda da porta de saída convencional', 'cube', 'darkConcrete', [-2.05, 2.05, -83.02], [0, 0, 0], [0.36, 4.0, 0.32]);
    this.add('Moldura direita da porta de saída convencional', 'cube', 'darkConcrete', [2.05, 2.05, -83.02], [0, 0, 0], [0.36, 4.0, 0.32]);
    this.add('Verga superior da porta de saída convencional', 'cube', 'darkConcrete', [0, 3.92, -83.02], [0, 0, 0], [4.45, 0.44, 0.32]);
    this.add('Placa SAÍDA encaixada no travessão da porta convencional', 'verticalPlane', this.labelMaterial('SAÍDA', { width: 512, height: 128, fontSize: 62, bg: '#125c3d', bg2: '#1ccf88', fg: '#f4fff8', border: '#eafff2', emissive: 0.18 }), [0, 3.96, -82.85], [0, 0, 0], [1.95, 0.34, 1]);

    this.exitDoor = this.add('Porta convencional de madeira da saída articulada mais alta', 'cube', 'wood', [0, 1.88, -83.02], [0, 0, 0], [3.74, 3.76, 0.16]);
    this.addCollider('Porta SAÍDA convencional', 0, -83.02, 2.10, 0.36, { gate: 'exit' });
    this.add('Piso externo após a saída', 'cube', 'gravel', [0, 0.12, -85.4], [0, 0, 0], [5.0, 0.07, 3.8]);
  }


  update(time, cameraPosition = null) {
    const player = cameraPosition || [0, 1.75, 31.2];
    const approachOuter = Vec3.distance([player[0], 0, player[2]], [0, 0, 10.25]) < 5.1;
    const approachInner = Vec3.distance([player[0], 0, player[2]], [0, 0, 7.15]) < 4.4;
    const approachDark = Vec3.distance([player[0], 0, player[2]], [0, 0, -34.95]) < 5.0;
    const approachExit = Vec3.distance([player[0], 0, player[2]], [0, 0, -80.15]) < 4.8;
    const approachInfirmary = Vec3.distance([player[0], 0, player[2]], [4.75, 0, -24.12]) < 1.75;
    const approachControl = Vec3.distance([player[0], 0, player[2]], [-4.75, 0, -24.12]) < 1.75;
    const approachFiscal = Vec3.distance([player[0], 0, player[2]], [-4.22, 0, 21.72]) < 2.0;
    const rate = 0.055;
    this.outerGateAmount += ((approachOuter ? 1 : 0) - this.outerGateAmount) * rate;
    this.innerGateAmount += ((approachInner ? 1 : 0) - this.innerGateAmount) * rate;
    this.darkGateAmount += ((approachDark ? 1 : 0) - this.darkGateAmount) * rate;
    this.exitGateAmount += ((approachExit ? 1 : 0) - this.exitGateAmount) * rate;
    this.infirmaryDoorAmount += ((approachInfirmary ? 1 : 0) - this.infirmaryDoorAmount) * rate;
    this.controlDoorAmount += ((approachControl ? 1 : 0) - this.controlDoorAmount) * rate;
    this.fiscalDoorAmount += ((approachFiscal ? 1 : 0) - this.fiscalDoorAmount) * rate;
    if (this.outerGateLeft) {
      this.outerGateLeft.position[0] = -1.35 - this.outerGateAmount * 1.65;
      this.outerGateRight.position[0] = 1.35 + this.outerGateAmount * 1.65;
    }
    if (this.innerGateLeft) {
      this.innerGateLeft.position[0] = -1.28 - this.innerGateAmount * 1.65;
      this.innerGateRight.position[0] = 1.28 + this.innerGateAmount * 1.65;
    }
    if (this.darkGateLeft) {
      this.darkGateLeft.position[0] = -1.02 - this.darkGateAmount * 1.38;
      this.darkGateRight.position[0] = 1.02 + this.darkGateAmount * 1.38;
    }
    if (this.exitGateLeft) {
      this.exitGateLeft.position[0] = -0.92 - this.exitGateAmount * 1.28;
      this.exitGateRight.position[0] = 0.92 + this.exitGateAmount * 1.28;
    }
    if (this.exitDoor) {
      const angle = this.exitGateAmount * 1.20;
      const pivotX = -1.87;
      const pivotZ = -83.02;
      const halfWidth = 1.87;
      // Dobradiça no lado esquerdo: um lado fica fixo e apenas o outro gira.
      this.exitDoor.rotation[1] = angle;
      this.exitDoor.position[0] = pivotX + Math.cos(angle) * halfWidth;
      this.exitDoor.position[2] = pivotZ - Math.sin(angle) * halfWidth;
    }
    if (this.infirmaryDoor) {
      this.infirmaryDoor.rotation[1] = 0 + this.infirmaryDoorAmount * 1.18;
      this.infirmaryDoor.position[0] = 4.55 + 0.24 * this.infirmaryDoorAmount;
      this.infirmaryDoor.position[2] = -24.12 - 0.48 * this.infirmaryDoorAmount;
    }
    if (this.controlDoor) {
      this.controlDoor.rotation[1] = 0 - this.controlDoorAmount * 1.18;
      this.controlDoor.position[0] = -4.55 - 0.24 * this.controlDoorAmount;
      this.controlDoor.position[2] = -24.12 - 0.48 * this.controlDoorAmount;
    }
    if (this.fiscalDoor) {
      // Porta do posto de fiscalização com pivô fixo: a lateral traseira funciona como dobradiça
      // e a folha abre 90 graus para fora, sem escorregar ou atravessar a parede.
      const angle = this.fiscalDoorAmount * (Math.PI / 2);
      const hingeX = -4.20;
      const hingeZ = 21.12;
      const halfWidth = 0.60;
      this.fiscalDoor.rotation[1] = angle;
      this.fiscalDoor.position[0] = hingeX + Math.sin(angle) * halfWidth;
      this.fiscalDoor.position[2] = hingeZ + Math.cos(angle) * halfWidth;
    }

    this.flashlightEnabled = player[2] < -35.4 ? 1.0 : 0.0;
    this.redLightIntensity = 0.0;

    const a = time * 0.58;
    this.scenicLightPosition = this.beaconCenter.slice();
    const beamLength = 14.0;
    const beamRadius = 1.25 + Math.sin(time * 1.7) * 0.10;

    if (this.searchlightHead) this.searchlightHead.rotation[1] = -a;
    if (this.searchLens) {
      this.searchLens.position = this.beaconCenter.slice();
      this.searchLens.material.emissive = 1.0 + Math.sin(time * 6.0) * 0.15;
    }
    if (this.searchBeam) {
      // Pivô fixo: a ponta do cone permanece no centro da lente; somente a rotação muda.
      this.searchBeam.position = this.beaconCenter.slice();
      this.searchBeam.rotation = [0, -a, 0];
      this.searchBeam.scale = [beamRadius, beamRadius, beamLength];
    }

    if (this.leftSearchlightHead) this.leftSearchlightHead.rotation[1] = -a;
    if (this.leftSearchLens) {
      this.leftSearchLens.position = this.leftBeaconCenter.slice();
      this.leftSearchLens.material.emissive = 1.0 + Math.sin(time * 6.0 + 0.4) * 0.15;
    }
    if (this.leftSearchBeam) {
      this.leftSearchBeam.position = this.leftBeaconCenter.slice();
      this.leftSearchBeam.rotation = [0, -a, 0];
      this.leftSearchBeam.scale = [beamRadius, beamRadius, beamLength];
    }

    for (const obj of this.objects) if (typeof obj.update === 'function') obj.update(obj, time);
    for (const obj of this.transparentObjects) if (typeof obj.update === 'function') obj.update(obj, time);
  }

  getLightingSetup(cameraPosition) {
    const inCellsWing = cameraPosition[2] < -35.4;
    if (inCellsWing) {
      return {
        ambientStrength: 0.11,
        flashlightStrength: 5.3,
        mainLight: this.cellWingLighting.main,
        auxLights: this.cellWingLighting.aux
      };
    }
    return {
      ambientStrength: 0.20,
      flashlightStrength: 8.8,
      mainLight: this.defaultMainLight,
      auxLights: this.defaultAuxLights
    };
  }


  drawSky(gl, shader, camera, projectionMatrix, time) {
    if (!this.skyObject) return;
    this.skyObject.position[0] = camera.position[0];
    this.skyObject.position[1] = camera.position[1];
    this.skyObject.position[2] = camera.position[2];

    gl.useProgram(shader.program);
    gl.uniformMatrix4fv(shader.uniform.view, false, camera.getViewMatrix());
    gl.uniformMatrix4fv(shader.uniform.projection, false, projectionMatrix);
    gl.uniformMatrix4fv(shader.uniform.model, false, this.skyObject.getModelMatrix());
    gl.uniform1f(shader.uniform.time, time);
    gl.uniform3fv(shader.uniform.moonDirection, new Float32Array(this.moonDirection));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.skyObject.material.texture);
    gl.uniform1i(shader.uniform.skyTexture, 0);

    gl.disable(gl.BLEND);
    gl.depthMask(false);
    this.skyObject.mesh.draw(shader);
    gl.depthMask(true);
  }

  drawStandardObject(gl, shader, obj) {
    const material = obj.material;
    const model = obj.getModelMatrix();
    const normalMatrix = Mat4.normalFromMat4(model);

    gl.uniformMatrix4fv(shader.uniform.model, false, model);
    gl.uniformMatrix3fv(shader.uniform.normalMatrix, false, normalMatrix);
    gl.uniform3fv(shader.uniform.materialColor, new Float32Array(material.color));
    gl.uniform1f(shader.uniform.specularStrength, material.specular);
    gl.uniform1f(shader.uniform.shininess, material.shininess);
    gl.uniform2fv(shader.uniform.texScale, new Float32Array(material.texScale || [1, 1]));
    gl.uniform1f(shader.uniform.alpha, material.alpha ?? 1.0);
    gl.uniform1f(shader.uniform.emissive, material.emissive ?? 0.0);

    if (material.texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, material.texture);
      gl.uniform1i(shader.uniform.texture, 0);
      gl.uniform1i(shader.uniform.useTexture, 1);
    } else {
      gl.uniform1i(shader.uniform.useTexture, 0);
    }
    obj.mesh.draw(shader);
  }

  draw(skyShader, standardShader, waterShader, camera, projectionMatrix, time) {
    const gl = this.gl;
    const lighting = this.getLightingSetup(camera.position);

    this.drawSky(gl, skyShader, camera, projectionMatrix, time);

    gl.useProgram(standardShader.program);
    gl.uniformMatrix4fv(standardShader.uniform.view, false, camera.getViewMatrix());
    gl.uniformMatrix4fv(standardShader.uniform.projection, false, projectionMatrix);
    gl.uniform3fv(standardShader.uniform.cameraPosition, new Float32Array(camera.position));
    gl.uniform3fv(standardShader.uniform.lightPosition, new Float32Array(lighting.mainLight.position));
    gl.uniform3fv(standardShader.uniform.lightColor, new Float32Array(lighting.mainLight.color));
    gl.uniform3fv(standardShader.uniform.moonDirection, new Float32Array(this.moonDirection));
    gl.uniform3fv(standardShader.uniform.moonColor, new Float32Array(this.moonColor));
    gl.uniform1f(standardShader.uniform.ambientStrength, lighting.ambientStrength);
    gl.uniform3fv(standardShader.uniform.fogColor, new Float32Array(this.fogColor));
    gl.uniform1f(standardShader.uniform.fogNear, 34.0);
    gl.uniform1f(standardShader.uniform.fogFar, 122.0);
    const flashlightDir = camera.getForward ? camera.getForward() : [0, -0.05, -1];
    if (standardShader.uniform.flashlightPosition) gl.uniform3fv(standardShader.uniform.flashlightPosition, new Float32Array(camera.position));
    if (standardShader.uniform.flashlightDirection) gl.uniform3fv(standardShader.uniform.flashlightDirection, new Float32Array(flashlightDir));
    if (standardShader.uniform.flashlightStrength) gl.uniform1f(standardShader.uniform.flashlightStrength, this.flashlightEnabled * lighting.flashlightStrength);
    if (standardShader.uniform.redLightPosition) gl.uniform3fv(standardShader.uniform.redLightPosition, new Float32Array(this.redLightPosition));
    if (standardShader.uniform.redLightIntensity) gl.uniform1f(standardShader.uniform.redLightIntensity, this.redLightIntensity);
    if (standardShader.uniform.auxLight0Position) gl.uniform3fv(standardShader.uniform.auxLight0Position, new Float32Array(lighting.auxLights[0].position));
    if (standardShader.uniform.auxLight0Color) gl.uniform3fv(standardShader.uniform.auxLight0Color, new Float32Array(lighting.auxLights[0].color));
    if (standardShader.uniform.auxLight0Intensity) gl.uniform1f(standardShader.uniform.auxLight0Intensity, lighting.auxLights[0].intensity);
    if (standardShader.uniform.auxLight1Position) gl.uniform3fv(standardShader.uniform.auxLight1Position, new Float32Array(lighting.auxLights[1].position));
    if (standardShader.uniform.auxLight1Color) gl.uniform3fv(standardShader.uniform.auxLight1Color, new Float32Array(lighting.auxLights[1].color));
    if (standardShader.uniform.auxLight1Intensity) gl.uniform1f(standardShader.uniform.auxLight1Intensity, lighting.auxLights[1].intensity);
    if (standardShader.uniform.auxLight2Position) gl.uniform3fv(standardShader.uniform.auxLight2Position, new Float32Array(lighting.auxLights[2].position));
    if (standardShader.uniform.auxLight2Color) gl.uniform3fv(standardShader.uniform.auxLight2Color, new Float32Array(lighting.auxLights[2].color));
    if (standardShader.uniform.auxLight2Intensity) gl.uniform1f(standardShader.uniform.auxLight2Intensity, lighting.auxLights[2].intensity);

    gl.disable(gl.BLEND);
    gl.depthMask(true);
    for (const obj of this.objects) this.drawStandardObject(gl, standardShader, obj);

    gl.useProgram(waterShader.program);
    gl.uniformMatrix4fv(waterShader.uniform.view, false, camera.getViewMatrix());
    gl.uniformMatrix4fv(waterShader.uniform.projection, false, projectionMatrix);
    gl.uniform1f(waterShader.uniform.time, time);
    gl.uniform3fv(waterShader.uniform.cameraPosition, new Float32Array(camera.position));
    gl.uniform3fv(waterShader.uniform.lightPosition, new Float32Array(this.scenicLightPosition));
    gl.uniform3fv(waterShader.uniform.fogColor, new Float32Array(this.fogColor));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    for (const obj of this.waterObjects) {
      gl.uniformMatrix4fv(waterShader.uniform.model, false, obj.getModelMatrix());
      obj.mesh.draw(waterShader);
    }

    gl.useProgram(standardShader.program);
    gl.uniformMatrix4fv(standardShader.uniform.view, false, camera.getViewMatrix());
    gl.uniformMatrix4fv(standardShader.uniform.projection, false, projectionMatrix);
    gl.uniform3fv(standardShader.uniform.cameraPosition, new Float32Array(camera.position));
    gl.uniform3fv(standardShader.uniform.lightPosition, new Float32Array(lighting.mainLight.position));
    gl.uniform3fv(standardShader.uniform.lightColor, new Float32Array(lighting.mainLight.color));
    gl.uniform3fv(standardShader.uniform.moonDirection, new Float32Array(this.moonDirection));
    gl.uniform3fv(standardShader.uniform.moonColor, new Float32Array(this.moonColor));
    gl.uniform1f(standardShader.uniform.ambientStrength, lighting.ambientStrength);
    gl.uniform3fv(standardShader.uniform.fogColor, new Float32Array(this.fogColor));
    gl.uniform1f(standardShader.uniform.fogNear, 34.0);
    gl.uniform1f(standardShader.uniform.fogFar, 122.0);
    if (standardShader.uniform.flashlightPosition) gl.uniform3fv(standardShader.uniform.flashlightPosition, new Float32Array(camera.position));
    if (standardShader.uniform.flashlightDirection) gl.uniform3fv(standardShader.uniform.flashlightDirection, new Float32Array(flashlightDir));
    if (standardShader.uniform.flashlightStrength) gl.uniform1f(standardShader.uniform.flashlightStrength, this.flashlightEnabled * lighting.flashlightStrength);
    if (standardShader.uniform.redLightPosition) gl.uniform3fv(standardShader.uniform.redLightPosition, new Float32Array(this.redLightPosition));
    if (standardShader.uniform.redLightIntensity) gl.uniform1f(standardShader.uniform.redLightIntensity, this.redLightIntensity);
    if (standardShader.uniform.auxLight0Position) gl.uniform3fv(standardShader.uniform.auxLight0Position, new Float32Array(lighting.auxLights[0].position));
    if (standardShader.uniform.auxLight0Color) gl.uniform3fv(standardShader.uniform.auxLight0Color, new Float32Array(lighting.auxLights[0].color));
    if (standardShader.uniform.auxLight0Intensity) gl.uniform1f(standardShader.uniform.auxLight0Intensity, lighting.auxLights[0].intensity);
    if (standardShader.uniform.auxLight1Position) gl.uniform3fv(standardShader.uniform.auxLight1Position, new Float32Array(lighting.auxLights[1].position));
    if (standardShader.uniform.auxLight1Color) gl.uniform3fv(standardShader.uniform.auxLight1Color, new Float32Array(lighting.auxLights[1].color));
    if (standardShader.uniform.auxLight1Intensity) gl.uniform1f(standardShader.uniform.auxLight1Intensity, lighting.auxLights[1].intensity);
    if (standardShader.uniform.auxLight2Position) gl.uniform3fv(standardShader.uniform.auxLight2Position, new Float32Array(lighting.auxLights[2].position));
    if (standardShader.uniform.auxLight2Color) gl.uniform3fv(standardShader.uniform.auxLight2Color, new Float32Array(lighting.auxLights[2].color));
    if (standardShader.uniform.auxLight2Intensity) gl.uniform1f(standardShader.uniform.auxLight2Intensity, lighting.auxLights[2].intensity);
    for (const obj of this.transparentObjects) this.drawStandardObject(gl, standardShader, obj);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  getProgress(cameraPosition) {
    const z = cameraPosition[2];
    return Math.max(0, Math.min(1, (31.2 - z) / (31.2 + 85.0)));
  }


  getZone(cameraPosition) {
    const [x, , z] = cameraPosition;
    if (z > 26.0) return 'PÍER / BARCO';
    if (z > 18.0) return 'POSTO DE FISCALIZAÇÃO';
    if (z > 10.8) return 'CAMINHANDO - ENTRADA PRINCIPAL';
    if (z > 7.8) return 'PORTÃO ABERTO';
    if (z > 5.0) return 'ENTRADA LIBERADA';
    if (z > -16.8) return x < -2.0 ? 'REFEITÓRIO — MESAS ESQUERDAS' : (x > 2.0 ? 'REFEITÓRIO — MESAS DIREITAS' : 'REFEITÓRIO — CORREDOR CENTRAL');
    if (z > -33.8) return 'CONTROLE / TRIAGEM / ENFERMARIA';
    if (z > -81.9) return 'SALA DAS CELAS';
    if (z > -84.3) return 'FINALIZAÇÃO DO PASSEIO';
    return 'FIM DO PASSEIO';
  }


  getStatus(cameraPosition) {
    const [x, , z] = cameraPosition;
    if (z > 26.0) return 'Você está no píer, ande até o posto de fiscalização.';
    if (z > 18.0) return 'Você chegou na fiscalização, se identifique para poder prosseguir.';
    if (z > 10.8) return 'Siga pela estrada até chegar no portal principal da prisão.';
    if (z > 7.8) return 'O portão prisional abriu automaticamente por proximidade. Passe pelo centro.';
    if (z > 5.0) return 'Portão prisional aberto. O primeiro espaço interno agora é o refeitório.';
    if (z > -16.8) return 'Refeitório: mesas e bancos à esquerda e à direita, com refeitórios nas duas laterais e passagem central livre.';
    if (z > -33.8) return 'Segundo setor lógico: controle, triagem, enfermaria, guaritas e monitores antes da área restrita.';
    if (z > -81.9) return 'Salas das celas: aqui estão os indivíduos mais perigosos do território nacional, siga em frente!';
    if (z > -84.3) return 'Termine o seu passeio passando pela porta da saída, obrigado!';
    return 'Termine o seu passeio passando pela porta da saída, obrigado!';
  }

}

window.AlcatrazScene = AlcatrazScene;
