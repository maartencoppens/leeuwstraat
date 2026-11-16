// All interface text. Texts marked TODO are functional placeholders that still need approval.
export const nl = {
  meta: {
    title: "Leeuwstraat Experience Festival",
    // TODO: final description from the communication team.
    description: "Experience Festival op Campus Leeuwstraat, 23 januari 2027.",
    siteName: "Leeuwstraat Experience Festival",
  },

  header: {
    logoAlt: "Leeuwstraat Experience Festival",
  },

  window: {
    // TODO: label for screen readers, to be approved.
    label: "Glasraam van Lee",
  },

  story: {
    /** Screen reader label of a clickable story shard. */
    open: (title: string) => `Lees het verhaal: ${title}`,
    close: "Sluiten",
  },

  countdown: {
    label: "Tijd tot het festival",
    units: { days: "dagen", hours: "uren", minutes: "min", seconds: "sec" },
    /** Screen reader text, read once a day instead of every second. */
    remaining: (days: number) =>
      days === 1 ? "Nog 1 dag" : `Nog ${days} dagen`,
  },

  signup: {
    label: "E-mailadres",
    placeholder: "E-mailadres",
    button: "Hou mij op de hoogte",
    // TODO: the free-drink note comes back once the team confirms it.
    notes: ["Je kan je altijd uitschrijven."],
    // Shown while no e-mail provider is connected (same text as the old site).
    unavailable: "Inschrijven is nog niet mogelijk.",
    // TODO: confirmation and error texts, to be approved.
    success: "Je bent ingeschreven.",
    error: "Dat lukte niet. Probeer het later opnieuw.",
  },

  footer: {
    links: [
      // TODO: Privacy and Contact come back once the team has settled them.
      {
        label: "Arteveldehogeschool",
        href: "https://www.arteveldehogeschool.be",
      },
    ],
    date: "23 januari 2027",
  },

  visual: {
    title: "Glasraam · projectie",
    qrLabel: "QR-code naar lee-uwstraat.be/raam",
  },

  sponsors: {
    meta: {
      title: "Sponsors · Leeuwstraat Experience Festival",
      // TODO: final description from the communication team.
      description:
        "Maak het Experience Festival op Campus Leeuwstraat mee mogelijk.",
    },
    // From the reference design.
    eyebrow: "Sponsoring",
    title: "Maak dit verhaal mee mogelijk",
    intro:
      "Op 23 januari 2027 brengen we de verhalen van Campus Leeuwstraat en de buurt tot leven met interactieve installaties. Met jouw steun maken we er een bijzondere ervaring van.",
    whyTitle: "Waarom sponsoren?",
    reasons: [
      {
        icon: "eye",
        title: "Zichtbaarheid",
        text: "Je zaak of merk krijgt een plekje in onze communicatie en op het festival.",
      },
      {
        icon: "people",
        title: "Steun aan jong talent",
        text: "Je helpt studenten om hun creatieve ideeën werkelijkheid te maken.",
      },
      {
        icon: "handshake",
        title: "Samen voor de buurt",
        text: "Je draagt bij aan een bijzonder afscheid van Campus Leeuwstraat, samen met de buurt.",
      },
    ],
    note: "Sponsoren kan met een financiële bijdrage, materiaal of andere ondersteuning.",
    // From the reference design.
    footer: "23 januari 2027 — Campus Leeuwstraat, Gent",
  },
} as const;
