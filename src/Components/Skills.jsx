import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { SKILLS } from "../data/portfolio";

const Skills = () => (
  <section className="section" id="skills">
    <div className="wrap">
      <SectionHead
        kicker="Skills"
        title="Qué domino y qué estoy aprendiendo"
        lead="Separo de forma explícita lo que forma parte de mi base de lo que estoy incorporando ahora mismo."
      />

      <Reveal className="legend">
        <span className="legend__item">
          <span className="mark mark--solid" aria-hidden="true" />
          Base adquirida en mi formación
        </span>

        <span className="legend__item">
          <span className="mark mark--open" aria-hidden="true" />
          En aprendizaje o actualización
        </span>
      </Reveal>

      <div className="skills">
        {SKILLS.map((category, i) => (
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
                      ? ", en aprendizaje o actualización"
                      : ", base adquirida en mi formación")
                  }
                  title={
                    skill.level === "learning"
                      ? "En aprendizaje o actualización"
                      : "Base adquirida en mi formación"
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

export default Skills;