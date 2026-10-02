import Icon from "./Icon";

const isPlaceholder = (value) => !value || value.trim().startsWith("[");

const Hero = ({ content }) => {
  const { hero, profile } = content;
  return (
    <section className="hero" id="inicio">
      <div className="wrap hero__grid">
        <div>
          <p className="hero__status enter d1">
            <span className="pulse" aria-hidden="true" />

            {profile.statusLine}
          </p>

          <h1 className="hero__name enter d2">{profile.name}</h1>

          <p className="hero__role enter d3">
            {profile.role} {hero.roleConnector} <b>{profile.focus}</b>
          </p>

          <p className="hero__intro enter d4">
            {hero.intro}
          </p>

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

        <aside className="card--profile enter d6" aria-label={hero.profileCardLabel}>
          <div className="photo">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.photoAlt} />
            ) : (
              <div className="photo__empty">
                <Icon name="target" size={22} />

                <span>{hero.addPhoto}</span>
              </div>
            )}
          </div>

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
