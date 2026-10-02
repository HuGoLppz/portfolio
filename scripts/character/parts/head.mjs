// Cabeza estilo Pixar esculpida con SDF a partir de las medidas de character.png
// (coordenadas de la imagen: px,py; z = profundidad hacia el espectador, estimada)
import { ellipsoid, sphere, roundCone, roundBox, union, subtract, intersect, unionAll, polygonize } from '../lib/sdf.mjs';
import { uvSphere, sweep, rgb, mergeGeo, V } from '../lib/geom.mjs';
import { P } from '../lib/space.mjs';

const E = (px, py, z, rx, ry, rz, rot) => ellipsoid(P(px, py, z), [rx, ry, rz], rot);
const S = (px, py, z, r) => sphere(P(px, py, z), r);

export const HEAD = {
  axisX: 506,
  eyeL: { px: 461, py: 223.5, hw: 27, hh: 18.5, gaze: 1 },
  eyeR: { px: 556, py: 224, hw: 27.5, hh: 18.5, gaze: -5 },
  eyeR_: 29,       // radio del globo ocular
  nose: { px: 506, py: 258 },
  mouth: [[466, 286.5], [478, 289.5], [492, 291.2], [506, 291.8], [520, 290.8], [533, 289], [543, 286]],
};

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------- piel ----------
function skinBase() {
  const ax = HEAD.axisX;
  const cran = E(ax, 168, -28, 101, 113, 118);
  const facePlate = roundBox(P(ax, 232, -6), [76, 82, 90], 38);
  const face = E(ax, 262, -8, 91, 78, 98);
  const chin = E(ax - 1, 315, 40, 27, 23, 28);
  const cheekL = E(ax - 50, 272, 34, 38, 32, 44), cheekR = E(ax + 50, 272, 34, 38, 32, 44);
  let s = union(cran, face, 30);
  s = union(s, facePlate, 22);
  s = union(s, chin, 12);
  s = union(s, cheekL, 20); s = union(s, cheekR, 20);
  const neck = roundCone(P(500, 322, -46), P(500, 440, -50), 46, 56);
  s = union(s, neck, 18);
  // orejas (placa elíptica orientada hacia fuera/adelante) con concha hundida
  const earL = E(392, 268, -16, 12, 38, 25, [0, 0.5, 0.14]);
  const earR = E(620, 270, -16, 12, 38, 25, [0, -0.5, -0.14]);
  s = union(s, earL, 8); s = union(s, earR, 8);
  const conchaL = E(386, 266, 4, 7, 22, 14, [0, 0.5, 0.14]);
  const conchaR = E(626, 268, 4, 7, 22, 14, [0, -0.5, -0.14]);
  s = subtract(s, conchaL, 5); s = subtract(s, conchaR, 5);
  return s;
}

// z de la superficie de un SDF para un (x,y) dado, marchando desde delante
export function surfaceZ(sdf, x, y, zStart = 260, zEnd = -200) {
  let z = zStart, step = 6;
  let prev = sdf.f(x, y, z);
  while (z > zEnd) {
    const zn = z - step;
    const d = sdf.f(x, y, zn);
    if (d < 0) {
      let a = z, b = zn;
      for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (sdf.f(x, y, m) < 0) b = m; else a = m; }
      return (a + b) / 2;
    }
    z = zn; prev = d;
  }
  return NaN;
}

