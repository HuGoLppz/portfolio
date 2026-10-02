// Pelo: casquete liso oscuro + mechones anchos y aplanados con punta, repartidos como tejas.
//  · Frente/lados: corrientes 2D sembradas en la imagen que parten del remolino (raya en x≈545), caen por gravedad
//    y se elevan a la envolvente 3D. No pueden entrar en la cara, la ventana de la frente ni las orejas.
//  · Nuca: meridianos esféricos desde la coronilla que cuelgan hacia el cuello.
import { ellipsoid, polySDF, polygonize } from '../lib/sdf.mjs';
import { sweep, rgb, V, mergeGeo } from '../lib/geom.mjs';
import { P, CX, FEET } from '../lib/space.mjs';
import { surfaceZ } from './head.mjs';

const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// envolvente del pelo = línea central de los mechones (px, py, z)
export const ENV = { c: [506, 165, -25], r: [139, 132, 140] };
const WHORL = [545, 46];
const toPu = (px, py, z) => [px - CX, FEET - py, z];

// zonas libres de pelo (px): cara con la ventana de la frente (el borde del flequillo cae en diagonal) y orejas
const FACE = [[404, 214], [410, 170], [440, 177], [480, 188], [520, 194], [545, 192], [548, 124], [612, 121], [613, 196], [607, 214], [604, 290], [580, 322], [505, 342], [430, 322], [406, 290]];
const EAR_L = [[366, 224], [418, 224], [418, 312], [366, 312]];
const EAR_R = [[596, 224], [648, 224], [648, 314], [596, 314]];
// el casquete se corta un poco por encima: las puntas de los mechones forman el borde irregular
const CAP_CUT = [[404, 214], [410, 156], [440, 152], [480, 160], [520, 164], [546, 164], [549, 124], [612, 121], [613, 180], [607, 214], [604, 290], [580, 322], [505, 342], [430, 322], [406, 290]];
const CAP_R = [128, 120, 128];
const faceSD = polySDF(FACE), earLSD = polySDF(EAR_L), earRSD = polySDF(EAR_R), capCutSD = polySDF(CAP_CUT);
const grad2 = (sd, x, y) => { const e = 0.8; return V.norm([sd(x + e, y) - sd(x - e, y), sd(x, y + e) - sd(x, y - e), 0]); };

// saca (x,y) de las zonas prohibidas (margen < 0 permite entrar un poco)
function pushOut(x, y, margin) {
  for (let it = 0; it < 3; it++) {
    for (const sd of [faceSD, earLSD, earRSD]) {
      const d = sd(x, y);
      if (d < margin) { const g = grad2(sd, x, y); x += g[0] * (margin - d); y += g[1] * (margin - d); }
    }
  }
  return [x, y];
}

function shell(px, py) {
  const dx = (px - ENV.c[0]) / ENV.r[0], dy = (py - ENV.c[1]) / ENV.r[1];
  const dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
  const n = V.norm([dx / ENV.r[0], -dy / ENV.r[1], dz / ENV.r[2]]);
  return { z: ENV.c[2] + ENV.r[2] * dz, n };
}

// perfil de radio: raíz fina, panza, punta afilada
const profile = (t, rmax) => rmax * (t < 0.2 ? 0.7 + 0.3 * (t / 0.2) : t < 0.5 ? 1 : Math.max(0.08, 1 - Math.pow((t - 0.5) / 0.5, 1.35)));

