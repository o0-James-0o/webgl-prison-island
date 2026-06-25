'use strict';

function pushFace(out, verts, normal, uvs) {
  const base = out.positions.length / 3;
  for (let i = 0; i < verts.length; i++) {
    out.positions.push(verts[i][0], verts[i][1], verts[i][2]);
    out.normals.push(normal[0], normal[1], normal[2]);
    out.texcoords.push(uvs[i][0], uvs[i][1]);
  }
  out.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

const Geometry = {
  cube() {
    const g = { positions: [], normals: [], texcoords: [], indices: [] };
    const uv = [[0,0], [1,0], [1,1], [0,1]];
    pushFace(g, [[-0.5,-0.5, 0.5], [ 0.5,-0.5, 0.5], [ 0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]], [0,0,1], uv);
    pushFace(g, [[ 0.5,-0.5,-0.5], [-0.5,-0.5,-0.5], [-0.5, 0.5,-0.5], [ 0.5, 0.5,-0.5]], [0,0,-1], uv);
    pushFace(g, [[-0.5,-0.5,-0.5], [-0.5,-0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5,-0.5]], [-1,0,0], uv);
    pushFace(g, [[ 0.5,-0.5, 0.5], [ 0.5,-0.5,-0.5], [ 0.5, 0.5,-0.5], [ 0.5, 0.5, 0.5]], [1,0,0], uv);
    pushFace(g, [[-0.5, 0.5, 0.5], [ 0.5, 0.5, 0.5], [ 0.5, 0.5,-0.5], [-0.5, 0.5,-0.5]], [0,1,0], uv);
    pushFace(g, [[-0.5,-0.5,-0.5], [ 0.5,-0.5,-0.5], [ 0.5,-0.5, 0.5], [-0.5,-0.5, 0.5]], [0,-1,0], uv);
    return g;
  },

  plane(uvScale = 1) {
    return {
      positions: [-0.5,0,-0.5, 0.5,0,-0.5, 0.5,0,0.5, -0.5,0,0.5],
      normals: [0,1,0, 0,1,0, 0,1,0, 0,1,0],
      texcoords: [0,0, uvScale,0, uvScale,uvScale, 0,uvScale],
      indices: [0,1,2, 0,2,3]
    };
  },

  verticalPlane(uvScale = 1) {
    return {
      positions: [-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0],
      normals: [0,0,1, 0,0,1, 0,0,1, 0,0,1],
      texcoords: [0,0, uvScale,0, uvScale,uvScale, 0,uvScale],
      indices: [0,1,2, 0,2,3]
    };
  },

  gridPlane(divisions = 96, uvScale = 24) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    for (let z = 0; z <= divisions; z++) {
      for (let x = 0; x <= divisions; x++) {
        const u = x / divisions;
        const v = z / divisions;
        positions.push(u - 0.5, 0, v - 0.5);
        normals.push(0, 1, 0);
        texcoords.push(u * uvScale, v * uvScale);
      }
    }
    for (let z = 0; z < divisions; z++) {
      for (let x = 0; x < divisions; x++) {
        const a = z * (divisions + 1) + x;
        const b = a + 1;
        const c = a + divisions + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    return { positions, normals, texcoords, indices };
  },

  cylinder(segments = 48) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const a = u * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const z = Math.sin(a) * 0.5;
      positions.push(x, -0.5, z, x, 0.5, z);
      normals.push(x * 2, 0, z * 2, x * 2, 0, z * 2);
      texcoords.push(u * 4, 0, u * 4, 1);
    }
    for (let i = 0; i < segments; i++) {
      const o = i * 2;
      indices.push(o, o + 1, o + 3, o, o + 3, o + 2);
    }

    const topCenter = positions.length / 3;
    positions.push(0, 0.5, 0); normals.push(0, 1, 0); texcoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const z = Math.sin(a) * 0.5;
      positions.push(x, 0.5, z); normals.push(0, 1, 0); texcoords.push(x + 0.5, z + 0.5);
    }
    for (let i = 0; i < segments; i++) indices.push(topCenter, topCenter + i + 1, topCenter + i + 2);

    const bottomCenter = positions.length / 3;
    positions.push(0, -0.5, 0); normals.push(0, -1, 0); texcoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const z = Math.sin(a) * 0.5;
      positions.push(x, -0.5, z); normals.push(0, -1, 0); texcoords.push(x + 0.5, z + 0.5);
    }
    for (let i = 0; i < segments; i++) indices.push(bottomCenter, bottomCenter + i + 2, bottomCenter + i + 1);
    return { positions, normals, texcoords, indices };
  },

  sphere(latBands = 24, lonBands = 32) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    for (let lat = 0; lat <= latBands; lat++) {
      const theta = lat * Math.PI / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = lon * 2 * Math.PI / lonBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        positions.push(x * 0.5, y * 0.5, z * 0.5);
        normals.push(x, y, z);
        texcoords.push(lon / lonBands, 1 - lat / latBands);
      }
    }
    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;
        indices.push(first, second, first + 1, second, second + 1, first + 1);
      }
    }
    return { positions, normals, texcoords, indices };
  },

  cone(segments = 48) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    positions.push(0, 0.5, 0); normals.push(0, 1, 0); texcoords.push(0.5, 1);
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const a = u * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const z = Math.sin(a) * 0.5;
      const normal = Vec3.normalize([x, 0.35, z]);
      positions.push(x, -0.5, z);
      normals.push(normal[0], normal[1], normal[2]);
      texcoords.push(u, 0);
    }
    for (let i = 1; i <= segments; i++) indices.push(0, i, i + 1);
    const center = positions.length / 3;
    positions.push(0, -0.5, 0); normals.push(0, -1, 0); texcoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const z = Math.sin(a) * 0.5;
      positions.push(x, -0.5, z); normals.push(0, -1, 0); texcoords.push(x + 0.5, z + 0.5);
    }
    for (let i = 0; i < segments; i++) indices.push(center, center + i + 2, center + i + 1);
    return { positions, normals, texcoords, indices };
  },


  beaconBeam(segments = 64) {
    // Cone de feixe com pivô correto: a ponta fica exatamente em (0,0,0)
    // e o volume se estende no eixo local -Z. Assim, ao girar no Y,
    // a origem permanece fixa no centro da lente do farol.
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];

    const tipIndex = 0;
    positions.push(0, 0, 0);
    normals.push(0, 0, 1);
    texcoords.push(0.5, 1.0);

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const a = u * Math.PI * 2;
      const x = Math.cos(a) * 0.5;
      const y = Math.sin(a) * 0.5;
      const z = -1.0;
      const normal = Vec3.normalize([x, y, 0.28]);
      positions.push(x, y, z);
      normals.push(normal[0], normal[1], normal[2]);
      texcoords.push(u, 0.0);
    }

    for (let i = 1; i <= segments; i++) indices.push(tipIndex, i, i + 1);
    return { positions, normals, texcoords, indices };
  },


  curvedFacePatch(cols = 18, rows = 18) {
    // Patch oval aderido à curvatura da cabeça, não uma placa plana.
    // A superfície é uma pequena calota esférica local voltada para +Z.
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    const radius = 0.50;
    for (let y = 0; y <= rows; y++) {
      const v = y / rows;
      const py = (v - 0.5) * 0.72;
      for (let x = 0; x <= cols; x++) {
        const u = x / cols;
        const px = (u - 0.5) * 0.62;
        const inside = Math.max(0.001, radius * radius - px * px - py * py);
        const pz = Math.sqrt(inside) - radius + 0.012;
        positions.push(px, py, pz);
        const n = Vec3.normalize([px, py, pz + radius]);
        normals.push(n[0], n[1], n[2]);
        texcoords.push(u, v);
      }
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const a = y * (cols + 1) + x;
        const b = a + 1;
        const c = a + cols + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    return { positions, normals, texcoords, indices };
  },

  triangularPrism() {
    const g = { positions: [], normals: [], texcoords: [], indices: [] };
    const triFront = [[-0.5,-0.3,0.5], [0.5,-0.3,0.5], [0.0,0.4,0.5]];
    let b = 0;
    for (const v of triFront) { g.positions.push(...v); g.normals.push(0,0,1); }
    g.texcoords.push(0,0, 1,0, 0.5,1); g.indices.push(0,1,2);
    b = 3;
    for (const v of [[0.5,-0.3,-0.5], [-0.5,-0.3,-0.5], [0.0,0.4,-0.5]]) { g.positions.push(...v); g.normals.push(0,0,-1); }
    g.texcoords.push(0,0, 1,0, 0.5,1); g.indices.push(b,b+1,b+2);
    pushFace(g, [[-0.5,-0.3,-0.5], [0.5,-0.3,-0.5], [0.5,-0.3,0.5], [-0.5,-0.3,0.5]], [0,-1,0], [[0,0],[1,0],[1,1],[0,1]]);
    pushFace(g, [[-0.5,-0.3,-0.5], [-0.5,-0.3,0.5], [0.0,0.4,0.5], [0.0,0.4,-0.5]], [-0.82,0.58,0], [[0,0],[1,0],[1,1],[0,1]]);
    pushFace(g, [[0.5,-0.3,0.5], [0.5,-0.3,-0.5], [0.0,0.4,-0.5], [0.0,0.4,0.5]], [0.82,0.58,0], [[0,0],[1,0],[1,1],[0,1]]);
    return g;
  },


  objGroups(objText) {
    // Parser OBJ enxuto para assets low-poly: lê v, g/usemtl e f.
    // As faces são trianguladas em fan e recebem normais planas calculadas no carregamento.
    const sourceVertices = [null];
    const groups = new Map();
    let currentMaterial = 'default';

    function getGroup(material) {
      if (!groups.has(material)) {
        groups.set(material, { name: material, material, geometry: { positions: [], normals: [], texcoords: [], indices: [] } });
      }
      return groups.get(material).geometry;
    }

    function vertexFromToken(token) {
      const raw = token.split('/')[0];
      let index = parseInt(raw, 10);
      if (!Number.isFinite(index)) return null;
      if (index < 0) index = sourceVertices.length + index;
      return sourceVertices[index] || null;
    }

    function pushTriangle(g, a, b, c) {
      if (!a || !b || !c) return;
      const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let nx = ab[1] * ac[2] - ab[2] * ac[1];
      let ny = ab[2] * ac[0] - ab[0] * ac[2];
      let nz = ab[0] * ac[1] - ab[1] * ac[0];
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      const base = g.positions.length / 3;
      g.positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      g.normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
      g.texcoords.push(0, 0, 1, 0, 0.5, 1);
      g.indices.push(base, base + 1, base + 2);
    }

    const lines = String(objText || '').split(/\r?\n/);
    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      const type = parts[0];
      if (type === 'v' && parts.length >= 4) {
        sourceVertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if ((type === 'usemtl' || type === 'g' || type === 'o') && parts[1]) {
        currentMaterial = parts.slice(1).join('_').replace(/[^a-zA-Z0-9_\-]/g, '_') || 'default';
        getGroup(currentMaterial);
      } else if (type === 'f' && parts.length >= 4) {
        const verts = parts.slice(1).map(vertexFromToken).filter(Boolean);
        const g = getGroup(currentMaterial);
        for (let i = 1; i < verts.length - 1; i++) pushTriangle(g, verts[0], verts[i], verts[i + 1]);
      }
    }

    return Array.from(groups.values()).filter(group => group.geometry.indices.length > 0);
  },

  island(radialSegments = 96, rings = 14) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    function edgeNoise(a) {
      return 1.0 + 0.08 * Math.sin(a * 3.0) + 0.05 * Math.sin(a * 7.0 + 1.2) + 0.035 * Math.sin(a * 13.0 + 0.5);
    }
    for (let r = 0; r <= rings; r++) {
      const t = r / rings;
      for (let s = 0; s <= radialSegments; s++) {
        const a = (s / radialSegments) * Math.PI * 2;
        const radius = t * edgeNoise(a);
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        const mound = 0.18 * Math.exp(-t * 2.4);
        const rim = t > 0.82 ? -0.12 * (t - 0.82) / 0.18 : 0.0;
        const y = mound + rim + 0.025 * Math.sin(x * 11.0 + z * 7.0);
        positions.push(x, y, z);
        normals.push(0, 1, 0);
        texcoords.push(x * 1.8 + 0.5, z * 1.8 + 0.5);
      }
    }
    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < radialSegments; s++) {
        const a = r * (radialSegments + 1) + s;
        const b = a + 1;
        const c = a + radialSegments + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    return { positions, normals, texcoords, indices };
  }
};

window.Geometry = Geometry;
