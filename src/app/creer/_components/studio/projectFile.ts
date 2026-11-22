import { BLOCKS, newId } from "@/lib/blocks";
import { sanitizeProject } from "@/lib/project";
import {
  BACKGROUNDS,
  STAGE_H,
  STAGE_W,
  type Project,
  type SpriteDef,
} from "@/lib/runtime";

/** Télécharge le jeu dans un fichier « mon-jeu.cubocode.json ». */
export function downloadProject(project: Project) {
  const blob = new Blob([JSON.stringify(project)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mon-jeu.cubocode.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Lit un jeu téléchargé auparavant. Renvoie `null` si le fichier n'est pas un jeu CuboCode valide. */
export async function readProject(f: File): Promise<Project | null> {
  try {
    return sanitizeProject(
      JSON.parse(await f.text()),
      (t) => t in BLOCKS,
      (id) => BACKGROUNDS.some((b) => b.id === id),
    );
  } catch {
    return null;
  }
}

/** Nouveau personnage placé au hasard sur la scène, avec un nom qui n'existe pas encore. */
export function newSprite(project: Project, name: string, src: string) {
  let n = name;
  let k = 2;
  while (project.sprites.some((s) => s.name === n)) n = `${name} ${k++}`;
  const s: SpriteDef = {
    id: newId(),
    name: n,
    src,
    size: 100,
    scripts: [],
    x: 60 + Math.random() * (STAGE_W - 120),
    y: 60 + Math.random() * (STAGE_H - 120),
  };
  return s;
}
