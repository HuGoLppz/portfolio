// Sondeo numérico de la malla de cuerpo ajustada (cortes de cuello, dobladillo, bajos)
import { loadSource, toPu, silhouetteOf, buildRowFit, ROOT } from '../parts/body.mjs';
import { refMask } from '../lib/raster.mjs';
import { CX, FEET } from '../lib/space.mjs';

const { mask } = refMask(ROOT + 'src/assets/character.png');
const m = loadSource();
const pos = toPu(m);
const fit = buildRowFit(silhouetteOf(pos, m.idx), mask, { y0: 335, y1: 1400, smooth: 3 });
const n = pos.length / 3;
for (let i = 0; i < n; i++) { const [x, zs] = fit(pos[i * 3] + CX, FEET - pos[i * 3 + 1]); pos[i * 3] = x - CX; pos[i * 3 + 2] *= zs; }
const py = (i) => FEET - pos[i * 3 + 1];

// z extents per 10px row for a window of x
const probe = (label, y0, y1, xmin, xmax) => {
  console.log(label);
  for (let y = y0; y <= y1; y += 10) {
    let zmin = 1e9, zmax = -1e9, cnt = 0, xs = [1e9, -1e9];
    for (let i = 0; i < n; i++) {
      const p = py(i), x = pos[i * 3];
      if (p < y || p >= y + 10 || x < xmin || x > xmax) continue;
      zmin = Math.min(zmin, pos[i * 3 + 2]); zmax = Math.max(zmax, pos[i * 3 + 2]); xs[0] = Math.min(xs[0], x); xs[1] = Math.max(xs[1], x); cnt++;
    }
    console.log(' py', y, 'n', cnt, 'z', zmin.toFixed(0), zmax.toFixed(0), 'x', xs[0].toFixed(0), xs[1].toFixed(0));
  }
};
probe('central column |x|<45', 250, 450, -45, 45);
probe('head rows, all x', 150, 340, -400, 400);
