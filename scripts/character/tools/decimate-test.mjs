// Prueba del decimador sobre la piel de la cabeza
import { buildSkin, buildEyes, buildHighlights, buildBrows, buildLashes } from '../parts/head.mjs';
import { decimate } from '../lib/decimate.mjs';
import { computeNormals } from '../lib/mesh.mjs';
import { dumpGLB } from '../lib/debug.mjs';

const SCRATCH = process.env.SCRATCH;
const t0 = Date.now();
const { mesh, eyes, sdf, base } = buildSkin({ cell: 2.2 });
console.log('skin', mesh.idx.length / 3, 'tris', Date.now() - t0, 'ms');
const t1 = Date.now();
const target = Number(process.env.TARGET || 40000);
const d = decimate(mesh, { target, colorWeight: Number(process.env.CW || 400), boundaryWeight: 50 });
console.log('decimated', d.idx.length / 3, 'tris', Date.now() - t1, 'ms');
const nrm = computeNormals(d.pos, d.idx);
const brows = [...buildBrows(sdf), ...buildLashes(base)];
const parts = [
  ...brows.map((m, i) => ({ name: 'brow' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, col: m.col, rough: 0.5 })),
  { name: 'skin', pos: d.pos, idx: d.idx, nrm, col: d.col, rough: 0.6 },
  ...buildEyes(eyes).map((m, i) => ({ name: 'eye' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, col: m.col, rough: 0.2 })),
  ...buildHighlights(eyes).map((m, i) => ({ name: 'hl' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, color: [1, 1, 1], emissive: [1, 1, 1] })),
];
dumpGLB(SCRATCH + '/out/head_dec.glb', parts);
