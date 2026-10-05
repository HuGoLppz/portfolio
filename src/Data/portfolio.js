export const DEFAULT_LOCALE = "es";

export const CONTACT = {
  email: "hugolopezsanz08@gmail.com",
  linkedin: "https://www.linkedin.com/in/hugolopezsanz",
  github: "https://github.com/HuGoLppz",
};

const es = {
  locale: "es",
  language: "Español",
  profile: {
    name: "Hugo López Sanz",
    role: "Desarrollador web",
    focus: "Inteligencia Artificial y Big Data",
    location: "Segovia, España",
    age: "22 años",
    degree: "Técnico Superior en Desarrollo de Aplicaciones Web",
    availability: "Disponible",
    photo: null,
    photoAlt: "Foto de Hugo López Sanz",
  },
  sections: [
    { id: "inicio", label: "Inicio" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "formacion", label: "Formación" },
    { id: "skills", label: "Skills" },
    { id: "proyectos", label: "Proyectos" },
    { id: "contacto", label: "Contacto" },
  ],
  hero: {
    roleConnector: "orientado a",
    intro:
      "Técnico Superior en Desarrollo de Aplicaciones Web, con base en JavaScript, Java, PHP y SQL. Ahora amplío esa base hacia la Inteligencia Artificial y el Big Data, buscando trabajar donde el desarrollo y los datos se encuentran.",
    viewProjects: "Ver proyectos",
    contactMe: "Contactar conmigo",
    profileCardLabel: "Ficha de perfil",
    addPhoto: "[AÑADIR FOTOGRAFÍA]",
    details: {
      location: "Ubicación",
      age: "Edad",
      degree: "Formación",
      focus: "Enfoque actual",
      availability: "Disponibilidad",
    },
  },
  about: {
    kicker: "Sobre mí",
    title: "Del desarrollo web al trabajo con datos",
    paragraphs: [
      "Tengo 22 años y vivo en Segovia, España. Mi punto de partida es el Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web, donde construí la base con la que trabajo hoy: JavaScript, Java, PHP, SQL y el diseño de bases de datos.",
      "Desde entonces he dedicado tiempo a repasar y modernizar esos conocimientos: entender bien los fundamentos antes de acumular herramientas, y ponerlos en práctica con las tecnologías que se utilizan actualmente en el desarrollo web.",
      "Esa revisión me llevó a un terreno que me interesa especialmente: la Inteligencia Artificial y el Big Data. Es la dirección en la que quiero crecer, y por eso he orientado mi formación hacia el análisis de datos y los sistemas inteligentes.",
      "Mi objetivo ahora es incorporarme a un equipo donde poder aportar mi base de desarrollo, seguir aprendiendo y asumir responsabilidades reales.",
    ],
    pillars: [
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
    ],
  },
  education: {
    kicker: "Formación",
    title: "Mi recorrido académico",
    lead: "Dos etapas: la base en desarrollo web y la especialización hacia datos e inteligencia artificial.",
    items: [
      {
        title: "Técnico Superior en Desarrollo de Aplicaciones Web",
        subtitle: "Formación Profesional",
        center: "IES María Moliner",
        period: "2022-2024",
        status: "done",
        statusText: "Formación completada",
        description:
          "Formación especializada en programación, desarrollo de aplicaciones web, desarrollo frontend y backend, y gestión de bases de datos.",
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
        title: "Curso de Especialización en Inteligencia Artificial y Big Data",
        subtitle: "Especialización",
        center: "Instituto Nebrija de Formación Profesional",
        period: "2026-2027",
        status: "next",
        statusText: "En formación",
        description:
          "Especialización orientada al análisis y tratamiento de datos, la inteligencia artificial, el aprendizaje automático y el desarrollo de soluciones basadas en datos.",
        tags: [
          "Inteligencia Artificial",
          "Big Data",
          "Análisis de datos",
          "Machine Learning",
          "Cloud",
          "Automatización",
        ],
      },
    ],
  },
  skills: {
    kicker: "Skills",
    title: "Qué domino y qué estoy aprendiendo",
    lead: "Separo de forma explícita lo que forma parte de mi base de lo que estoy incorporando ahora mismo.",
    baseLabel: "Base adquirida en mi formación",
    learningLabel: "En aprendizaje o actualización",
    baseAriaSuffix: ", base adquirida en mi formación",
    learningAriaSuffix: ", en aprendizaje o actualización",
    groups: [
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
          { name: "Node.js", level: "learning" },
        ],
      },
      {
        group: "Inteligencia Artificial y Big Data",
        icon: "spark",
        items: [
          { name: "Big Data", level: "learning" },
          { name: "Machine Learning", level: "learning" },
          { name: "Análisis de datos", level: "learning" },
          { name: "Automatización", level: "learning" },
          { name: "Python", level: "learning" },
          { name: "Inteligencia Artificial", level: "learning" },
        ],
      },
    ],
  },
  projects: {
    kicker: "Proyectos",
    title: "Trabajos en construcción",
    lead: "Estoy preparando esta sección. Cada ficha se completará con el proyecto, su descripción y los enlaces al código.",
    viewProject: "Ver proyecto",
    repository: "GitHub",
    items: [
      {
        focus: "Aplicación web",
        title: "AutoRRSS",
        description:
          "Aplicación web orientada a la creación de contenido e ideas para redes sociales mediante el uso de inteligencia artificial.",
        tech: ["Inteligencia Artificial", "Redes sociales"],
        url: "",
        repo: "https://github.com/HuGoLppz/AutoRRSS",
      },
      {
        focus: "Aplicación web",
        title: "FinTrack",
        description:
          "Aplicación web para gestionar ingresos y gastos personales y mantener un control sencillo de las finanzas.",
        tech: ["Finanzas", "Gestión personal"],
        url: "",
        repo: "https://github.com/HuGoLppz/FinTrack---Personal-Finance-Manager",
      },
    ],
  },
  contact: {
    kicker: "Contacto",
    title: "Hablemos",
    lead: "Si buscas un perfil junior con base en desarrollo web y ganas de crecer en IA y datos, escríbeme.",
    labels: { email: "Email", linkedin: "LinkedIn", github: "GitHub" },
    ctaTitle: "¿Trabajamos juntos?",
    ctaText:
      "Disponible para prácticas, primer empleo o proyectos en los que aportar y seguir aprendiendo.",
    sendEmail: "Enviar un email",
  },
  navigation: {
    mainLabel: "Navegación principal",
    languageSpanish: "Cambiar a español",
    languageEnglish: "Cambiar a inglés",
    lightTheme: "Activar tema claro",
    darkTheme: "Activar tema oscuro",
    closeMenu: "Cerrar menú",
    openMenu: "Abrir menú",
  },
};

