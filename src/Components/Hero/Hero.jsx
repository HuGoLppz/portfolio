import { useEffect, useRef } from "react";

import Icon from "../Common/Icon";
import HeroContours from "./HeroContours";
import Character3D from "./Character3D";

const isPlaceholder = (value) => !value || value.trim().startsWith("[");

const Hero = ({ content }) => {
  const { hero, profile } = content;
  const nameRef = useRef(null);

  // Al hacer scroll, el título se desliza y encoge hasta la marca de la barra de navegación.
  useEffect(() => {
    const name = nameRef.current;
    const brand = document.querySelector(".nav__brand");
    if (!name || !brand) return undefined;

    let m = null;

    const measure = () => {
      name.style.transform = "";
      const n = name.getBoundingClientRect();
      const b = brand.getBoundingClientRect();
      m = {
        dx: b.left - n.left,
        dy: b.top - (n.top + window.scrollY),
        scale: parseFloat(getComputedStyle(brand).fontSize) / parseFloat(getComputedStyle(name).fontSize),
        range: Math.max(1, n.top + window.scrollY - b.top),
      };
    };

    const update = () => {
      if (!m) return;
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / m.range));
      const eased = p * p * (3 - 2 * p);
      name.style.transform = p
        ? `translate(${m.dx * eased}px, ${(m.dy + y) * eased}px) scale(${1 + (m.scale - 1) * eased})`
        : "";
      const swap = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
      name.style.opacity = 1 - swap;
      brand.style.opacity = swap;
      brand.style.visibility = swap ? "visible" : "hidden";
    };

    const refresh = () => {
      measure();
      update();
    };

    refresh();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", refresh);
      name.style.cssText = "";
      brand.style.cssText = "";
    };
  }, [profile.name]);

  return (
    <section className="hero" id="inicio">
      <HeroContours />

      <Character3D />

      <div className="wrap hero__grid">
        <div>
          <h1 className="hero__name enter d2" ref={nameRef}>{profile.name}</h1>

          <p className="hero__role enter d3">
            {profile.role} {hero.roleConnector} <b>{profile.focus}</b>
          </p>

          <p className="hero__intro enter d4">{hero.intro}</p>

          <div className="hero__cta enter d5">
            <a className="btn btn--primary" href="#proyectos">
              {hero.viewProjects}
              <Icon name="arrow" size={17} />
            </a>

            <a className="btn btn--ghost" href="#contacto">
              {hero.contactMe}
            </a>
          </div>
        </div>

        <aside
          className="card--profile enter d6"
          aria-label={hero.profileCardLabel}
        >
          <dl className="spec">
            {[
              [hero.details.location, profile.location],
              [hero.details.age, profile.age],
              [hero.details.degree, profile.degree],
              [hero.details.focus, profile.focus],
              [hero.details.availability, profile.availability],
            ].map(([key, value]) => (
              <div className="spec__row" key={key}>
                <dt className="spec__key">{key}</dt>

                <dd
                  className="spec__val"
                  style={{
                    margin: 0,
                    color: isPlaceholder(value)
                      ? "var(--text-muted)"
                      : undefined,
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
};

export default Hero;
