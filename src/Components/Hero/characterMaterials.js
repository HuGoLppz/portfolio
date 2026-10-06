import * as THREE from "three";

/*
  Ajustes de material en tiempo de ejecución para character.glb, compartidos por el visor y el hero.
  El GLB trae los materiales por nombre (skin, eyes, hair, hoodie, jeans, sneaker_*…); aquí se
  les da el entorno de estudio y los ajustes que glTF no puede expresar.
*/

// cuánto refleja el entorno de estudio cada material
const ENV = { skin: 0.35, eye_cornea: 1.4, eye_ball: 0.9, hair: 0.7, hoodie: 0.35, jeans: 0.4 };

export const applyCharacterMaterials = (scene, envTexture) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m.isMeshStandardMaterial) continue;
      m.envMap = envTexture;
      m.envMapIntensity = ENV[m.name] ?? 0.6;
    }
  });
};

export { THREE };
