// Serveur local des fonctions de api/ (sauvegarde en ligne) pendant le développement.
// Lancé par « npm run dev » sur le port 3001 ; Next redirige /api/* vers lui (voir next.config.ts).
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import * as cloud from "../api/cloud";
import * as keepalive from "../api/keepalive";

// Lecture de .env « brute » : un mot de passe peut contenir # (que les chargeurs habituels prennent pour un commentaire).
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
}

type Handler = (req: Request) => Promise<Response>;
const ROUTES: Record<string, Record<string, Handler>> = {
  "/api/cloud": cloud as unknown as Record<string, Handler>,
  "/api/keepalive": keepalive as unknown as Record<string, Handler>,
};
const PORT = 3001;

createServer(async (req, res) => {
  const path = (req.url ?? "/").split("?")[0].replace(/\/+$/, "");
  const handler = ROUTES[path]?.[req.method ?? "GET"];
  if (!handler) { res.writeHead(404, { "content-type": "application/json" }); res.end('{"error":"notFound"}'); return; }
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const hasBody = !["GET", "HEAD"].includes(req.method ?? "GET");
  try {
    const r = await handler(new Request(`http://localhost:${PORT}${req.url}`, {
      method: req.method, headers: { "content-type": String(req.headers["content-type"] ?? "application/json") },
      body: hasBody ? Buffer.concat(chunks) : undefined,
    }));
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end('{"error":"server"}');
  }
}).listen(PORT, () => {
  console.log(`API locale prête sur http://localhost:${PORT} (MONGODB_URI ${process.env.MONGODB_URI ? "trouvée" : "MANQUANTE : ajoute-la dans .env"})`);
});
