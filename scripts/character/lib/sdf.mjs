// Escultura por campos de distancia con signo (SDF) + mallador "surface nets".
// Todas las funciones trabajan con números sueltos (x, y, z) para ir rápido.
// Un "shape" es { f(x,y,z) -> distancia, bb: [x0,y0,z0,x1,y1,z1] } (negativo = dentro).

const rotMatrix = (rx = 0, ry = 0, rz = 0) => {
  // R = Rz * Ry * Rx ; guardamos su transpuesta (inversa) para llevar el punto al espacio local
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  const m = [
    cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx,
  ];
  return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]; // transpuesta
};

const bboxOfEllipsoid = (cx, cy, cz, rx, ry, rz, rot) => {
  if (!rot) return [cx - rx, cy - ry, cz - rz, cx + rx, cy + ry, cz + rz];
  const r = Math.max(rx, ry, rz);
  return [cx - r, cy - r, cz - r, cx + r, cy + r, cz + r];
};

// elipsoide con rotación opcional (rx, ry, rz en radianes)
export function ellipsoid(c, r, rot) {
  const [cx, cy, cz] = c, [rx, ry, rz] = r;
  const m = rot ? rotMatrix(...rot) : null;
  const mn = Math.min(rx, ry, rz);
  const f = (x, y, z) => {
    x -= cx; y -= cy; z -= cz;
    if (m) { const a = m[0] * x + m[1] * y + m[2] * z, b = m[3] * x + m[4] * y + m[5] * z, c2 = m[6] * x + m[7] * y + m[8] * z; x = a; y = b; z = c2; }
    const px = x / rx, py = y / ry, pz = z / rz;
    const k0 = Math.sqrt(px * px + py * py + pz * pz);
    const qx = px / rx, qy = py / ry, qz = pz / rz;
    const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
    if (k1 < 1e-9) return -mn;
    return (k0 * (k0 - 1)) / k1;
  };
  return { f, bb: bboxOfEllipsoid(cx, cy, cz, rx, ry, rz, rot) };
}

export function sphere(c, r) {
  const [cx, cy, cz] = c;
  return { f: (x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r, bb: [cx - r, cy - r, cz - r, cx + r, cy + r, cz + r] };
}

// cono redondeado entre dos puntos con radios distintos (cápsula cónica)
export function roundCone(a, b, ra, rb) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const f = (x, y, z) => {
    const pax = x - a[0], pay = y - a[1], paz = z - a[2];
    let h = l2 ? (pax * bax + pay * bay + paz * baz) / l2 : 0;
    h = h < 0 ? 0 : h > 1 ? 1 : h;
    const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h);
  };
  const r = Math.max(ra, rb);
  return { f, bb: [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r, Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r] };
}

// cápsula a lo largo de una polilínea con radios por punto
export function tube(points, radii) {
  const segs = [];
  for (let i = 0; i + 1 < points.length; i++) segs.push(roundCone(points[i], points[i + 1], radii[i], radii[i + 1]));
  return unionAll(segs);
}

// caja redondeada con rotación opcional
export function roundBox(c, h, r = 0, rot) {
  const [cx, cy, cz] = c;
  const m = rot ? rotMatrix(...rot) : null;
  const f = (x, y, z) => {
    x -= cx; y -= cy; z -= cz;
    if (m) { const a = m[0] * x + m[1] * y + m[2] * z, b = m[3] * x + m[4] * y + m[5] * z, c2 = m[6] * x + m[7] * y + m[8] * z; x = a; y = b; z = c2; }
    const qx = Math.abs(x) - h[0] + r, qy = Math.abs(y) - h[1] + r, qz = Math.abs(z) - h[2] + r;
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
    return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, qy, qz), 0) - r;
  };
  const R = Math.hypot(h[0], h[1], h[2]);
  return { f, bb: m ? [cx - R, cy - R, cz - R, cx + R, cy + R, cz + R] : [cx - h[0], cy - h[1], cz - h[2], cx + h[0], cy + h[1], cz + h[2]] };
}

export const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => -smin(-a, -b, k);

const mergeBB = (a, b, pad = 0) => [Math.min(a[0], b[0]) - pad, Math.min(a[1], b[1]) - pad, Math.min(a[2], b[2]) - pad, Math.max(a[3], b[3]) + pad, Math.max(a[4], b[4]) + pad, Math.max(a[5], b[5]) + pad];

export function union(a, b, k = 0) {
  return { f: (x, y, z) => smin(a.f(x, y, z), b.f(x, y, z), k), bb: mergeBB(a.bb, b.bb, k) };
}
export function subtract(a, b, k = 0) {
  return { f: (x, y, z) => smax(a.f(x, y, z), -b.f(x, y, z), k), bb: a.bb };
}
export function intersect(a, b, k = 0) {
  return { f: (x, y, z) => smax(a.f(x, y, z), b.f(x, y, z), k), bb: a.bb };
}

