// Vuelca las piezas del cuerpo, coloreadas por región, al visor
import { buildBody } from '../parts/body.mjs';
import { dumpGLB } from '../lib/debug.mjs';

const SCRATCH = process.env.SCRATCH;
const parts = buildBody();
const colors = {
  hoodie: [0.18, 0.18, 0.2], jeans: [0.22, 0.38, 0.7], headOld: [0.9, 0.2, 0.2], neckOld: [0.95, 0.7, 0.2], shoeOld: [0.2, 0.8, 0.3],
};
const list = Object.entries(parts).map(([name, m]) => ({ name, pos: m.pos, idx: m.idx, nrm: m.attrs.nrm.data, color: colors[name] || [0.7, 0.7, 0.7], rough: 0.8 }));
dumpGLB(SCRATCH + '/out/body_parts.glb', list);
for (const [k, m] of Object.entries(parts)) console.log(k, m.pos.length / 3, 'v', m.idx.length / 3, 't');
