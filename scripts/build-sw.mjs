// Génère out/sw.js avec la liste complète des fichiers du site,
// pour que tout soit mis en cache dès la première visite (mode hors-ligne).
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";

const OUT = "out";
const files = [];
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk(OUT);

// Next 16 écrit "route/__next.route/__PAGE__.txt" mais le navigateur demande
// "route/__next.route.__PAGE__.txt" : on crée la copie « à plat » attendue.
import { copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
for (const f of [...files]) {
  const parts = f.split(sep);
  const i = parts.findIndex((p) => p.startsWith("__next."));
  if (i === -1 || i === parts.length - 1) continue;
  const flat = join(...parts.slice(0, i), parts.slice(i).join("."));
  if (!existsSync(flat)) {
    await copyFile(f, flat);
    files.push(flat);
  }
}

files.sort();
const hash = createHash("sha1");
const urls = [];
// Fichiers légers mis en cache dès la première visite ; le reste (3D, images) quand l'enfant commence à jouer.
const CORE_MAX = 150 * 1024;
const core = [];
for (const f of files) {
  const rel = "/" + relative(OUT, f).split(sep).join("/");
  if (rel === "/sw.js" || rel === "/404.html") continue;
  // Voix : seule la voix choisie est téléchargée, en arrière-plan (warmVoice dans lib/sound.ts).
  if (rel.startsWith("/voice/")) continue;
  hash.update(rel);
  hash.update(await readFile(f));
  const url = rel.endsWith("/index.html")
    ? rel.slice(0, -"index.html".length)
    : rel;
  urls.push(url);
  if (
    (await stat(f)).size <= CORE_MAX &&
    !rel.startsWith("/sprites/") &&
    !rel.startsWith("/screens/")
  )
    core.push(url);
}
// Le numéro de commit (fourni par Vercel) garantit une nouvelle version à chaque push.
hash.update(process.env.VERCEL_GIT_COMMIT_SHA ?? "");
const version = hash.digest("hex").slice(0, 10);
const tpl = await readFile("scripts/sw-template.js", "utf8");
await writeFile(
  join(OUT, "sw.js"),
  tpl
    .replace("__VERSION__", version)
    .replace("__URLS__", JSON.stringify(urls))
    .replace("__CORE__", JSON.stringify(core)),
);
console.log(
  `sw.js : ${core.length} fichiers dès la 1re visite, ${urls.length} au total (v${version})`,
);
