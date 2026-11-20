// Catalogue des blocs (aventure + création libre) et outils pour manipuler l'arbre de blocs.
import { newId, type Block } from "./levels";
export type { Block };
export { newId };

export type Category = "event" | "motion" | "action" | "control" | "looks" | "sound" | "score";

export const CATEGORIES: Record<Category, { label: string; color: string; soft: string; icon: string }> = {
  event: { label: "Quand…", color: "#FFD23F", soft: "#FFF1BF", icon: "Zap" },
  motion: { label: "Bouger", color: "#4FC3F7", soft: "#D5F1FD", icon: "Move" },
  action: { label: "Actions", color: "#7BD88F", soft: "#DDF6E2", icon: "Pickaxe" },
  looks: { label: "Apparence", color: "#C3A6FF", soft: "#EDE4FF", icon: "Sparkles" },
  sound: { label: "Sons", color: "#FF8FC7", soft: "#FFE0F0", icon: "Music" },
  control: { label: "Contrôle", color: "#FFA94D", soft: "#FFE6CC", icon: "Repeat" },
  score: { label: "Score", color: "#5EE6C8", soft: "#D3F9EF", icon: "Trophy" },
};

export type ParamDef =
  | { key: string; kind: "number"; def: number; min: number; max: number }
  | { key: string; kind: "select"; def: string; options: { value: string; label: string }[] }
  | { key: string; kind: "text"; def: string }
  | { key: string; kind: "sprite" };

export type BlockDef = {
  type: string;
  category: Category;
  icon?: string;
  /** Texte du bloc ; "{n}" insère le paramètre n. */
  label: string;
  params?: ParamDef[];
  hat?: boolean;
  container?: boolean;
  /** Possède une branche « sinon ». */
  hasElse?: boolean;
};

const CONDITIONS = [
  { value: "eau", label: "eau devant" },
  { value: "rocher", label: "rocher devant" },
  { value: "lave", label: "lave devant" },
  { value: "porte", label: "porte devant" },
  { value: "chemin", label: "chemin devant" },
  { value: "droite", label: "chemin à droite" },
  { value: "gauche", label: "chemin à gauche" },
];

const KEYS = [
  { value: "ArrowRight", label: "→ droite" },
  { value: "ArrowLeft", label: "← gauche" },
  { value: "ArrowUp", label: "↑ haut" },
  { value: "ArrowDown", label: "↓ bas" },
  { value: " ", label: "espace" },
];
const DIRS4 = [
  { value: "right", label: "→" },
  { value: "left", label: "←" },
  { value: "up", label: "↑" },
  { value: "down", label: "↓" },
];
export const SOUNDS = [
  { value: "pop", label: "pop" },
  { value: "coin", label: "pièce" },
  { value: "jump", label: "saut" },
  { value: "boing", label: "boing" },
  { value: "magic", label: "magie" },
  { value: "laser", label: "laser" },
];