export function buildSkin({ cell = 2.2 } = {}) {
  let skin = skinBase();
  const base = skin;
  const ax = HEAD.axisX;

  // nariz: bulbo + aletas
  const nz = surfaceZ(base, P(HEAD.nose.px, 0)[0], P(0, 262)[1]);
  const [nxp, nyp] = [HEAD.nose.px, HEAD.nose.py];
  skin = union(skin, E(nxp, nyp, nz - 8, 24, 19, 25), 9);
  skin = union(skin, S(nxp - 21, nyp + 7, nz - 12, 11), 6);
  skin = union(skin, S(nxp + 21, nyp + 7, nz - 12, 11), 6);
  const nzTip = surfaceZ(skin, P(nxp, 0)[0], P(0, nyp + 6)[1]);
  skin = subtract(skin, E(nxp - 12, nyp + 11, nzTip - 4, 4.8, 2.6, 6), 3);
  skin = subtract(skin, E(nxp + 12, nyp + 11, nzTip - 4, 4.8, 2.6, 6), 3);

  // ojos: se retira piel delante del globo ocular dejando párpados
  const eyes = [];
  for (const [key, e] of [['L', HEAD.eyeL], ['R', HEAD.eyeR]]) {
    const zf = surfaceZ(base, P(e.px, 0)[0], P(0, e.py)[1]);
    const tilt = key === 'L' ? 0.05 : -0.05;
    const R = HEAD.eyeR_;
    const center = [e.px, e.py, zf - 21];
    const d = (e.hw * e.hw - e.hh * e.hh) / (2 * e.hh), Rl = e.hh + d;   // lente: dos discos desplazados
    const lens = intersect(E(e.px, e.py - d, zf + 6, Rl, Rl, 34, [0, 0, tilt]), E(e.px, e.py + d, zf + 6, Rl, Rl, 34, [0, 0, tilt]), 7);
    skin = subtract(skin, lens, 4);
    eyes.push({ key, e, center, R, zf });
  }

  // boca: surco de la sonrisa + labios
  const mouthPts = HEAD.mouth.map(([x, y]) => { const q = P(x, y); return [q[0], q[1], surfaceZ(skin, q[0], q[1]) + 0.4]; });
  const lipZ = mouthPts[3][2];
  const [mx, my] = [504, 292];
  skin = union(skin, E(mx, my - 8, lipZ - 7, 25, 6.2, 8), 4);   // labio inferior
  skin = union(skin, E(mx + 1, my - 4.2, lipZ - 7, 26, 3.4, 7), 3); // labio superior
  const groove = mouthPts.slice(0, -1).map((p, i) => roundCone(p, mouthPts[i + 1], 1.7, 1.7));
  skin = subtract(skin, unionAll(groove), 3);

  const bb = [-160, P(0, 470)[1], -190, 160, P(0, 36)[1], 175];
  const f = skin.f;
  const colorFn = (x, y, z, nx, ny, nz2) => skinColor(x, y, z, mouthPts);
  const mesh = polygonize(f, [bb[0], bb[1], bb[2]], [bb[3], bb[4], bb[5]], cell, { color: colorFn, project: 2 });
  return { mesh, sdf: skin, base, eyes, mouthPts };
}