const en = {
  ...es,
  locale: "en",
  language: "English",
  profile: {
    ...es.profile,
    role: "Web Developer",
    focus: "Artificial Intelligence & Big Data",
    location: "Segovia, Spain",
    age: "22 years old",
    degree: "Higher Technician in Web Application Development",
    availability: "Available",
    photoAlt: "Photo of Hugo López Sanz",
  },
  sections: [
    { id: "inicio", label: "Home" },
    { id: "sobre-mi", label: "About me" },
    { id: "formacion", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "proyectos", label: "Projects" },
    { id: "contacto", label: "Contact" },
  ],
  hero: {
    ...es.hero,
    roleConnector: "focused on",
    intro:
      "Higher Technician in Web Application Development, with a foundation in JavaScript, Java, PHP, and SQL. I am now expanding that foundation into Artificial Intelligence and Big Data, seeking to work where development and data meet.",
    viewProjects: "View projects",
    contactMe: "Contact me",
    profileCardLabel: "Profile card",
    addPhoto: "[ADD PHOTO]",
    details: {
      location: "Location",
      age: "Age",
      degree: "Education",
      focus: "Current focus",
      availability: "Availability",
    },
  },
  about: {
    kicker: "About me",
    title: "From web development to data",
    paragraphs: [
      "I am 22 years old and live in Segovia, Spain. My starting point was a Higher Vocational Training Diploma in Web Application Development, where I built the foundation I work with today: JavaScript, Java, PHP, SQL, and database design.",
      "Since then, I have dedicated time to reviewing and updating that knowledge: understanding the fundamentals before accumulating tools, and applying them with the technologies currently used in web development.",
      "That review led me to an area that especially interests me: Artificial Intelligence and Big Data. It is the direction in which I want to grow, which is why I have focused my education on data analysis and intelligent systems.",
      "My goal now is to join a team where I can contribute my development foundation, keep learning, and take on real responsibilities.",
    ],
    pillars: [
      {
        icon: "book",
        title: "Technical foundation",
        text: "Formal training in client- and server-side web development, object-oriented programming, and databases.",
      },
      {
        icon: "trend",
        title: "Continuous learning",
        text: "I keep my knowledge current with the tools and practices used in development today.",
      },
      {
        icon: "layers",
        title: "Next step",
        text: "Specializing in Artificial Intelligence and Big Data to work with data at a larger scale.",
      },
    ],
  },
  education: {
    kicker: "Education",
    title: "My academic path",
    lead: "Two stages: a foundation in web development and a specialization in data and artificial intelligence.",
    items: [
      {
        title: "Higher Technician in Web Application Development",
        subtitle: "Vocational Training",
        center: "IES María Moliner",
        period: "2022-2024",
        status: "done",
        statusText: "Completed",
        description:
          "Specialized training in programming, web application development, frontend and backend development, and database management.",
        tags: [
          "JavaScript",
          "Java",
          "PHP",
          "SQL",
          "Web Development",
          "Databases",
        ],
      },
      {
        title: "Artificial Intelligence and Big Data Specialization Course",
        subtitle: "Specialization",
        center: "Instituto Nebrija de Formación Profesional",
        period: "2026-2027",
        status: "next",
        statusText: "Currently studying",
        description:
          "Specialization focused on data analysis and processing, artificial intelligence, machine learning, and the development of data-driven solutions.",
        tags: [
          "Artificial Intelligence",
          "Big Data",
          "Data Analysis",
          "Machine Learning",
          "Cloud",
          "Automation",
        ],
      },
    ],
  },
  skills: {
    kicker: "Skills",
    title: "What I know and what I am learning",
    lead: "I explicitly distinguish between the skills that are part of my foundation and those I am currently adding.",
    baseLabel: "Foundation acquired during my education",
    learningLabel: "Learning or updating",
    baseAriaSuffix: ", foundation acquired during my education",
    learningAriaSuffix: ", learning or updating",
    groups: [
      {
        group: "Web Development",
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
        group: "Backend & Databases",
        icon: "server",
        items: [
          { name: "Java", level: "base" },
          { name: "PHP", level: "base" },
          { name: "SQL", level: "base" },
          { name: "Databases", level: "base" },
          { name: "Node.js", level: "learning" },
        ],
      },
      {
        group: "Artificial Intelligence & Big Data",
        icon: "spark",
        items: [
          { name: "Big Data", level: "learning" },
          { name: "Machine Learning", level: "learning" },
          { name: "Data Analysis", level: "learning" },
          { name: "Automation", level: "learning" },
          { name: "Python", level: "learning" },
          { name: "Artificial Intelligence", level: "learning" },
        ],
      },
    ],
  },
  projects: {
    kicker: "Projects",
    title: "Work in progress",
    lead: "I am preparing this section. Each card will include the project, its description, and links to the code.",
    viewProject: "View project",
    repository: "GitHub",
    items: [
      {
        focus: "Web Application",
        title: "AutoRRSS",
        description:
          "Web application focused on creating social media content and ideas using artificial intelligence.",
        tech: ["Artificial Intelligence", "Social Media"],
        url: "",
        repo: "https://github.com/HuGoLppz/AutoRRSS",
      },
      {
        focus: "Web Application",
        title: "FinTrack",
        description:
          "Web application for managing personal income and expenses and keeping track of everyday finances.",
        tech: ["Finance", "Personal Management"],
        url: "",
        repo: "https://github.com/HuGoLppz/FinTrack---Personal-Finance-Manager",
      },
    ],
  },
  contact: {
    kicker: "Contact",
    title: "Let's talk",
    lead: "If you are looking for a junior profile with a foundation in web development and the desire to grow in AI and data, get in touch.",
    labels: { email: "Email", linkedin: "LinkedIn", github: "GitHub" },
    ctaTitle: "Shall we work together?",
    ctaText:
      "Available for internships, a first role, or projects where I can contribute and keep learning.",
    sendEmail: "Send an email",
  },
  navigation: {
    mainLabel: "Main navigation",
    languageSpanish: "Switch to Spanish",
    languageEnglish: "Switch to English",
    lightTheme: "Switch to light theme",
    darkTheme: "Switch to dark theme",
    closeMenu: "Close menu",
    openMenu: "Open menu",
  },
};

export const PORTFOLIO = { es, en };
export const getPortfolio = (locale = DEFAULT_LOCALE) =>
  PORTFOLIO[locale] ?? PORTFOLIO[DEFAULT_LOCALE];

// Aliases maintained temporarily while components are migrated to PORTFOLIO.
export const profileES = es.profile;
export const profileEN = en.profile;
export const EDUCATION_ES = es.education.items;
export const EDUCATION_EN = en.education.items;
export const SKILLS_ES = es.skills.groups;
export const SKILLS_EN = en.skills.groups;
export const PROJECTS_ES = es.projects.items;
export const PROJECTS_EN = en.projects.items;
export const SECTIONS_ES = es.sections;
export const SECTIONS_EN = en.sections;
export const PROFILE = es.profile;
export const EDUCATION = es.education.items;
export const SKILLS = es.skills.groups;
export const PROJECTS = es.projects.items;
export const SECTIONS = es.sections;
