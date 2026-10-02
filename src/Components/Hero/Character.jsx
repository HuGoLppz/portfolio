import { useEffect, useRef } from "react";
import character from "../../assets/character.png";

/*
  Personaje con los ojos que siguen al cursor. Sobre la imagen se superpone un
  SVG con la misma proporción (coordenadas = píxeles del PNG): en cada ojo se
  pinta la esclerótica dentro de la abertura del párpado y, encima, una copia
  del iris recortada de la propia imagen que se desplaza hacia el cursor.
*/

const W = 1024;
const H = 1536;
const IRIS_R = 15.5;
const REACH_X = 6;
const REACH_Y = 4;

const EYES = [
  {
    id: "l",
    cx: 461,
    cy: 222.5,
    lid: "M434 217C438 212 447 209 460.5 208.5C469 208.5 475 211 478 215C481 219 481.5 223.5 480 227C476 233 469 236.5 460.5 237C451 236.8 442 234.5 437.5 228.5C435 225 433.5 221 434 217Z",
  },
  {
    id: "r",
    cx: 550,
    cy: 223.5,
    lid: "M530.5 226.5C531.5 221 535 217 539.5 214.5C544 212 548 211.5 551 211.5C559 211.5 565 213 568.5 216C573 219.5 577 222.5 578 225.5C576 230 571 234 565 236C560 237.5 555 238 550.5 238C543 237.5 536 235.5 532.5 231Z",
  },
];

const Character = () => {
  const rootRef = useRef(null);
  const irisRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const gaze = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame = 0;
    let last = 0;

    const apply = () => {
      EYES.forEach((_, i) => {
        irisRefs.current[i]?.setAttribute(
          "transform",
          `translate(${(gaze.x * REACH_X).toFixed(2)} ${(gaze.y * REACH_Y).toFixed(2)})`,
        );
      });
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const f = 1 - Math.exp(-dt * 9);
      gaze.x += (target.x - gaze.x) * f;
      gaze.y += (target.y - gaze.y) * f;
      apply();
      if (
        Math.abs(target.x - gaze.x) < 0.001 &&
        Math.abs(target.y - gaze.y) < 0.001
      ) {
        gaze.x = target.x;
        gaze.y = target.y;
        apply();
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onPointer = (e) => {
      if (e.pointerType === "touch" || reduced.matches) return;
      const rect = root.getBoundingClientRect();
      if (!rect.width) return;
      // punto medio entre los ojos, en pantalla
      const ex = rect.left + (505.5 / W) * rect.width;
      const ey = rect.top + (223 / H) * rect.height;
      const dx = e.clientX - ex;
      const dy = e.clientY - ey;
      const dist = Math.hypot(dx, dy) || 1;
      const strength = Math.tanh(dist / 260);
      target.x = (dx / dist) * strength;
      target.y = (dy / dist) * strength;
      kick();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    const onMotionChange = () => {
      if (reduced.matches) onLeave();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="hero__character" ref={rootRef} aria-hidden="true">
      <img src={character} width={W} height={H} alt="" draggable="false" />

      <svg viewBox={`0 0 ${W} ${H}`} focusable="false">
        <defs>
          <linearGradient id="sclera" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d8c6c0" />
            <stop offset="0.35" stopColor="#f6efeb" />
            <stop offset="1" stopColor="#fbf7f4" />
          </linearGradient>

          {EYES.map((eye) => (
            <g key={eye.id}>
              <clipPath id={`lid-${eye.id}`}>
                <path d={eye.lid} />
              </clipPath>
              <clipPath id={`iris-${eye.id}`}>
                <circle cx={eye.cx} cy={eye.cy} r={IRIS_R} />
              </clipPath>
            </g>
          ))}
        </defs>

        {EYES.map((eye, i) => (
          <g key={eye.id} clipPath={`url(#lid-${eye.id})`}>
            <path d={eye.lid} fill="url(#sclera)" />
            <g
              ref={(el) => {
                irisRefs.current[i] = el;
              }}
            >
              <image
                href={character}
                width={W}
                height={H}
                clipPath={`url(#iris-${eye.id})`}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Character;
