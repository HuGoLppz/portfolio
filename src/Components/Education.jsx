import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { EDUCATION } from "../Data/portfolio";

const Education = () => (
  <section className="section section--alt" id="formacion">
    <div className="wrap">
      <SectionHead
        kicker="Formación"
        title="Mi recorrido académico"
        lead="Dos etapas: la base en desarrollo web y la especialización hacia datos e inteligencia artificial."
      />

      <div className="timeline">
        {EDUCATION.map((item, i) => (
          <Reveal
            key={item.title}
            className="tl"
            delay={i * 100}
          >
            <span
              className={
                "tl__node" +
                (item.status === "next" ? " tl__node--next" : "")
              }
              aria-hidden="true"
            />

            <article className="tl__card">
              <div className="tl__top">
                <h3>{item.title}</h3>

                <span
                  className={
                    "badge " +
                    (item.status === "next"
                      ? "badge--next"
                      : "badge--done")
                  }
                >
                  <span className="badge__dot" aria-hidden="true" />
                  {item.statusText}
                </span>
              </div>

              <p className="tl__meta">
                {item.center} · {item.period}
              </p>

              <p className="tl__desc">{item.description}</p>

              <ul className="taglist">
                {item.tags.map((tag) => (
                  <li className="tag" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Education;
