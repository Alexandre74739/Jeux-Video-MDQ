import { Flame, Lock } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import { BlockView } from "@/_components/game/BlockView";
import { Icon, StarIcon } from "@/_components/icons/Icon";
import { createBlock, type Block } from "@/lib/blocks";
import { BADGES } from "@/lib/rewards";
import { ICON_STROKE } from "@/lib/site";
import SectionTitle from "./SectionTitle";
import CoursePath from "./CoursePath";

/** Badges montrés en exemple (les autres sont à découvrir en jouant). */
const BADGE_SAMPLE = 5;

function b(type: string, params: Block["params"] = {}, children?: Block[]): Block {
  const x = createBlock(type);
  return { ...x, params: { ...x.params, ...params }, ...(children ? { children } : {}) };
}

const CONCEPTS: { title: string; text: string; color: string; levels: string; sample: Block[] }[] = [
  { title: "Séquence", text: "Donner des instructions dans le bon ordre, une par une.", color: "bg-sky", levels: "Tutoriel", sample: [b("avancer"), b("droite"), b("avancer")] },
  { title: "Actions", text: "Agir sur le monde : ramasser, casser, ouvrir, sauter.", color: "bg-mint", levels: "Vallée des clés", sample: [b("ramasser"), b("ouvrir"), b("sauter")] },
  { title: "Boucles", text: "Répéter sans tout réécrire. Le super-pouvoir des codeurs.", color: "bg-orange", levels: "Volcan", sample: [b("repeter", { n: 3 }, [b("avancer"), b("casser")])] },
  { title: "Conditions", text: "Vérifier avant d'agir : SI il y a de la lave, je saute, SINON j'avance.", color: "bg-lilac", levels: "Labyrinthe du maître", sample: [{ ...b("sisinon", { what: "lave" }, [b("sauter")]), alt: [b("avancer")] }] },
];

export default function Adventure() {
  const sample = Object.entries(BADGES).filter(([, bd]) => !bd.secret && !bd.at?.startsWith("ile-secrete")).slice(0, BADGE_SAMPLE);
  return (
    <section id="aventure" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionTitle
        title="Ce que l'enfant apprend"
        intro="Chaque parcours enchaîne des niveaux de plus en plus difficiles, qui se débloquent l'un après l'autre. Par exemple, le tutoriel :"
      />
      <CoursePath />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONCEPTS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08} className="toon flex flex-col overflow-hidden rounded-[28px] bg-paper">
            <div className={`border-b-[3px] border-ink px-5 py-4 ${c.color}`}>
              <span className="text-sm font-extrabold">{c.levels}</span>
              <h3 className="text-2xl font-bold">{c.title}</h3>
            </div>
            <p className="px-5 pt-4 font-bold">{c.text}</p>
            <div className="dots m-4 mt-3 flex flex-1 flex-col gap-1.5 rounded-2xl border-2 border-ink/15 p-3">
              {c.sample.map((s) => <BlockView key={s.id} block={s} mode="static" />)}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="toon mt-14 grid items-center gap-8 rounded-4xl bg-sun p-8 md:grid-cols-[1fr_1.3fr]">
        <div>
          <h3 className="text-3xl font-bold">Gagne des étoiles et des badges</h3>
          <p className="mt-2 text-lg font-bold">
            Jusqu&apos;à 3 étoiles par niveau : moins tu utilises de blocs, plus tu en gagnes. Enchaîne les réussites
            du premier coup pour faire grimper ta flamme.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="toon flex items-center gap-1 rounded-full bg-paper px-4 py-2" aria-label="3 étoiles">
            {[0, 1, 2].map((i) => <StarIcon key={i} size={34} />)}
          </div>
          <div className="toon flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-display text-2xl font-bold">
            <Flame size={30} strokeWidth={ICON_STROKE} fill="#FFD23F" aria-hidden="true" /> 5
          </div>
          {sample.map(([k, bd]) => (
            <span key={k} title={bd.name} className="grid size-14 place-items-center rounded-full border-[3px] border-ink bg-lilac shadow-pop">
              <Icon name={bd.icon} size={26} />
              <span className="sr-only">{bd.name}</span>
            </span>
          ))}
          <span title="Badge secret" className="grid size-14 place-items-center rounded-full border-[3px] border-ink bg-grape text-white shadow-pop">
            <Lock size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /><span className="sr-only">Badge secret</span>
          </span>
          <span className="toon rounded-full bg-paper px-4 py-2 font-display text-lg font-bold">
            + {Object.keys(BADGES).length - BADGE_SAMPLE - 1} badges à découvrir
          </span>
        </div>
      </Reveal>
    </section>
  );
}
