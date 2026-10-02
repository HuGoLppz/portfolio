// z frontal máximo del puño + pie original por columnas de x y filas de y (para localizar el pliegue puño/zapatilla)
import { buildBody } from '../parts/body.mjs';
import { CX, FEET } from '../lib/space.mjs';
import { merge } from '../lib/mesh.mjs';

const side = process.argv[2] || 'L';
const b = buildBody({ shoeCutPy: 1395 });
const m = merge([b.jeans, b.shoeOld]);
const n = m.pos.length / 3;
const xb = side === 'L' ? [-250, -230, -210, -190, -170, -150, -130, -110, -90, -70, -50, -30] : [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240];
console.log('py   ' + xb.map((x) => String(x + CX).padStart(5)).join(''));
for (let y = 1320; y < 1523; y += 8) {
  let row = String(y).padStart(5) + ' ';
  for (const x of xb) {
    let zm = -1e9;
    for (let i = 0; i < n; i++) {
      const px = m.pos[i * 3], py = FEET - m.pos[i * 3 + 1];
      if (px < x || px >= x + 20 || py < y || py >= y + 8) continue;
      zm = Math.max(zm, m.pos[i * 3 + 2]);
    }
    row += zm < -1e8 ? '    .' : String(zm.toFixed(0)).padStart(5);
  }
  console.log(row);
}
