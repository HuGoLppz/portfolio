// Contorno de la cara (piel) por filas: referencia (por color) vs piel generada. Para ajustar mandíbula y mejillas.
import { readPNG } from '../lib/png.mjs';
import { silhouette, IW, IH } from '../lib/raster.mjs';
import { buildSkin } from '../parts/head.mjs';
import { ROOT } from '../parts/body.mjs';
import { CX, FEET } from '../lib/space.mjs';

const im = readPNG(ROOT + 'src/assets/character.png');
const isSkin = (x, y) => {
  const o = (y * IW + x) * 4; const r = im.data[o], g = im.data[o + 1], b = im.data[o + 2];
  return im.data[o + 3] > 200 && r > 120 && r > g * 1.12 && g > b * 1.05 && r - b > 45;
};
const { mesh } = buildSkin({ cell: 3 });
const n = mesh.pos.length / 3, pxy = new Float32Array(n * 2);
for (let i = 0; i < n; i++) { pxy[i * 2] = mesh.pos[i * 3] + CX; pxy[i * 2 + 1] = FEET - mesh.pos[i * 3 + 1]; }
const mine = silhouette(pxy, mesh.idx);
const run = (test, y, x0) => { if (!test(x0, y)) return null; let l = x0, r = x0; while (l > 0 && test(l - 1, y)) l--; while (r < IW - 1 && test(r + 1, y)) r++; return [l, r]; };
console.log('y    ref(face run)   mine(face run)');
for (let y = 200; y <= 345; y += 10) {
  const a = run(isSkin, y, 506), b = run((x, yy) => mine[yy * IW + x] === 1, y, 506);
  console.log(String(y).padEnd(4), a ? a.join('-').padEnd(10) + ' w' + (a[1] - a[0]) : 'none'.padEnd(14), '   ', b ? b.join('-').padEnd(10) + ' w' + (b[1] - b[0]) : 'none');
}
