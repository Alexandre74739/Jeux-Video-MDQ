import { CloudError } from "@/lib/profiles";

export const ERRORS: Record<string, string> = {
  offline: "Pas de connexion internet. Réessaie quand tu es connecté.",
  unavailable: "La sauvegarde en ligne n'est pas disponible pour le moment.",
  taken: "Ce pseudo est déjà pris. Choisis-en un autre !",
  unknown: "Aucun compte avec ce pseudo. Vérifie l'orthographe.",
  badCode: "Ce n'est pas le bon code secret.",
  badPseudo: "Le pseudo doit faire de 3 à 16 lettres ou chiffres.",
  auth: "Ta connexion a expiré. Reconnecte-toi avec ton pseudo et ton code.",
  tooMany: "Trop de demandes d'un coup. Attends quelques minutes.",
  server: "Oups, un problème est survenu. Réessaie dans un instant.",
};

export function errorText(e: unknown) {
  if (!(e instanceof CloudError)) return ERRORS.server;
  if (e.code === "locked") {
    const min = Number(e.info.retryIn ?? 15);
    return `Trop d'essais ratés. Réessaie dans ${min >= 90 ? `${Math.round(min / 60)} heures` : `${min} minutes`}.`;
  }
  if (e.code === "badCode" && typeof e.info.left === "number") return `Ce n'est pas le bon code secret. Encore ${e.info.left} essai${e.info.left > 1 ? "s" : ""}.`;
  return ERRORS[e.code] ?? ERRORS.server;
}
