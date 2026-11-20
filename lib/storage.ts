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

export type Progress = { stars: Record<string, number>; streak: number; badges: string[] };
export const emptyProgress: Progress = { stars: {}, streak: 0, badges: [] };

/** Badges gagnés en réussissant un niveau précis (« parcours:numéro »). */
export const BADGES: Record<string, { icon: string; name: string; text: string; at: string }> = {
  first: { icon: "Footprints", name: "Premier pas", text: "Tu as réussi ton premier niveau !", at: "tutoriel:1" },
  loop: { icon: "Repeat", name: "Pro des boucles", text: "Tu maîtrises la boucle « répéter » !", at: "tutoriel:5" },
  student: { icon: "Award", name: "Diplômé", text: "Tu as terminé le tutoriel !", at: "tutoriel:10" },
  keys: { icon: "KeyRound", name: "Maître des clés", text: "Tu as traversé la vallée des clés !", at: "vallee-des-cles:10" },
  volcano: { icon: "Flame", name: "Dompteur de volcan", text: "Tu as vaincu le volcan !", at: "volcan:10" },
  master: { icon: "Crown", name: "Grand maître du code", text: "Tu as résolu le labyrinthe du maître !", at: "labyrinthe:10" },
};
