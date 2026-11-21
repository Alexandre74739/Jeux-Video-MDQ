// Validation d'un jeu de la création libre ouvert depuis un fichier (.cubocode.json).
// Un fichier partagé n'est pas fiable : on ne garde que des valeurs attendues, et aucune image externe
// (une adresse distante permettrait de suivre l'enfant qui ouvre le fichier).
// Fichier sans import de valeur : testable directement avec Node.
import type { Block } from "./levels";
import type { Project, SpriteDef } from "./runtime";

const MAX_SPRITES = 30;
const MAX_BLOCKS = 2000;
const MAX_DEPTH = 12;

const ID = /^[\w-]{1,40}$/;
/** Image locale de la bibliothèque, ou image importée et réduite sur l'appareil (data:image/…). */
const SAFE_SRC = /^(\/sprites\/[\w-]{1,40}\.svg|data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]{1,400000})$/;

const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function blocks(list: unknown, isBlockType: (t: string) => boolean, depth: number, budget: { left: number }): Block[] {
  if (!Array.isArray(list) || depth > MAX_DEPTH) return [];
  const out: Block[] = [];
  for (const raw of list) {
    if (budget.left-- <= 0) break;
    const b = raw as Record<string, unknown>;
    if (!b || typeof b.type !== "string" || !isBlockType(b.type) || typeof b.id !== "string" || !ID.test(b.id)) continue;
    const params: Block["params"] = {};
    if (b.params && typeof b.params === "object") {
      for (const [k, v] of Object.entries(b.params as Record<string, unknown>).slice(0, 10)) {
        if (!ID.test(k)) continue;
        if (typeof v === "number" && Number.isFinite(v)) params[k] = v;
        else if (typeof v === "string") params[k] = v.slice(0, 80);
      }
    }
    const block: Block = { id: b.id, type: b.type, params };
    if (b.children !== undefined) block.children = blocks(b.children, isBlockType, depth + 1, budget);
    if (b.alt !== undefined) block.alt = blocks(b.alt, isBlockType, depth + 1, budget);
    out.push(block);
  }
  return out;
}

/** Projet propre, ou null si le fichier n'est pas un jeu CuboCode utilisable. */
export function sanitizeProject(x: unknown, isBlockType: (t: string) => boolean, isBackground: (id: string) => boolean): Project | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.sprites)) return null;
  const budget = { left: MAX_BLOCKS };
  const sprites: SpriteDef[] = [];
  for (const raw of o.sprites.slice(0, MAX_SPRITES)) {
    const s = raw as Record<string, unknown>;
    if (!s || typeof s.id !== "string" || !ID.test(s.id) || typeof s.src !== "string" || !SAFE_SRC.test(s.src)) continue;
    sprites.push({
      id: s.id,
      name: text(s.name, 30) || "Personnage",
      src: s.src,
      x: num(s.x, -2000, 4000, 0),
      y: num(s.y, -2000, 4000, 0),
      size: num(s.size, 10, 400, 100),
      scripts: blocks(s.scripts, isBlockType, 0, budget),
    });
  }
  if (!sprites.length) return null;
  const bg = typeof o.bg === "string" && isBackground(o.bg) ? o.bg : "prairie";
  return { bg, sprites };
}
