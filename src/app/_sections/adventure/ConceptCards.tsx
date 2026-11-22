import Reveal from "@/_components/animations/Reveal";
import { BlockView } from "@/_components/game/BlockView";
import { createBlock, type Block } from "@/lib/blocks";

function b(
  type: string,
  params: Block["params"] = {},
  children?: Block[],
): Block {
  const x = createBlock(type);
  return {
    ...x,
    params: { ...x.params, ...params },
    ...(children ? { children } : {}),
  };
}

const CONCEPTS: {
  title: string;
  text: string;
  color: string;
  levels: string;
  sample: Block[];
}[] = [
  {
    title: "Séquence",
    text: "Donner des instructions dans le bon ordre, une par une.",
    color: "bg-sky",
    levels: "Tutoriel",
    sample: [b("avancer"), b("droite"), b("avancer")],
  },
  {
    title: "Actions",
    text: "Agir sur le monde : ramasser, casser, ouvrir, sauter.",
    color: "bg-mint",
    levels: "Vallée des clés",
    sample: [b("ramasser"), b("ouvrir"), b("sauter")],
  },
  {
    title: "Boucles",
    text: "Répéter sans tout réécrire. Le super-pouvoir des codeurs.",
    color: "bg-orange",
    levels: "Volcan",
    sample: [b("repeter", { n: 3 }, [b("avancer"), b("casser")])],
  },
  {
    title: "Conditions",
    text: "Vérifier avant d'agir : SI il y a de la lave, je saute, SINON j'avance.",
    color: "bg-lilac",
    levels: "Labyrinthe du maître",
    sample: [
      { ...b("sisinon", { what: "lave" }, [b("sauter")]), alt: [b("avancer")] },
    ],
  },
];

/** Les quatre notions apprises, chacune avec un exemple de blocs. */
export default function ConceptCards() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {CONCEPTS.map((c, i) => (
        <Reveal
          key={c.title}
          delay={i * 0.08}
          className="toon flex flex-col overflow-hidden rounded-[28px] bg-paper"
        >
          <div className={`border-b-[3px] border-ink px-5 py-4 ${c.color}`}>
            <span className="text-sm font-extrabold">{c.levels}</span>
            <h3 className="text-2xl font-bold">{c.title}</h3>
          </div>
          <p className="px-5 pt-4 font-bold">{c.text}</p>
          <div className="dots m-4 mt-3 flex flex-1 flex-col gap-1.5 rounded-2xl border-2 border-ink/15 p-3">
            {c.sample.map((s) => (
              <BlockView key={s.id} block={s} mode="static" />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
