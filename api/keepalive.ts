// Appelée chaque jour par une tâche planifiée Vercel (voir "crons" dans vercel.json).
// Une connexion quotidienne empêche MongoDB Atlas (offre gratuite) de mettre la base en pause
// après 30 jours sans activité, par exemple pendant les vacances scolaires.
import { MongoClient } from "mongodb";
import { mongoUri } from "./_mongo";

export async function GET(): Promise<Response> {
  const uri = mongoUri();
  if (!uri) return Response.json({ ok: false, error: "MONGODB_URI manquant" }, { status: 503 });
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    await client.db("cubocode").command({ ping: 1 });
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  } finally {
    await client.close().catch(() => {});
  }
}