// ---------- color de la piel (por vértice) ----------
const SKIN = [236, 164, 126];
function skinColor(x, y, z, mouthPts) {
  const px = x + 508, py = 1523 - y;
  let c = rgb(...SKIN).map((v) => Math.min(1, v * 1.25));
  const blush = (cx, cy, r, amt, col = [234, 128, 106]) => {
    const d = Math.hypot(px - cx, py - cy) / r;
    if (d < 1) c = mixC(c, rgb(...col), amt * (1 - smoothstep(0.2, 1, d)));
  };
  blush(446, 268, 40, 0.38); blush(570, 266, 40, 0.34);
  blush(506, 258, 16, 0.4, [236, 138, 110]);                   // punta de la nariz
  blush(462, 238, 30, 0.18); blush(552, 238, 30, 0.18);        // ojeras suaves
  blush(506, 205, 20, 0.0);
  // orejas
  if (px < 420 || px > 596) {
    const earC = px < 508 ? [392, 268] : [620, 270];
    const d = Math.hypot((px - earC[0]) / 22, (py - earC[1]) / 40);
    if (d < 1.15 && Math.abs(z) < 60) c = mixC(c, rgb(214, 112, 80), 0.7 * (1 - smoothstep(0.7, 1.15, d)));
    const dc = Math.hypot((px - (px < 508 ? 387 : 625)) / 9, (py - 268) / 20);   // concha
    if (dc < 1) c = mixC(c, rgb(190, 92, 66), 0.8 * (1 - smoothstep(0.4, 1, dc)));
  }
  // labios
  const lipD = Math.hypot((px - 505) / 26, (py - 296) / 7);
  if (lipD < 1) c = mixC(c, rgb(226, 138, 112), 0.8 * (1 - smoothstep(0.7, 1, lipD)));
  const lipU = Math.hypot((px - 506) / 27, (py - 287.5) / 4);
  if (lipU < 1) c = mixC(c, rgb(228, 142, 116), 0.7 * (1 - smoothstep(0.6, 1, lipU)));
  // línea de la boca
  let dm = 1e9;
  for (let i = 0; i < mouthPts.length - 1; i++) {
    const [ax, ay] = [mouthPts[i][0], mouthPts[i][1]], [bx, by] = [mouthPts[i + 1][0], mouthPts[i + 1][1]];
    const ex = bx - ax, ey = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)));
    dm = Math.min(dm, Math.hypot(x - ax - ex * t, y - ay - ey * t));
  }
  if (dm < 2.6) c = mixC(c, rgb(150, 74, 58), 0.95 * (1 - smoothstep(0.6, 2.6, dm)));
  // fosas nasales
  for (const nx of [494, 518]) { const d = Math.hypot((px - nx) / 6, (py - 266) / 3.4); if (d < 1) c = mixC(c, rgb(120, 62, 52), 0.75 * (1 - smoothstep(0.5, 1, d))); }
  return c;
}

// ---------- ojos ----------
export function buildEyes(eyes) {
  const meshes = [];
  const hl = [];
  const R = HEAD.eyeR_;
  for (const { key, e, center } of eyes) {
    const c = P(center[0], center[1], center[2]);
    const gx = e.gaze / R;
    const g = V.norm([gx, 0.02, 1]);
    const irisTh = Math.asin(22 / R), pupilTh = Math.asin(12.4 / R);
    const color = (d) => {
      const cosT = V.dot(d, g);
      const th = Math.acos(Math.min(1, Math.max(-1, cosT)));
      const sclera = rgb(236, 228, 222);
      if (th > irisTh + 0.04) return sclera;
      // posición angular dentro del iris para el reflejo inferior
      const low = smoothstep(0.0, 0.5, -(d[1] - g[1]) * 2.2);
      const rr = th / irisTh;
      let col;
      if (th < pupilTh) col = rgb(14, 11, 10);
      else {
        const edge = smoothstep(pupilTh, pupilTh + 0.05, th);
        col = mixC(rgb(48, 26, 13), rgb(104, 60, 28), smoothstep(0.5, 0.78, rr));
        col = mixC(col, rgb(150, 92, 44), low * smoothstep(0.5, 0.95, rr) * 0.85);
        col = mixC(col, rgb(34, 19, 11), smoothstep(0.88, 1.0, rr) * 0.9);   // anillo límbico
        col = mixC(rgb(14, 11, 10), col, edge);
      }
      return mixC(col, sclera, smoothstep(irisTh - 0.01, irisTh + 0.04, th));
    };
    meshes.push(uvSphere(c, R, { seg: 44, rings: 30, color }));
  }
  return meshes;
}

