export const PROFILE = {
  name: "Hugo López Sanz",
  initials: "H",
  role: "Desarrollador web",
  focus: "Inteligencia Artificial y Big Data",
  location: "Segovia, España",
  age: "22 años",
  degree: "Técnico Superior en DAW",
  availability: "Total",
  statusLine: "Abierto a oportunidades en el sector tecnológico",
  photo: null,
  photoAlt: "Mi foto",
};

export const CONTACT = {
  email: "hugolopezsanz08@gmail.com",
  linkedin: "https://www.linkedin.com/in/hugolopezsanz",
  github: "https://github.com/HuGoLppz",
};

export const EDUCATION = [
  {
    title:
      "Técnico Superior en Desarrollo de Aplicaciones Web",
    subtitle: "DAW",
    center: "IES María Moliner",
    period: "2022-2024",
    status: "done",
    statusText: "Formación completada",
    description:
      "Base de la formación: programación, desarrollo web de cliente y servidor, y gestión de bases de datos.",
    tags: [
      "JavaScript",
      "Java",
      "PHP",
      "SQL",
      "Desarrollo web",
      "Bases de datos",
    ],
  },

  {
    title:
      "Curso de Especialización en Inteligencia Artificial y Big Data",
    subtitle: "Especialización",
    center: "Instituto Nebrija de Formación Profesional",
    period: "2026-2027",
    status: "next",
    statusText:
      "En formación / próxima formación",
    description:
      "Especialización orientada al tratamiento de datos y a los sistemas inteligentes",
    tags: [
      "Inteligencia Artificial",
      "Big Data",
      "Análisis de datos",
      "Machine Learning",
      "Tecnologías cloud",
      "Automatización",
    ],
  },
];

export const SKILLS = [
  {
    group: "Desarrollo web",
    icon: "code",
    items: [
      { name: "HTML", level: "base" },
      { name: "CSS", level: "base" },
      { name: "JavaScript", level: "base" },
      { name: "Responsive Design", level: "base" },
      { name: "React", level: "learning" },
    ],
  },

  {
    group: "Backend y bases de datos",
    icon: "server",
    items: [
      { name: "Java", level: "base" },
      { name: "PHP", level: "base" },
      { name: "SQL", level: "base" },
      { name: "Bases de datos", level: "base" },
      { name: "Node", level: "learning" },
    ],
  },

  {
    group: "IA y Big Data",
    icon: "spark",
    items: [
      
      {
        name: "Big Data",
        level: "learning",
      },
      {
        name: "Machine Learning",
        level: "learning",
      },
      {
        name: "Análisis de datos",
        level: "learning",
      },
      {
        name: "Automatización",
        level: "learning",
      },
      {
        name: "Python",
        level: "learning",
      },
      {
        name: "Inteligencia Artificial",
        level: "learning",
      },
    ],
  },
];

export const PROJECTS = [
  {
    focus: "Aplicación",
    title: "AutoRRSS",
    description:
      "Aplicación web para poder crear temas para tus redes sociales",
    tech: ["Redes sociales", "IA"],
    url: "",
    repo: "https://github.com/HuGoLppz/AutoRRSS",
  },
  {
    focus: "Aplicación",
    title: "FinTrack - Personal Finance Manager",
    description:
      "Aplicación web para controlar los ingresos y gastos",
    tech: ["Finanzas", "Personal"],
    url: "",
    repo: "https://github.com/HuGoLppz/FinTrack---Personal-Finance-Manager",
  },
];

export const SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "formacion", label: "Formación" },
  { id: "skills", label: "Skills" },
  { id: "proyectos", label: "Proyectos" },
  { id: "contacto", label: "Contacto" },
];