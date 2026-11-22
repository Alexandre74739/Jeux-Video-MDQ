// Joueurs de l'appareil (plusieurs enfants sur le même ordinateur ou la même tablette)
// et synchronisation de la progression avec la sauvegarde en ligne (api/cloud.ts).
"use client";
import { useEffect, useState } from "react";
import {
  CHANGED_EVENT,
  MAIN_PROFILE,
  activeProfileId,
  keyFor,
  load,
  loadGlobal,
  save,
  saveGlobal,
  wipeProfile,
} from "./storage";
import {
  DEFAULT_AVATAR,
  emptyCloudData,
  isSpriteId,
  mergeData,
  sameData,
  sanitizeData,
  type CloudData,
} from "./cloud";
import { emptyProgress, totalStars, type Progress } from "./rewards";

export type CloudLink = { pseudo: string; token: string; syncedAt?: number };
export type Profile = {
  id: string;
  name: string;
  avatar: string;
  cloud?: CloudLink;
};

const PROFILES_EVENT = "cubocode:profiles";
/** Envoyé quand des données du joueur ont été remplacées par une synchronisation : les pages se rechargent. */
export const DATA_EVENT = "cubocode:data";
const OUTFIT_EVENT = "cubocode:outfit";

const DEFAULT_PROFILE: Profile = {
  id: MAIN_PROFILE,
  name: "Joueur 1",
  avatar: DEFAULT_AVATAR,
};

// ---------------------------------------------------------------- Joueurs
export function getProfiles(): Profile[] {
  const list = loadGlobal<Profile[]>("profiles", []);
  return list.length ? list : [DEFAULT_PROFILE];
}

function setProfiles(list: Profile[]) {
  saveGlobal("profiles", list);
  window.dispatchEvent(new Event(PROFILES_EVENT));
}

export function getActiveProfile(): Profile {
  const list = getProfiles();
  return list.find((p) => p.id === activeProfileId()) ?? list[0];
}

export function updateProfile(id: string, patch: Partial<Profile>) {
  setProfiles(getProfiles().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function createProfile(
  name: string,
  avatar: string,
  cloud?: CloudLink,
): Profile {
  const p: Profile = {
    id: Math.random().toString(36).slice(2, 10),
    name: name.trim().slice(0, 16) || "Joueur",
    avatar,
    cloud,
  };
  setProfiles([...getProfiles(), p]);
  return p;
}

/** Change de joueur : toute la page est rechargée pour repartir de ses données. */
export function switchProfile(id: string) {
  saveGlobal("active", id);
  window.location.reload();
}

/**
 * Supprime un joueur de cet appareil : déconnexion de la sauvegarde en ligne (s'il en a une, elle reste
 * disponible sur les autres appareils) puis effacement de ses données locales. Si c'était le dernier joueur,
 * on repart d'un « Joueur 1 » tout neuf.
 * Avec `everywhere`, le compte en ligne est d'abord supprimé définitivement (droit à l'effacement) :
 * en cas d'échec (hors-ligne…), rien n'est effacé et l'erreur est remontée.
 */
export async function deleteProfile(id: string, { everywhere = false } = {}) {
  const p = getProfiles().find((x) => x.id === id);
  if (p?.cloud && everywhere)
    await cloudCall({
      action: "delete",
      pseudo: p.cloud.pseudo,
      token: p.cloud.token,
    });
  else if (p?.cloud)
    await cloudCall({
      action: "logout",
      pseudo: p.cloud.pseudo,
      token: p.cloud.token,
    }).catch(() => {});
  const rest = getProfiles().filter((x) => x.id !== id);
  wipeProfile(id);
  setProfiles(rest);
  if (activeProfileId() === id || !rest.length)
    switchProfile(rest[0]?.id ?? MAIN_PROFILE);
}

/** Étoiles d'un joueur (lues directement dans ses données, même s'il n'est pas le joueur en cours). */
export function starsOf(id: string): number {
  try {
    const raw = window.localStorage.getItem(keyFor("progress", id));
    return totalStars(raw ? (JSON.parse(raw) as Progress) : emptyProgress);
  } catch {
    return 0;
  }
}

/** Joueur en cours et liste des joueurs, mis à jour en direct. */
export function useProfiles() {
  const [state, setState] = useState<{ list: Profile[]; active: Profile }>({
    list: [DEFAULT_PROFILE],
    active: DEFAULT_PROFILE,
  });
  useEffect(() => {
    const upd = () =>
      setState({ list: getProfiles(), active: getActiveProfile() });
    upd();
    window.addEventListener(PROFILES_EVENT, upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener(PROFILES_EVENT, upd);
      window.removeEventListener("storage", upd);
    };
  }, []);
  return state;
}

// ---------------------------------------------------------------- Sauvegarde en ligne
export class CloudError extends Error {
  constructor(
    public code: string,
    public info: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

export async function cloudCall<T = Record<string, unknown>>(
  body: Record<string, unknown>,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch("/api/cloud", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CloudError("offline");
  }
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok)
    throw new CloudError(
      typeof json.error === "string"
        ? json.error
        : res.status === 404
          ? "unavailable"
          : "server",
      json,
    );
  return json as T;
}

/** Données du joueur en cours, au format de la sauvegarde en ligne. */
export function localData(): CloudData {
  return sanitizeData({
    progress: load("progress", emptyProgress),
    story: load("story", []),
    outfit: load("outfit", {}),
    outfitAt: load("outfitAt", 0),
  });
}

/** Remplace les données du joueur en cours (sans relancer de synchronisation) et prévient les pages. */
export function applyData(d: CloudData) {
  save("progress", d.progress, { silent: true });
  save("story", d.story, { silent: true });
  save("outfit", d.outfit, { silent: true });
  save("outfitAt", d.outfitAt, { silent: true });
  window.dispatchEvent(new Event(DATA_EVENT));
  window.dispatchEvent(new Event(OUTFIT_EVENT));
}

export type SyncStatus = "off" | "syncing" | "ok" | "offline" | "error";
let status: SyncStatus = "off";
const statusListeners = new Set<() => void>();
const setStatus = (s: SyncStatus) => {
  status = s;
  statusListeners.forEach((f) => f());
};

export function useSyncStatus() {
  const [s, setS] = useState<SyncStatus>("off");
  useEffect(() => {
    const upd = () => setS(status);
    upd();
    statusListeners.add(upd);
    return () => {
      statusListeners.delete(upd);
    };
  }, []);
  return s;
}

let running: Promise<void> | null = null;
let again = false;

/** Envoie les données du joueur en cours et récupère la version fusionnée (le meilleur des deux). */
export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    do {
      again = false;
      const p = getActiveProfile();
      if (!p.cloud) {
        setStatus("off");
        return;
      }
      setStatus("syncing");
      try {
        const before = localData();
        const { data } = await cloudCall<{ data: unknown }>({
          action: "sync",
          pseudo: p.cloud.pseudo,
          token: p.cloud.token,
          data: before,
        });
        const merged = mergeData(localData(), sanitizeData(data));
        if (!sameData(merged, localData())) applyData(merged);
        updateProfile(p.id, { cloud: { ...p.cloud, syncedAt: Date.now() } });
        setStatus("ok");
      } catch (e) {
        const code = e instanceof CloudError ? e.code : "server";
        if (code === "auth") updateProfile(p.id, { cloud: undefined }); // connexion expirée : il faudra se reconnecter
        setStatus(
          code === "offline" || code === "unavailable" ? "offline" : "error",
        );
      }
    } while (again);
  })().finally(() => {
    running = null;
  });
  return running;
}

