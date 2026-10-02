// Generadores de geometría sencillos: tubos barridos, esferas UV, cilindros…
// Mallas: { pos: Float32Array, idx: Uint32Array, nrm: Float32Array, col?: Float32Array }
import { computeNormals } from './mesh.mjs';

export const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
export const rgb = (r, g, b) => [lin(r), lin(g), lin(b)];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const V = { sub, add, mul, dot, cross, len, norm };

// Catmull-Rom: remuestrea una polilínea de puntos de control con `perSeg` puntos por tramo
export function catmull(points, perSeg = 6) {
  const out = [];
  const p = (i) => points[Math.max(0, Math.min(points.length - 1, i))];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// Tubo/cinta barrida a lo largo de una curva. Sección elíptica con semiejes (rw, rt) que pueden variar
// a lo largo de la curva; `up` fija la orientación del eje "ancho" (rw). La punta puede cerrarse (taper).
//  pts: [[x,y,z],...]   rw(i,t), rt(i,t): funciones de radio ancho/grueso;  sides: lados de la sección
export function sweep(pts, { rw, rt, up = [0, 0, 1], sides = 8, capStart = true, capEnd = true, color = null }) {
  const n = pts.length;
  const pos = [], idx = [], col = [];
  let prevN = null;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const tan = norm(sub(b, a));
    // ancho = up proyectado perpendicular a la tangente
    const U = typeof up === 'function' ? up(i, t) : up;
    let w = sub(U, mul(tan, dot(U, tan)));
    if (len(w) < 1e-4) w = prevN || [1, 0, 0];
    w = norm(w); prevN = w;
    const th = norm(cross(tan, w));
    const rW = rw(i, t), rT = rt(i, t);
    for (let s = 0; s < sides; s++) {
      const ang = (s / sides) * Math.PI * 2;
      const c = Math.cos(ang), sn = Math.sin(ang);
      pos.push(pts[i][0] + w[0] * c * rW + th[0] * sn * rT, pts[i][1] + w[1] * c * rW + th[1] * sn * rT, pts[i][2] + w[2] * c * rW + th[2] * sn * rT);
      if (color) { const cc = color(i, t, s); col.push(cc[0], cc[1], cc[2]); }
    }
  }
  for (let i = 0; i < n - 1; i++) for (let s = 0; s < sides; s++) {
    const a = i * sides + s, b = i * sides + ((s + 1) % sides), c = (i + 1) * sides + s, d = (i + 1) * sides + ((s + 1) % sides);
    idx.push(a, c, b, b, c, d);
  }
  const cap = (ring, center, flip) => {
    const ci = pos.length / 3;
    pos.push(center[0], center[1], center[2]);
    if (color) { const cc = color(ring === 0 ? 0 : n - 1, ring === 0 ? 0 : 1, 0); col.push(cc[0], cc[1], cc[2]); }
    for (let s = 0; s < sides; s++) { const a = ring * sides + s, b = ring * sides + ((s + 1) % sides); if (flip) idx.push(ci, b, a); else idx.push(ci, a, b); }
  };
  if (capStart) cap(0, pts[0], false);
  if (capEnd) cap(n - 1, pts[n - 1], true);
  const P = Float32Array.from(pos), I = Uint32Array.from(idx);
  for (let i = 0; i < I.length; i += 3) { const t = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = t; }   // caras hacia fuera
  return { pos: P, idx: I, nrm: computeNormals(P, I), col: color ? Float32Array.from(col) : null };
}

// Esfera UV (eje polar = +z, para ojos mirando hacia +z). colorFn(dir, theta, phi) -> [r,g,b]
export function uvSphere(center, radius, { seg = 48, rings = 32, scale = [1, 1, 1], color = null } = {}) {
  const pos = [], nrm = [], col = [], idx = [];
  for (let r = 0; r <= rings; r++) {
    const th = (r / rings) * Math.PI; // 0 en +z (frente)
    for (let s = 0; s <= seg; s++) {
      const ph = (s / seg) * Math.PI * 2;
      const dx = Math.sin(th) * Math.cos(ph), dy = Math.sin(th) * Math.sin(ph), dz = Math.cos(th);
      pos.push(center[0] + dx * radius * scale[0], center[1] + dy * radius * scale[1], center[2] + dz * radius * scale[2]);
      nrm.push(dx / scale[0], dy / scale[1], dz / scale[2]);
      if (color) { const c = color([dx, dy, dz], th, ph); col.push(c[0], c[1], c[2]); }
    }
  }
  for (let r = 0; r < rings; r++) for (let s = 0; s < seg; s++) {
    const a = r * (seg + 1) + s, b = a + 1, c = a + seg + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const N = Float32Array.from(nrm);
  for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; N[i] /= l; N[i + 1] /= l; N[i + 2] /= l; }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx), nrm: N, col: color ? Float32Array.from(col) : null };
}

export function mergeGeo(list) {
  const hasCol = list.every((m) => m.col);
  let nv = 0, ni = 0;
  for (const m of list) { nv += m.pos.length / 3; ni += m.idx.length; }
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), idx = new Uint32Array(ni), col = hasCol ? new Float32Array(nv * 3) : null;
  let vo = 0, io = 0;
  for (const m of list) {
    pos.set(m.pos, vo * 3); nrm.set(m.nrm, vo * 3); if (hasCol) col.set(m.col, vo * 3);
    for (let i = 0; i < m.idx.length; i++) idx[io + i] = m.idx[i] + vo;
    vo += m.pos.length / 3; io += m.idx.length;
  }
  return { pos, nrm, idx, col };
}
