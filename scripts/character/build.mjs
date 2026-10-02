// Genera src/assets/character.glb: personaje 3D fiel a src/assets/character.png
//   node build.mjs            → escribe src/assets/character.glb
//   SCRATCH=<dir> node build.mjs   → además copia el GLB a <dir>/out/character.glb (para el visor de depuración)
import fs from 'fs';
import { GLBWriter } from './lib/glb.mjs';
import { computeNormals, merge, subset } from './lib/mesh.mjs';
import { decimate } from './lib/decimate.mjs';
import { mergeGeo, sweep, rgb } from './lib/geom.mjs';
import { smoothstep } from './lib/util.mjs';
import { CX, FEET, S } from './lib/space.mjs';
import { buildBody, ROOT } from './parts/body.mjs';
import { buildSkin, buildEyes, buildHighlights, buildBrows, buildLashes } from './parts/head.mjs';
import { buildHair } from './parts/hair.mjs';
import { buildShoe, placeMesh, SHOE_PLACEMENT } from './parts/shoes.mjs';
import { MATERIALS } from './materials.mjs';

const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

// pivotes del esqueleto (py de la imagen): base del cuello y base del cráneo
const NECK_PY = 400, HEAD_PY = 300;

const parts = []; // { name, material, mesh:{pos,idx,nrm?,col?,uv?}, rig:'root'|'head'|'neck' }
const add = (name, material, mesh, rig = 'root') => parts.push({ name, material, mesh, rig });

// ---------------- cuerpo ----------------
const body = buildBody();
add('hoodie', 'hoodie', { pos: body.hoodie.pos, idx: body.hoodie.idx, nrm: body.hoodie.attrs.nrm.data });
add('jeans', 'jeans', { pos: body.jeans.pos, idx: body.jeans.idx, nrm: body.jeans.attrs.nrm.data });
log('cuerpo', body.hoodie.idx.length / 3, body.jeans.idx.length / 3);

// cordones: remates de plástico negro brillante
{
  const tips = [{ x: 456 - CX, z: 80 }, { x: 548 - CX, z: 80 }];
  const geos = tips.map(({ x, z }) => {
    const y0 = FEET - 556, y1 = FEET - 583;
    const pts = [0, 0.12, 0.5, 0.88, 1].map((t) => [x, y0 + (y1 - y0) * t, z]);
    const r = [3.6, 5.1, 5.3, 5.1, 3.2];
    return sweep(pts, { rw: (i) => r[i], rt: (i) => r[i], up: [0, 0, 1], sides: 12 });
  });
  const m = mergeGeo(geos);
  add('aglets', 'aglet', m);
}

// ---------------- cabeza ----------------
const head = buildSkin({ cell: 2.2 });
log('piel SDF', head.mesh.idx.length / 3);
{
  // el cuello se corta por debajo del escote (queda oculto dentro de la sudadera)
  const m0 = head.mesh;
  const sk = subset({ pos: m0.pos, idx: m0.idx, attrs: { col: { stride: 3, data: m0.col } } }, (t) => {
    for (let k = 0; k < 3; k++) if (FEET - m0.pos[m0.idx[t * 3 + k] * 3 + 1] > 438) return false;
    return true;
  });
  const d = decimate({ pos: sk.pos, idx: sk.idx, col: sk.attrs.col.data }, { target: 26000, colorWeight: 400 });
  add('skin', 'skin', { pos: d.pos, idx: d.idx, nrm: computeNormals(d.pos, d.idx), col: d.col }, 'neck');
  log('piel', d.idx.length / 3);
}
{
  const eyes = buildEyes(head.eyes);
  add('eyes', 'eyes', mergeGeo(eyes), 'head');
  add('eye_highlights', 'eyeHL', mergeGeo(buildHighlights(head.eyes)), 'head');
  add('brows', 'brows', mergeGeo([...buildBrows(head.sdf), ...buildLashes(head.base)]), 'head');
}

// ---------------- pelo ----------------
{
  const { mass, locks } = buildHair(head.sdf, { cell: 3.6 });
  const dm = decimate({ pos: mass.pos, idx: mass.idx, col: mass.col }, { target: 12000, colorWeight: 0 });
  const hair = mergeGeo([{ pos: dm.pos, idx: dm.idx, col: dm.col, nrm: computeNormals(dm.pos, dm.idx) }, locks]);
  add('hair', 'hair', hair, 'head');
  log('pelo', hair.idx.length / 3);
}

// ---------------- zapatillas ----------------
{
  const sh = buildShoe({ cell: 2.6 });
  const dec = (m, target, cw) => { const d = decimate({ pos: m.pos, idx: m.idx, col: m.col }, { target, colorWeight: cw }); return { pos: d.pos, idx: d.idx, col: d.col, nrm: computeNormals(d.pos, d.idx) }; };
  const up = dec(sh.upperMesh, 9000, 300), so = dec(sh.soleMesh, 5000, 300);
  const groups = { upper: [], sole: [], laces: [], logo: [] };
  SHOE_PLACEMENT.forEach((pl) => {
    groups.upper.push(placeMesh(up, pl)); groups.sole.push(placeMesh(so, pl));
    groups.laces.push(placeMesh(sh.laces, pl)); groups.logo.push(placeMesh(sh.logo, pl));
  });
  add('shoes_upper', 'shoeUpper', mergeGeo(groups.upper));
  add('shoes_sole', 'shoeSole', mergeGeo(groups.sole));
  add('shoes_laces', 'laces', mergeGeo(groups.laces));
  add('shoes_logo', 'logo', mergeGeo(groups.logo));
  log('zapatillas');
}

