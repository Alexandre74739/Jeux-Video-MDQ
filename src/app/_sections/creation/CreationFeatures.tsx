import {
  Download,
  ImagePlus,
  Music,
  Palette,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { BACKGROUNDS } from "@/lib/runtime";
import { ICON_STROKE } from "@/lib/site";
import LIBRARY from "@/lib/sprites.json";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: `${LIBRARY.length} personnages`,
    text: "Animaux, héros, véhicules, nature…",
  },
  {
    icon: ImagePlus,
    title: "Tes propres images",
    text: "Importe un dessin ou une photo.",
  },
  {
    icon: Palette,
    title: `${BACKGROUNDS.length} décors`,
    text: "Ciel, espace, océan, désert…",
  },
  {
    icon: Music,
    title: "Des sons rigolos",
    text: "Pièce, saut, boing, laser…",
  },
  {
    icon: Trophy,
    title: "Score et victoire",
    text: "Ajoute des points, gagne ou perds.",
  },
  {
    icon: Download,
    title: "Garde ton jeu",
    text: "Télécharge-le pour le rejouer chez toi.",
  },
];

/** Ce que l'on peut faire dans la création libre. */
export default function CreationFeatures() {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {FEATURES.map((f) => (
        <li key={f.title} className="flex gap-3">
          <span className="toon grid size-12 shrink-0 place-items-center rounded-2xl bg-paper">
            <f.icon size={24} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold">
              {f.title}
            </span>
            <span className="font-semibold text-ink-soft">{f.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
