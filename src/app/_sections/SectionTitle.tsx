import Reveal from "@/_components/animations/Reveal";

/** Titre de section de l'accueil, avec une phrase d'introduction facultative. `light` : texte blanc sur fond foncé. */
export default function SectionTitle({ title, intro, light = false }: { title: string; intro?: string; light?: boolean }) {
  return (
    <Reveal className="text-center">
      <h2 className={`mx-auto max-w-4xl text-4xl font-bold text-balance sm:text-5xl ${light ? "text-white" : ""}`}>{title}</h2>
      {intro && <p className={`mx-auto mt-4 max-w-2xl text-lg font-semibold ${light ? "text-white/85" : "text-ink-soft"}`}>{intro}</p>}
    </Reveal>
  );
}
