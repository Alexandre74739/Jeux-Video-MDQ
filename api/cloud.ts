// Fonction serveur Vercel : comptes joueurs et sauvegarde en ligne (MongoDB Atlas).
// La chaîne de connexion est lue dans la variable d'environnement MONGODB_URI (jamais envoyée au navigateur).
//
// POST /api/cloud  { action, ... }
//   check  { pseudo }                         → { free }
//   create { pseudo, code, avatar, data }     → { token, pseudo, avatar, data }
//   login  { pseudo, code }                   → { token, pseudo, avatar, data }
//   sync   { pseudo, token, data }            → { data }      (fusion « on garde le meilleur »)
//   logout { pseudo, token }                  → { ok }
import { MongoClient, type Collection } from "mongodb";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mongoUri } from "./_mongo";
import { DEFAULT_AVATAR, cleanPseudo, emptyCloudData, isSpriteId, isValidCode, mergeData, pseudoKey, sanitizeData, type CloudData } from "../lib/cloud";

type Account = {
  _id: string; // pseudo sans accents ni majuscules
  pseudo: string;
  avatar: string;
  salt: string;
  hash: string;
  tokens: { h: string; at: Date }[];
  data: CloudData;
  fails: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const MAX_TOKENS = 10;

// Connexion réutilisée d'un appel à l'autre tant que la fonction reste « chaude ».
let client: Promise<MongoClient> | null = null;
async function accounts(): Promise<Collection<Account>> {
  const uri = mongoUri();
  if (!uri) throw new Error("MONGODB_URI manquant");
  client ??= new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 6000 }).connect().catch((e) => { client = null; throw e; });
  return (await client).db("cubocode").collection<Account>("accounts");
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const hashCode = (code: string[], salt: string) => scryptSync(code.join("-"), salt, 32).toString("hex");
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const sameHex = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));

async function newToken(col: Collection<Account>, id: string) {
  const token = randomBytes(24).toString("hex");
  await col.updateOne({ _id: id }, { $push: { tokens: { $each: [{ h: hashToken(token), at: new Date() }], $slice: -MAX_TOKENS } } });
  return token;
}

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (raw.length > 60_000) return json({ error: "tooBig" }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ error: "badRequest" }, 400); }

  const pseudo = cleanPseudo(body.pseudo);
  if (!pseudo) return json({ error: "badPseudo" }, 400);
  const id = pseudoKey(pseudo);

  let col: Collection<Account>;
  try { col = await accounts(); } catch { return json({ error: "unavailable" }, 503); }

  try {
    switch (body.action) {
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
            fails: 0, lockUntil: null, createdAt: now, updatedAt: now,
          });
        } catch (e) {
          if ((e as { code?: number }).code === 11000) return json({ error: "taken" }, 409);
          throw e;
        }
        return json({ token: await newToken(col, id), pseudo, avatar, data });
      }

      case "login": {
        if (!isValidCode(body.code)) return json({ error: "badCode" }, 400);
        const acc = await col.findOne({ _id: id });
        if (!acc) return json({ error: "unknown" }, 404);
        if (acc.lockUntil && acc.lockUntil.getTime() > Date.now()) {
          return json({ error: "locked", retryIn: Math.ceil((acc.lockUntil.getTime() - Date.now()) / 60000) }, 429);
        }
        if (!sameHex(hashCode(body.code, acc.salt), acc.hash)) {
          const fails = acc.fails + 1;
          const lock = fails >= MAX_FAILS;
          await col.updateOne({ _id: id }, { $set: { fails: lock ? 0 : fails, lockUntil: lock ? new Date(Date.now() + LOCK_MS) : null } });
          return json(lock ? { error: "locked", retryIn: LOCK_MS / 60000 } : { error: "badCode", left: MAX_FAILS - fails }, lock ? 429 : 401);
        }
        await col.updateOne({ _id: id }, { $set: { fails: 0, lockUntil: null } });
        return json({ token: await newToken(col, id), pseudo: acc.pseudo, avatar: acc.avatar, data: acc.data ?? emptyCloudData() });
      }

      case "sync": {
        const acc = await col.findOne({ _id: id });
        const token = typeof body.token === "string" ? hashToken(body.token) : "";
        if (!acc || !acc.tokens.some((t) => t.h === token)) return json({ error: "auth" }, 401);
        const data = mergeData(sanitizeData(acc.data), sanitizeData(body.data));
        await col.updateOne({ _id: id }, { $set: { data, updatedAt: new Date() } });
        return json({ data });
      }

      case "logout": {
        const token = typeof body.token === "string" ? hashToken(body.token) : "";
        await col.updateOne({ _id: id }, { $pull: { tokens: { h: token } } });
        return json({ ok: true });
      }

      default:
        return json({ error: "badRequest" }, 400);
    }
  } catch {
    return json({ error: "server" }, 500);
  }
}
