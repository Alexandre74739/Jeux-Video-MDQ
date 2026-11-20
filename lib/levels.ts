// Niveaux de l'aventure + moteur d'exécution (sans dépendance, testable avec Node).

export type Block = {
  id: string;
  type: string;
  params: Record<string, string | number>;
  children?: Block[];
};

export type Dir = 0 | 1 | 2 | 3; // 0 Nord, 1 Est, 2 Sud, 3 Ouest
// Tuiles : "." herbe, "f" fleurs, "T" arbre, "W" eau, "R" rocher, "B" pont
export type Tile = "." | "f" | "T" | "W" | "R" | "B";

export type World = {
  w: number;
  h: number;
  tiles: Tile[][];
  gems: string[]; // "x,y" restants
  totalGems: number;
  goal: { x: number; y: number };
  cubo: { x: number; y: number; dir: Dir };
};

export type LevelDef = {
  id: number;
  title: string;
  concept: string;
  goal: string;
  tip: string;
  grid: string[];
  startDir: Dir;
  blocks: string[];
  optimal: number;
  solution: Block[];
};

let uid = 0;
export const newId = () => `b${Date.now().toString(36)}${(uid++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const b = (type: string, params: Block["params"] = {}, children?: Block[]): Block => ({
  id: newId(),
  type,
  params,
  ...(children ? { children } : {}),
});
const av = () => b("avancer");
const tg = () => b("gauche");
const td = () => b("droite");
const rep = (n: number, children: Block[]) => b("repeter", { n }, children);

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: "Premiers pas",
    concept: "Séquence",
    goal: "Aide Cubo à atteindre le coffre au trésor ! Glisse le bloc « avancer » dans ton programme.",
    tip: "Le coffre est à 3 cases. Il faut donc 3 blocs « avancer ».",
    grid: ["TTTTTTT", "Tf.f..T", "TS..F.T", "T..f.fT", "TTTTTTT"],
    startDir: 1,
    blocks: ["avancer"],
    optimal: 3,
    solution: [av(), av(), av()],
  },
  {
    id: 2,
    title: "Le virage",
    concept: "Séquence",
    goal: "Le chemin tourne ! Utilise « tourner à droite » au bon moment.",
    tip: "Avance 2 fois, tourne à droite, puis avance encore 2 fois.",
    grid: ["TTTTTTT", "TS..TfT", "Tf..TTT", "TT.FfTT", "TTTTTTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite"],
    optimal: 5,
    solution: [av(), av(), td(), av(), av()],
  },
  {
    id: 3,
    title: "Le grand tour",
    concept: "Séquence",
    goal: "Cubo regarde vers le haut. Trouve le chemin jusqu'au coffre.",
    tip: "Monte de 2 cases, tourne à droite, avance 2 fois, tourne à droite, avance 2 fois.",
    grid: ["TTTTTTT", "T...TfT", "T.T.TTT", "TSTF.fT", "TTTTTTT"],
    startDir: 0,
    blocks: ["avancer", "gauche", "droite"],
    optimal: 8,
    solution: [av(), av(), td(), av(), av(), td(), av(), av()],
  },
  {
    id: 4,
    title: "Chasse aux gemmes",
    concept: "Actions",
    goal: "Ramasse toutes les gemmes avant d'ouvrir le coffre !",
    tip: "Quand Cubo est SUR une gemme, utilise le bloc « ramasser ».",
    grid: ["TTfTTfTT", "TS.G.GFT", "TTTfTTTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "ramasser"],
    optimal: 7,
    solution: [av(), av(), b("ramasser"), av(), av(), b("ramasser"), av()],
  },
  {
    id: 5,
    title: "La boucle magique",
    concept: "Boucle",
    goal: "Un très long chemin… Le bloc « répéter » peut faire le travail à ta place !",
    tip: "Mets un seul bloc « avancer » DANS « répéter », et choisis le bon nombre.",
    grid: ["TfTTfTTfTT", "TS......FT", "TTfTTfTTTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "repeter"],
    optimal: 2,
    solution: [rep(7, [av()])],
  },
  {
    id: 6,
    title: "Casse-cailloux",
    concept: "Boucle + actions",
    goal: "Des rochers bloquent la route. Cubo peut les casser s'ils sont juste devant lui.",
    tip: "Le motif « avancer, casser, avancer » se répète 2 fois. Puis un dernier pas !",
    grid: ["TTTTTTTT", "TS.R.RFT", "TTfTTfTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "casser", "repeter"],
    optimal: 5,
    solution: [rep(2, [av(), b("casser"), av()]), av()],
  },
  {
    id: 7,
    title: "Le pont",
    concept: "Boucle + actions",
    goal: "Une rivière ! Cubo ne sait pas nager : construis un pont devant lui.",
    tip: "Répète 3 fois « poser un pont » puis « avancer ». Ensuite, encore 2 pas.",
    grid: ["TTWWWTTT", "TSWWW.FT", "TfWWWTfT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "pont", "repeter"],
    optimal: 5,
    solution: [rep(3, [b("pont"), av()]), av(), av()],
  },
  {
    id: 8,
    title: "L'escalier",
    concept: "Boucle",
    goal: "Le chemin fait des marches. Trouve le motif qui se répète !",
    tip: "Une marche = avancer, tourner à droite, avancer, tourner à gauche. Il y a 3 marches.",
    grid: ["TTTTTT", "TS.TfT", "TT..TT", "TfT..T", "TTTTFT", "TTTTTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "repeter"],
    optimal: 5,
    solution: [rep(3, [av(), td(), av(), tg()])],
  },
  {
    id: 9,
    title: "Le tour de l'étang",
    concept: "Boucles imbriquées",
    goal: "Fais le tour de l'étang et ramasse les 3 gemmes. Une boucle peut aller DANS une autre boucle !",
    tip: "Un côté = avancer 3 fois, ramasser, tourner à droite. Répète les côtés 4 fois.",
    grid: ["TTTTTT", "TS..GT", "TFWW.T", "T.WW.T", "TG..GT", "TTTTTT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "ramasser", "repeter"],
    optimal: 5,
    solution: [rep(4, [rep(3, [av()]), b("ramasser"), td()])],
  },
  {
    id: 10,
    title: "Si… alors !",
    concept: "Condition",
    goal: "Il y a de l'eau à certains endroits seulement. Cubo doit vérifier : SI il y a de l'eau devant, ALORS il pose un pont.",
    tip: "Répète 7 fois : « si eau devant → poser un pont », puis « avancer ».",
    grid: ["TTTWTWWTTT", "TS.W.WW.FT", "TfTWTWWTfT"],
    startDir: 1,
    blocks: ["avancer", "gauche", "droite", "pont", "casser", "repeter", "si"],
    optimal: 4,
    solution: [rep(7, [b("si", { what: "eau" }, [b("pont")]), av()])],
  },
];

export function buildWorld(level: LevelDef): World {
  const tiles: Tile[][] = [];
  const gems: string[] = [];
  let start = { x: 0, y: 0 };
  let goal = { x: 0, y: 0 };
  level.grid.forEach((row, y) => {
    tiles.push(
      row.split("").map((c, x) => {
        if (c === "S") { start = { x, y }; return "."; }
        if (c === "F") { goal = { x, y }; return "."; }
        if (c === "G") { gems.push(`${x},${y}`); return "."; }
        return c as Tile;
      })
    );
  });
  return {
    w: level.grid[0].length,
    h: level.grid.length,
    tiles,
    gems,
    totalGems: gems.length,
    goal,
    cubo: { ...start, dir: level.startDir },
  };
}

export const cloneWorld = (w: World): World => ({
  ...w,
  tiles: w.tiles.map((r) => [...r]),
  gems: [...w.gems],
  goal: { ...w.goal },
  cubo: { ...w.cubo },
});

export const DIRS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

export type StepKind =
  | "move" | "turn" | "collect" | "nothing" | "break" | "bridge"
  | "check" | "bump" | "splash" | "win";

export type Step = { kind: StepKind; blockId: string; world: World; at?: { x: number; y: number } };

export type Outcome =
  | { ok: true }
  | { ok: false; reason: "water" | "blocked" | "notAtGoal" | "gemsMissing" | "tooLong" | "empty" };

class Stop extends Error {
  outcome: Outcome;
  constructor(outcome: Outcome) { super("stop"); this.outcome = outcome; }
}

export function countBlocks(list: Block[]): number {
  return list.reduce((n, bl) => n + 1 + (bl.children ? countBlocks(bl.children) : 0), 0);
}

export function starsFor(level: LevelDef, used: number): 1 | 2 | 3 {
  if (used <= level.optimal) return 3;
  if (used <= level.optimal + 3) return 2;
  return 1;
}

/** Exécute un programme et produit les étapes à animer. Le résultat final est renvoyé par le générateur. */
export function* runProgram(world0: World, program: Block[]): Generator<Step, Outcome> {
  const w = cloneWorld(world0);
  let steps = 0;
  if (program.length === 0) return { ok: false, reason: "empty" };

  const front = () => {
    const d = DIRS[w.cubo.dir];
    const x = w.cubo.x + d.x;
    const y = w.cubo.y + d.y;
    const inside = x >= 0 && y >= 0 && x < w.w && y < w.h;
    return { x, y, tile: inside ? w.tiles[y][x] : ("T" as Tile) };
  };
  const snap = (kind: StepKind, blockId: string, at?: { x: number; y: number }): Step => ({
    kind, blockId, world: cloneWorld(w), at,
  });
  const atGoal = () => w.cubo.x === w.goal.x && w.cubo.y === w.goal.y;

  function* exec(list: Block[]): Generator<Step, void> {
    for (const bl of list) {
      if (++steps > 400) throw new Stop({ ok: false, reason: "tooLong" });
      switch (bl.type) {
        case "avancer": {
          const f = front();
          if (f.tile === "T" || f.tile === "R") {
            yield snap("bump", bl.id, f);
            throw new Stop({ ok: false, reason: "blocked" });
          }
          w.cubo.x = f.x;
          w.cubo.y = f.y;
          if (f.tile === "W") {
            yield snap("splash", bl.id);
            throw new Stop({ ok: false, reason: "water" });
          }
          yield snap("move", bl.id);
          if (atGoal() && w.gems.length === 0) {
            yield snap("win", bl.id);
            throw new Stop({ ok: true });
          }
          break;
        }
        case "gauche":
        case "droite":
          w.cubo.dir = (((w.cubo.dir + (bl.type === "gauche" ? 3 : 1)) % 4) as Dir);
          yield snap("turn", bl.id);
          break;
        case "ramasser": {
          const key = `${w.cubo.x},${w.cubo.y}`;
          const i = w.gems.indexOf(key);
          if (i >= 0) {
            w.gems.splice(i, 1);
            yield snap("collect", bl.id, { x: w.cubo.x, y: w.cubo.y });
            if (atGoal() && w.gems.length === 0) {
              yield snap("win", bl.id);
              throw new Stop({ ok: true });
            }
          } else yield snap("nothing", bl.id);
          break;
        }
        case "casser": {
          const f = front();
          if (f.tile === "R") {
            w.tiles[f.y][f.x] = ".";
            yield snap("break", bl.id, f);
          } else yield snap("nothing", bl.id);
          break;
        }
        case "pont": {
          const f = front();
          if (f.tile === "W") {
            w.tiles[f.y][f.x] = "B";
            yield snap("bridge", bl.id, f);
          } else yield snap("nothing", bl.id);
          break;
        }
        case "repeter": {
          const n = Math.max(0, Math.min(20, Number(bl.params.n) || 0));
          for (let k = 0; k < n; k++) yield* exec(bl.children ?? []);
          break;
        }
        case "si": {
          const f = front();
          const what = bl.params.what;
          const yes =
            (what === "eau" && f.tile === "W") ||
            (what === "rocher" && f.tile === "R") ||
            (what === "chemin" && (f.tile === "." || f.tile === "f" || f.tile === "B"));
          yield snap("check", bl.id);
          if (yes) yield* exec(bl.children ?? []);
          break;
        }
      }
    }
  }

  try {
    yield* exec(program);
  } catch (e) {
    if (e instanceof Stop) return e.outcome;
    throw e;
  }
  if (atGoal() && w.gems.length > 0) return { ok: false, reason: "gemsMissing" };
  return { ok: false, reason: "notAtGoal" };
}

export const FAIL_MESSAGES: Record<string, string> = {
  water: "Plouf ! Cubo est tombé dans l'eau. Il ne sait pas nager…",
  blocked: "Aïe ! Il y a un obstacle devant Cubo.",
  notAtGoal: "Presque ! Cubo n'est pas encore arrivé au coffre.",
  gemsMissing: "Il manque des gemmes ! Ramasse-les toutes avant le coffre.",
  tooLong: "Ton programme est trop long ! Essaie avec moins de blocs.",
  empty: "Ton programme est vide ! Glisse des blocs dans la zone de droite.",
};