let started = false;
/** Synchronise au chargement, après chaque changement (regroupés), au retour du réseau et de l'onglet. */
export function startAutoSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const soon = (ms = 1500) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (getActiveProfile().cloud) void syncNow();
    }, ms);
  };
  window.addEventListener(CHANGED_EVENT, () => soon());
  window.addEventListener("online", () => soon(200));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") soon(200);
  });
  soon(300);
}

/** Crée un compte en ligne pour le joueur en cours, avec sa progression actuelle. */
export async function createAccount(pseudo: string, code: string[]) {
  const p = getActiveProfile();
  const r = await cloudCall<{ token: string; pseudo: string; data: unknown }>({
    action: "create",
    pseudo,
    code,
    avatar: isSpriteId(p.avatar) ? p.avatar : DEFAULT_AVATAR,
    data: localData(),
  });
  updateProfile(p.id, {
    name: r.pseudo,
    cloud: { pseudo: r.pseudo, token: r.token, syncedAt: Date.now() },
  });
  setStatus("ok");
}

/**
 * Nouveau joueur en une seule étape : il est créé sur l'appareil et, si un code secret est choisi,
 * son compte en ligne est créé en même temps (pseudo = son nom). En cas d'échec, rien n'est gardé.
 */
export async function createPlayer(
  name: string,
  avatar: string,
  code?: string[],
) {
  const previous = activeProfileId();
  const p = createProfile(name, avatar);
  if (code) {
    saveGlobal("active", p.id);
    try {
      await createAccount(p.name, code);
    } catch (e) {
      saveGlobal("active", previous);
      setProfiles(getProfiles().filter((x) => x.id !== p.id));
      wipeProfile(p.id);
      throw e;
    }
  }
  switchProfile(p.id);
}

/**
 * Connexion à un compte existant. Si le joueur en cours est tout neuf, on le relie au compte ;
 * sinon on crée un nouveau joueur sur l'appareil pour ne pas mélanger deux enfants.
 */
export async function loginAccount(pseudo: string, code: string[]) {
  const r = await cloudCall<{
    token: string;
    pseudo: string;
    avatar: string;
    data: unknown;
  }>({ action: "login", pseudo, code });
  const link: CloudLink = {
    pseudo: r.pseudo,
    token: r.token,
    syncedAt: Date.now(),
  };
  const current = getActiveProfile();
  const fresh = !current.cloud && totalStars(localData().progress) === 0;
  if (fresh) {
    updateProfile(current.id, { name: r.pseudo, cloud: link });
    applyData(mergeData(localData(), sanitizeData(r.data)));
    setStatus("ok");
    void syncNow();
    return;
  }
  const already = getProfiles().find(
    (p) => p.cloud?.pseudo.toLowerCase() === r.pseudo.toLowerCase(),
  );
  const target = already ?? createProfile(r.pseudo, r.avatar, link);
  if (already) updateProfile(already.id, { cloud: link });
  saveGlobal("active", target.id);
  applyData(mergeData(localData(), sanitizeData(r.data ?? emptyCloudData())));
  window.location.reload();
}

/** Déconnecte le joueur en cours de la sauvegarde en ligne (ses données restent sur l'appareil). */
export async function logoutAccount() {
  const p = getActiveProfile();
  if (!p.cloud) return;
  updateProfile(p.id, { cloud: undefined });
  setStatus("off");
  await cloudCall({
    action: "logout",
    pseudo: p.cloud.pseudo,
    token: p.cloud.token,
  }).catch(() => {});
}
