// Cabeza (piel + ojos) en el visor
import { buildSkin, buildEyes, buildHighlights, buildBrows, buildLashes } from '../parts/head.mjs';
import { dumpGLB } from '../lib/debug.mjs';

const SCRATCH = process.env.SCRATCH;
const t0 = Date.now();
const { mesh, eyes, sdf, base } = buildSkin({ cell: Number(process.env.CELL || 2.2) });
console.log('skin', mesh.pos.length / 3, 'v', mesh.idx.length / 3, 't', Date.now() - t0, 'ms');
const eyeMeshes = buildEyes(eyes);
const hl = buildHighlights(eyes);
const brows = [...buildBrows(sdf), ...buildLashes(base)];
const parts = [
  ...brows.map((m, i) => ({ name: 'brow' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, col: m.col, rough: 0.5 })),
  { name: 'skin', pos: mesh.pos, idx: mesh.idx, nrm: mesh.nrm, col: mesh.col, rough: 0.6 },
  ...eyeMeshes.map((m, i) => ({ name: 'eye' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, col: m.col, rough: 0.2 })),
  ...hl.map((m, i) => ({ name: 'hl' + i, pos: m.pos, idx: m.idx, nrm: m.nrm, color: [1, 1, 1], emissive: [1, 1, 1] })),
];
dumpGLB(SCRATCH + '/out/head.glb', parts);
