import Icon from "./Icon";

import {
  PROFILE,
} from "../data/portfolio";

const isPlaceholder = (value) =>
  !value || value.trim().startsWith("[");

const Hero = () => {
  return (
    <section
      className="hero"
      id="inicio"
    >
      <div
        className="hero__bg"
        aria-hidden="true"
      >
        <div className="hero__dots" />
        <div className="hero__glow hero__glow--a" />
        <div className="hero__glow hero__glow--b" />
      </div>

      <div className="wrap hero__grid">
        <div>
          <p className="hero__status enter d1">
            <span
              className="pulse"
              aria-hidden="true"
            />

            {PROFILE.statusLine}
          </p>

          <h1 className="hero__name enter d2">
            {PROFILE.name}
          </h1>

          <p className="hero__role enter d3">
            {PROFILE.role} orientado a{" "}
            <b>{PROFILE.focus}</b>
          </p>

          <p className="hero__intro enter d4">
            Técnico Superior en Desarrollo de
            Aplicaciones Web, con base en
            JavaScript, Java, PHP y SQL.
            Ahora amplío esa base hacia la
            Inteligencia Artificial y el Big
            Data, buscando trabajar donde el
            desarrollo y los datos se
            encuentran.
          </p>

          <div className="hero__cta enter d5">
            <a
              className="btn btn--primary"
              href="#proyectos"
            >
              Ver proyectos
              <Icon
                name="arrow"
                size={17}
              />
            </a>

            <a
              className="btn btn--ghost"
              href="#contacto"
            >
              Contactar conmigo
            </a>
          </div>
        </div>

        <aside
          className="card--profile enter d6"
          aria-label="Ficha de perfil"
        >
          <div className="photo">
            {PROFILE.photo ? (
              <img
                src={PROFILE.photo}
                alt={PROFILE.photoAlt}
              />
            ) : (
              <div className="photo__empty">
                <Icon
                  name="target"
                  size={22}
                />

                <span>
                  [AÑADIR FOTOGRAFÍA]
                </span>
              </div>
            )}
          </div>

          <dl className="spec">
            {[
              ["Ubicación", PROFILE.location],
              ["Edad", PROFILE.age],
              ["Formación", PROFILE.degree],
              ["Enfoque actual", PROFILE.focus],
              [
                "Disponibilidad",
                PROFILE.availability,
              ],
            ].map(([key, value]) => (
              <div
                className="spec__row"
                key={key}
              >
                <dt className="spec__key">
                  {key}
                </dt>

                <dd
                  className="spec__val"
                  style={{
                    margin: 0,
                    color: isPlaceholder(
                      value
                    )
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