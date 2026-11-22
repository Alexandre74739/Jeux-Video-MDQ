import type { Category } from "@/lib/blocks";

/** Familles de blocs de la création libre, dans l'ordre de la palette. */
export const GROUPS: { category: Category; types: string[] }[] = [
  { category: "event", types: ["ev_start", "ev_key", "ev_click", "ev_touch"] },
  {
    category: "motion",
    types: [
      "avancer",
      "gauche",
      "droite",
      "demitour",
      "sauter",
      "move",
      "random",
      "goto_center",
    ],
  },
  {
    category: "action",
    types: ["ramasser", "casser", "ouvrir", "pont", "frapper"],
  },
  {
    category: "looks",
    types: ["say", "grow", "shrink", "spin", "hide", "show"],
  },
  { category: "sound", types: ["sound"] },
  {
    category: "control",
    types: [
      "wait",
      "attendre",
      "repeat",
      "forever",
      "jusqua",
      "if_touch",
      "si",
      "sisinon",
    ],
  },
  { category: "score", types: ["score_add", "score_reset", "win", "lose"] },
];
