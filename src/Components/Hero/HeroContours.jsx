import { useEffect, useRef } from "react";

/*
  Curvas de nivel vivas: cada isohipsa respira con unos pocos armónicos cuyo
  desfase crece de curva en curva, y todo el conjunto describe una órbita
  circular lenta (cada curva con su retraso). Un punto dorado recorre la curva
  de agua, como un marcador de levantamiento topográfico. No hay interacción
  con el cursor: se mueve solo. Los parámetros están elegidos para que las
  curvas no se crucen nunca entre sí (comprobado numéricamente).
*/

const CX = 550;
const CY = 450;
const RINGS = 22;
const POINTS = 144;
const TAU = Math.PI * 2;
const WATER_RING = 14;
const INDEX_EVERY = 5;
const ORBIT_RADIUS = 30;
const ORBIT_SPEED = 0.12; // rad/s
const ORBIT_LAG = 0.12;
const PHASE_LAG = 0.06;

// [frecuencia angular, amplitud relativa, fase, velocidad rad/s]
const HARMONICS = [
  [2, 0.085, 0.7, 0.05],
  [3, 0.055, 2.1, -0.035],
  [5, 0.03, 4.0, 0.06],
  [7, 0.014, 1.3, -0.045],
];

const RING_IDS = Array.from({ length: RINGS }, (_, k) => k);
const ringOffset = (k, t) => {
  const depth = 1 - (k / RINGS) * 0.7;
  const phase = ORBIT_SPEED * t - ORBIT_LAG * k;
  return [
    Math.cos(phase) * ORBIT_RADIUS * depth,
    Math.sin(phase) * ORBIT_RADIUS * depth,
  ];
};

const ringPoint = (k, theta, t) => {
  const base = 30 + k * 17.5;
  const reach = 0.3 + 0.7 * Math.min(1, k / 10);
  let w = 1;
  for (const [f, a, p, v] of HARMONICS) {
    w += a * reach * Math.sin(f * theta + p + v * t - PHASE_LAG * k);
  }
  const r = base * w;
  const [ox, oy] = ringOffset(k, t);
  return [
    CX + r * Math.cos(theta) * 1.1 + ox,
    CY + r * Math.sin(theta) * 0.9 + oy,
  ];
};

const HeroContours = () => {
  const rootRef = useRef(null);
  const pathRefs = useRef([]);
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const crossRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let t = 0;
    let frame = 0;
    let last = 0;
    let inView = true;

    const draw = () => {
      for (let k = 0; k < RINGS; k += 1) {
        let d = "";
        for (let i = 0; i < POINTS; i += 1) {
          const [x, y] = ringPoint(k, (i / POINTS) * TAU, t);
          d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        pathRefs.current[k]?.setAttribute("d", `${d}Z`);
      }

      const [dx, dy] = ringPoint(WATER_RING, t * 0.11, t);
      const at = `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`;
      dotRef.current?.setAttribute("transform", at);
      haloRef.current?.setAttribute("transform", at);
      const [cx, cy] = ringOffset(0, t);
      crossRef.current?.setAttribute(
        "transform",
        `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`,
      );
    };

    const tick = (now) => {
      t += Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const start = () => {
      if (frame || reduced.matches || !inView || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      if (reduced.matches) {
        stop();
        t = 0;
        draw();
      } else {
        start();
      }
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    observer.observe(root);

    draw();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="hero__art" ref={rootRef} aria-hidden="true">
      <svg viewBox="0 0 1100 900" focusable="false">
        <g>
          {RING_IDS.map((k) => (
            <path
              key={k}
              ref={(el) => {
                pathRefs.current[k] = el;
              }}
              className={
                k === WATER_RING
                  ? "is-water"
                  : k % INDEX_EVERY === 0
                    ? "is-index"
                    : undefined
              }
            />
          ))}
        </g>

        <g ref={crossRef} className="hero__art-cross">
          <path d={`M${CX - 14} ${CY}H${CX + 14}M${CX} ${CY - 14}V${CY + 14}`} />
        </g>

        <g ref={haloRef}>
          <circle className="hero__art-halo" r="9" />
        </g>
        <g ref={dotRef}>
          <circle className="hero__art-dot" r="3.2" />
        </g>
      </svg>
    </div>
  );
};

export default HeroContours;
