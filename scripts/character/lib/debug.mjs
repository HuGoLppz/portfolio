// Vuelca partes a un GLB sencillo para inspeccionarlas en el visor (scratchpad)
import fs from 'fs';
import { GLBWriter } from './glb.mjs';
import { computeNormals } from './mesh.mjs';
import { S } from './space.mjs';

export function dumpGLB(path, parts, scale = 1 / S) {
  const w = new GLBWriter();
  const nodes = [];
  for (const p of parts) {
    const pos = Float32Array.from(p.pos, (v) => v * scale);
    const nrm = p.nrm || computeNormals(pos, p.idx);
    const mat = w.addMaterial({
      name: p.name,
      pbrMetallicRoughness: { baseColorFactor: [...(p.color || [0.8, 0.8, 0.8]), 1], metallicFactor: 0, roughnessFactor: p.rough ?? 0.7 },
      ...(p.emissive ? { emissiveFactor: p.emissive } : {}),
      doubleSided: true,
    });
    const attributes = { POSITION: pos, NORMAL: nrm };
    if (p.col) attributes.COLOR_0 = p.col;
    const mesh = w.addMesh(p.name, { attributes, indices: p.idx, material: mat });
    w.nodes.push({ name: p.name, mesh });
    nodes.push(w.nodes.length - 1);
  }
  fs.writeFileSync(path, w.build({ scene: 0, scenes: [{ nodes }] }));
}