// ---------------- esqueleto, centrado y exportación ----------------
// centrado en x/z por la caja de todo el modelo; y=0 en la suela
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
for (const p of parts) for (let i = 0; i < p.mesh.pos.length; i += 3) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], p.mesh.pos[i + c]); mx[c] = Math.max(mx[c], p.mesh.pos[i + c]); }
const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, y0 = mn[1];
log('caja pu', mn.map((v) => v.toFixed(0)), mx.map((v) => v.toFixed(0)));
const toWorld = (p) => { const o = new Float32Array(p.length); for (let i = 0; i < p.length; i += 3) { o[i] = (p[i] - cx) / S; o[i + 1] = (p[i + 1] - y0) / S; o[i + 2] = (p[i + 2] - cz) / S; } return o; };

const yNeck = (FEET - NECK_PY - y0) / S, yHead = (FEET - HEAD_PY - y0) / S;
const w = new GLBWriter();
const matIdx = {};
for (const [k, m] of Object.entries(MATERIALS)) matIdx[k] = w.addMaterial(m(w));

// nodos: 0 Root > 1 Neck > 2 Head ; luego mallas
w.nodes.push({ name: 'Root', children: [1] }, { name: 'Neck', translation: [0, yNeck, 0], children: [2] }, { name: 'Head', translation: [0, yHead - yNeck, 0] });
const ibm = new Float32Array(16 * 3);
[[0, 0, 0], [0, yNeck, 0], [0, yHead, 0]].forEach(([tx, ty, tz], j) => { const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -tx, -ty, -tz, 1]; ibm.set(m, j * 16); });
const ibmAcc = w.addAccessor(ibm, 'MAT4');
w.skins.push({ inverseBindMatrices: ibmAcc, joints: [0, 1, 2], skeleton: 0 });

const sceneNodes = [0];
let totalTris = 0, totalVerts = 0;
for (const p of parts) {
  const m = p.mesh;
  const pos = toWorld(m.pos);
  const nrm = m.nrm ? Float32Array.from(m.nrm) : computeNormals(pos, m.idx);
  for (let i = 0; i < nrm.length; i += 3) { const l = Math.hypot(nrm[i], nrm[i + 1], nrm[i + 2]) || 1; nrm[i] /= l; nrm[i + 1] /= l; nrm[i + 2] /= l; }
  const n = pos.length / 3;
  const joints = new Uint8Array(n * 4), weights = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const py = FEET - m.pos[i * 3 + 1];
    let wr = 1, wn = 0, wh = 0;
    if (p.rig === 'head') { wr = 0; wh = 1; }
    else if (p.rig === 'neck') {
      const s = 1 - smoothstep(360, 405, py);        // cuerpo → cuello
      const t = 1 - smoothstep(300, 345, py);        // cuello → cabeza
      wr = 1 - s; wn = s * (1 - t); wh = s * t;
    }
    joints[i * 4] = 0; joints[i * 4 + 1] = 1; joints[i * 4 + 2] = 2; joints[i * 4 + 3] = 0;
    weights[i * 4] = wr; weights[i * 4 + 1] = wn; weights[i * 4 + 2] = wh; weights[i * 4 + 3] = 0;
  }
  const attributes = { POSITION: pos, NORMAL: nrm, JOINTS_0: joints, WEIGHTS_0: weights };
  if (m.col) attributes.COLOR_0 = m.col;
  if (m.uv) attributes.TEXCOORD_0 = m.uv;
  const idx = n > 65535 ? Uint32Array.from(m.idx) : Uint16Array.from(m.idx);
  const mesh = w.addMesh(p.name, { attributes, indices: idx, material: matIdx[p.material] });
  w.nodes.push({ name: p.name, mesh, skin: 0 });
  sceneNodes.push(w.nodes.length - 1);
  totalTris += m.idx.length / 3; totalVerts += n;
  log(p.name.padEnd(16), String(n).padStart(7), 'v', String(m.idx.length / 3).padStart(7), 't');
}
const bin = w.build({ scene: 0, scenes: [{ nodes: sceneNodes }], extensionsUsed: ['KHR_materials_clearcoat', 'KHR_materials_sheen'], extras: { source: 'scripts/character', height: (mx[1] - y0) / S } });
const out = ROOT + 'src/assets/character.glb';
fs.writeFileSync(out, bin);
if (process.env.SCRATCH) fs.writeFileSync(process.env.SCRATCH + '/out/character.glb', bin);
log('OK', (bin.length / 1024 / 1024).toFixed(2), 'MB', totalVerts, 'v', totalTris, 't →', out);
