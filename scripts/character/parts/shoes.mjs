// Zapatillas tipo Jordan 4 (ante marrón, paneles negros, suela crema con ventana de aire), esculpidas con SDF.
// Se modelan en un marco local (u adelante, v arriba, w lateral) y se colocan con yaw sobre el eje del tobillo.
import { ellipsoid, sphere, roundCone, roundBox, union, unionAll, subtract, intersect, polygonize } from '../lib/sdf.mjs';
import { sweep, rgb, V, mergeGeo } from '../lib/geom.mjs';
import { computeNormals } from '../lib/mesh.mjs';
import { P } from '../lib/space.mjs';

const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const E = (c, r, rot) => ellipsoid(c, r, rot);

// ---------- formas locales ----------
function soleShape() {
  const fore = E([84, 17, 0], [72, 17.5, 50]);
  const mid = E([12, 17, 0], [64, 17.5, 46]);
  const heel = E([-60, 18, 0], [50, 18.5, 41]);
  let s = union(union(fore, mid, 18), heel, 18);
  s = intersect(s, { f: (u, v, w) => -v, bb: s.bb }, 3);          // fondo plano
  return s;
}
function upperShape() {
  // paredes que nacen sobre la suela y se cierran arriba; empeine ancho, lengüeta plana y alta
  const toe = E([98, 40, 0], [56, 36, 44]);
  const front = E([52, 44, 0], [64, 46, 44]);
  const instep = E([6, 50, 0], [60, 60, 43]);
  const heel = E([-58, 52, 0], [46, 62, 37]);
  const ankle = E([-52, 96, 0], [36, 56, 35]);
  const tongue = E([-16, 146, 0], [15, 60, 42], [0, 0, 0.34]);
  let s = union(union(union(toe, front, 18), instep, 22), heel, 20);
  s = union(s, ankle, 22);
  s = union(s, tongue, 10);
  // alas de plástico (relieve) a ambos lados del empeine y ventanas de malla (rehundido)
  for (const sg of [-1, 1]) {
    s = union(s, roundBox([-8, 94, sg * 40], [30, 17, 5], 4, [0, sg * 0.1, -0.35]), 3);
    s = subtract(s, roundBox([40, 62, sg * 46], [30, 14, 6], 4), 2);
  }
  s = intersect(s, { f: (u, v, w) => 27 - v, bb: s.bb }, 2);      // se apoya sobre la suela, sin tapar el crema
  return s;
}

// color de la suela por posición local
function soleColor(u, v, w) {
  const CREAM = rgb(224, 205, 172), BLACK = rgb(34, 30, 28), AIR = rgb(26, 24, 24);
  if (v < 6) return BLACK;
  let c = CREAM;
  // ventana de aire en el talón/mediopié, a ambos lados
  const dx = (u + 4) / 34, dy = (v - 17) / 7.2;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (Math.abs(w) > 26 && d < 1.25) c = mix(c, AIR, 1 - sstep(0.85, 1.25, d));
  // bajo la suela, la franja más baja de cada lado es el borde negro del outsole
  return mix(c, BLACK, 1 - sstep(5.5, 8, v));
}

// rectángulo redondeado suave (máscara 0..1) en el plano (u, v)
const rr = (u, v, cu, cv, hu, hv, r, soft = 2.5) => {
  const qu = Math.abs(u - cu) - hu + r, qv = Math.abs(v - cv) - hv + r;
  const d = Math.hypot(Math.max(qu, 0), Math.max(qv, 0)) + Math.min(Math.max(qu, qv), 0) - r;
  return 1 - sstep(-soft, soft, d);
};

function upperColor(u, v, w) {
  const SUEDE = rgb(184, 136, 100), BLACK = rgb(30, 26, 25), NET = rgb(104, 70, 50), TAB = rgb(156, 112, 80);
  let c = SUEDE;
  const side = sstep(16, 30, Math.abs(w));
  // banda negra baja (foxing) sobre la suela
  c = mix(c, BLACK, 1 - sstep(38, 42, v));
  // ala negra del lateral y ventana de malla bajo los cordones
  c = mix(c, BLACK, side * rr(u, v, -8, 92, 30, 17, 9));
  c = mix(c, NET, side * rr(u, v, 40, 62, 30, 15, 8));
  // talón/lengüeta algo más oscuros
  c = mix(c, TAB, sstep(115, 160, v) * 0.5);
  return c;
}

