// Pré-enregistre toutes les phrases de Cubo avec des voix neuronales (fichiers MP3 dans public/voice/).
// Seules les phrases nouvelles ou modifiées sont générées ; les fichiers inutilisés sont supprimés.
// Usage : npm run voices
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { COURSES, FAIL_MESSAGES } from "../src/lib/levels.ts";
import { BADGES, SLOTS } from "../src/lib/rewards.ts";
import { STORY } from "../src/lib/story.ts";
import { CHEERS, LINES, badgeLine, giftLine, lineId, spoken, tipLine, winLine } from "../src/lib/lines.ts";

// La voix unique de Cubo.
const VOICES: Record<string, { name: string; rate: string; pitch: string }> = {
  thierry: { name: "fr-CA-ThierryNeural", rate: "-4%", pitch: "+0Hz" },
};

// ---- Toutes les phrases du jeu
const lines = new Set<string>();
const add = (t: string) => lines.add(t);
Object.values(LINES).forEach(add);
CHEERS.forEach(add);
[1, 2, 3].forEach((n) => add(winLine(n)));
Object.values(FAIL_MESSAGES).forEach(add);
Object.values(BADGES).forEach((b) => add(badgeLine(b.name)));
Object.values(SLOTS).forEach((s) => s.items.forEach((i) => i.stars > 0 && add(giftLine(i.name))));
for (const c of COURSES) for (const l of c.levels) { add(l.goal); add(tipLine(l.tip)); }
for (const ch of Object.values(STORY)) for (const sc of [ch.intro, ch.outro]) sc.pages.forEach((p) => add(p.text));

const ids = new Map([...lines].map((t) => [lineId(t), t]));
if (ids.size !== lines.size) throw new Error("Deux phrases ont le même identifiant : changer la fonction lineId.");
console.log(`${ids.size} phrases`);

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function synth(tts: MsEdgeTTS, text: string, rate: string, pitch: string): Promise<Buffer> {
  const { audioStream } = tts.toStream(escape(spoken(text)), { rate, pitch });
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on("data", (c: Buffer) => chunks.push(c));
    audioStream.on("close", () => resolve());
    audioStream.on("end", () => resolve());
    audioStream.on("error", reject);
  });
  const buf = Buffer.concat(chunks);
  if (buf.length < 1000) throw new Error(`audio vide pour : ${text}`);
  return buf;
}

const manifest: Record<string, string[]> = {};
for (const [key, v] of Object.entries(VOICES)) {
  const dir = join("public", "voice", key);
  await mkdir(dir, { recursive: true });
  const todo = [...ids.keys()].filter((id) => !existsSync(join(dir, `${id}.mp3`)));
  console.log(`\n== ${key} (${v.name}) : ${todo.length} à générer`);

  // 3 connexions en parallèle
  const queue = [...todo];
  let done = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      let tts: MsEdgeTTS | null = null;
      while (queue.length) {
        const id = queue.shift()!;
        for (let attempt = 1; ; attempt++) {
          try {
            if (!tts) { tts = new MsEdgeTTS(); await tts.setMetadata(v.name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3); }
            await writeFile(join(dir, `${id}.mp3`), await synth(tts, ids.get(id)!, v.rate, v.pitch));
            break;
          } catch (e) {
            tts?.close(); tts = null;
            if (attempt >= 4) throw e;
            await new Promise((r) => setTimeout(r, 1500 * attempt));
          }
        }
        if (++done % 20 === 0) console.log(`  ${done} / ${todo.length}`);
      }
      tts?.close();
    })
  );

  // Ménage : fichiers de phrases qui n'existent plus
  for (const f of await readdir(dir)) {
    if (!ids.has(f.replace(/\.mp3$/, ""))) { await unlink(join(dir, f)); console.log(`  supprimé ${f}`); }
  }
  manifest[key] = [...ids.keys()].sort();
}

await writeFile("lib/voice-manifest.json", JSON.stringify(manifest) + "\n");
console.log("\nlib/voice-manifest.json écrit.");
