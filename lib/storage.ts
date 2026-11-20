// Accès sûr au localStorage (peut être bloqué ou vide).
const PREFIX = "cubocode:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* stockage plein ou bloqué : on continue sans sauvegarde */
  }
}

export type Progress = { stars: Record<number, number>; streak: number; badges: string[] };
export const emptyProgress: Progress = { stars: {}, streak: 0, badges: [] };

export const BADGES: Record<string, { icon: string; name: string; text: string; level: number }> = {
  first: { icon: "Footprints", name: "Premier pas", text: "Tu as réussi ton premier niveau !", level: 1 },
  gems: { icon: "Gem", name: "Chasseur de gemmes", text: "Tu sais utiliser les actions !", level: 4 },
  loop: { icon: "Repeat", name: "Pro des boucles", text: "Tu maîtrises la boucle « répéter » !", level: 5 },
  builder: { icon: "Fence", name: "Bâtisseur", text: "Tu as construit ton premier pont !", level: 7 },
  master: { icon: "Crown", name: "Maître du code", text: "Tu as fini toute l'aventure !", level: 10 },
};
