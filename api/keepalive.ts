// Appelée chaque jour par une tâche planifiée Vercel (voir "crons" dans vercel.json).
// Une connexion quotidienne empêche MongoDB Atlas (offre gratuite) de mettre la base en pause
// après 30 jours sans activité, par exemple pendant les vacances scolaires.
// Vercel envoie « Authorization: Bearer <CRON_SECRET> » : tout autre appel est refusé.
import { database, json } from "./_mongo";

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return json({ ok: false }, 401);
  try {
    await (await database()).command({ ping: 1 });
    return json({ ok: true, at: new Date().toISOString() });
  } catch {
    return json({ ok: false }, 503);
  }
}
