// Cuerpo (sudadera + vaqueros) a partir de white_mesh.glb:
//  1. limpia triángulos-fibra y restos
//  2. pasa a unidades de píxel de character.png
//  3. corrige proporciones: estiramiento vertical de los pies + ajuste fila a fila de la silueta a la máscara alpha
//  4. separa en piezas (sudadera, vaqueros, …) con cortes exactos por campos escalares
import { readGLB } from '../lib/glb.mjs';
import { components, subset, computeNormals, split, adjacency, taubin } from '../lib/mesh.mjs';
import { polySDF } from '../lib/sdf.mjs';
import { legacyToPx, SCL, CX, FEET, P } from '../lib/space.mjs';
import { IW, IH, silhouette, refMask } from '../lib/raster.mjs';

export const ROOT = new URL('../../../', import.meta.url).pathname.replace(/^\//, '');

export function loadSource() {
  const g = readGLB(ROOT + 'src/assets/white_mesh.glb');
  const idx = g.accessor(0), pos = g.accessor(1);
  // fuera triángulos con aristas largas (la "fibra" que va de la cabeza a los pies)
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const d = (p, q) => Math.hypot(pos[p * 3] - pos[q * 3], pos[p * 3 + 1] - pos[q * 3 + 1], pos[p * 3 + 2] - pos[q * 3 + 2]);
    if (d(a, b) > 0.15 || d(b, c) > 0.15 || d(a, c) > 0.15) continue;
    keep.push(a, b, c);
  }
  let m = { pos: Float32Array.from(pos), idx: Uint32Array.from(keep), attrs: {} };
  const label = components(m.idx, pos.length / 3);
  const count = new Map();
  for (let t = 0; t < m.idx.length; t += 3) count.set(label[m.idx[t]], (count.get(label[m.idx[t]]) || 0) + 1);
  return subset(m, (t) => count.get(label[m.idx[t * 3]]) >= 300);
}

// Los pies de la referencia llegan a la fila 1523 y los de la malla a 1499: se estira la zona baja.
const FOOT_FROM = 1330;
const FOOT_SRC_END = 1499;
export const vwarp = (py) => (py <= FOOT_FROM ? py : FOOT_FROM + ((py - FOOT_FROM) * (FEET - FOOT_FROM)) / (FOOT_SRC_END - FOOT_FROM));

export function toPu(m) {
  const n = m.pos.length / 3;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const [px, py] = legacyToPx(m.pos[i * 3], m.pos[i * 3 + 1]);
    const [x, y, z] = P(px, vwarp(py), m.pos[i * 3 + 2] * SCL);
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return out;
}

export function silhouetteOf(pos, idx) {
  const n = pos.length / 3;
  const pxy = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { pxy[i * 2] = pos[i * 3] + CX; pxy[i * 2 + 1] = FEET - pos[i * 3 + 1]; }
  return silhouette(pxy, idx);
}

// runs de píxeles activos en una fila de una máscara (huecos <= gapMin se funden)
function rowRuns(mask, y, gapMin = 5) {
  const runs = [];
  let start = -1;
  for (let x = 0; x <= IW; x++) {
    const v = x < IW ? mask[y * IW + x] : 0;
    if (v && start < 0) start = x;
    if (!v && start >= 0) { runs.push([start, x - 1]); start = -1; }
  }
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && r[0] - last[1] <= gapMin) last[1] = r[1]; else merged.push([...r]);
  }
  return merged;
}

const smoothArr = (a, r) => a.map((_, i) => { let s = 0, k = 0; for (let j = Math.max(0, i - r); j <= Math.min(a.length - 1, i + r); j++) if (!Number.isNaN(a[j])) { s += a[j]; k++; } return k ? s / k : NaN; });

// Mapa de ajuste fila a fila: puntos de control [izq, (hueco izq, hueco der), der] de malla → referencia.
// Devuelve (px, py) → [px', escalaZ]
export function buildRowFit(meshMask, ref, { y0, y1, smooth = 3, gapFrom = 960 }) {
  const L = { m: [], r: [] }, R = { m: [], r: [] }, GL = { m: [], r: [] }, GR = { m: [], r: [] };
  for (let y = 0; y < IH; y++) {
    for (const [key, mask] of [['m', meshMask], ['r', ref]]) {
      const runs = y >= y0 - 5 && y <= y1 + 5 ? rowRuns(mask, y) : [];
      const big = runs.filter((r) => r[1] - r[0] > 12);
      if (!big.length) { L[key][y] = R[key][y] = GL[key][y] = GR[key][y] = NaN; continue; }
      L[key][y] = big[0][0]; R[key][y] = big[big.length - 1][1];
      if (y >= gapFrom && big.length === 2) { GL[key][y] = big[0][1] + 1; GR[key][y] = big[1][0] - 1; } else { GL[key][y] = GR[key][y] = NaN; }
    }
  }
  // un hueco central solo se usa si existe en ambas siluetas
  for (let y = 0; y < IH; y++) {
    if (Number.isNaN(GL.m[y]) !== Number.isNaN(GL.r[y])) { GL.m[y] = GR.m[y] = GL.r[y] = GR.r[y] = NaN; }
  }
  for (const o of [L, R, GL, GR]) { o.m = smoothArr(o.m, smooth); o.r = smoothArr(o.r, smooth); }
  return (px, py) => {
    const y = Math.min(IH - 1, Math.max(0, Math.round(py)));
    const yc = Math.min(y1, Math.max(y0, y));
    const l0 = L.m[yc], r0 = R.m[yc], l1 = L.r[yc], r1 = R.r[yc];
    if (Number.isNaN(l0) || Number.isNaN(l1)) return [px, 1];
    const gl0 = GL.m[yc], gr0 = GR.m[yc], gl1 = GL.r[yc], gr1 = GR.r[yc];
    const src = [l0], dst = [l1];
    if (!Number.isNaN(gl0)) { src.push(gl0, gr0); dst.push(gl1, gr1); }
    src.push(r0); dst.push(r1);
    let x;
    if (px <= src[0]) x = dst[0] + (px - src[0]);
    else if (px >= src[src.length - 1]) x = dst[dst.length - 1] + (px - src[src.length - 1]);
    else {
      let i = 0;
      while (px > src[i + 1]) i++;
      x = dst[i] + ((dst[i + 1] - dst[i]) * (px - src[i])) / Math.max(1e-6, src[i + 1] - src[i]);
    }
    return [x, Math.min(1.1, Math.max(0.8, (r1 - l1) / Math.max(1, r0 - l0)))];
  };
}

