import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { PROJECTS } from "../data/portfolio";

const isPlaceholder = (value) =>
  !value || value.trim().startsWith("[");

const Projects = () => (
  <section className="section section--alt" id="proyectos">
    <div className="wrap">
      <SectionHead
        kicker="Proyectos"
        title="Trabajos en construcción"
        lead="Estoy preparando esta sección. Cada ficha se completará con el proyecto, su descripción y los enlaces al código."
      />

      <div className="projects">
        {PROJECTS.map((project, i) => (
          <Reveal
            key={i}
            className="project"
            as="article"
            delay={(i % 2) * 90}
          >
            <div className="project__top">
              <span className="project__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="project__focus">
                {project.focus}
              </span>
            </div>

            <h3
              className={
                isPlaceholder(project.title)
                  ? "is-empty"
                  : ""
              }
            >
              {project.title}
            </h3>

            <p className="project__desc">
              {project.description}
            </p>

            <ul className="taglist">
              {project.tech.map((technology, k) => (
                <li className="tag" key={k}>
                  {technology}
                </li>
              ))}
            </ul>

            <div className="project__foot">
              {project.url ? (
                <a
                  className="btn btn--primary btn--sm"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver proyecto
                </a>
              ) : (
                <button
                  className="btn btn--primary btn--sm"
                  disabled
                >
                  Ver proyecto
                </button>
              )}

              {project.repo ? (
                <a
                  className="btn btn--ghost btn--sm"
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" size={16} />
                  GitHub
                </a>
              ) : (
                <button
                  className="btn btn--ghost btn--sm"
                  disabled
                >
                  <Icon name="github" size={16} />
                  GitHub
                </button>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Projects;