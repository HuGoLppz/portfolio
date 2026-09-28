import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
const Skills = ({ content }) => {
  const { skills } = content;

  return (
  <section className="section" id="skills">
    <div className="wrap">
      <SectionHead
        kicker={skills.kicker}
        title={skills.title}
        lead={skills.lead}
      />

      <Reveal className="legend">
        <span className="legend__item">
          <span className="mark mark--solid" aria-hidden="true" />
          {skills.baseLabel}
        </span>

        <span className="legend__item">
          <span className="mark mark--open" aria-hidden="true" />
          {skills.learningLabel}
        </span>
      </Reveal>

      <div className="skills">
        {skills.groups.map((category, i) => (
          <Reveal
            key={category.group}
            className="skillcard"
            delay={i * 90}
          >
            <div className="skillcard__head">
              <span className="skillcard__ico" aria-hidden="true">
                <Icon name={category.icon} size={18} />
              </span>

              <h3>{category.group}</h3>
            </div>

            <ul className="chips">
              {category.items.map((skill) => (
                <li
                  className={
                    "chip" +
                    (skill.level === "learning"
                      ? " chip--learning"
                      : "")
                  }
                  key={skill.name}
                  aria-label={
                    skill.name +
                    (skill.level === "learning"
                      ? skills.learningAriaSuffix
                      : skills.baseAriaSuffix)
                  }
                  title={
                    skill.level === "learning"
                      ? skills.learningLabel
                      : skills.baseLabel
                  }
                >
                  <span
                    className={
                      "mark " +
                      (skill.level === "learning"
                        ? "mark--open"
                        : "mark--solid")
                    }
                    aria-hidden="true"
                  />

                  {skill.name}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Skills;