// ---------------- cortes ----------------
export const HEAD_CUT_PY = 337;                // por encima: cabeza/pelo (se reconstruye)
export const HEM_PY = 887;                     // borde inferior de la sudadera
// polígono (px, py) del cuello + escote en V de la referencia: se retira para sustituirlo por el cuello nuevo
export const NECK_POLY = [[447, 300], [449, 372], [451, 378], [491, 406], [518, 407], [552, 379], [553, 372], [555, 300]];
const neckPoly = polySDF(NECK_POLY);
// zona (px, solo la mitad delantera del puño) donde asoma la zapatilla: lengüeta, cordones y empeine
export const CUFF_CUT_L = [[235, 1388], [268, 1390], [300, 1397], [322, 1396], [326, 1360], [333, 1332], [348, 1318], [372, 1318], [388, 1336], [396, 1372], [404, 1398], [432, 1432], [452, 1470], [460, 1535], [232, 1535]];
export const CUFF_CUT_R = [[796, 1380], [765, 1385], [735, 1395], [718, 1392], [712, 1362], [705, 1335], [692, 1322], [672, 1322], [656, 1340], [648, 1372], [640, 1398], [612, 1430], [592, 1462], [584, 1535], [800, 1535]];
const cuffL = polySDF(CUFF_CUT_L), cuffR = polySDF(CUFF_CUT_R);
export const LEG_Z = -22;                       // plano medio en z de las piernas

export function buildBody(opts = {}) {
  const ref = refMask(ROOT + 'src/assets/character.png').mask;
  const src = loadSource();
  const pos = toPu(src);
  const fit = buildRowFit(silhouetteOf(pos, src.idx), ref, { y0: 335, y1: 1400, smooth: 3 });
  const n = pos.length / 3;
  for (let i = 0; i < n; i++) {
    const [x, zs] = fit(pos[i * 3] + CX, FEET - pos[i * 3 + 1]);
    pos[i * 3] = x - CX; pos[i * 3 + 2] *= zs;
  }
  let m = { pos, idx: src.idx, attrs: {} };
  m.attrs.nrm = { stride: 3, data: computeNormals(pos, src.idx) };

  const px = (p, i) => p[i * 3] + CX, py = (p, i) => FEET - p[i * 3 + 1];
  const field = (mesh, fn) => { const v = new Float32Array(mesh.pos.length / 3); for (let i = 0; i < v.length; i++) v[i] = fn(px(mesh.pos, i), py(mesh.pos, i), mesh.pos[i * 3 + 2]); return v; };

  const parts = {};
  // 1. cabeza
  let s = split(m, field(m, (x, y) => HEAD_CUT_PY - y));
  parts.headOld = s.pos; m = s.neg;
  // 2. cuello + escote
  const NECK_Z = [-105, 75];
  s = split(m, field(m, (x, y, z) => Math.max(neckPoly(x, y), NECK_Z[0] - z, z - NECK_Z[1])));
  parts.neckOld = s.neg; m = s.pos;
  // 3. dobladillo: sudadera / vaqueros
  s = split(m, field(m, (x, y) => y - HEM_PY));
  parts.hoodie = s.neg; parts.jeansAll = s.pos;
  // 4. pies de la malla original: se retiran por completo; en la mitad delantera del puño se abre el arco de la zapatilla
  const cutField = (x, y, z) => Math.min(
    Math.max(cuffL(x, y), LEG_Z - z), Math.max(cuffR(x, y), LEG_Z - z), (opts.shoeCutPy ?? 1472) - y,
  );
  s = split(parts.jeansAll, field(parts.jeansAll, (x, y, z) => -cutField(x, y, z)));
  parts.jeans = s.neg; parts.shoeOld = s.pos;
  delete parts.jeansAll;
  return parts;
}
