import { GraduationCap, HeartHandshake, Users, type LucideIcon } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import { ICON_STROKE, PUBLISHER } from "@/lib/site";

const AUDIENCES: { icon: LucideIcon; who: string; text: string; bg: string }[] = [
  {
    icon: GraduationCap, who: "Enseignants", bg: "bg-sky",
    text: "Séquences, boucles, conditions : les notions de l'initiation à la programmation de l'école élémentaire, abordées par le jeu. Chaque niveau tient en quelques minutes et se rejoue autant que nécessaire.",
  },
  {
    icon: Users, who: "Animateurs", bg: "bg-mint",
    text: "Une séance d'1h30 prête à l'emploi, en binôme, sur des postes prêtés ou des tablettes. Rien à installer, et l'espace animateur donne la solution de chaque niveau.",
  },
  {
    icon: HeartHandshake, who: "Parents", bg: "bg-pink",
    text: "Gratuit, sans publicité ni compte obligatoire. La progression reste sur l'appareil ; la sauvegarde en ligne est facultative et ne demande qu'un pseudo.",
  },
];

/** À propos : à qui s'adresse le site, pourquoi il existe et comment nous joindre. */
export default function About() {
  return (
    <section id="a-propos" className="scroll-mt-24 border-t-[3px] border-ink bg-paper px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <h2 className="text-4xl font-bold text-balance sm:text-5xl">À propos de CuboCode</h2>
          <p className="mt-5 text-lg leading-relaxed font-semibold text-ink-soft">
            CuboCode est un outil d&apos;atelier pour les enfants de 6 à 10 ans. L&apos;objectif : leur faire comprendre
            qu&apos;un jeu vidéo est un programme, et qu&apos;ils peuvent en écrire un eux-mêmes, avant même de savoir
            bien lire.
          </p>
          <p className="mt-4 text-lg leading-relaxed font-semibold text-ink-soft">
            La démarche est celle de l&apos;essai-erreur : l&apos;enfant formule une hypothèse, la teste, observe ce que fait
            Cubo et corrige. Il apprend à décomposer un problème en étapes, à repérer ce qui se répète et à anticiper
            avec des conditions. Les consignes sont lues à voix haute et le travail en binôme fait verbaliser le
            raisonnement.
          </p>
          <p className="mt-6 font-bold">
            Une question, une idée de niveau, un retour d&apos;atelier ?{" "}
            <a href={`mailto:${PUBLISHER.contact}`} className="underline decoration-2 underline-offset-2 hover:text-grape">Écrivez-nous</a>.
          </p>
        </Reveal>

        <ul className="grid gap-5">
          {AUDIENCES.map((a, i) => (
            <li key={a.who}>
              <Reveal delay={i * 0.08} className="toon flex gap-4 rounded-3xl bg-cream p-5">
                <span className={`toon grid size-14 shrink-0 place-items-center rounded-2xl ${a.bg}`}>
                  <a.icon size={28} strokeWidth={ICON_STROKE} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold">{a.who}</span>
                  <span className="mt-1 block font-semibold text-ink-soft">{a.text}</span>
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
