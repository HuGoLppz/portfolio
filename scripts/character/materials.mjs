// Materiales glTF del personaje (PBR + extensiones de la capa de brillo/tela que three.js entiende).
// Cada entrada recibe el escritor (por si necesita registrar texturas) y devuelve el material.
// Los colores son lineales; las mallas con COLOR_0 lo multiplican por baseColorFactor.
import { lin } from './lib/geom.mjs';

const c = (r, g, b) => [lin(r), lin(g), lin(b), 1];
const pbr = (baseColorFactor, roughnessFactor, metallicFactor = 0) => ({ baseColorFactor, roughnessFactor, metallicFactor });

export const MATERIALS = {
  // sudadera negra de forro polar: mate, con "sheen" suave en los bordes de los pliegues
  hoodie: () => ({
    name: 'hoodie', pbrMetallicRoughness: pbr([0.0019, 0.0018, 0.0022, 1], 0.96), doubleSided: true,
    extensions: { KHR_materials_sheen: { sheenColorFactor: [0.06, 0.06, 0.065], sheenRoughnessFactor: 0.55 } },
  }),
  jeans: () => ({
    name: 'jeans', pbrMetallicRoughness: pbr([0.0925, 0.1726, 0.3369, 1], 0.9), doubleSided: true,
    extensions: { KHR_materials_sheen: { sheenColorFactor: [0.12, 0.16, 0.24], sheenRoughnessFactor: 0.6 } },
  }),
  skin: () => ({ name: 'skin', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.58), emissiveFactor: [0.05, 0.03, 0.02] }),
  hair: () => ({ name: 'hair', pbrMetallicRoughness: pbr([0.85, 0.85, 0.85, 1], 0.5) }),
  brows: () => ({ name: 'brows', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.55) }),
  eyes: () => ({
    name: 'eyes', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.22),
    extensions: { KHR_materials_clearcoat: { clearcoatFactor: 1, clearcoatRoughnessFactor: 0.04 } },
  }),
  eyeHL: () => ({ name: 'eye_highlights', pbrMetallicRoughness: pbr([0, 0, 0, 1], 1), emissiveFactor: [1, 1, 1] }),
  shoeUpper: () => ({ name: 'shoe_upper', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.93) }),
  shoeSole: () => ({
    name: 'shoe_sole', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.6),
  }),
  laces: () => ({ name: 'laces', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.7) }),
  logo: () => ({ name: 'logo', pbrMetallicRoughness: pbr([1, 1, 1, 1], 0.8) }),
  aglet: () => ({ name: 'aglet', pbrMetallicRoughness: pbr(c(14, 14, 15), 0.22, 0.35) }),
};
