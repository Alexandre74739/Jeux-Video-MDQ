// Outils communs aux fonctions serveur (les fichiers commençant par « _ » ne sont pas exposés par Vercel).
import { MongoClient, type Db } from "mongodb";

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

// Connexion réutilisée d'un appel à l'autre tant que la fonction reste « chaude ».
let client: Promise<MongoClient> | null = null;

export async function database(): Promise<Db> {
  const uri = mongoUri();
  if (!uri) throw new Error("MONGODB_URI manquant");
  client ??= new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 6000 })
    .connect()
    .catch((e) => { client = null; throw e; });
  return (await client).db("cubocode");
}

/** Réponse JSON jamais mise en cache. */
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
