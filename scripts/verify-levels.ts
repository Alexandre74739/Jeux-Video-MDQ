// Vérifie que la solution de chaque niveau de chaque parcours gagne bien.
import { COURSES, buildWorld, runProgram, countBlocks, type Outcome } from "../lib/levels.ts";

let failed = 0;
for (const course of COURSES) {
  console.log(`\n== ${course.title} (${course.levels.length} niveaux)`);
  for (const lvl of course.levels) {
    const widths = new Set(lvl.grid.map((r) => r.length));
    const counts = (c: string) => lvl.grid.join("").split(c).length - 1;
    const gen = runProgram(buildWorld(lvl), lvl.solution);
    let r = gen.next();
    let steps = 0;
    while (!r.done) { r = gen.next(); steps++; }
    const out = r.value as Outcome;
    const n = countBlocks(lvl.solution);
    const unknown = lvl.solution.flatMap(function walk(b): string[] {
      return [b.type, ...(b.children ?? []).flatMap(walk), ...(b.alt ?? []).flatMap(walk)];
    }).filter((t) => !lvl.blocks.includes(t));
    const ok = out.ok && widths.size === 1 && counts("S") === 1 && counts("F") === 1 && unknown.length === 0;
    if (!ok) failed++;
    console.log(
      `${ok ? "✓" : "✗"} ${lvl.id}. ${lvl.title} : ${n} blocs, ${steps} étapes`,
      out.ok ? "" : JSON.stringify(out),
      widths.size > 1 ? "LIGNES INÉGALES" : "",
      unknown.length ? `BLOCS NON AUTORISÉS ${unknown}` : ""
    );
  }
}
process.exit(failed ? 1 : 0);
