import type { Mood } from "@/_components/ui/Cubo";
import { BLOCKS, type Category } from "@/lib/blocks";
import { COURSES, type Step } from "@/lib/levels";
import type { Progress } from "@/lib/rewards";
import type { SfxName } from "@/lib/sound";
import { CHEERS } from "@/lib/lines";

/** Message de Cubo : texte affiché, humeur et phrases lues à voix haute. */
export type Msg = { text: string; mood: Mood; say: string[] };
export const msgOf = (say: string[], mood: Mood): Msg => ({
  text: say.join(" "),
  mood,
  say,
});

/** Parcours entièrement réussis. */
export const coursesDone = (p: Progress) =>
  COURSES.filter((c) =>
    c.levels.every((l) => p.stars[`${c.slug}:${l.id}`]),
  ).map((c) => c.slug);

/** Son joué à chaque pas du programme. */
export const STEP_SFX: Partial<Record<Step["kind"], SfxName>> = {
  move: "step",
  turn: "turn",
  collect: "gem",
  break: "crack",
  bridge: "plank",
  bump: "bump",
  splash: "splash",
  nothing: "click",
  key: "coin",
  open: "magic",
  jump: "jump",
  burn: "fail",
  hit: "crack",
  wait: "turn",
  caught: "boing",
};

/** Durée d'un pas (ms, vitesse normale) : le temps de voir l'animation correspondante. */
const STEP_MS: Partial<Record<Step["kind"], number>> = {
  check: 320,
  turn: 380,
  splash: 900,
  burn: 900,
  jump: 700,
  caught: 900,
  win: 300,
};
export const stepDelay = (kind: Step["kind"]) => STEP_MS[kind] ?? 560;

/** Une seule famille de blocs dans les défis, triés : mouvements, actions, puis contrôle. */
export function groupsFor(types: string[]) {
  const order: Category[] = ["motion", "action", "control"];
  return [
    {
      category: order[0],
      types: [...types].sort(
        (a, b) =>
          order.indexOf(BLOCKS[a].category) - order.indexOf(BLOCKS[b].category),
      ),
    },
  ];
}

/** Encouragement au hasard pour fêter la victoire. */
export const randomCheer = () =>
  CHEERS[Math.floor(Math.random() * CHEERS.length)];
