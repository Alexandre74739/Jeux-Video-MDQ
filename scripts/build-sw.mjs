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
  if (!existsSync(flat)) { await copyFile(f, flat); files.push(flat); }
}

const hash = createHash("sha1");
const urls = [];
for (const f of files) {
  const rel = "/" + relative(OUT, f).split(sep).join("/");
  if (rel === "/sw.js" || rel === "/404.html") continue;
  hash.update(rel + (await stat(f)).size);
  if (rel.endsWith("/index.html")) urls.push(rel.slice(0, -"index.html".length));
  else urls.push(rel);
}
const version = hash.digest("hex").slice(0, 10);
const tpl = await readFile("scripts/sw-template.js", "utf8");
await writeFile(
  join(OUT, "sw.js"),
  tpl.replace("__VERSION__", version).replace("__URLS__", JSON.stringify(urls))
);
console.log(`sw.js : ${urls.length} fichiers en cache (v${version})`);
