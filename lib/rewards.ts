// Récompenses : badges (visibles et secrets) et garde-robe de Cubo débloquée avec les étoiles.
// Fichier sans import de valeur (seulement des types) : lisible par les scripts Node.
import type { Block } from "./levels";

export type Progress = { stars: Record<string, number>; streak: number; badges: string[] };
export const emptyProgress: Progress = { stars: {}, streak: 0, badges: [] };

export const totalStars = (p: Progress) => Object.values(p.stars).reduce((a, n) => a + n, 0);

// ---------------------------------------------------------------- BADGES
/** Contexte d'une victoire, pour savoir quels badges elle débloque. */
export type WinContext = {
  slug: string;
  levelId: number;
  difficulty: number;
  stars: number;
  prevStars: number;
  fails: number;
  used: number;
  optimal: number;
  program: Block[];
  /** Progression après la victoire. */
  after: Progress;
  /** Parcours dont tous les niveaux sont réussis (après la victoire). */
  coursesDone: string[];
};

export type Badge = {
  icon: string;
  name: string;
  text: string;
  /** Badge secret : nom caché tant qu'il n'est pas gagné, un indice est affiché à la place. */
  secret?: boolean;
  hint?: string;
  /** Réussir ce niveau précis (« parcours:numéro »). */
  at?: string;
  check?: (c: WinContext) => boolean;
};

const LOOPS = ["repeter", "jusqua"];
function nestedLoop(list: Block[], inLoop = false): boolean {
  return list.some((b) => {
    const loop = LOOPS.includes(b.type);
    if (loop && inLoop) return true;
    return nestedLoop([...(b.children ?? []), ...(b.alt ?? [])], inLoop || loop);
  });
}

export const BADGES: Record<string, Badge> = {
  first: { icon: "Footprints", name: "Premier pas", text: "Tu as réussi ton premier niveau !", at: "tutoriel:1" },
  loop: { icon: "Repeat", name: "Pro des boucles", text: "Tu maîtrises la boucle « répéter » !", at: "tutoriel:5" },
  student: { icon: "Award", name: "Diplômé", text: "Tu as terminé le tutoriel !", at: "tutoriel:10" },
  keys: { icon: "KeyRound", name: "Maître des clés", text: "Tu as traversé la vallée des clés !", at: "vallee-des-cles:10" },
  volcano: { icon: "Flame", name: "Dompteur de volcan", text: "Tu as vaincu le volcan !", at: "volcan:10" },
  master: { icon: "Crown", name: "Grand maître du code", text: "Tu as résolu le labyrinthe du maître !", at: "labyrinthe:10" },
  legend: { icon: "Palmtree", name: "Légende de l'île", text: "Tu as trouvé le trésor de l'île secrète !", at: "ile-secrete:6" },
  stars30: { icon: "Star", name: "Chasseur d'étoiles", text: "Tu as gagné 30 étoiles !", check: (c) => totalStars(c.after) >= 30 },
  stars60: { icon: "TowerControl", name: "Gardien du phare", text: "60 étoiles : le phare de l'île est allumé !", check: (c) => totalStars(c.after) >= 60 },
  stars100: { icon: "Sparkles", name: "Pluie d'étoiles", text: "Tu as gagné 100 étoiles. Incroyable !", check: (c) => totalStars(c.after) >= 100 },
  map: {
    icon: "Map", name: "Carte complète", text: "Tu as retrouvé les 4 morceaux de la carte au trésor !",
    check: (c) => ["tutoriel", "vallee-des-cles", "volcan", "labyrinthe"].every((s) => c.coursesDone.includes(s)),
  },
  // --- Badges secrets ---
  tenace: {
    icon: "Mountain", name: "Jamais abandonner", text: "Tu as réussi après 3 essais ratés. Quelle persévérance !",
    secret: true, hint: "Ne lâche rien, même quand c'est dur…", check: (c) => c.fails >= 3,
  },
  parfait: {
    icon: "Target", name: "Code parfait", text: "Tu as utilisé exactement le bon nombre de blocs !",
    secret: true, hint: "Pas un bloc de trop, pas un de moins…", check: (c) => c.used === c.optimal && c.optimal >= 4,
  },
  poupee: {
    icon: "Layers", name: "Boucle dans la boucle", text: "Tu as mis une boucle à l'intérieur d'une autre boucle !",
    secret: true, hint: "Une boucle… dans une boucle ?", check: (c) => nestedLoop(c.program),
  },
  retour: {
    icon: "Undo2", name: "Retour gagnant", text: "Tu es revenu sur un niveau pour gagner les 3 étoiles !",
    secret: true, hint: "Reviens améliorer un ancien niveau…", check: (c) => c.prevStars > 0 && c.prevStars < 3 && c.stars === 3,
  },
  malin: {
    icon: "Brain", name: "Plus malin que Cubo", text: "Ta solution est encore plus courte que celle de Cubo !",
    secret: true, hint: "Trouve une solution plus courte que prévu…", check: (c) => c.used < c.optimal,
  },
  eclair: {
    icon: "Zap", name: "Du premier coup !", text: "Tu as réussi un niveau difficile dès le premier essai !",
    secret: true, hint: "Réussis un niveau difficile sans te tromper…", check: (c) => c.difficulty >= 3 && c.fails === 0,
  },
  styliste: {
    icon: "Shirt", name: "Styliste", text: "Tu as changé le look de Cubo !",
    secret: true, hint: "Cubo aimerait bien changer de tenue…",
  },
};

