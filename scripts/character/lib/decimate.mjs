// Decimación por colapso de aristas con métricas cuádricas (Garland-Heckbert).
// Conserva las fronteras abiertas, evita invertir caras y penaliza colapsar entre vértices de color distinto.
//   decimate({ pos, idx, col? }, { target: nº de triángulos final, colorWeight, boundaryWeight })
//   → { pos, idx, col }  (las normales se recalculan fuera)

class Heap {
  constructor() { this.a = []; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p].c <= a[i].c) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a; const top = a[0]; const last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < a.length && a[l].c < a[m].c) m = l; if (r < a.length && a[r].c < a[m].c) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top;
  }
  get size() { return this.a.length; }
}

export function decimate(mesh, { target, colorWeight = 0, boundaryWeight = 50, maxCost = Infinity } = {}) {
  const n0 = mesh.pos.length / 3;
  const P = Float64Array.from(mesh.pos);
  const C = mesh.col ? Float64Array.from(mesh.col) : null;
  const F = []; // caras [a,b,c]
  for (let t = 0; t < mesh.idx.length; t += 3) { const a = mesh.idx[t], b = mesh.idx[t + 1], c = mesh.idx[t + 2]; if (a !== b && b !== c && a !== c) F.push([a, b, c]); }
  const faceAlive = new Uint8Array(F.length).fill(1);
  let aliveFaces = F.length;
  const vf = Array.from({ length: n0 }, () => []);
  F.forEach((f, i) => { for (const v of f) vf[v].push(i); });
  const Q = new Float64Array(n0 * 10);
  const addPlane = (v, a, b, c, d, w) => {
    const o = v * 10;
    Q[o] += w * a * a; Q[o + 1] += w * a * b; Q[o + 2] += w * a * c; Q[o + 3] += w * a * d;
    Q[o + 4] += w * b * b; Q[o + 5] += w * b * c; Q[o + 6] += w * b * d;
    Q[o + 7] += w * c * c; Q[o + 8] += w * c * d; Q[o + 9] += w * d * d;
  };
  const faceNormal = (f) => {
    const [a, b, c] = f;
    const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
    const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    return [nx / (l || 1), ny / (l || 1), nz / (l || 1), l * 0.5];
  };
  for (const f of F) {
    const [nx, ny, nz, area] = faceNormal(f);
    const d = -(nx * P[f[0] * 3] + ny * P[f[0] * 3 + 1] + nz * P[f[0] * 3 + 2]);
    for (const v of f) addPlane(v, nx, ny, nz, d, area);
  }
  // fronteras abiertas: plano perpendicular a la cara que contiene la arista
  const edgeCount = new Map();
  const ek = (a, b) => (a < b ? a * 4294967296 + b : b * 4294967296 + a);
  for (const f of F) for (let k = 0; k < 3; k++) { const key = ek(f[k], f[(k + 1) % 3]); edgeCount.set(key, (edgeCount.get(key) || 0) + 1); }
  for (const f of F) {
    const [nx, ny, nz] = faceNormal(f);
    for (let k = 0; k < 3; k++) {
      const a = f[k], b = f[(k + 1) % 3];
      if (edgeCount.get(ek(a, b)) !== 1) continue;
      const ex = P[b * 3] - P[a * 3], ey = P[b * 3 + 1] - P[a * 3 + 1], ez = P[b * 3 + 2] - P[a * 3 + 2];
      let px = ey * nz - ez * ny, py = ez * nx - ex * nz, pz = ex * ny - ey * nx;
      const l = Math.hypot(px, py, pz) || 1; px /= l; py /= l; pz /= l;
      const d = -(px * P[a * 3] + py * P[a * 3 + 1] + pz * P[a * 3 + 2]);
      const w = boundaryWeight * Math.hypot(ex, ey, ez);
      addPlane(a, px, py, pz, d, w); addPlane(b, px, py, pz, d, w);
    }
  }
  const ver = new Uint32Array(n0);
  const alive = new Uint8Array(n0).fill(1);

  const evalQ = (q, x, y, z) => q[0] * x * x + 2 * q[1] * x * y + 2 * q[2] * x * z + 2 * q[3] * x + q[4] * y * y + 2 * q[5] * y * z + 2 * q[6] * y + q[7] * z * z + 2 * q[8] * z + q[9];
  const tmpQ = new Float64Array(10);
  const edgeCandidate = (a, b) => {
    for (let k = 0; k < 10; k++) tmpQ[k] = Q[a * 10 + k] + Q[b * 10 + k];
    // posición óptima: resolver A x = -b (matriz 3x3 simétrica de la cuádrica)
    const [m00, m01, m02, m03, m11, m12, m13, m22, m23] = tmpQ;
    const det = m00 * (m11 * m22 - m12 * m12) - m01 * (m01 * m22 - m12 * m02) + m02 * (m01 * m12 - m11 * m02);
    let x, y, z;
    const mid = [(P[a * 3] + P[b * 3]) / 2, (P[a * 3 + 1] + P[b * 3 + 1]) / 2, (P[a * 3 + 2] + P[b * 3 + 2]) / 2];
    if (Math.abs(det) > 1e-9) {
      const r0 = -m03, r1 = -m13, r2 = -m23;
      x = (r0 * (m11 * m22 - m12 * m12) - m01 * (r1 * m22 - m12 * r2) + m02 * (r1 * m12 - m11 * r2)) / det;
      y = (m00 * (r1 * m22 - m12 * r2) - r0 * (m01 * m22 - m12 * m02) + m02 * (m01 * r2 - r1 * m02)) / det;
      z = (m00 * (m11 * r2 - r1 * m12) - m01 * (m01 * r2 - r1 * m02) + r0 * (m01 * m12 - m11 * m02)) / det;
      // evitar posiciones absurdas lejos de la arista
      const el = Math.hypot(P[a * 3] - P[b * 3], P[a * 3 + 1] - P[b * 3 + 1], P[a * 3 + 2] - P[b * 3 + 2]) || 1e-6;
      if (Math.hypot(x - mid[0], y - mid[1], z - mid[2]) > el * 1.5) { x = mid[0]; y = mid[1]; z = mid[2]; }
    } else { x = mid[0]; y = mid[1]; z = mid[2]; }
    let cost = evalQ(tmpQ, x, y, z);
    if (C && colorWeight) {
      const dc = Math.hypot(C[a * 3] - C[b * 3], C[a * 3 + 1] - C[b * 3 + 1], C[a * 3 + 2] - C[b * 3 + 2]);
      cost += colorWeight * dc * dc;
    }
    return { x, y, z, cost: Math.max(0, cost) };
  };

  const heap = new Heap();
  const pushEdge = (a, b) => { const e = edgeCandidate(a, b); heap.push({ c: e.cost, a, b, va: ver[a], vb: ver[b], x: e.x, y: e.y, z: e.z }); };
  const seen = new Set();
  for (const f of F) for (let k = 0; k < 3; k++) { const a = f[k], b = f[(k + 1) % 3]; const key = ek(a, b); if (seen.has(key)) continue; seen.add(key); pushEdge(a, b); }

  const nbrFaces = (a, b) => { const s = new Set(vf[a]); for (const f of vf[b]) s.add(f); return [...s].filter((f) => faceAlive[f]); };
  while (aliveFaces > target && heap.size) {
    const e = heap.pop();
    if (!alive[e.a] || !alive[e.b] || ver[e.a] !== e.va || ver[e.b] !== e.vb) continue;
    if (e.c > maxCost) break;
    const { a, b } = e;
    const faces = nbrFaces(a, b);
    // validez: ninguna cara (no degenerada por el colapso) puede invertirse o quedar casi plana
    let ok = true;
    const oldA = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], oldB = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]];
    for (const fi of faces) {
      const f = F[fi];
      if (f.includes(a) && f.includes(b)) continue;
      const before = faceNormal(f);
      const saveA = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], saveB = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]];
      for (const v of [a, b]) { P[v * 3] = e.x; P[v * 3 + 1] = e.y; P[v * 3 + 2] = e.z; }
      const after = faceNormal(f);
      P[a * 3] = saveA[0]; P[a * 3 + 1] = saveA[1]; P[a * 3 + 2] = saveA[2]; P[b * 3] = saveB[0]; P[b * 3 + 1] = saveB[1]; P[b * 3 + 2] = saveB[2];
      if (before[0] * after[0] + before[1] * after[1] + before[2] * after[2] < 0.25) { ok = false; break; }
    }
    if (!ok) continue;
    // colapso b → a
    P[a * 3] = e.x; P[a * 3 + 1] = e.y; P[a * 3 + 2] = e.z;
    if (C) { for (let k = 0; k < 3; k++) C[a * 3 + k] = (C[a * 3 + k] + C[b * 3 + k]) / 2; }
    for (let k = 0; k < 10; k++) Q[a * 10 + k] += Q[b * 10 + k];
    alive[b] = 0; ver[a]++; ver[b]++;
    for (const fi of vf[b]) {
      if (!faceAlive[fi]) continue;
      const f = F[fi];
      for (let k = 0; k < 3; k++) if (f[k] === b) f[k] = a;
      if (f[0] === f[1] || f[1] === f[2] || f[0] === f[2]) { faceAlive[fi] = 0; aliveFaces--; } else vf[a].push(fi);
    }
    vf[b] = [];
    vf[a] = vf[a].filter((fi) => faceAlive[fi]);
    const around = new Set();
    for (const fi of vf[a]) for (const v of F[fi]) if (v !== a) around.add(v);
    for (const v of around) pushEdge(Math.min(a, v), Math.max(a, v));
  }
  // compactar
  const map = new Int32Array(n0).fill(-1);
  let m = 0;
  const outIdx = [];
  for (let i = 0; i < F.length; i++) {
    if (!faceAlive[i]) continue;
    for (const v of F[i]) { if (map[v] < 0) map[v] = m++; outIdx.push(map[v]); }
  }
  const pos = new Float32Array(m * 3), col = C ? new Float32Array(m * 3) : null;
  for (let v = 0; v < n0; v++) {
    const o = map[v]; if (o < 0) continue;
    pos[o * 3] = P[v * 3]; pos[o * 3 + 1] = P[v * 3 + 1]; pos[o * 3 + 2] = P[v * 3 + 2];
    if (C) { col[o * 3] = C[v * 3]; col[o * 3 + 1] = C[v * 3 + 1]; col[o * 3 + 2] = C[v * 3 + 2]; }
  }
  return { pos, idx: Uint32Array.from(outIdx), col };
}
