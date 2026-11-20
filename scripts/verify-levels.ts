// Vérifie que la solution de chaque niveau gagne bien, avec le bon nombre de blocs.
import { LEVELS, buildWorld, runProgram, countBlocks, type Outcome } from "../lib/levels.ts";

let failed = 0;
for (const lvl of LEVELS) {
  const widths = new Set(lvl.grid.map((r) => r.length));
  const gen = runProgram(buildWorld(lvl), lvl.solution);
  let r = gen.next();
  while (!r.done) r = gen.next();
  const out = r.value as Outcome;
  const n = countBlocks(lvl.solution);
  const ok = out.ok && n === lvl.optimal && widths.size === 1;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} Niveau ${lvl.id} ${lvl.title} — ${n} blocs (optimal ${lvl.optimal})`, out.ok ? "" : out, widths.size > 1 ? "LIGNES INÉGALES" : "");
}
process.exit(failed ? 1 : 0);
