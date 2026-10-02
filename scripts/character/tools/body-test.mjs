// Prueba del ajuste de silueta del cuerpo contra la máscara alpha de character.png
import { loadSource, toPu, silhouetteOf, buildRowFit, ROOT } from '../parts/body.mjs';
import { refMask, compare, rowExtents, IW, IH, silhouette } from '../lib/raster.mjs';
import { CX, FEET } from '../lib/space.mjs';

const SCRATCH = process.env.SCRATCH;
const { mask } = refMask(ROOT + 'src/assets/character.png');
const m = loadSource();
const pos = toPu(m);
const before = silhouetteOf(pos, m.idx);
console.log('IoU before', compare(mask, before, SCRATCH + '/out/body_before.png'));
const fit = buildRowFit(before, mask, { y0: 335, y1: 1400, smooth: 3 });
const n = pos.length / 3;
for (let i = 0; i < n; i++) {
  const px = pos[i * 3] + CX, py = FEET - pos[i * 3 + 1];
  const [x, zs] = fit(px, py);
  pos[i * 3] = x - CX; pos[i * 3 + 2] *= zs;
}
const after = silhouetteOf(pos, m.idx);
console.log('IoU after', compare(mask, after, SCRATCH + '/out/body_after.png'));
for (const y of [340, 400, 500, 650, 800, 880, 1000, 1100, 1200, 1300, 1400]) console.log(y, 'ref', rowExtents(mask, y).join('-'), 'mesh', rowExtents(after, y).join('-'));
