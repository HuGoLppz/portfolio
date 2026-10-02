// Ensamblado provisional (con colores de depuración) para revisar en el visor
import { buildBody } from '../parts/body.mjs';
import { buildSkin, buildEyes, buildHighlights, buildBrows, buildLashes } from '../parts/head.mjs';
import { buildHair } from '../parts/hair.mjs';
import { buildShoe, placeMesh, SHOE_PLACEMENT } from '../parts/shoes.mjs';
import { mergeGeo, rgb } from '../lib/geom.mjs';
import { dumpGLB } from '../lib/debug.mjs';
import { refMask, silhouette, compare, IW, IH } from '../lib/raster.mjs';
import { CX, FEET } from '../lib/space.mjs';
import { ROOT } from '../parts/body.mjs';

const SCRATCH = process.env.SCRATCH;
const only = (process.env.ONLY || '').split(',').filter(Boolean);
const want = (k) => !only.length || only.includes(k);
const parts = [];
const t0 = Date.now();
const lap = (s) => console.log(s, Date.now() - t0, 'ms');

if (want('body')) {
  const b = buildBody();
  parts.push({ name: 'hoodie', pos: b.hoodie.pos, idx: b.hoodie.idx, nrm: b.hoodie.attrs.nrm.data, color: [0.06, 0.06, 0.07], rough: 0.9 });
  parts.push({ name: 'jeans', pos: b.jeans.pos, idx: b.jeans.idx, nrm: b.jeans.attrs.nrm.data, color: [0.1, 0.18, 0.35], rough: 0.85 });
  lap('body');
}
let head = null;
if (want('head') || want('hair')) { head = buildSkin({ cell: Number(process.env.CELL || 2.6) }); lap('skin'); }
if (want('head')) {
  const m = head.mesh;
  parts.push({ name: 'skin', pos: m.pos, idx: m.idx, nrm: m.nrm, col: m.col, rough: 0.6 });
  buildEyes(head.eyes).forEach((e, i) => parts.push({ name: 'eye' + i, pos: e.pos, idx: e.idx, nrm: e.nrm, col: e.col, rough: 0.2 }));
  buildHighlights(head.eyes).forEach((e, i) => parts.push({ name: 'hl' + i, pos: e.pos, idx: e.idx, nrm: e.nrm, color: [1, 1, 1], emissive: [1, 1, 1] }));
  [...buildBrows(head.sdf), ...buildLashes(head.base)].forEach((e, i) => parts.push({ name: 'brow' + i, pos: e.pos, idx: e.idx, nrm: e.nrm, col: e.col, rough: 0.5 }));
}
if (want('hair')) {
  const { mass, locks, count } = buildHair(head.sdf, { cell: Number(process.env.HCELL || 3.6) });
  console.log('hair mass tris', mass.idx.length / 3, 'locks', count, 'tris', locks.idx.length / 3);
  parts.push({ name: 'hairmass', pos: mass.pos, idx: mass.idx, nrm: mass.nrm, col: mass.col, rough: 0.6 });
  parts.push({ name: 'hair', pos: locks.pos, idx: locks.idx, nrm: locks.nrm, col: locks.col, rough: 0.5 });
  lap('hair');
}
if (want('shoes')) {
  const sh = buildShoe({ cell: Number(process.env.SCELL || 2.4) });
  SHOE_PLACEMENT.forEach((pl, i) => {
    for (const [k, m, rough] of [['upper', sh.upperMesh, 0.95], ['sole', sh.soleMesh, 0.6], ['laces', sh.laces, 0.7], ['logo', sh.logo, 0.8]]) {
      const w = placeMesh(m, pl);
      parts.push({ name: 'shoe_' + k + i, pos: w.pos, idx: w.idx, nrm: w.nrm, col: w.col, rough });
    }
  });
  console.log('shoe tris (one)', (sh.soleMesh.idx.length + sh.upperMesh.idx.length + sh.laces.idx.length) / 3);
  lap('shoes');
}
dumpGLB(SCRATCH + '/out/all.glb', parts);

// silueta frontal de todo lo generado frente a la máscara alpha de la referencia
const { mask: ref } = refMask(ROOT + 'src/assets/character.png');
const mine = new Uint8Array(IW * IH);
for (const p of parts) {
  if (p.name.startsWith('hl')) continue;
  const n = p.pos.length / 3, pxy = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { pxy[i * 2] = p.pos[i * 3] + CX; pxy[i * 2 + 1] = FEET - p.pos[i * 3 + 1]; }
  silhouette(pxy, p.idx, mine);
}
const rowsOnly = (m, y0, y1) => { const o = new Uint8Array(m.length); for (let y = y0; y < y1; y++) for (let x = 0; x < IW; x++) o[y * IW + x] = m[y * IW + x]; return o; };
console.log('IoU total', compare(ref, mine, SCRATCH + '/out/sil_all.png').toFixed(4));
console.log('IoU head rows 0-345', compare(rowsOnly(ref, 0, 345), rowsOnly(mine, 0, 345), SCRATCH + '/out/sil_head.png').toFixed(4));
