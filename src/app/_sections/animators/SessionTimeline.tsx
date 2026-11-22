const TIMELINE = [
  {
    t: "0 – 10 min",
    title: "Découverte",
    text: "On présente Cubo et on fait la démo de l'accueil ensemble.",
    bg: "bg-sun",
  },
  {
    t: "10 – 50 min",
    title: "Les défis",
    text: "Le tutoriel, puis les défis de plus en plus durs, chacun à son rythme.",
    bg: "bg-sky",
  },
  {
    t: "50 – 80 min",
    title: "Création libre",
    text: "Chaque binôme invente son jeu avec ses personnages préférés.",
    bg: "bg-pink",
  },
  {
    t: "80 – 90 min",
    title: "On partage",
    text: "Chacun montre son jeu aux autres et télécharge sa création.",
    bg: "bg-mint",
  },
];

/** Déroulé d'une séance de 1h30, étape par étape. */
export default function SessionTimeline() {
  return (
    <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
      <span
        className="absolute top-8 right-[12%] left-[12%] hidden h-1.5 bg-ink md:block"
        aria-hidden="true"
      />
      {TIMELINE.map((s, i) => (
        <li
          key={s.title}
          className="relative flex flex-col items-center text-center"
        >
          <span
            className={`toon relative z-10 grid size-16 place-items-center rounded-full font-display text-2xl font-bold ${s.bg}`}
          >
            {i + 1}
          </span>
          <span className="mt-3 rounded-full bg-ink px-3 py-0.5 text-sm font-bold text-white">
            {s.t}
          </span>
          <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
          <p className="mt-1 font-semibold text-ink-soft">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
