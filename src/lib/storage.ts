// Accès sûr au localStorage (peut être bloqué ou vide).
// Les données de jeu (progression, histoire, tenue, programmes, création libre) sont rangées par joueur :
// le joueur d'origine « main » garde les clés historiques, les autres ont le préfixe « u:<id>: ».
const PREFIX = "cubocode:";
export const MAIN_PROFILE = "main";

/** Données propres à chaque joueur. */
const PER_PLAYER = new Set([
  "progress",
  "story",
  "outfit",
  "outfitAt",
  "project",
  "streak",
]);
/** Données sauvegardées en ligne : un changement déclenche une synchronisation. */
const SYNCED = new Set(["progress", "story", "outfit", "outfitAt"]);
export const CHANGED_EVENT = "cubocode:changed";

const perPlayer = (key: string) =>
  PER_PLAYER.has(key) || key.startsWith("prog:");

/** Joueur en cours sur cet appareil. */
export function activeProfileId(): string {
  try {
    const raw = window.localStorage.getItem(PREFIX + "active");
    return raw ? (JSON.parse(raw) as string) : MAIN_PROFILE;
  } catch {
    return MAIN_PROFILE;
  }
}

/** Clé réelle d'une donnée, pour un joueur donné (le joueur en cours par défaut). */
export function keyFor(key: string, profile = activeProfileId()) {
  return perPlayer(key) && profile !== MAIN_PROFILE
    ? `${PREFIX}u:${profile}:${key}`
    : PREFIX + key;
}

function read<T>(store: Storage, full: string, fallback: T): T {
  try {
    const raw = store.getItem(full);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return read(window.localStorage, keyFor(key), fallback);
}

export function save(key: string, value: unknown, { silent = false } = {}) {
  try {
    window.localStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch {
    /* stockage plein ou bloqué : on continue sans sauvegarde */
  }
  if (!silent && SYNCED.has(key))
    window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Efface toutes les données de jeu d'un joueur sur cet appareil (les réglages communs sont gardés). */
export function wipeProfile(profile: string) {
  try {
    for (const store of [window.localStorage, window.sessionStorage]) {
      const keys = Object.keys(store);
      const doomed =
        profile === MAIN_PROFILE
          ? keys.filter(
              (k) => k.startsWith(PREFIX) && perPlayer(k.slice(PREFIX.length)),
            )
          : keys.filter((k) => k.startsWith(`${PREFIX}u:${profile}:`));
      doomed.forEach((k) => store.removeItem(k));
    }
  } catch {
    /* ignoré */
  }
}

/** Même chose pour la session en cours (onglet). */
export function loadSession<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return read(window.sessionStorage, keyFor(key), fallback);
}

export function saveSession(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch {
    /* ignoré */
  }
}

/** Réglages communs à l'appareil (liste des joueurs, joueur actif…), jamais rangés par joueur. */
export function loadGlobal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return read(window.localStorage, PREFIX + key, fallback);
}

export function saveGlobal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignoré */
  }
}

export { BADGES, emptyProgress, type Progress } from "./rewards";
