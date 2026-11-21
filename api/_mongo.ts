// Outils communs aux fonctions serveur (les fichiers commençant par « _ » ne sont pas exposés par Vercel).

/**
 * Chaîne de connexion MongoDB prête à l'emploi : l'identifiant et le mot de passe sont encodés
 * automatiquement (un mot de passe avec @ : / ? # % est sinon refusé par le pilote).
 */
export function mongoUri(): string | null {
  const raw = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, "");
  if (!raw) return null;
  const m = raw.match(/^(mongodb(?:\+srv)?:\/\/)([^:@/]*):(.*)@([^@]+)$/);
  if (!m) return raw;
  const enc = (s: string) => {
    try { return encodeURIComponent(decodeURIComponent(s)); } catch { return encodeURIComponent(s); }
  };
  return `${m[1]}${enc(m[2])}:${enc(m[3])}@${m[4]}`;
}
