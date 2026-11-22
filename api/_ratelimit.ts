// Limitation du nombre d'appels par adresse IP (fenêtre fixe), stockée dans MongoDB.
// Les compteurs s'effacent seuls grâce à un index TTL sur « expiresAt ».
import type { Db } from "mongodb";

type Hit = { _id: string; count: number; expiresAt: Date };

/** Appels autorisés par adresse IP et par fenêtre de temps, selon l'action. */
export const LIMITS: Record<string, { max: number; windowMs: number }> = {
  check: { max: 60, windowMs: 60_000 },
  create: { max: 5, windowMs: 60 * 60_000 },
  login: { max: 20, windowMs: 15 * 60_000 },
  sync: { max: 120, windowMs: 60_000 },
  logout: { max: 30, windowMs: 60_000 },
  delete: { max: 5, windowMs: 60 * 60_000 },
};

let indexed = false;

/** Adresse IP du visiteur (fournie par Vercel). */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

/** Vrai si l'appel est autorisé ; compte l'appel dans tous les cas. */
export async function allow(
  db: Db,
  action: string,
  ip: string,
): Promise<boolean> {
  const rule = LIMITS[action];
  if (!rule) return true;
  const col = db.collection<Hit>("ratelimits");
  if (!indexed) {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    indexed = true;
  }
  const window = Math.floor(Date.now() / rule.windowMs);
  const hit = await col.findOneAndUpdate(
    { _id: `${action}:${ip}:${window}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((window + 1) * rule.windowMs) },
    },
    { upsert: true, returnDocument: "after" },
  );
  return (hit?.count ?? 0) <= rule.max;
}
