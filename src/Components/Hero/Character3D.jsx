import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import modelUrl from "../../assets/white_mesh.glb";

/*
  Personaje 3D cargado desde white_mesh.glb (una sola malla sin esqueleto).
  Se le añade un esqueleto de 3 huesos (cuerpo > cuello > cabeza) con pesos
  calculados por altura, así el cursor mueve cuello y cabeza con suavidad.
*/

const MODEL_HEIGHT = 6.2;
// Alturas en el espacio original del modelo (y de -1 a 0.96)
const NECK_FROM = 0.42;
const NECK_TO = 0.66;
const HEAD_FROM = 0.6;
const HEAD_TO = 0.72;
const NECK_PIVOT_Y = 0.6;

const smooth = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const prepare = (gltf) => {
  let src;
  gltf.scene.traverse((o) => {
    if (o.isMesh && !src) src = o;
  });
  const geo = src.geometry.clone();
  const pos = geo.attributes.position;

  // la malla trae unos pocos triángulos-fibra (aristas > 1.6) que dibujan una
  // línea de la cabeza a los pies: se descartan
  const MAX_EDGE = 0.15;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const srcIndex = geo.index.array;
  const keep = [];
  for (let i = 0; i < srcIndex.length; i += 3) {
    a.fromBufferAttribute(pos, srcIndex[i]);
    b.fromBufferAttribute(pos, srcIndex[i + 1]);
    c.fromBufferAttribute(pos, srcIndex[i + 2]);
    if (
      a.distanceTo(b) < MAX_EDGE &&
      b.distanceTo(c) < MAX_EDGE &&
      a.distanceTo(c) < MAX_EDGE
    ) {
      keep.push(srcIndex[i], srcIndex[i + 1], srcIndex[i + 2]);
    }
  }
  geo.setIndex(keep);
  geo.computeVertexNormals();

  const count = pos.count;
  const idx = new Uint16Array(count * 4);
  const wts = new Float32Array(count * 4);
  for (let i = 0; i < count; i += 1) {
    const y = pos.getY(i);
    const s = smooth(NECK_FROM, NECK_TO, y); // cuerpo -> cuello
    const t = smooth(HEAD_FROM, HEAD_TO, y); // cuello -> cabeza
    wts[i * 4] = 1 - s;
    wts[i * 4 + 1] = s * (1 - t);
    wts[i * 4 + 2] = s * t;
    idx[i * 4 + 1] = 1;
    idx[i * 4 + 2] = 2;
  }
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(idx, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(wts, 4));

  const root = new THREE.Bone();
  const neck = new THREE.Bone();
  neck.position.set(0, NECK_PIVOT_Y, 0);
  const head = new THREE.Bone();
  head.position.set(0, 0.12, 0);
  root.add(neck);
  neck.add(head);

  const material = new THREE.MeshStandardMaterial({
    color: "#e9e4dc",
    roughness: 0.65,
    metalness: 0,
  });
  const mesh = new THREE.SkinnedMesh(geo, material);
  mesh.add(root);
  mesh.bind(new THREE.Skeleton([root, neck, head]));

  // colocar: pies en y=0, centrado en x/z, altura MODEL_HEIGHT
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  const k = MODEL_HEIGHT / (box.max.y - box.min.y);
  const holder = new THREE.Group();
  holder.add(mesh);
  mesh.scale.setScalar(k);
  mesh.position.set(
    -((box.min.x + box.max.x) / 2) * k,
    -box.min.y * k,
    -((box.min.z + box.max.z) / 2) * k,
  );
  return { holder, root, neck, head, k, box };
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
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    camera.position.set(0, 3.2, 17);
    camera.lookAt(0, 3.1, 0);

    // luces: ambiente frío, principal cálida, contraluz azul como en la imagen
    scene.add(new THREE.HemisphereLight("#9fb4ff", "#2a1a10", 0.9));
    const key = new THREE.DirectionalLight("#ffe2c4", 2.4);
    key.position.set(3, 7, 8);
    scene.add(key);
    const rimBlue = new THREE.DirectionalLight("#5f8dff", 2.2);
    rimBlue.position.set(-6, 1, -3);
    scene.add(rimBlue);
    const rimWarm = new THREE.DirectionalLight("#ffb27a", 1.4);
    rimWarm.position.set(6, 5, -4);
    scene.add(rimWarm);
    const fill = new THREE.PointLight("#6f95ff", 14, 18);
    fill.position.set(0, 0.5, 5);
    scene.add(fill);

    let model = null;
    let disposed = false;
    new GLTFLoader().load(modelUrl, (gltf) => {
      if (disposed) return;
      model = prepare(gltf);
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
          o.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="hero__character" ref={hostRef} aria-hidden="true" />;
};

export default Character3D;
