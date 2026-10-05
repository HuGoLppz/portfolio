import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import modelUrl from "../../assets/character_realistic.glb";
import { createStudioEnvironment } from "./studioEnvironment.js";

/*
  Personaje 3D cargado desde character_realistic.glb: versión 3D de character.png
  con el pelo de "Hair 2.obj", las zapatillas Air Jordan 4 University Blue y la
  cara refinada (párpados, labios, orejas, piel con micro-relieve, ojos con iris
  y córnea, cejas y pestañas de pelos individuales). Viene separado por partes y
  materiales (piel, ojos, pelo, sudadera, vaqueros, zapatillas…) y con un
  esqueleto de 3 huesos (Root > Neck > Head); el cursor mueve cuello y cabeza
  con suavidad.
*/

const MODEL_HEIGHT = 6.2;

// cuánto refleja el entorno de estudio cada material (la piel casi nada para no
// lavar su color; los ojos mucho, para que la córnea tenga catchlights)
const ENV_INTENSITY = { skin: 0.3, eyes: 1.2, hair: 0.55, hair_fibers: 0.5, brow_hair: 0.5 };

const prepare = (gltf, envTexture) => {
  const scene = gltf.scene;
  const root = scene.getObjectByName("Root");
  const neck = scene.getObjectByName("Neck");
  const head = scene.getObjectByName("Head");
  scene.traverse((o) => {
    if (o.isSkinnedMesh) o.frustumCulled = false; // la cabeza gira: se evita el recorte por caja
    const k = o.isMesh && ENV_INTENSITY[o.material.name];
    if (k) {
      o.material.envMap = envTexture;
      o.material.envMapIntensity = k;
    }
  });

  // colocar: pies en y=0, centrado en x/z, altura MODEL_HEIGHT
  const box = new THREE.Box3().setFromObject(scene);
  const k = MODEL_HEIGHT / (box.max.y - box.min.y);
  const holder = new THREE.Group();
  holder.add(scene);
  scene.scale.setScalar(k);
  scene.position.set(
    -((box.min.x + box.max.x) / 2) * k,
    -box.min.y * k,
    -((box.min.z + box.max.z) / 2) * k,
  );
  return { holder, root, neck, head };
};

const Character3D = () => {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined; // sin WebGL: el contenedor queda vacío
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // reflejos de estudio (catchlights de la córnea, brillo del pelo y de los labios)
    const envTarget = createStudioEnvironment(renderer);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.5;
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 3.2, 17);
    camera.lookAt(0, 3.1, 0);

    // luces: principal cálida desde la izquierda del espectador (como en la ilustración), relleno frontal
    // suave y contraluces azul y cálido para recortar la silueta
    scene.add(new THREE.HemisphereLight("#fff6ee", "#9a8478", 1.7));
    const key = new THREE.DirectionalLight("#fff1e2", 2.5);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const front = new THREE.DirectionalLight("#fff0e6", 0.6);
    front.position.set(1, 1.5, 9);
    scene.add(front);
    const fill = new THREE.DirectionalLight("#d6defa", 0.6);
    fill.position.set(5, 2, 6);
    scene.add(fill);
    const rimBlue = new THREE.DirectionalLight("#5f8dff", 1.3);
    rimBlue.position.set(-6, 1, -3);
    scene.add(rimBlue);
    const rimWarm = new THREE.DirectionalLight("#ffb27a", 0.9);
    rimWarm.position.set(6, 5, -4);
    scene.add(rimWarm);

    let model = null;
    let disposed = false;
    new GLTFLoader().load(modelUrl, (gltf) => {
      if (disposed) return;
      model = prepare(gltf, envTarget.texture);
      scene.add(model.holder);
    });

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const target = { x: 0, y: 0 };
    const gaze = { x: 0, y: 0 };
    const headPos = new THREE.Vector3();

    const onPointer = (e) => {
      if (e.pointerType === "touch" || reduced.matches) return;
      const rect = host.getBoundingClientRect();
      if (!rect.width) return;
      headPos.set(0, 5.4, 0.4).project(camera);
      const hx = rect.left + ((headPos.x + 1) / 2) * rect.width;
      const hy = rect.top + ((1 - headPos.y) / 2) * rect.height;
      target.x = THREE.MathUtils.clamp((e.clientX - hx) / (window.innerWidth * 0.45), -1, 1);
      target.y = THREE.MathUtils.clamp((e.clientY - hy) / (window.innerHeight * 0.45), -1, 1);
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      if (!visible || document.hidden) return;

      const k = 1 - Math.exp(-dt * 7);
      gaze.x += (target.x - gaze.x) * k;
      gaze.y += (target.y - gaze.y) * k;

      if (model) {
        // reparto del giro: cuerpo < cuello < cabeza
        model.holder.rotation.y = gaze.x * 0.1;
        model.neck.rotation.y = gaze.x * 0.25;
        model.neck.rotation.x = gaze.y * 0.12;
        model.head.rotation.y = gaze.x * 0.4;
        model.head.rotation.x = gaze.y * 0.28;
        model.root.scale.y = 1 + Math.sin(t * 1.6) * 0.004;
      }

      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          // las texturas (piel, ojos, zapatillas) no se liberan con el material
          for (const value of Object.values(o.material)) if (value?.isTexture) value.dispose();
          o.material.dispose();
        }
      });
      envTarget.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="hero__character" ref={hostRef} aria-hidden="true" />;
};

export default Character3D;