// reflejos (decales emisivos): [{ eye, dx, dy, rw, rh }] en px relativos al centro del ojo
export function buildHighlights(eyes) {
  const R = HEAD.eyeR_;
  const defs = {
    L: [{ dx: 5, dy: 6.5, rw: 3.9, rh: 3.1 }, { dx: -6.5, dy: -5.5, rw: 1.5, rh: 1.3 }],
    R: [{ dx: -3, dy: 7, rw: 4.4, rh: 3.3 }, { dx: -10, dy: 5, rw: 2.0, rh: 1.3 }],
  };
  const out = [];
  for (const { key, center } of eyes) {
    for (const h of defs[key]) {
      const c = P(center[0], center[1], center[2]);
      const dir = V.norm([h.dx / R, h.dy / R, Math.sqrt(Math.max(0.1, 1 - (h.dx / R) ** 2 - (h.dy / R) ** 2))]);
      const m = uvSphere([0, 0, 0], 1, { seg: 16, rings: 10, scale: [h.rw, h.rh, 0.9] });
      // orientar +z hacia dir
      const up = [0, 1, 0];
      const xAxis = V.norm(V.cross(up, dir)), yAxis = V.cross(dir, xAxis);
      const place = (p) => [0, 1, 2].map((k) => c[k] + dir[k] * (R + 0.2) + xAxis[k] * p[0] + yAxis[k] * p[1] + dir[k] * p[2]);
      const pos = new Float32Array(m.pos.length);
      for (let i = 0; i < m.pos.length; i += 3) { const q = place([m.pos[i], m.pos[i + 1], m.pos[i + 2]]); pos[i] = q[0]; pos[i + 1] = q[1]; pos[i + 2] = q[2]; }
      const nrm = new Float32Array(m.nrm.length);
      for (let i = 0; i < nrm.length; i += 3) { const n = [m.nrm[i], m.nrm[i + 1], m.nrm[i + 2]]; for (let k = 0; k < 3; k++) nrm[i + k] = xAxis[k] * n[0] + yAxis[k] * n[1] + dir[k] * n[2]; }
      out.push({ pos, nrm, idx: m.idx, col: null });
    }
  }
  return out;
}

// ---------- cejas y pestañas ----------
const interp = (arr, t) => { const f = t * (arr.length - 1), i = Math.min(arr.length - 2, Math.floor(f)); return arr[i] + (arr[i + 1] - arr[i]) * (f - i); };
const onSurface = (sdf, pts, dz) => pts.map(([px, py]) => { const q = P(px, py); return [q[0], q[1], surfaceZ(sdf, q[0], q[1]) + dz]; });

export const BROW_COLOR = [27, 17, 12];

export function buildBrows(sdf) {
  const defs = [
    // izquierda (del espectador): del extremo exterior al interior
    { pts: [[417, 202], [428, 194], [441, 188], [456, 184], [471, 183], [485, 186], [497, 192]], h: [5, 11, 15, 16.5, 15.5, 12.5, 9] },
    // derecha: del interior al exterior
    { pts: [[525, 193], [537, 185], [551, 181], [566, 181], [580, 185], [591, 192], [597, 201]], h: [9, 12.5, 15.5, 16.5, 15, 10.5, 5] },
  ];
  return defs.map(({ pts, h }) => {
    const curve = catmullPts(pts);
    const path = onSurface(sdf, curve, -0.2);
    return sweep(path, { rw: (i, t) => interp(h, t) / 2, rt: () => 2.6, up: [0, 1, 0], sides: 10, color: () => rgb(...BROW_COLOR) });
  });
}

export function buildLashes(base) {
  const defs = [
    // izquierdo: del lagrimal al extremo exterior
    { pts: [[490, 219], [487, 212], [479, 207], [468, 204.5], [456, 205], [445, 209], [437, 216], [430, 227]], r: [1.5, 2.1, 2.7, 3.0, 3.3, 3.4, 3.2, 1.2] },
    // derecho: del lagrimal al extremo exterior
    { pts: [[527, 218], [533, 210], [545, 205], [559, 204.5], [572, 208], [582, 216], [587, 224], [590, 231]], r: [1.5, 2.2, 2.8, 3.1, 3.3, 3.4, 3.0, 1.2] },
  ];
  return defs.map(({ pts, r }) => {
    const curve = catmullPts(pts);
    const path = onSurface(base, curve, -0.6);
    return sweep(path, { rw: (i, t) => interp(r, t), rt: (i, t) => interp(r, t) * 0.85, up: [0, 0, 1], sides: 8, color: () => rgb(...BROW_COLOR) });
  });
}

import { catmull } from '../lib/geom.mjs';
function catmullPts(pts) { return catmull(pts, 6); }