// unión de muchos con bounding-box culling (la mezcla suave solo afecta a vecinos cercanos)
export function unionAll(shapes, k = 0) {
  let bb = shapes[0].bb;
  for (const s of shapes) bb = mergeBB(bb, s.bb);
  const n = shapes.length;
  const B = shapes.map((s) => s.bb), F = shapes.map((s) => s.f);
  const f = (x, y, z) => {
    let d = 1e9;
    for (let i = 0; i < n; i++) {
      const b = B[i];
      // distancia mínima al bbox (cota inferior); si no puede mejorar d - k, se descarta
      const dx = x < b[0] ? b[0] - x : x > b[3] ? x - b[3] : 0;
      const dy = y < b[1] ? b[1] - y : y > b[4] ? y - b[4] : 0;
      const dz = z < b[2] ? b[2] - z : z > b[5] ? z - b[5] : 0;
      const lb = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (lb > d + k) continue;
      d = k > 0 ? smin(d, F[i](x, y, z), k) : Math.min(d, F[i](x, y, z));
    }
    return d;
  };
  return { f, bb: mergeBB(bb, bb, k) };
}

// distancia con signo a un polígono 2D (negativa dentro)
export function polySDF(pts) {
  const n = pts.length;
  return (px, py) => {
    let d = (px - pts[0][0]) ** 2 + (py - pts[0][1]) ** 2, s = 1;
    for (let i = 0, j = n - 1; i < n; j = i, i++) {
      const [ax, ay] = pts[j], [bx, by] = pts[i];
      const ex = bx - ax, ey = by - ay, wx = px - ax, wy = py - ay;
      const t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
      const dx = wx - ex * t, dy = wy - ey * t;
      d = Math.min(d, dx * dx + dy * dy);
      const c1 = py >= ay, c2 = py < by, c3 = ex * wy > ey * wx;
      if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    }
    return s * Math.sqrt(d);
  };
}

// unión suave de muchas primitivas con rejilla espacial: cada celda guarda solo las primitivas cercanas.
// Fuera del alcance (margen) devuelve `far`, suficiente para extraer la isosuperficie cerca de la geometría.
export function unionGrid(shapes, k = 0, cellSize = 32, far = 60) {
  let bb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const s of shapes) for (let c = 0; c < 3; c++) { bb[c] = Math.min(bb[c], s.bb[c]); bb[c + 3] = Math.max(bb[c + 3], s.bb[c + 3]); }
  const M = k + Math.max(far, cellSize);
  const org = [bb[0] - M, bb[1] - M, bb[2] - M];
  const dim = [0, 1, 2].map((c) => Math.ceil((bb[c + 3] + M - org[c]) / cellSize) + 1);
  const cells = new Array(dim[0] * dim[1] * dim[2]);
  const at = (i, j, l) => i + dim[0] * (j + dim[1] * l);
  shapes.forEach((s, n) => {
    const lo = [0, 1, 2].map((c) => Math.max(0, Math.floor((s.bb[c] - M - org[c]) / cellSize)));
    const hi = [0, 1, 2].map((c) => Math.min(dim[c] - 1, Math.floor((s.bb[c + 3] + M - org[c]) / cellSize)));
    for (let l = lo[2]; l <= hi[2]; l++) for (let j = lo[1]; j <= hi[1]; j++) for (let i = lo[0]; i <= hi[0]; i++) { const id = at(i, j, l); (cells[id] || (cells[id] = [])).push(n); }
  });
  const F = shapes.map((s) => s.f);
  const f = (x, y, z) => {
    const i = Math.floor((x - org[0]) / cellSize), j = Math.floor((y - org[1]) / cellSize), l = Math.floor((z - org[2]) / cellSize);
    if (i < 0 || j < 0 || l < 0 || i >= dim[0] || j >= dim[1] || l >= dim[2]) return far;
    const list = cells[at(i, j, l)];
    if (!list) return far;
    let d = far;
    for (let n = 0; n < list.length; n++) { const v = F[list[n]](x, y, z); d = k > 0 ? (d >= far ? v : smin(d, v, k)) : Math.min(d, v); }
    return d;
  };
  return { f, bb: [bb[0] - k, bb[1] - k, bb[2] - k, bb[3] + k, bb[4] + k, bb[5] + k] };
}

