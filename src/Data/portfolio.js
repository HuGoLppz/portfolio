export const PROFILE = {
  name: "Hugo López",
  initials: "HL",
  role: "Desarrollador web",
  focus: "Inteligencia Artificial y Big Data",
  location: "Segovia, España",
  age: "22 años",
  degree: "Técnico Superior en DAW",
  availability: "[AÑADIR DISPONIBILIDAD]",
  statusLine:
    "Abierto a oportunidades en el sector tecnológico",

  photo: null,

  photoAlt: "Fotografía de Hugo López",
};

export const CONTACT = {
  email: "[AÑADIR EMAIL]",
  linkedin: "[AÑADIR LINKEDIN]",
  github: "[AÑADIR GITHUB]",
};

export const EDUCATION = [
  {
    title:
      "Técnico Superior en Desarrollo de Aplicaciones Web",
    subtitle: "DAW",
    center: "[AÑADIR CENTRO]",
    period: "[AÑADIR AÑOS]",
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
    center: "[AÑADIR CENTRO]",
    period: "[AÑADIR AÑOS]",
    status: "next",
    statusText:
      "En formación / próxima formación",
    description:
      "Especialización orientada al tratamiento de datos y a los sistemas inteligentes. Áreas del programa:",
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
    ],
  },

  {
    group: "IA y datos",
    icon: "spark",
    items: [
      {
        name: "Inteligencia Artificial",
        level: "learning",
      },
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
    ],
  },
];

export const PROJECTS = [
  {
    focus: "Desarrollo web",
    title: "[Nombre del proyecto]",
    description:
      "[Añadir descripción del proyecto]",
    tech: ["[Tecnología]", "[Tecnología]"],
    url: null,
    repo: null,
  },

  {
    focus: "Inteligencia Artificial",
    title: "[Nombre del proyecto]",
    description:
      "[Añadir descripción del proyecto]",
    tech: ["[Tecnología]", "[Tecnología]"],
    url: null,
    repo: null,
  },

  {
    focus: "Automatización",
    title: "[Nombre del proyecto]",
    description:
      "[Añadir descripción del proyecto]",
    tech: ["[Tecnología]", "[Tecnología]"],
    url: null,
    repo: null,
  },

  {
    focus: "Aplicación",
    title: "[Nombre del proyecto]",
    description:
      "[Añadir descripción del proyecto]",
    tech: ["[Tecnología]", "[Tecnología]"],
    url: null,
    repo: null,
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