import Icon from "../Common/Icon";
import Reveal from "../Common/Reveal";
import SectionHead from "../Common/SectionHead";
const isPlaceholder = (value) =>
  !value || value.trim().startsWith("[");

const Projects = ({ content }) => {
  const { projects } = content;

  return (
  <section className="section section--alt" id="proyectos">
    <div className="wrap">
      <SectionHead
        kicker={projects.kicker}
        title={projects.title}
        lead={projects.lead}
      />

      <div className="projects">
        {projects.items.map((project, i) => (
          <Reveal
            key={i}
            className="project"
            as="article"
            delay={(i % 2) * 90}
          >
            <div className="project__top">
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
                  {projects.viewProject}
                </a>
              ) : (
                <button
                  className="btn btn--primary btn--sm"
                  disabled
                >
                  {projects.viewProject}
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
                  {projects.repository}
                </a>
              ) : (
                <button
                  className="btn btn--ghost btn--sm"
                  disabled
                >
                  <Icon name="github" size={16} />
                  {projects.repository}
                </button>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Projects;
