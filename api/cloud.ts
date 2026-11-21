// Fonction serveur Vercel : comptes joueurs et sauvegarde en ligne (MongoDB Atlas).
// La chaîne de connexion est lue dans la variable d'environnement MONGODB_URI (jamais envoyée au navigateur).
//
// POST /api/cloud  { action, ... }
//   check  { pseudo }                         → { free }
//   create { pseudo, code, avatar, data }     → { token, pseudo, avatar, data }
//   login  { pseudo, code }                   → { token, pseudo, avatar, data }
//   sync   { pseudo, token, data }            → { data }      (fusion « on garde le meilleur »)
//   logout { pseudo, token }                  → { ok }
//   delete { pseudo, token }                  → { ok }        (droit à l'effacement)
import type { Collection } from "mongodb";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { database, json } from "./_mongo.js";
import { allow, clientIp } from "./_ratelimit.js";
import {
  DEFAULT_AVATAR, cleanPseudo, emptyCloudData, isSpriteId, isValidCode, mergeData, pseudoKey, sanitizeData,
  type CloudData,
} from "../src/lib/cloud.js";

type Account = {
  _id: string; // pseudo sans accents ni majuscules
  pseudo: string;
  avatar: string;
  salt: string;
  hash: string;
  tokens: { h: string; at: Date }[];
  data: CloudData;
  /** Essais de code en cours (réservés avant la vérification, voir login). */
  fails: number;
  /** Nombre de verrouillages successifs : chaque nouveau verrouillage dure deux fois plus longtemps. */
  locks?: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const MAX_LOCK_MS = 24 * 60 * 60_000;
const MAX_TOKENS = 10;
/** Une connexion inutilisée pendant 6 mois expire. */
const TOKEN_TTL_MS = 180 * 24 * 60 * 60_000;
/** Un compte inactif pendant 12 mois est supprimé automatiquement (durée de conservation RGPD). */
const RETENTION_S = 365 * 24 * 60 * 60;

let indexed = false;
async function accounts(): Promise<Collection<Account>> {
  const col = (await database()).collection<Account>("accounts");
  if (!indexed) {
    await col.createIndex({ updatedAt: 1 }, { expireAfterSeconds: RETENTION_S });
    indexed = true;
  }
  return col;
}

const hashCode = (code: string[], salt: string) => scryptSync(code.join("-"), salt, 32).toString("hex");
const hashToken = (t: unknown) => (typeof t === "string" && t ? createHash("sha256").update(t).digest("hex") : "");
const sameHex = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
const lockMs = (locks: number) => Math.min(MAX_LOCK_MS, LOCK_MS * 2 ** locks);
const minutesLeft = (until: Date) => Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60_000));

/** Jeton valide (non expiré) du compte, cherché par son empreinte. */
const validToken = (acc: Account, h: string) =>
  !!h && acc.tokens.some((t) => t.h === h && Date.now() - new Date(t.at).getTime() < TOKEN_TTL_MS);

async function newToken(col: Collection<Account>, id: string) {
  const token = randomBytes(24).toString("hex");
  await col.updateOne({ _id: id }, { $push: { tokens: { $each: [{ h: hashToken(token), at: new Date() }], $slice: -MAX_TOKENS } } });
  return token;
}

/** Refuse les appels venant d'un autre site (les navigateurs envoient toujours l'en-tête Origin en POST). */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host")); } catch { return false; }
}

export async function POST(req: Request): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ error: "badRequest" }, 415);
  const raw = await req.text();
  if (raw.length > 60_000) return json({ error: "tooBig" }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ error: "badRequest" }, 400); }

  const pseudo = cleanPseudo(body.pseudo);
  if (!pseudo) return json({ error: "badPseudo" }, 400);
  const id = pseudoKey(pseudo);
  const action = String(body.action);

  let col: Collection<Account>;
  try {
    col = await accounts();
    if (!(await allow(await database(), action, clientIp(req)))) return json({ error: "tooMany" }, 429);
  } catch {
    return json({ error: "unavailable" }, 503);
  }

  try {
    switch (action) {
      case "check":
        return json({ free: !(await col.findOne({ _id: id }, { projection: { _id: 1 } })) });

      case "create": {
        if (!isValidCode(body.code)) return json({ error: "badCode" }, 400);
        const avatar = isSpriteId(body.avatar) ? body.avatar : DEFAULT_AVATAR;
        const salt = randomBytes(16).toString("hex");
        const data = sanitizeData(body.data);
        const now = new Date();
        try {
          await col.insertOne({
            _id: id, pseudo, avatar, salt, hash: hashCode(body.code, salt), tokens: [], data,
            fails: 0, locks: 0, lockUntil: null, createdAt: now, updatedAt: now,
          });
        } catch (e) {
          if ((e as { code?: number }).code === 11000) return json({ error: "taken" }, 409);
          throw e;
        }
        return json({ token: await newToken(col, id), pseudo, avatar, data });
      }

      case "login": {
        if (!isValidCode(body.code)) return json({ error: "badCode" }, 400);
        // L'essai est réservé AVANT la vérification, en une seule opération atomique :
        // des requêtes envoyées en parallèle ne peuvent pas dépasser MAX_FAILS essais.
        const now = new Date();
        const acc = await col.findOneAndUpdate(
          { _id: id, fails: { $lt: MAX_FAILS }, $or: [{ lockUntil: null }, { lockUntil: { $lte: now } }] },
          { $inc: { fails: 1 } },
          { returnDocument: "after" },
        );
        if (!acc) {
          const existing = await col.findOne({ _id: id }, { projection: { lockUntil: 1 } });
          if (!existing) return json({ error: "unknown" }, 404);
          return json({ error: "locked", retryIn: existing.lockUntil ? minutesLeft(existing.lockUntil) : LOCK_MS / 60_000 }, 429);
        }
        if (!sameHex(hashCode(body.code, acc.salt), acc.hash)) {
          if (acc.fails < MAX_FAILS) return json({ error: "badCode", left: MAX_FAILS - acc.fails }, 401);
          const until = new Date(Date.now() + lockMs(acc.locks ?? 0));
          await col.updateOne({ _id: id }, { $set: { fails: 0, lockUntil: until }, $inc: { locks: 1 } });
          return json({ error: "locked", retryIn: minutesLeft(until) }, 429);
        }
        await col.updateOne({ _id: id }, { $set: { fails: 0, locks: 0, lockUntil: null, updatedAt: new Date() } });
        return json({ token: await newToken(col, id), pseudo: acc.pseudo, avatar: acc.avatar, data: acc.data ?? emptyCloudData() });
      }

      case "sync": {
        const acc = await col.findOne({ _id: id });
        const h = hashToken(body.token);
        if (!acc || !validToken(acc, h)) return json({ error: "auth" }, 401);
        const data = mergeData(sanitizeData(acc.data), sanitizeData(body.data));
        const now = new Date();
        await col.updateOne({ _id: id, "tokens.h": h }, { $set: { data, updatedAt: now, "tokens.$.at": now } });
        return json({ data });
      }

      case "logout": {
        await col.updateOne({ _id: id }, { $pull: { tokens: { h: hashToken(body.token) } } });
        return json({ ok: true });
      }

      case "delete": {
        const acc = await col.findOne({ _id: id });
        if (!acc || !validToken(acc, hashToken(body.token))) return json({ error: "auth" }, 401);
        await col.deleteOne({ _id: id });
        return json({ ok: true });
      }

      default:
        return json({ error: "badRequest" }, 400);
    }
  } catch {
    return json({ error: "server" }, 500);
  }
}
