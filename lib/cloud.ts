// Données sauvegardées en ligne : validation et fusion. Partagé par le site et la fonction serveur (api/cloud.ts).
// Fichier sans import de valeur : utilisable côté serveur comme côté navigateur.
import type { Progress } from "./rewards";

/** Ce qui est synchronisé entre les appareils d'un même joueur. */
export type CloudData = {
  progress: Progress;
  /** Scènes de l'histoire déjà vues (« parcours:intro »). */
  story: string[];
  outfit: Record<string, string>;
  /** Date du dernier changement de tenue : la tenue la plus récente gagne. */
  outfitAt: number;
};

export const emptyCloudData = (): CloudData => ({ progress: { stars: {}, streak: 0, badges: [] }, story: [], outfit: {}, outfitAt: 0 });

/** Code secret : 4 chiffres. */
export const CODE_LENGTH = 4;

export const isValidCode = (code: unknown): code is string[] =>
  Array.isArray(code) && code.length === CODE_LENGTH && code.every((c) => typeof c === "string" && /^[0-9]$/.test(c));

/** Avatar par défaut (renard). Un avatar est un personnage de public/sprites, ou une photo gardée sur l'appareil. */
export const DEFAULT_AVATAR = "1f98a";
/** Avatar acceptable en ligne : identifiant de personnage (les photos ne quittent jamais l'appareil). */
export const isSpriteId = (a: unknown): a is string => typeof a === "string" && /^[0-9a-f]{2,6}(-[0-9a-f]{2,6}){0,4}$/.test(a);

/** Pseudo affiché (3 à 16 lettres, chiffres, espaces, - ou _) ou null s'il n'est pas valable. */
export function cleanPseudo(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const p = raw.trim().replace(/\s+/g, " ");
  return /^[\p{L}\p{N} _-]{3,16}$/u.test(p) ? p : null;
}

/** Clé unique d'un pseudo : sans majuscules ni accents (« Léa » et « lea » sont le même compte). */
export const pseudoKey = (p: string) => p.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const ID = /^[a-z0-9-]{1,40}$/;
const int = (n: unknown, max: number) => (typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0);

/** Nettoie des données venues de l'extérieur : seules les valeurs attendues sont gardées. */
export function sanitizeData(x: unknown): CloudData {
  const d = emptyCloudData();
  if (!x || typeof x !== "object") return d;
  const o = x as Record<string, unknown>;
  const p = (o.progress ?? {}) as Record<string, unknown>;
  if (p.stars && typeof p.stars === "object") {
    for (const [k, v] of Object.entries(p.stars as Record<string, unknown>).slice(0, 500)) {
      if (/^[a-z-]{1,40}:\d{1,3}$/.test(k)) d.progress.stars[k] = int(v, 3);
    }
  }
  d.progress.streak = int(p.streak, 100000);
  if (Array.isArray(p.badges)) d.progress.badges = [...new Set(p.badges.filter((b) => typeof b === "string" && ID.test(b)))].slice(0, 100) as string[];
  if (Array.isArray(o.story)) d.story = [...new Set(o.story.filter((s) => typeof s === "string" && /^[a-z-]{1,40}:(intro|outro)$/.test(s)))].slice(0, 100) as string[];
  if (o.outfit && typeof o.outfit === "object") {
    for (const k of ["color", "hat", "face", "back", "trail"]) {
      const v = (o.outfit as Record<string, unknown>)[k];
      if (typeof v === "string" && ID.test(v)) d.outfit[k] = v;
    }
  }
  d.outfitAt = int(o.outfitAt, 8.64e15);
  return d;
}

/** Fusionne deux sauvegardes en gardant le meilleur : on ne perd jamais une étoile ni un badge. */
export function mergeData(a: CloudData, b: CloudData): CloudData {
  const stars: Record<string, number> = { ...a.progress.stars };
  for (const [k, v] of Object.entries(b.progress.stars)) stars[k] = Math.max(stars[k] ?? 0, v);
  const newer = b.outfitAt > a.outfitAt ? b : a;
  return {
    progress: {
      stars,
      streak: Math.max(a.progress.streak, b.progress.streak),
      badges: [...new Set([...a.progress.badges, ...b.progress.badges])],
    },
    story: [...new Set([...a.story, ...b.story])],
    outfit: { ...(newer === a ? b.outfit : a.outfit), ...newer.outfit },
    outfitAt: newer.outfitAt,
  };
}

export const sameData = (a: CloudData, b: CloudData) => JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return [...v].map(sortKeys).sort();
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]));
  return v;
}
