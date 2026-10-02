// Localiza el extremo de los cordones de la sudadera (zona delantera, a ambos lados del eje)
import { buildBody } from '../parts/body.mjs';
import { CX, FEET } from '../lib/space.mjs';

const b = buildBody();
const m = b.hoodie;
const n = m.pos.length / 3;
for (const [label, x0, x1] of [['izq', -75, -25], ['der', 20, 70]]) {
  console.log(label);
  for (let y = 400; y < 640; y += 15) {
    let zmax = -1e9, xs = [], cnt = 0;
    for (let i = 0; i < n; i++) {
      const px = m.pos[i * 3], py = FEET - m.pos[i * 3 + 1], z = m.pos[i * 3 + 2];
      if (px < x0 || px > x1 || py < y || py >= y + 15) continue;
      if (z > zmax) zmax = z;
      cnt++;
    }
    // vértices muy adelantados respecto al plano del pecho = cordón
    const front = [];
    for (let i = 0; i < n; i++) {
      const px = m.pos[i * 3], py = FEET - m.pos[i * 3 + 1], z = m.pos[i * 3 + 2];
      if (px < x0 || px > x1 || py < y || py >= y + 15 || z < zmax - 8) continue;
      front.push([px, z]);
    }
    const mx = front.reduce((s, p) => s + p[0], 0) / (front.length || 1);
    console.log(' py', y, 'n', cnt, 'zmax', zmax.toFixed(0), 'x(front mean)', mx.toFixed(0), '→ px', (mx + CX).toFixed(0));
  }
}
