// Rasterizador de siluetas ortográficas para comparar con la máscara alpha de la referencia
import { readPNG, writePNG } from './png.mjs';

export const IW = 1024, IH = 1536;

export function refMask(path) {
  const im = readPNG(path);
  const m = new Uint8Array(IW * IH);
  for (let i = 0; i < IW * IH; i++) m[i] = im.data[i * 4 + 3] >= 200 ? 1 : 0;
  return { mask: m, im };
}

// pxy: Float32Array con (px,py) por vértice ya proyectados; idx: Uint32Array de triángulos
export function silhouette(pxy, idx, mask = new Uint8Array(IW * IH)) {
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 2, b = idx[t + 1] * 2, c = idx[t + 2] * 2;
    const x0 = pxy[a], y0 = pxy[a + 1], x1 = pxy[b], y1 = pxy[b + 1], x2 = pxy[c], y2 = pxy[c + 1];
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxY = Math.min(IH - 1, Math.ceil(Math.max(y0, y1, y2)));
    const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxX = Math.min(IW - 1, Math.ceil(Math.max(x0, x1, x2)));
    const den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
    if (Math.abs(den) < 1e-9) continue;
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      const l0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / den;
      const l1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / den;
      const l2 = 1 - l0 - l1;
      if (l0 >= -0.02 && l1 >= -0.02 && l2 >= -0.02) mask[y * IW + x] = 1;
    }
  }
  return mask;
}

// verde = solo referencia (falta), rojo = solo malla (sobra), gris = coincide
export function compare(ref, mine, outPath) {
  let inter = 0, uni = 0;
  const out = Buffer.alloc(IW * IH * 4);
  for (let i = 0; i < IW * IH; i++) {
    const r = ref[i], m = mine[i];
    if (r && m) inter++;
    if (r || m) uni++;
    const o = i * 4;
    if (r && m) { out[o] = out[o + 1] = out[o + 2] = 70; }
    else if (r) { out[o] = 30; out[o + 1] = 230; out[o + 2] = 90; }
    else if (m) { out[o] = 240; out[o + 1] = 40; out[o + 2] = 40; }
    out[o + 3] = 255;
  }
  if (outPath) writePNG(outPath, IW, IH, out);
  return inter / uni;
}

export function rowExtents(mask, y) {
  let l = -1, r = -1;
  for (let x = 0; x < IW; x++) if (mask[y * IW + x]) { if (l < 0) l = x; r = x; }
  return [l, r];
}
