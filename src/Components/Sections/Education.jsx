import Icon from "../Common/Icon";
import Reveal from "../Common/Reveal";
import SectionHead from "../Common/SectionHead";
const Education = ({ content }) => {
  const { education } = content;

  return (
  <section className="section section--alt" id="formacion">
    <div className="wrap">
      <SectionHead
        kicker={education.kicker}
        title={education.title}
        lead={education.lead}
      />

      <div className="timeline">
        {education.items.map((item, i) => (
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
};

export default Education;
