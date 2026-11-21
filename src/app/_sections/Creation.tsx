import Image from "next/image";
import { Download, ImagePlus, Music, Palette, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import { BlockView } from "@/_components/game/BlockView";
import ButtonLink from "@/_components/ui/ButtonLink";
import { createBlock, type Block } from "@/lib/blocks";
import { BACKGROUNDS } from "@/lib/runtime";
import { ICON_STROKE } from "@/lib/site";
import LIBRARY from "@/lib/sprites.json";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Sparkles, title: `${LIBRARY.length} personnages`, text: "Animaux, héros, véhicules, nature…" },
  { icon: ImagePlus, title: "Tes propres images", text: "Importe un dessin ou une photo." },
  { icon: Palette, title: `${BACKGROUNDS.length} décors`, text: "Ciel, espace, océan, désert…" },
  { icon: Music, title: "Des sons rigolos", text: "Pièce, saut, boing, laser…" },
  { icon: Trophy, title: "Score et victoire", text: "Ajoute des points, gagne ou perds." },
  { icon: Download, title: "Garde ton jeu", text: "Télécharge-le pour le rejouer chez toi." },
];

const block = (type: string, params: Block["params"], children?: Block[]): Block => {
  const x = createBlock(type);
  return { ...x, params: { ...x.params, ...params }, ...(children ? { children } : {}) };
};
const EXAMPLE = block("ev_key", { key: "ArrowRight" }, [block("move", { dir: "right", n: 10 })]);

export default function Creation() {
  return (
    <section id="creer" className="scroll-mt-24 border-y-[3px] border-ink bg-pink/40 px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-4xl font-bold sm:text-5xl">Invente ton propre jeu</h2>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            Fais bouger tes personnages avec les flèches du clavier, attrape des étoiles, compte les points… Tu décides des règles.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="toon grid size-12 shrink-0 place-items-center rounded-2xl bg-paper"><f.icon size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /></span>
                <span>
                  <span className="block font-display text-lg font-bold">{f.title}</span>
                  <span className="font-semibold text-ink-soft">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8"><ButtonLink href="/creer/"><Palette size={24} strokeWidth={ICON_STROKE} aria-hidden="true" /> Créer mon jeu</ButtonLink></div>
        </Reveal>

        <Reveal className="relative">
          <div className="toon overflow-hidden rounded-[28px] bg-paper shadow-pop-xl">
            <Image
              src="/screens/creer.webp" width={1298} height={757} sizes="(min-width: 1024px) 560px, 100vw"
              alt="Le studio de création libre : la scène avec un robot et une étoile, la liste des personnages et les blocs « quand j'appuie sur → droite, aller de 12 pas »."
              className="h-auto w-full"
            />
          </div>
          <div className="absolute -bottom-10 -left-4 hidden -rotate-3 sm:block">
            <BlockView mode="static" block={EXAMPLE} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
