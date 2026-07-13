/**
 * Catálogo de imágenes — orientación real y uso permitido.
 * Regla: no repetir la misma foto en dos secciones visibles.
 * Newsletter gráfico: object-fit contain.
 * Avatar circular: solo portrait-circle en .avatar-circle.
 */

export const images = {
  /** Home hero */
  hero: {
    src: "/images/speaking-1660.jpg",
    alt: "Fabián Canoni hablando en un evento profesional",
    width: 2000,
    height: 1333,
    position: "68% 26%",
  },

  /** Home banda speaker */
  speakerBand: {
    src: "/images/stage-room.jpg",
    alt: "Fabián Canoni presentando ante una audiencia en un auditorio moderno",
    width: 1024,
    height: 683,
    position: "72% 40%",
  },

  /** Home intro */
  portraitWarm: {
    src: "/images/portrait-smile.jpg",
    alt: "Retrato de Fabián Canoni",
    width: 960,
    height: 1280,
    position: "50% 10%",
  },

  /** Sobre — cuerpo */
  portraitSpeak: {
    src: "/images/speaking-1671.jpg",
    alt: "Fabián Canoni durante una presentación",
    width: 1067,
    height: 1600,
    position: "50% 16%",
  },

  /** Contacto hero */
  portraitSpeakAlt: {
    src: "/images/speaking-1673.jpg",
    alt: "Fabián Canoni capacitando en un evento",
    width: 1067,
    height: 1600,
    position: "48% 14%",
  },

  /** Off the Record hero — portrait con aire (cabeza completa) */
  podcastHero: {
    src: "/images/podcast-portrait.jpg",
    alt: "Fabián Canoni hablando con micrófono en una presentación",
    width: 1000,
    height: 1250,
    position: "58% 10%",
  },

  /** Contacto aside / escena */
  portraitStage: {
    src: "/images/portrait-stage.jpg",
    alt: "Fabián Canoni en el escenario durante una presentación",
    width: 933,
    height: 1400,
    position: "50% 18%",
  },

  /** Micrófono close — solo cards chicas, no heroes */
  portraitMic: {
    src: "/images/portrait-mic.jpg",
    alt: "Fabián Canoni hablando frente a un micrófono",
    width: 640,
    height: 960,
    position: "45% 18%",
  },

  /** Sobre hero — gesto en escena (encuadre completo) */
  portraitGesture: {
    src: "/images/portrait-gesture.jpg",
    alt: "Fabián Canoni enfatizando un punto durante una presentación",
    width: 1024,
    height: 1536,
    position: "52% 16%",
  },

  /** Crop muy cerrado — no usar en heroes */
  portraitCloseAlt: {
    src: "/images/portrait-close-alt.jpg",
    alt: "Fabián Canoni con micrófono durante una charla PyME",
    width: 1100,
    height: 2227,
    position: "50% 12%",
  },

  /** Servicios hero */
  stageTalk: {
    src: "/images/stage-talk.jpg",
    alt: "Fabián Canoni hablando ante una audiencia con micrófono",
    width: 1024,
    height: 683,
    position: "72% 35%",
  },

  /** Newsletter body */
  stageGesture: {
    src: "/images/stage-gesture.jpg",
    alt: "Fabián Canoni presentando sobre planificación financiera",
    width: 1024,
    height: 683,
    position: "70% 32%",
  },

  /** Sobre strip */
  stageClose: {
    src: "/images/stage-close.jpg",
    alt: "Fabián Canoni en el escenario con presentación de finanzas",
    width: 1024,
    height: 683,
    position: "70% 35%",
  },
  stageAudience: {
    src: "/images/stage-audience.jpg",
    alt: "Vista de la audiencia durante una presentación de Fabián Canoni",
    width: 1024,
    height: 683,
    position: "55% 45%",
  },
  stageWideA: {
    src: "/images/stage-wide-a.jpg",
    alt: "Vista amplia de una charla de Fabián Canoni",
    width: 1024,
    height: 576,
    position: "65% 40%",
  },

  /** Sobre — bloque en escena (landscape, distinto al hero) */
  stageMid: {
    src: "/images/stage-mid.jpg",
    alt: "Fabián Canoni presentando ante la audiencia",
    width: 1024,
    height: 683,
    position: "68% 38%",
  },

  /** Podcast hero — frame YouTube ep.1 */
  otrFrameEp1: {
    src: "/images/social-otr-frame-ep1.jpg",
    alt: "Off the Record — episodio con Emilio Mata",
    width: 1280,
    height: 720,
    position: "28% 42%",
  },

  /** Podcast body */
  stageExit: {
    src: "/images/stage-exit.jpg",
    alt: "Fabián Canoni en una charla sobre salida estratégica",
    width: 1024,
    height: 683,
    position: "70% 40%",
  },

  /** Home card podcast — frame YouTube ep.2 */
  otrFrameEp2: {
    src: "/images/social-otr-frame-ep2.jpg",
    alt: "Off the Record — conversación con invitado",
    width: 1280,
    height: 720,
    position: "50% 40%",
  },

  /** Newsletter hero — miniatura YouTube canal */
  ytFeatured: {
    src: "/images/social-yt-featured.jpg",
    alt: "Fabián Canoni en charla: ¿Con qué estás comprometido?",
    width: 1280,
    height: 720,
    position: "50% 50%",
  },

  /** Newsletter hero — versión con aire superior (cabeza completa) */
  newsletterHero: {
    src: "/images/newsletter-hero.jpg",
    alt: "Fabián Canoni en charla: ¿Con qué estás comprometido?",
    width: 1400,
    height: 1120,
    position: "50% 20%",
  },

  /** Home card newsletter */
  newsletter: {
    src: "/images/brand-newsletter.png",
    alt: "Pieza de En Clave PyME: ¿Cuánto vale tu empresa?",
    width: 1114,
    height: 627,
  },

  avatar: {
    src: "/images/portrait-circle.png",
    alt: "Fabián Canoni",
    width: 792,
    height: 741,
  },

  credentials: [
    {
      src: "/images/cred-handshake.jpg",
      alt: "Reconocimiento institucional — entrega de diploma",
      width: 1200,
      height: 808,
      position: "50% 35%",
      orient: "landscape" as const,
    },
    {
      src: "/images/cred-diploma.jpg",
      alt: "Fabián Canoni con diploma en ceremonia formal",
      width: 1200,
      height: 808,
      position: "42% 30%",
      orient: "landscape" as const,
    },
    {
      src: "/images/cred-podium.jpg",
      alt: "Fabián Canoni en el podio en un acto institucional",
      width: 1200,
      height: 900,
      position: "40% 30%",
      orient: "landscape" as const,
    },
    {
      src: "/images/cred-graduate.jpg",
      alt: "Fabián Canoni con diploma tras una certificación",
      width: 562,
      height: 1000,
      position: "50% 20%",
      orient: "portrait" as const,
    },
  ],
} as const;
