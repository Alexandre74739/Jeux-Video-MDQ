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

/** Même chose pour la session en cours (onglet). */
export function loadSession<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSession(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignoré */
  }
}

export { BADGES, emptyProgress, type Progress } from "./rewards";
