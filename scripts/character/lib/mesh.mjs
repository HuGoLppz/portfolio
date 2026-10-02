// Utilidades de malla indexada: { pos: Float32Array(3n), idx: Uint32Array, attrs: { nombre: {data, stride} } }

export const vcount = (m) => m.pos.length / 3;

export function computeNormals(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { n[i] += nx; n[i + 1] += ny; n[i + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

export function adjacency(idx, n) {
  const nb = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < idx.length; t += 3) {
    for (let k = 0; k < 3; k++) { const a = idx[t + k], b = idx[t + (k + 1) % 3]; nb[a].add(b); nb[b].add(a); }
  }
  return nb.map((s) => [...s]);
}

// Suavizado Taubin (λ|μ) restringido a una máscara; no encoge la malla
export function taubin(pos, nb, mask, iters, lam = 0.5, mu = -0.53) {
  const n = pos.length / 3;
  const tmp = new Float32Array(pos.length);
  for (let it = 0; it < iters; it++) {
    for (const f of [lam, mu]) {
      tmp.set(pos);
      for (let i = 0; i < n; i++) {
        if (mask && !mask[i]) continue;
        const N = nb[i];
        if (!N.length) continue;
        let sx = 0, sy = 0, sz = 0;
        for (const j of N) { sx += pos[j * 3]; sy += pos[j * 3 + 1]; sz += pos[j * 3 + 2]; }
        const k = 1 / N.length;
        tmp[i * 3] = pos[i * 3] + f * (sx * k - pos[i * 3]);
        tmp[i * 3 + 1] = pos[i * 3 + 1] + f * (sy * k - pos[i * 3 + 1]);
        tmp[i * 3 + 2] = pos[i * 3 + 2] + f * (sz * k - pos[i * 3 + 2]);
      }
      pos.set(tmp);
    }
  }
}

// Conserva solo los triángulos con keep(t) verdadero y compacta los vértices usados
export function subset(m, keep) {
  const n = vcount(m);
  const map = new Int32Array(n).fill(-1);
  let cnt = 0;
  const out = [];
  for (let t = 0; t < m.idx.length / 3; t++) {
    if (!keep(t)) continue;
    for (let k = 0; k < 3; k++) {
      const v = m.idx[t * 3 + k];
      if (map[v] < 0) map[v] = cnt++;
      out.push(map[v]);
    }
  }
  const pos = new Float32Array(cnt * 3);
  const attrs = {};
  for (const [name, a] of Object.entries(m.attrs || {})) attrs[name] = { stride: a.stride, data: new a.data.constructor(cnt * a.stride) };
  for (let v = 0; v < n; v++) {
    const o = map[v];
    if (o < 0) continue;
    pos[o * 3] = m.pos[v * 3]; pos[o * 3 + 1] = m.pos[v * 3 + 1]; pos[o * 3 + 2] = m.pos[v * 3 + 2];
    for (const [name, a] of Object.entries(m.attrs || {})) for (let c = 0; c < a.stride; c++) attrs[name].data[o * a.stride + c] = a.data[v * a.stride + c];
  }
  return { pos, idx: Uint32Array.from(out), attrs };
}

// Corta la malla por el campo escalar `val` (un valor por vértice): triángulos que cruzan el cero se
// parten en el punto exacto. Devuelve { neg, pos } (val<0 y val>=0) con la frontera compartida y los
// atributos interpolados (la normal se mantiene continua a ambos lados del corte).
export function split(m, val) {
  const attrNames = Object.keys(m.attrs || {});
  const build = () => ({ pos: [], idx: [], attrs: Object.fromEntries(attrNames.map((k) => [k, { stride: m.attrs[k].stride, data: [] }])), map: new Map() });
  const out = [build(), build()]; // 0: neg, 1: pos
  const addV = (o, key, fn) => {
    let id = o.map.get(key);
    if (id !== undefined) return id;
    id = o.pos.length / 3;
    o.map.set(key, id);
    fn(o);
    return id;
  };
  const orig = (o, v) => addV(o, 'v' + v, (q) => {
    q.pos.push(m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]);
    for (const k of attrNames) { const a = m.attrs[k]; for (let c = 0; c < a.stride; c++) q.attrs[k].data.push(a.data[v * a.stride + c]); }
  });
  const cut = (o, a, b) => {
    const va = val[a], vb = val[b];
    const t = va / (va - vb);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const tt = a === lo ? t : 1 - t;
    return addV(o, 'e' + lo + '_' + hi, (q) => {
      for (let c = 0; c < 3; c++) q.pos.push(m.pos[lo * 3 + c] + (m.pos[hi * 3 + c] - m.pos[lo * 3 + c]) * tt);
      for (const k of attrNames) { const at = m.attrs[k]; for (let c = 0; c < at.stride; c++) q.attrs[k].data.push(at.data[lo * at.stride + c] + (at.data[hi * at.stride + c] - at.data[lo * at.stride + c]) * tt); }
    });
  };
  for (let t = 0; t < m.idx.length; t += 3) {
    const v = [m.idx[t], m.idx[t + 1], m.idx[t + 2]];
    const neg = v.map((i) => val[i] < 0);
    const nn = neg.filter(Boolean).length;
    if (nn === 3) { for (const i of v) out[0].idx.push(orig(out[0], i)); continue; }
    if (nn === 0) { for (const i of v) out[1].idx.push(orig(out[1], i)); continue; }
    // triángulo cortado: rotar para que el vértice "solo" quede en v[0]
    const lone = nn === 1 ? neg.indexOf(true) : neg.indexOf(false);
    const a = v[lone], b = v[(lone + 1) % 3], c = v[(lone + 2) % 3];
    const aSide = nn === 1 ? 0 : 1, otherSide = 1 - aSide;
    const A = out[aSide], B = out[otherSide];
    const ab = cut(A, a, b), ac = cut(A, a, c);
    A.idx.push(orig(A, a), ab, ac);
    const ab2 = cut(B, a, b), ac2 = cut(B, a, c);
    B.idx.push(ab2, orig(B, b), orig(B, c), ab2, orig(B, c), ac2);
  }
  const fin = (o) => ({
    pos: Float32Array.from(o.pos), idx: Uint32Array.from(o.idx),
    attrs: Object.fromEntries(attrNames.map((k) => [k, { stride: o.attrs[k].stride, data: Float32Array.from(o.attrs[k].data) }])),
  });
  return { neg: fin(out[0]), pos: fin(out[1]) };
}

// Componentes conexas (por vértices compartidos): devuelve etiqueta por vértice y tamaños
export function components(idx, n) {
  const par = new Int32Array(n).map((_, i) => i);
  const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let t = 0; t < idx.length; t += 3) { const a = find(idx[t]); for (let k = 1; k < 3; k++) { const b = find(idx[t + k]); if (a !== b) par[b] = a; } }
  const label = new Int32Array(n);
  for (let i = 0; i < n; i++) label[i] = find(i);
  return label;
}

// Une varias mallas en una (mismo conjunto de atributos)
export function merge(list) {
  const names = Object.keys(list[0].attrs || {});
  let nv = 0, ni = 0;
  for (const m of list) { nv += vcount(m); ni += m.idx.length; }
  const pos = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  const attrs = Object.fromEntries(names.map((k) => [k, { stride: list[0].attrs[k].stride, data: new Float32Array(nv * list[0].attrs[k].stride) }]));
  let vo = 0, io = 0;
  for (const m of list) {
    pos.set(m.pos, vo * 3);
    for (let i = 0; i < m.idx.length; i++) idx[io + i] = m.idx[i] + vo;
    for (const k of names) attrs[k].data.set(m.attrs[k].data, vo * attrs[k].stride);
    vo += vcount(m); io += m.idx.length;
  }
  return { pos, idx, attrs };
}
