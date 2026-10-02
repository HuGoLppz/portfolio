// Comprueba la orientación (hacia fuera) de las mallas cerradas generadas: volumen con signo > 0 = caras hacia fuera
import { uvSphere, sweep } from '../lib/geom.mjs';

const volume = (m) => {
  let v = 0;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3, b = m.idx[t + 1] * 3, c = m.idx[t + 2] * 3;
    const p = m.pos;
    v += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
  }
  return v;
};
console.log('uvSphere', volume(uvSphere([0, 0, 0], 10, { seg: 24, rings: 16 })).toFixed(1), '(esperado > 0 ≈ 4189)');
const pts = [0, 1, 2, 3, 4, 5].map((i) => [i * 10, 0, 0]);
const tube = sweep(pts, { rw: () => 3, rt: () => 3, up: [0, 0, 1], sides: 8 });
console.log('sweep', volume(tube).toFixed(1), '(esperado > 0 ≈ 1400)');
