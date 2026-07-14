export const siteConfig = {
  name: "Fabián Canoni",
  title: "Fabián Canoni | CFO Fractional para dueños de PyMEs",
  description:
    "CFO Fractional. Acompaño a dueños de PyMEs a convertir la información financiera en decisiones claras. Detrás de cada número hay una decisión.",
  url: "https://fabiancanoni.com", // TODO: confirmar dominio definitivo
  locale: "es_AR",
  tagline: "Detrás de cada número hay una decisión.",
  mission:
    "Ayudo a dueños de PyMEs a leer la información financiera en clave de negocio, y a decidir con más claridad.",
  role: "CFO Fractional",
  email: "fcanoni@estudiomartin.com",
  phone: "+54 9 11 6743 4637",
  phoneHref: "tel:+5491167434637",
  whatsapp: "https://wa.me/5491167434637",
  address: "Buenos Aires, Argentina",
  social: {
    linkedin: "https://www.linkedin.com/in/fabiancanoni/",
    instagram: "https://www.instagram.com/fabiancanoni/",
    youtube: "https://www.youtube.com/watch?v=Nf2calxXrms",
    podcast:
      "https://www.youtube.com/playlist?list=PLLrqHplVIBeEYR6AQCZHr1T6at5zPgMeT",
    newsletter:
      "https://www.linkedin.com/newsletters/en-clave-pyme-7462332384512782336/",
  },
} as const;

export const navLinks = [
  { href: "/sobre", label: "Sobre mí" },
  { href: "/servicios", label: "Cómo trabajo" },
  { href: "/en-clave-pyme", label: "Newsletter" },
  { href: "/off-the-record", label: "Podcast" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const highlights = [
  { value: "14+", label: "años con PyMEs" },
  { value: "3.000+", label: "horas de coaching" },
  { value: "CFO", label: "Fractional" },
  { value: "UBA", label: "Lic. en Administración" },
] as const;

export const services = [
  {
    slug: "cfo-fractional",
    title: "CFO Fractional",
    summary: "Tu área financiera, sin estructura fija completa.",
    description:
      "Presupuesto, cash flow, punto de equilibrio, costos y decisiones estratégicas. El CFO que muchas PyMEs necesitan y no pueden sostener a tiempo completo.",
    outcomes: [
      "Presupuesto y proyección",
      "Cash flow y capital de trabajo",
      "Punto de equilibrio y costos",
      "Decisiones con información clara",
    ],
  },
  {
    slug: "planificacion-financiera",
    title: "Planificación financiera",
    summary: "De la contabilidad al lenguaje del negocio.",
    description:
      "Información a tiempo, clara y accionable. Tableros que se usan, tensiones de caja que se anticipan y prioridades que se entienden.",
    outcomes: [
      "Métricas que importan",
      "Anticipación de caja",
      "Priorización de gastos e inversión",
      "Lectura en clave de negocio",
    ],
  },
  {
    slug: "coaching-ejecutivo",
    title: "Coaching + finanzas",
    summary: "Porque el problema casi nunca es solo técnico.",
    description:
      "Planificación concreta con coaching ejecutivo. Acompaño la decisión, no solo el Excel.",
    outcomes: [
      "Claridad para decidir",
      "Conversaciones difíciles",
      "Alineación números y estrategia",
      "Liderazgo financiero del dueño",
    ],
  },
  {
    slug: "charlas-capacitacion",
    title: "Charlas y talleres",
    summary: "Formación práctica para equipos y audiencias.",
    description:
      "Charlas y talleres sobre finanzas para dueños, caja y gestión. Para eventos, empresas y comunidades PyME.",
    outcomes: [
      "Keynotes y paneles",
      "Talleres aplicables",
      "Lenguaje claro",
      "Resultados concretos",
    ],
  },
] as const;

export const about = {
  headline: "Los dueños deciden todos los días. Pocos lo hacen con información clara.",
  intro:
    "Más de 14 años acompañando a empresarios y PyMEs. Mi trabajo es que los números dejen de ser un trámite y pasen a ser una brújula.",
  body: [
    "Trabajo con dueños de PyMEs que tienen un problema concreto: toman decisiones importantes sin información financiera clara.",
    "No porque no sean capaces. Sino porque nadie les tradujo los números a lenguaje de negocio.",
    "Eso es lo que hago desde más de 14 años.",
    "Acompaño a empresarios y emprendedores en el proceso de convertir su contabilidad en una herramienta de decisión real.",
    "Lo hago desde dos lugares: como CFO Fractional, siendo el área financiera que muchas PyMEs no pueden tener internamente. Y como CEO de EMA Group Consultores, donde un equipo de más de 30 profesionales trabaja en finanzas, impuestos, auditoría, payroll y outsourcing administrativo para empresas tanto locales como internacionales.",
    "Mi metodología combina planificación financiera concreta con coaching ejecutivo. Porque detrás de cada número hay una decisión. Y detrás de cada decisión, hay una conversación que vale la pena tener.",
    "Si tenés una PyME y sentís que los números no te hablan con claridad.",
  ],
  credentials: [
    "Licenciado en Administración (UBA)",
    "Coach Ontológico (ICP)",
    "Inversor y Asesor Global de Inversiones (ICB)",
    "Más de 14 años con PyMEs argentinas",
    "Más de 3.000 horas de formación y coaching",
    "Expositor y capacitador en gestión financiera",
  ],
  trajectory:
    "En varios casos ocupé el rol de Director Financiero junto a mis clientes. Trabajé años en el Consejo Profesional de Ciencias Económicas de CABA, donde lideré equipos de más de 80 personas. Docente, coautor de textos universitarios y expositor en capacitación profesional.",
} as const;

export const newsletter = {
  name: "En Clave PyME",
  tagline: "Una idea por semana. Finanzas, decisiones y negocio.",
  description:
    "Sin tecnicismos. Sin vueltas. Para dueños que quieren entender mejor sus números y el contexto en el que operan.",
  youtubeTitle: "Con qué estás comprometido y de qué te vas a hacer cargo.",
  youtubeId: "Nf2calxXrms",
  youtubeEmbedUrl: "https://www.youtube.com/embed/Nf2calxXrms",
  quote:
    "Cuanto menos te necesita tu empresa, más vale. Cuanto más prescindible te hiciste, más alto es tu precio.",
  messages: [
    {
      title: "¿Cuánto vale?",
      text: "No lo que tenés, sino lo que va a generar. Una empresa se paga por la renta futura, no por el inventario.",
    },
    {
      title: "¿Cuánto cuesta salir?",
      text: "Cerrar no es gratis. Indemnizaciones, deudas, impuestos. Una salida desordenada se come años de trabajo.",
    },
  ],
} as const;

export const podcast = {
  name: "Off the Record",
  tagline: "Conversaciones más allá del discurso oficial.",
  description:
    "Negocios, decisiones y lo que pasa detrás de los números. Sin guion rígido. Sin pose.",
  playlistId: "PLLrqHplVIBeEYR6AQCZHr1T6at5zPgMeT",
  playlistUrl:
    "https://www.youtube.com/playlist?list=PLLrqHplVIBeEYR6AQCZHr1T6at5zPgMeT",
  embedUrl:
    "https://www.youtube.com/embed/videoseries?list=PLLrqHplVIBeEYR6AQCZHr1T6at5zPgMeT",
} as const;
