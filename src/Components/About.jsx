import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { PROFILE } from "../data/portfolio";

const About = () => {
  const pillars = [
    {
      icon: "book",
      title: "Base técnica",
      text: "Formación reglada en desarrollo web de cliente y servidor, programación orientada a objetos y bases de datos.",
    },
    {
      icon: "trend",
      title: "Actualización constante",
      text: "Estoy poniendo al día mis conocimientos con las herramientas y prácticas que se usan hoy en desarrollo.",
    },
    {
      icon: "layers",
      title: "Siguiente paso",
      text: "Especialización en Inteligencia Artificial y Big Data para trabajar con datos a mayor escala.",
    },
  ];

  return (
    <section className="section" id="sobre-mi">
      <div className="wrap">
        <SectionHead
          kicker="Sobre mí"
          title="Del desarrollo web al trabajo con datos"
        />

        <div className="about">
          <Reveal className="about__text">
            <p>
              Tengo {PROFILE.age.replace(" años", "")} años y vivo en{" "}
              {PROFILE.location}. Mi punto de partida es el Ciclo Formativo
              de Grado Superior en Desarrollo de Aplicaciones Web, donde
              construí la base con la que trabajo hoy: JavaScript, Java, PHP,
              SQL y el diseño de bases de datos.
            </p>

            <p>
              Desde entonces he dedicado tiempo a repasar y modernizar esos
              conocimientos: entender bien los fundamentos antes de acumular
              herramientas, y ponerlos en práctica con las tecnologías que se
              utilizan actualmente en el desarrollo web.
            </p>

            <p>
              Esa revisión me llevó a un terreno que me interesa especialmente:
              la Inteligencia Artificial y el Big Data. Es la dirección en la
              que quiero crecer, y por eso he orientado mi formación hacia el
              análisis de datos y los sistemas inteligentes.
            </p>

            <p>
              Mi objetivo ahora es incorporarme a un equipo donde poder aportar
              mi base de desarrollo, seguir aprendiendo y asumir
              responsabilidades reales.
            </p>
          </Reveal>

          <div className="pillars">
            {pillars.map((p, i) => (
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