// Jumpman estilizado: cápsulas en un plano (x lateral, y arriba, z hacia fuera), aplanado
export function buildLogo() {
  const caps = [
    [[0, 12, 0], [1, 0, 0], 3.3, 3.0], [[-0.5, 11, 0], [-9, 19, 0], 2.4, 2.1], [[0, 9, 0], [9, 5, 0], 2.3, 2.1], [[9, 5, 0], [12, -1, 0], 2.1, 1.8],
    [[1, 0, 0], [-9, -7, 0], 2.9, 2.5], [[-9, -7, 0], [-6, -16, 0], 2.5, 2.2], [[1, 0, 0], [10, -9, 0], 2.9, 2.5], [[10, -9, 0], [15, -17, 0], 2.5, 2.1],
  ].map(([a, b, ra, rb]) => roundCone(a, b, ra, rb));
  const parts = [...caps, sphere([0, 17.5, 0], 4.4), sphere([-11.5, 23, 0], 3.7)];
  const sh = unionAll(parts, 1.2);
  const m = polygonize(sh.f, [-24, -26, -8], [24, 32, 8], 0.9, { color: () => rgb(236, 218, 186), project: 1 });
  for (let i = 2; i < m.pos.length; i += 3) m.pos[i] *= 0.38;          // aplanado
  m.nrm = computeNormals(m.pos, m.idx);
  return m;
}
export function placeLogo(m, ) {
  // marco de la lengüeta (debe coincidir con upperShape): eje fino n, eje largo l, lateral w
  const th = 0.34, n = [Math.cos(th), Math.sin(th), 0], l = [-Math.sin(th), Math.cos(th), 0];
  const c = [-16 + n[0] * 15.6 + l[0] * 36, 146 + n[1] * 15.6 + l[1] * 36, 0];
  const pos = new Float32Array(m.pos.length), nrm = new Float32Array(m.pos.length);
  for (let i = 0; i < m.pos.length; i += 3) {
    const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
    // x → w (lateral), y → l (largo), z → n (fuera)
    pos[i] = c[0] + l[0] * y + n[0] * z; pos[i + 1] = c[1] + l[1] * y + n[1] * z; pos[i + 2] = x;
    const nx = m.nrm[i], ny = m.nrm[i + 1], nz = m.nrm[i + 2];
    nrm[i] = l[0] * ny + n[0] * nz; nrm[i + 1] = l[1] * ny + n[1] * nz; nrm[i + 2] = nx;
  }
  return { ...m, pos, nrm };
}

export function buildShoe({ cell = 2.4 } = {}) {
  const sole = soleShape(), upper = upperShape();
  const lo = [-125, -3, -62], hi = [190, 226, 62];
  const soleMesh = polygonize(sole.f, lo, hi, cell, { color: soleColor, project: 2 });
  const upperMesh = polygonize(upper.f, lo, hi, cell, { color: upperColor, project: 2 });

  // cordones: cruces sobre el empeine siguiendo la superficie
  const surfaceV = (u, w) => { let v = 230; while (v > 0 && upper.f(u, v, w) > 0) v -= 2; let a = v + 2, b = v; for (let i = 0; i < 16; i++) { const m = (a + b) / 2; if (upper.f(u, m, w) < 0) b = m; else a = m; } return (a + b) / 2; };
  const laceMeshes = [];
  const laceCol = () => rgb(28, 23, 21);
  const eyelets = [-24, -10, 4, 19, 36, 54];
  for (let i = 0; i < eyelets.length; i++) {
    const u0 = eyelets[i], u1 = eyelets[Math.min(eyelets.length - 1, i + 1)] + (i === eyelets.length - 1 ? 8 : 0);
    for (const dir of [1, -1]) {
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, w = dir * (30 - 60 * t), u = lerpN(u0, u1, t) + (k === 0 || k === 8 ? 0 : 0);
        pts.push([u, surfaceV(u, w) + 1.6, w]);
      }
      laceMeshes.push(sweep(pts, { rw: () => 2.3, rt: () => 2.3, up: [0, 1, 0], sides: 6, color: laceCol }));
    }
  }
  return { soleMesh, upperMesh, laces: mergeGeo(laceMeshes), logo: placeLogo(buildLogo()), upperShape: upper };
}
const lerpN = (a, b, t) => a + (b - a) * t;

// ---------- colocación en el mundo (pu) ----------
export function placeMesh(m, { x, z, yaw, k = [1, 1, 1] }) {
  const s = Math.sin(yaw), c = Math.cos(yaw);
  const Fv = x < 0 ? [-s, 0, c] : [s, 0, c];        // la punta mira hacia delante y hacia fuera
  const L = V.cross(Fv, [0, 1, 0]);                 // base (adelante, arriba, lateral) dextrógira
  const pos = new Float32Array(m.pos.length), nrm = new Float32Array(m.pos.length);
  for (let i = 0; i < m.pos.length; i += 3) {
    const u = m.pos[i] * k[0], v = m.pos[i + 1] * k[1], w = m.pos[i + 2] * k[2];
    pos[i] = x + Fv[0] * u + L[0] * w; pos[i + 1] = v; pos[i + 2] = z + Fv[2] * u + L[2] * w;
    let nu = m.nrm[i] / k[0], nv = m.nrm[i + 1] / k[1], nw = m.nrm[i + 2] / k[2];
    const nl = Math.hypot(nu, nv, nw) || 1; nu /= nl; nv /= nl; nw /= nl;
    nrm[i] = Fv[0] * nu + L[0] * nw; nrm[i + 1] = nv; nrm[i + 2] = Fv[2] * nu + L[2] * nw;
  }
  return { ...m, pos, nrm };
}

export const SHOE_PLACEMENT = [
  { x: P(334, 0)[0], z: -12, yaw: 29 * Math.PI / 180, k: [1.32, 1.0, 1.26] },   // zapatilla de la izquierda del espectador
  { x: P(692, 0)[0], z: -12, yaw: 21 * Math.PI / 180, k: [1.32, 1.0, 1.26] },
];