export const translate = (s, [tx, ty, tz]) => ({ f: (x, y, z) => s.f(x - tx, y - ty, z - tz), bb: [s.bb[0] + tx, s.bb[1] + ty, s.bb[2] + tz, s.bb[3] + tx, s.bb[4] + ty, s.bb[5] + tz] });
// espejo en x (para piezas simétricas): min(f(x), f(-x)) no, queremos la unión de la pieza y su reflejo
export const mirrorX = (s, cx = 0, k = 0) => union(s, { f: (x, y, z) => s.f(2 * cx - x, y, z), bb: [2 * cx - s.bb[3], s.bb[1], s.bb[2], 2 * cx - s.bb[0], s.bb[4], s.bb[5]] }, k);

// ---------------- surface nets ----------------
// f: función SDF; [x0,y0,z0]-[x1,y1,z1]: dominio; h: tamaño de celda.
// opts.project: pasos de proyección a la isosuperficie; opts.color(x,y,z,nx,ny,nz) -> [r,g,b]
export function polygonize(f, min, max, h, opts = {}) {
  const { project = 2, color = null } = opts;
  const nx = Math.ceil((max[0] - min[0]) / h) + 1, ny = Math.ceil((max[1] - min[1]) / h) + 1, nz = Math.ceil((max[2] - min[2]) / h) + 1;
  const g = new Float32Array(nx * ny * nz);
  const at = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) {
    const y = min[1] + j * h, z = min[2] + k * h;
    for (let i = 0; i < nx; i++) g[at(i, j, k)] = f(min[0] + i * h, y, z);
  }
  const vid = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
  const cellAt = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k);
  const pos = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const v = g[at(i + corner[c][0], j + corner[c][1], k + corner[c][2])]; cv[c] = v; if (v < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of edges) {
      const va = cv[a], vb = cv[b];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      sx += corner[a][0] + (corner[b][0] - corner[a][0]) * t;
      sy += corner[a][1] + (corner[b][1] - corner[a][1]) * t;
      sz += corner[a][2] + (corner[b][2] - corner[a][2]) * t;
      cnt++;
    }
    vid[cellAt(i, j, k)] = pos.length / 3;
    pos.push(min[0] + (i + sx / cnt) * h, min[1] + (j + sy / cnt) * h, min[2] + (k + sz / cnt) * h);
  }
  // caras: por cada arista de la rejilla con cambio de signo se conecta el quad de las 4 celdas que la rodean
  const idx = [];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const v0 = g[at(i, j, k)] < 0;
    // eje x
    if (i < nx - 1) { const v1 = g[at(i + 1, j, k)] < 0; if (v0 !== v1) quad(vid[cellAt(i, j - 1, k - 1)], vid[cellAt(i, j, k - 1)], vid[cellAt(i, j, k)], vid[cellAt(i, j - 1, k)], !v0); }
    // eje y
    if (j < ny - 1) { const v1 = g[at(i, j + 1, k)] < 0; if (v0 !== v1) quad(vid[cellAt(i - 1, j, k - 1)], vid[cellAt(i - 1, j, k)], vid[cellAt(i, j, k)], vid[cellAt(i, j, k - 1)], !v0); }
    // eje z
    if (k < nz - 1) { const v1 = g[at(i, j, k + 1)] < 0; if (v0 !== v1) quad(vid[cellAt(i - 1, j - 1, k)], vid[cellAt(i, j - 1, k)], vid[cellAt(i, j, k)], vid[cellAt(i - 1, j, k)], !v0); }
  }
  const P = Float32Array.from(pos);
  const n = P.length / 3;
  const N = new Float32Array(P.length);
  const e = h * 0.5;
  for (let v = 0; v < n; v++) {
    let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let gx = 0, gy = 0, gz = 0;
    for (let it = 0; it <= project; it++) {
      gx = f(x + e, y, z) - f(x - e, y, z); gy = f(x, y + e, z) - f(x, y - e, z); gz = f(x, y, z + e) - f(x, y, z - e);
      const gl = Math.hypot(gx, gy, gz) || 1;
      if (it < project) { const d = f(x, y, z); const s = Math.max(-h, Math.min(h, d)) / gl * 0.5; x -= (gx / gl) * s * 2; y -= (gy / gl) * s * 2; z -= (gz / gl) * s * 2; }
      else { gx /= gl; gy /= gl; gz /= gl; }
    }
    P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    N[v * 3] = gx; N[v * 3 + 1] = gy; N[v * 3 + 2] = gz;
  }
  let C = null;
  if (color) {
    C = new Float32Array(P.length);
    for (let v = 0; v < n; v++) { const c = color(P[v * 3], P[v * 3 + 1], P[v * 3 + 2], N[v * 3], N[v * 3 + 1], N[v * 3 + 2]); C[v * 3] = c[0]; C[v * 3 + 1] = c[1]; C[v * 3 + 2] = c[2]; }
  }
  return { pos: P, nrm: N, idx: Uint32Array.from(idx), col: C };
}