export const BLOCKS: Record<string, BlockDef> = {
  // --- Aventure ---
  avancer: { type: "avancer", category: "motion", icon: "ArrowUp", label: "avancer" },
  gauche: { type: "gauche", category: "motion", icon: "CornerUpLeft", label: "tourner à gauche" },
  droite: { type: "droite", category: "motion", icon: "CornerUpRight", label: "tourner à droite" },
  ramasser: { type: "ramasser", category: "action", icon: "Gem", label: "ramasser" },
  casser: { type: "casser", category: "action", icon: "Pickaxe", label: "casser le rocher" },
  pont: { type: "pont", category: "action", icon: "Fence", label: "poser un pont" },
  demitour: { type: "demitour", category: "motion", icon: "Undo2", label: "faire demi-tour" },
  sauter: { type: "sauter", category: "motion", icon: "ChevronsUp", label: "sauter" },
  ouvrir: { type: "ouvrir", category: "action", icon: "KeyRound", label: "ouvrir la porte" },
  jusqua: { type: "jusqua", category: "control", icon: "Repeat2", label: "répéter jusqu'au coffre", container: true },
  repeter: {
    type: "repeter", category: "control", icon: "Repeat", label: "répéter {n} fois", container: true,
    params: [{ key: "n", kind: "number", def: 3, min: 1, max: 20 }],
  },
  si: {
    type: "si", category: "control", icon: "CircleHelp", label: "si {what}", container: true,
    params: [{ key: "what", kind: "select", def: "eau", options: CONDITIONS }],
  },
  sisinon: {
    type: "sisinon", category: "control", icon: "Split", label: "si {what}", container: true, hasElse: true,
    params: [{ key: "what", kind: "select", def: "chemin", options: CONDITIONS }],
  },

  // --- Création libre ---
  ev_start: { type: "ev_start", category: "event", icon: "Play", label: "quand je clique sur Jouer", hat: true, container: true },
  ev_key: {
    type: "ev_key", category: "event", icon: "Keyboard", label: "quand j'appuie sur {key}", hat: true, container: true,
    params: [{ key: "key", kind: "select", def: "ArrowRight", options: KEYS }],
  },
  ev_click: { type: "ev_click", category: "event", icon: "MousePointerClick", label: "quand on clique sur moi", hat: true, container: true },
  ev_touch: {
    type: "ev_touch", category: "event", icon: "Shapes", label: "quand je touche {target}", hat: true, container: true,
    params: [{ key: "target", kind: "sprite" }],
  },
  move: {
    type: "move", category: "motion", icon: "Move", label: "aller {dir} de {n} pas",
    params: [
      { key: "dir", kind: "select", def: "right", options: DIRS4 },
      { key: "n", kind: "number", def: 10, min: 1, max: 200 },
    ],
  },
  random: { type: "random", category: "motion", icon: "Dices", label: "aller à un endroit au hasard" },
  goto_center: { type: "goto_center", category: "motion", icon: "Crosshair", label: "aller au centre" },
  say: {
    type: "say", category: "looks", icon: "MessageCircle", label: "dire {text}",
    params: [{ key: "text", kind: "text", def: "Bonjour !" }],
  },
  grow: { type: "grow", category: "looks", icon: "ZoomIn", label: "grandir" },
  shrink: { type: "shrink", category: "looks", icon: "ZoomOut", label: "rétrécir" },
  hide: { type: "hide", category: "looks", icon: "EyeOff", label: "disparaître" },
  show: { type: "show", category: "looks", icon: "Eye", label: "apparaître" },
  spin: { type: "spin", category: "looks", icon: "RotateCw", label: "faire une pirouette" },
  sound: {
    type: "sound", category: "sound", icon: "Volume2", label: "jouer le son {s}",
    params: [{ key: "s", kind: "select", def: "pop", options: SOUNDS }],
  },
  wait: {
    type: "wait", category: "control", icon: "Hourglass", label: "attendre {n} seconde(s)",
    params: [{ key: "n", kind: "number", def: 1, min: 1, max: 10 }],
  },
  repeat: {
    type: "repeat", category: "control", icon: "Repeat", label: "répéter {n} fois", container: true,
    params: [{ key: "n", kind: "number", def: 5, min: 1, max: 50 }],
  },
  forever: { type: "forever", category: "control", icon: "Infinity", label: "répéter pour toujours", container: true },
  if_touch: {
    type: "if_touch", category: "control", icon: "CircleHelp", label: "si je touche {target}", container: true,
    params: [{ key: "target", kind: "sprite" }],
  },
  score_add: {
    type: "score_add", category: "score", icon: "Star", label: "ajouter {n} au score",
    params: [{ key: "n", kind: "number", def: 1, min: -10, max: 100 }],
  },
  score_reset: { type: "score_reset", category: "score", icon: "RotateCcw", label: "mettre le score à 0" },
  win: { type: "win", category: "score", icon: "Trophy", label: "gagner la partie" },
  lose: { type: "lose", category: "score", icon: "Skull", label: "perdre la partie" },
};

export const FREE_PALETTE: Category[] = ["event", "motion", "looks", "sound", "control", "score"];

export function createBlock(type: string, spriteDefault = ""): Block {
  const def = BLOCKS[type];
  const params: Block["params"] = {};
  for (const p of def.params ?? []) params[p.key] = p.kind === "sprite" ? spriteDefault : p.def;
  return { id: newId(), type, params, ...(def.container ? { children: [] } : {}), ...(def.hasElse ? { alt: [] } : {}) };
}

export function cloneBlock(bl: Block): Block {
  return { ...bl, id: newId(), params: { ...bl.params }, children: bl.children?.map(cloneBlock), alt: bl.alt?.map(cloneBlock) };
}

// ---------- Manipulation de l'arbre ----------
/** Applique f aux listes enfants (children et alt) d'un bloc. */
function mapLists(bl: Block, f: (l: Block[]) => Block[]): Block {
  if (!bl.children && !bl.alt) return bl;
  return { ...bl, ...(bl.children ? { children: f(bl.children) } : {}), ...(bl.alt ? { alt: f(bl.alt) } : {}) };
}

export function removeBlock(list: Block[], id: string): [Block[], Block | null] {
  let found: Block | null = null;
  const walk = (l: Block[]): Block[] =>
    l.flatMap((bl) => {
      if (bl.id === id) { found = bl; return []; }
      return [mapLists(bl, walk)];
    });
  const res = walk(list);
  return [res, found];
}

/** listId : "root", l'id du bloc conteneur, ou "<id>:alt" pour la branche « sinon ». */
export function insertBlock(list: Block[], listId: string, index: number, block: Block): Block[] {
  if (listId === "root") {
    const c = [...list];
    c.splice(index, 0, block);
    return c;
  }
  const isAlt = listId.endsWith(":alt");
  const target = isAlt ? listId.slice(0, -4) : listId;
  return list.map((bl) => {
    if (bl.id === target) {
      const c = [...((isAlt ? bl.alt : bl.children) ?? [])];
      c.splice(index, 0, block);
      return isAlt ? { ...bl, alt: c } : { ...bl, children: c };
    }
    return mapLists(bl, (l) => insertBlock(l, listId, index, block));
  });
}

export function updateParam(list: Block[], id: string, key: string, value: string | number): Block[] {
  return list.map((bl) => {
    if (bl.id === id) return { ...bl, params: { ...bl.params, [key]: value } };
    return mapLists(bl, (l) => updateParam(l, id, key, value));
  });
}
