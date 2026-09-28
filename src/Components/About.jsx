import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
const About = ({ content }) => {
  const { about } = content;

  return (
    <section className="section" id="sobre-mi">
      <div className="wrap">
        <SectionHead
          kicker={about.kicker}
          title={about.title}
        />

        <div className="about">
          <Reveal className="about__text">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <div className="pillars">
            {about.pillars.map((p, i) => (
              <Reveal
                key={p.title}
                className="pillar"
                delay={i * 80}
              >
                <span className="pillar__ico" aria-hidden="true">
                  <Icon name={p.icon} size={19} />
                </span>

                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