/** Badges débloqués par cette victoire (pas encore possédés). */
export function badgesFor(c: WinContext, owned: string[]): string[] {
  const key = `${c.slug}:${c.levelId}`;
  return Object.entries(BADGES)
    .filter(([k, b]) => !owned.includes(k) && (b.at === key || (b.check?.(c) ?? false)))
    .map(([k]) => k);
}

// ---------------------------------------------------------------- GARDE-ROBE
export type Slot = "color" | "hat" | "trail";
export type Item = { id: string; name: string; stars: number };
export type ColorItem = Item & { faces: [string, string, string] };
export type TrailItem = Item & { colors: string[] };

export const COLORS: ColorItem[] = [
  { id: "orange", name: "Orange", stars: 0, faces: ["#FFB27A", "#FF8A3D", "#E66A1F"] },
  { id: "bleu", name: "Bleu ciel", stars: 4, faces: ["#9EDFFF", "#4FC3F7", "#2A9FD6"] },
  { id: "menthe", name: "Menthe", stars: 10, faces: ["#A8F0C6", "#3DDC97", "#22B377"] },
  { id: "rose", name: "Rose bonbon", stars: 18, faces: ["#FFC2E2", "#FF8FC7", "#E866A8"] },
  { id: "violet", name: "Violet", stars: 28, faces: ["#C9B8FF", "#9B7BFF", "#7356E0"] },
  { id: "rouge", name: "Rouge pompier", stars: 40, faces: ["#FF9C8F", "#FF6B57", "#D9473A"] },
  { id: "nuit", name: "Nuit étoilée", stars: 55, faces: ["#7F7BC0", "#4A4594", "#332F72"] },
  { id: "or", name: "Or", stars: 90, faces: ["#FFE58A", "#FFD23F", "#E0AE10"] },
];

export const HATS: Item[] = [
  { id: "casquette", name: "Casquette d'explorateur", stars: 0 },
  { id: "aucun", name: "Sans chapeau", stars: 0 },
  { id: "helice", name: "Casquette à hélice", stars: 6 },
  { id: "sorcier", name: "Chapeau de sorcier", stars: 14 },
  { id: "cowboy", name: "Chapeau de cow-boy", stars: 24 },
  { id: "pirate", name: "Chapeau de pirate", stars: 34 },
  { id: "couronne", name: "Couronne", stars: 50 },
  { id: "licorne", name: "Corne de licorne", stars: 70 },
];

export const TRAILS: TrailItem[] = [
  { id: "aucune", name: "Aucune", stars: 0, colors: [] },
  { id: "paillettes", name: "Paillettes", stars: 12, colors: ["#FFD23F", "#FFF1BF"] },
  { id: "bulles", name: "Bulles", stars: 22, colors: ["#9EDFFF", "#4FC3F7"] },
  { id: "coeurs", name: "Cœurs", stars: 32, colors: ["#FF8FC7", "#FF6B57"] },
  { id: "arcenciel", name: "Arc-en-ciel", stars: 45, colors: ["#FF6B57", "#FFA94D", "#FFD23F", "#3DDC97", "#4FC3F7", "#9B7BFF"] },
  { id: "flammes", name: "Flammes", stars: 65, colors: ["#FF6A1F", "#FFA94D", "#FFD23F"] },
];

export const SLOTS: Record<Slot, { label: string; items: Item[] }> = {
  color: { label: "Couleurs", items: COLORS },
  hat: { label: "Chapeaux", items: HATS },
  trail: { label: "Traînées", items: TRAILS },
};

export type Outfit = { color: string; hat: string; trail: string };
export const DEFAULT_OUTFIT: Outfit = { color: "orange", hat: "casquette", trail: "aucune" };

export const colorOf = (id: string) => COLORS.find((c) => c.id === id) ?? COLORS[0];
export const trailOf = (id: string) => TRAILS.find((t) => t.id === id) ?? TRAILS[0];

/** Objets débloqués en passant de `before` à `after` étoiles. */
export function newItems(before: number, after: number): { slot: Slot; item: Item }[] {
  return (Object.keys(SLOTS) as Slot[]).flatMap((slot) =>
    SLOTS[slot].items.filter((i) => i.stars > before && i.stars <= after).map((item) => ({ slot, item }))
  );
}

/** Prochain objet à débloquer. */
export function nextItem(stars: number): { slot: Slot; item: Item } | null {
  const all = (Object.keys(SLOTS) as Slot[]).flatMap((slot) => SLOTS[slot].items.map((item) => ({ slot, item })));
  return all.filter((x) => x.item.stars > stars).sort((a, b) => a.item.stars - b.item.stars)[0] ?? null;
}