export function buildHair(skin, { seed = 11, cell = 3.6 } = {}) {
  const rand = mulberry32(seed);
  const paths = []; // { pts:[[x,y,z]], r:[], w }
  const [Wx, Wy] = WHORL;

  // dirección del flujo en la imagen: radial desde el remolino + gravedad (+ deriva a la izquierda en el flequillo)
  const flowDir = (x, y) => {
    const rad = V.norm([x - Wx, y - Wy, 0]);
    const gam = clamp(0.22 + 0.0056 * (y - 40), 0.22, 0.93);
    let dx = rad[0] * (1 - gam), dy = Math.max(rad[1] * (1 - gam), -0.2 * (1 - gam)) + gam;
    dx -= 0.42 * smooth(95, 150, y) * smooth(560, 500, x) * smooth(380, 430, x);   // el flequillo barre hacia la izquierda
    return V.norm([dx, dy, 0]);
  };

  const stream = (x0, y0, L, { N = 9, wave = 0, waveF = 1.6, ph = 0, margin = 2, flick = 0, ears = true } = {}) => {
    const pts = [[x0, y0]];
    let [x, y] = [x0, y0];
    const h = L / N;
    for (let k = 1; k <= N; k++) {
      const t = k / N;
      let d = flowDir(x, y);
      const ang = wave * Math.sin(ph + t * Math.PI * 2 * waveF) + (t > 0.7 ? (flick * (t - 0.7)) / 0.3 : 0);
      const cs = Math.cos(ang), sn = Math.sin(ang);
      d = [d[0] * cs - d[1] * sn, d[0] * sn + d[1] * cs];
      let nx = x + d[0] * h, ny = y + d[1] * h;
      // dentro de la silueta de la envolvente
      const ex = (nx - ENV.c[0]) / (ENV.r[0] + 6), ey = (ny - ENV.c[1]) / (ENV.r[1] + 4), ee = ex * ex + ey * ey;
      if (ee > 0.97) { const k2 = Math.sqrt(0.97 / ee); nx = ENV.c[0] + (nx - ENV.c[0]) * k2; ny = ENV.c[1] + (ny - ENV.c[1]) * k2; }
      if (ny > 300) break;
      // al entrar en la cara/orejas el mechón acaba ahí (punta), sin pegarse al borde
      if (Math.min(faceSD(nx, ny), ears ? Math.min(earLSD(nx, ny), earRSD(nx, ny)) : 1e9) < margin) { if (k > 2) break; }
      [x, y] = ears ? pushOut(nx, ny, margin) : [nx, ny];
      pts.push([x, y]);
    }
    return pts;
  };

  const to3D = (pts2, rmax, off) => {
    const n = pts2.length, pts = [], r = [];
    pts2.forEach(([x, y], i) => {
      const t = i / (n - 1);
      const rr = profile(t, rmax);
      const s = shell(x, y);
      let z = s.z + off * (0.4 + 0.9 * t);          // las puntas flotan algo más (efecto teja)
      if (capCutSD(x, y) < 8) {                      // donde no hay casquete, pegado a la piel (flequillo)
        const sz = surfaceZ(skin, x - CX, FEET - y);
        if (!Number.isNaN(sz)) z = Math.min(z, sz + rr * 0.62 + 3);
      }
      pts.push(toPu(x, y, z)); r.push(rr);
    });
    return { pts, r, w: 1.3 };
  };

  // 1. frente, coronilla y laterales: semillas con jitter sobre la silueta del pelo
  const seeds = [];
  for (let gy = 22; gy < 300; gy += 15) for (let gx = 322; gx < 695; gx += 15) {
    const x = gx + (rand() - 0.5) * 14, y = gy + (rand() - 0.5) * 14;
    const e = ((x - 506) / 152) ** 2 + ((y - 165) / 140) ** 2;
    if (e > 1.02) continue;
    if (faceSD(x, y) < 4 || earLSD(x, y) < 6 || earRSD(x, y) < 6) continue;
    seeds.push([x, y]);
  }
  for (let gy = 150; gy < 290; gy += 12) for (let gx = 322; gx < 700; gx += 12) {
    if (gx > 380 && gx < 640) continue;
    const x = gx + (rand() - 0.5) * 10, y = gy + (rand() - 0.5) * 10;
    const e = ((x - 506) / 160) ** 2 + ((y - 190) / 120) ** 2;
    if (e > 1 || earLSD(x, y) < 6 || earRSD(x, y) < 6) continue;
    seeds.push([x, y]);
  }
  for (const [x0, y0] of seeds) {
    const side = x0 < Wx ? -1 : 1;
    const lateral = Math.abs(x0 - 506) / 150;
    const L = lerp(55, 105, rand()) * (1 + 0.5 * lateral) * (y0 > 110 && x0 > 430 && x0 < 560 ? 0.7 : 1);
    const pts = stream(x0, y0, L, { wave: lerp(0.05, 0.3, rand()), waveF: lerp(1, 2.2, rand()), ph: rand() * 6.28, margin: lerp(-8, 2, rand()), flick: y0 > 110 ? side * lerp(0, 0.7, rand()) : 0 });
    paths.push(to3D(pts, lerp(7.5, 11.5, rand()), lerp(2, 9, rand())));
  }

  // 1b. cortina de pelo detrás de las orejas (z por detrás del plano de la oreja)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const x0 = 506 + side * lerp(104, 150, rand()), y0 = lerp(196, 232, rand());
      const L = lerp(70, 105, rand());
      const pts = stream(x0, y0, L, { wave: lerp(0.05, 0.2, rand()), waveF: 1.4, ph: rand() * 6.28, margin: -30, ears: false, flick: side * lerp(0.2, 0.8, rand()) });
      const path = to3D(pts, lerp(8.5, 12, rand()), 0);
      path.pts = path.pts.map((p) => [p[0], p[1], Math.min(p[2], -34 - rand() * 14)]);
      paths.push(path);
    }
  }

  // 2. remates de silueta: mechones finos que salen del contorno hacia fuera y abajo
  for (let i = 0; i < 46; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    const th = lerp(0.95, 1.4, rand());                              // posición angular en el contorno (0 = arriba)
    const x0 = 506 + side * 157 * Math.sin(th) * 0.97, y0 = 165 - 145 * Math.cos(th) * 0.97;
    const out = V.norm([side * 0.5, 0.8, 0]);
    const pts = [[x0, y0]];
    let [x, y] = [x0, y0];
    const L = lerp(20, 42, rand()), N = 5;
    for (let k = 1; k <= N; k++) { const t = k / N; x += ((out[0] * (1 - 0.4 * t) + side * 0.25) * L) / N; y += ((out[1] * (1 - 0.3 * t) + 0.5 * t) * L) / N; [x, y] = pushOut(x, y, 2); pts.push([x, y]); }
    const path = to3D(pts, lerp(3.2, 5.2, rand()), 0);
    path.pts = path.pts.map((p) => [p[0], p[1], Math.min(p[2], 40)]);
    path.w = 1.1;
    paths.push(path);
  }

  // 3. nuca y laterales traseros: meridianos esféricos que cuelgan hacia el cuello
  const H0 = ENV.c;
  for (let i = 0; i < 90; i++) {
    const phi = lerp(75, 285, rand()) * Math.PI / 180;
    const th0 = lerp(15, 80, rand()) * Math.PI / 180;
    const dth = lerp(25, 55, rand()) * Math.PI / 180;
    const rmax = lerp(8.5, 13, rand());
    const yEnd = Math.abs(Math.sin(phi)) > 0.55 ? lerp(240, 296, rand()) : lerp(270, 342, rand());
    const N = 8, pts = [], r = [];
    const wob = lerp(0.03, 0.14, rand()), wf = lerp(1, 2.5, rand()), wp = rand() * 6.28;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const th = th0 + dth * t;
      const ph = phi + wob * Math.sin(wp + t * Math.PI * 2 * wf);
      let px = H0[0] + ENV.r[0] * Math.sin(th) * Math.sin(ph), py = H0[1] - ENV.r[1] * Math.cos(th), z = H0[2] + ENV.r[2] * Math.sin(th) * Math.cos(ph);
      if (th > 1.75) {   // por debajo del ecuador cuelga recto hacia yEnd
        const k2 = clamp((th - 1.75) / 0.7, 0, 1);
        py = Math.max(py, lerp(H0[1] + 18, yEnd, k2));
        px = lerp(px, H0[0] + (px - H0[0]) * 0.82, smooth(250, 340, py));
        z = lerp(z, Math.min(z, -38), smooth(215, 260, py));
      }
      if (py > 215 && py < 316 && Math.abs(px - H0[0]) > 96 && Math.abs(px - H0[0]) < 150) z = Math.min(z, -48);
      pts.push(toPu(px, py, z)); r.push(profile(t, rmax));
    }
    paths.push({ pts, r, w: 1.5 });
  }

  // 4. mechones sueltos que cuelgan al borde de la ventana de la frente
  for (const [x0, y0, L, r] of [[552, 120, 78, 6.2], [558, 116, 56, 5.2], [547, 126, 68, 5.6], [604, 124, 60, 5.4]]) {
    const pts = [[x0, y0]];
    for (let k = 1; k <= 7; k++) pts.push([x0 + (x0 > 580 ? 1 : 1) * k * 0.9 + Math.sin(k * 0.8) * 1.5, y0 + (L * k) / 7]);
    const path = to3D(pts, r, 0);
    path.w = 1.2;
    paths.push(path);
  }

  // --- masa base: casquete liso (relleno oscuro bajo los mechones), sin la cara interior ---
  const Hc = P(506, 165, -25);
  const win = polySDF(CAP_CUT);
  const earL = polySDF(EAR_L), earR = polySDF(EAR_R);
  const DROP = 85, RB = 55;
  const capVol = (x, y, z) => {
    const u = (x - Hc[0]) / CAP_R[0], w = (z - Hc[2]) / CAP_R[2];
    const dy = y - Hc[1];
    const v = dy > 0 ? dy / CAP_R[1] : Math.min(0, dy + DROP) / RB;
    return (Math.sqrt(u * u + v * v + w * w) - 1) * 120;
  };
  const fin = {
    f: (x, y, z) => {
      const px = x + CX, py = FEET - y;
      const h = Math.max(capVol(x, y, z), -Math.max(win(px, py), -z - 15), -Math.max(earL(px, py), -z - 30), -Math.max(earR(px, py), -z - 30), py - 300);
      if (h > 5) return h;
      return Math.max(h, -(skin.f(x, y, z) + 0.6));
    },
  };
  const baseCol = rgb(27, 21, 20);
  let mass = polygonize(fin.f, [-170, P(0, 320)[1], -190], [170, P(0, 10)[1], 175], cell, { color: () => baseCol, project: 1 });
  // fuera los triángulos pegados a la piel (cara interior del casquete)
  const keep = [];
  const nearSkin = (i) => skin.f(mass.pos[i * 3], mass.pos[i * 3 + 1], mass.pos[i * 3 + 2]) < 3.5;
  for (let t = 0; t < mass.idx.length; t += 3) { if (nearSkin(mass.idx[t]) && nearSkin(mass.idx[t + 1]) && nearSkin(mass.idx[t + 2])) continue; keep.push(mass.idx[t], mass.idx[t + 1], mass.idx[t + 2]); }
  mass = { ...mass, idx: Uint32Array.from(keep) };

  // --- mechones: tubos aplanados con punta ---
  const lockGeos = paths.map(({ pts, r, w }) => {
    const nrm = pts.map(([x, y]) => shell(x + CX, FEET - y).n);
    const k = lerp(0.8, 1.22, rand());
    const col = (i, t) => { const b = (0.82 + 0.36 * t) * k; return rgb(clamp(34 * b, 0, 255), clamp(26 * b, 0, 255), clamp(24 * b, 0, 255)); };
    return sweep(pts, { rw: (i) => r[i] * 0.78, rt: (i) => r[i] * w, up: (i) => nrm[i], sides: 8, color: col });
  });
  return { mass, locks: mergeGeo(lockGeos), count: paths.length };
}
