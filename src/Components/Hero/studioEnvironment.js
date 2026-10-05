import * as THREE from "three";

/*
  Entorno de estudio procedural (sin cargar ningún HDRI): un softbox principal
  arriba a la izquierda, un relleno frío a la derecha, un contraluz y una luz
  cenital. Solo se usa como mapa de reflejos / iluminación ambiental suave:
  es lo que da el brillo húmedo y los catchlights naturales de la córnea, el
  reflejo del pelo y el borde "sedoso" de la piel.
*/

const panel = (scene, [x, y, z], [w, h], color, intensity) => {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  mesh.position.set(x, y, z);
  mesh.lookAt(0, 0, 0);
  scene.add(mesh);
};

// Devuelve el WebGLRenderTarget del PMREM; su .texture se asigna a scene.environment
export const createStudioEnvironment = (renderer) => {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x1b222a);

  panel(studio, [-2.4, 2.6, 3.2], [2.4, 1.7], "#fff4e8", 14); // softbox principal
  panel(studio, [3.2, 0.8, 2.6], [1.6, 2.6], "#dfe8ff", 3); // relleno frío
  panel(studio, [-1.2, 2.2, -3.6], [3.2, 0.9], "#ffffff", 7); // contraluz
  panel(studio, [0, 4, 0.2], [3, 3], "#ffffff", 1.6); // cenital

  const target = pmrem.fromScene(studio, 0.03);
  studio.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  pmrem.dispose();
  return target;
};
