// Parcours (tutoriel + défis), niveaux et moteur d'exécution (sans dépendance, testable avec Node).

export type Block = {
  id: string;
  type: string;
  params: Record<string, string | number>;
  children?: Block[];
  /** Deuxième liste (branche « sinon » du bloc si… sinon). */
  alt?: Block[];
};

export type Dir = 0 | 1 | 2 | 3; // 0 Nord, 1 Est, 2 Sud, 3 Ouest
// Tuiles : "." chemin, "f" fleurs, "T" arbre, "W" eau, "R" rocher, "B" pont,
//          "L" lave, "D" porte fermée, "O" porte ouverte
export type Tile = "." | "f" | "T" | "W" | "R" | "B" | "L" | "D" | "O";

export type World = {
  w: number;
  h: number;
  tiles: Tile[][];
  gems: string[]; // "x,y" restants
  totalGems: number;
  keys: string[]; // clés encore au sol
  keysHeld: number;
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

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3 | 4;
  color: string;
  newBlocks: string[];
  /** Numéro du niveau montré en aperçu sur la carte du parcours. */
  preview: number;
  levels: LevelDef[];
};

export const DIFFICULTY = ["", "Débutant", "Moyen", "Difficile", "Expert"] as const;

let uid = 0;
export const newId = () => `b${Date.now().toString(36)}${(uid++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const b = (type: string, params: Block["params"] = {}, children?: Block[], alt?: Block[]): Block => ({
  id: newId(),
  type,
  params,
  ...(children ? { children } : {}),
  ...(alt ? { alt } : {}),
});
const av = () => b("avancer");
const tg = () => b("gauche");
const td = () => b("droite");
const dt = () => b("demitour");
const ram = () => b("ramasser");
const cas = () => b("casser");
const pont = () => b("pont");
const ouv = () => b("ouvrir");
const saut = () => b("sauter");
const rep = (n: number, children: Block[]) => b("repeter", { n }, children);
const jusqua = (children: Block[]) => b("jusqua", {}, children);
const si = (what: string, children: Block[]) => b("si", { what }, children);
const sisinon = (what: string, yes: Block[], no: Block[]) => b("sisinon", { what }, yes, no);

type RawLevel = Omit<LevelDef, "optimal" | "id"> & { optimal?: number };
const numbered = (raw: RawLevel[]): LevelDef[] =>
  raw.map((l, i) => ({ ...l, id: i + 1, optimal: l.optimal ?? countBlocks(l.solution) }));

const BASE = ["avancer", "gauche", "droite"];
const B1 = [...BASE, "demitour", "ramasser", "casser", "pont", "ouvrir", "repeter"];
const B2 = [...BASE, "demitour", "ramasser", "casser", "pont", "sauter", "repeter", "jusqua", "si"];
const B3 = [...BASE, "demitour", "ramasser", "casser", "pont", "ouvrir", "sauter", "repeter", "jusqua", "si", "sisinon"];

// ---------------------------------------------------------------- TUTORIEL
const TUTO: RawLevel[] = [
  {
    title: "Premiers pas", concept: "Séquence",
    goal: "Aide Cubo à atteindre le coffre au trésor ! Glisse le bloc « avancer » dans ton programme.",
    tip: "Le coffre est à 3 cases. Il faut donc 3 blocs « avancer ».",
    grid: ["TTTTTTT", "Tf.f..T", "TS..F.T", "T..f.fT", "TTTTTTT"], startDir: 1,
    blocks: ["avancer"], solution: [av(), av(), av()],
  },
  {
    title: "Le virage", concept: "Séquence",
    goal: "Le chemin tourne ! Utilise « tourner à droite » au bon moment.",
    tip: "Avance 2 fois, tourne à droite, puis avance encore 2 fois.",
    grid: ["TTTTTTT", "TS..TfT", "Tf..TTT", "TT.FfTT", "TTTTTTT"], startDir: 1,
    blocks: BASE, solution: [av(), av(), td(), av(), av()],
  },
  {
    title: "Le grand tour", concept: "Séquence",
    goal: "Cubo regarde vers le haut. Trouve le chemin jusqu'au coffre.",
    tip: "Monte de 2 cases, tourne à droite, avance 2 fois, tourne à droite, avance 2 fois.",
    grid: ["TTTTTTT", "T...TfT", "T.T.TTT", "TSTF.fT", "TTTTTTT"], startDir: 0,
    blocks: BASE, solution: [av(), av(), td(), av(), av(), td(), av(), av()],
  },
  {
    title: "Chasse aux gemmes", concept: "Actions",
    goal: "Ramasse toutes les gemmes avant d'ouvrir le coffre !",
    tip: "Quand Cubo est SUR une gemme, utilise le bloc « ramasser ».",
    grid: ["TTfTTfTT", "TS.G.GFT", "TTTfTTTT"], startDir: 1,
    blocks: [...BASE, "ramasser"], solution: [av(), av(), ram(), av(), av(), ram(), av()],
  },
  {
    title: "La boucle magique", concept: "Boucle",
    goal: "Un très long chemin… Le bloc « répéter » peut faire le travail à ta place !",
    tip: "Mets un seul bloc « avancer » DANS « répéter », et choisis le bon nombre.",
    grid: ["TfTTfTTfTT", "TS......FT", "TTfTTfTTTT"], startDir: 1,
    blocks: [...BASE, "repeter"], solution: [rep(7, [av()])],
  },
  {
    title: "Casse-cailloux", concept: "Boucle + actions",
    goal: "Des rochers bloquent la route. Cubo peut les casser s'ils sont juste devant lui.",
    tip: "Le motif « avancer, casser, avancer » se répète 2 fois. Puis un dernier pas !",
    grid: ["TTTTTTTT", "TS.R.RFT", "TTfTTfTT"], startDir: 1,
    blocks: [...BASE, "casser", "repeter"], solution: [rep(2, [av(), cas(), av()]), av()],
  },
  {
    title: "Le pont", concept: "Boucle + actions",
    goal: "Une rivière ! Cubo ne sait pas nager : construis un pont devant lui.",
    tip: "Répète 3 fois « poser un pont » puis « avancer ». Ensuite, encore 2 pas.",
    grid: ["TTWWWTTT", "TSWWW.FT", "TfWWWTfT"], startDir: 1,
    blocks: [...BASE, "pont", "repeter"], solution: [rep(3, [pont(), av()]), av(), av()],
  },
  {
    title: "L'escalier", concept: "Boucle",
    goal: "Le chemin fait des marches. Trouve le motif qui se répète !",
    tip: "Une marche = avancer, tourner à droite, avancer, tourner à gauche. Il y a 3 marches.",
    grid: ["TTTTTT", "TS.TfT", "TT..TT", "TfT..T", "TTTTFT", "TTTTTT"], startDir: 1,
    blocks: [...BASE, "repeter"], solution: [rep(3, [av(), td(), av(), tg()])],
  },
  {
    title: "Le tour de l'étang", concept: "Boucles imbriquées",
    goal: "Fais le tour de l'étang et ramasse les 3 gemmes. Une boucle peut aller DANS une autre boucle !",
    tip: "Un côté = avancer 3 fois, ramasser, tourner à droite. Répète les côtés 4 fois.",
    grid: ["TTTTTT", "TS..GT", "TFWW.T", "T.WW.T", "TG..GT", "TTTTTT"], startDir: 1,
    blocks: [...BASE, "ramasser", "repeter"], solution: [rep(4, [rep(3, [av()]), ram(), td()])],
  },
  {
    title: "Si… alors !", concept: "Condition",
    goal: "Il y a de l'eau à certains endroits seulement. Cubo doit vérifier : SI il y a de l'eau devant, ALORS il pose un pont.",
    tip: "Répète 7 fois : « si eau devant → poser un pont », puis « avancer ».",
    grid: ["TTTWTWWTTT", "TS.W.WW.FT", "TfTWTWWTfT"], startDir: 1,
    blocks: [...BASE, "pont", "casser", "repeter", "si"], solution: [rep(7, [si("eau", [pont()]), av()])],
  },
];

// ---------------------------------------------------------------- DÉFI 1 : LA VALLÉE DES CLÉS
const CLES: RawLevel[] = [
  {
    title: "La première clé", concept: "Clés et portes",
    goal: "Une porte bloque le chemin ! Ramasse la clé, puis utilise « ouvrir la porte » quand elle est juste devant Cubo.",
    tip: "Avance jusqu'à la clé, ramasse-la, ouvre la porte, puis avance jusqu'au coffre.",
    grid: ["TTTTTTTT", "TS.KD.FT", "TTfTTfTT"], startDir: 1,
    blocks: B1, solution: [rep(2, [av()]), ram(), ouv(), rep(3, [av()])],
  },
  {
    title: "Demi-tour !", concept: "Demi-tour",
    goal: "La clé est derrière Cubo ! Le bloc « faire demi-tour » le retourne d'un coup.",
    tip: "Demi-tour, avance, ramasse, demi-tour… puis va jusqu'à la porte.",
    grid: ["TTTTTTTT", "TKS.D.FT", "TTTfTTfT"], startDir: 1,
    blocks: B1, solution: [dt(), av(), ram(), dt(), rep(2, [av()]), ouv(), rep(3, [av()])],
  },
  {
    title: "Trois portes", concept: "Boucle",
    goal: "Clé, porte, clé, porte… Trouve le motif qui se répète !",
    tip: "Le motif : avancer, ramasser, ouvrir la porte, avancer. Répète-le 3 fois, puis un dernier pas.",
    grid: ["TTTTTTTTTT", "TSKDKDKDFT", "TfTTfTTfTT"], startDir: 1,
    blocks: B1, solution: [rep(3, [av(), ram(), ouv(), av()]), av()],
  },
  {
    title: "Le couloir tournant", concept: "Séquence",
    goal: "Ramasse la clé dans le virage, puis ouvre la porte plus bas.",
    tip: "2 pas, ramasser, tourner à droite, 2 pas, ouvrir, 2 pas.",
    grid: ["TTTTTTT", "TS.KTfT", "TTT.TTT", "TfT.TTT", "TTTDTfT", "TTTFTTT", "TTTTTTT"], startDir: 1,
    blocks: B1, solution: [rep(2, [av()]), ram(), td(), rep(2, [av()]), ouv(), rep(2, [av()])],
  },
  {
    title: "Rochers et clés", concept: "Actions",
    goal: "Un rocher, une clé, une porte. Dans quel ordre faut-il faire les choses ?",
    tip: "Avance, casse le rocher, avance 3 fois, ramasse, ouvre, avance 2 fois.",
    grid: ["TTTTTTTTT", "TS.R.KDFT", "TTfTTTfTT"], startDir: 1,
    blocks: B1, solution: [av(), cas(), rep(3, [av()]), ram(), ouv(), rep(2, [av()])],
  },
  {
    title: "Le pont et la porte", concept: "Boucle + actions",
    goal: "Traverse la rivière, puis trouve la clé de la porte.",
    tip: "Répète 2 fois « poser un pont, avancer ». Puis avance, ramasse, ouvre et avance encore.",
    grid: ["TTWWTTTT", "TSWWKDFT", "TfWWTTfT"], startDir: 1,
    blocks: B1, solution: [rep(2, [pont(), av()]), av(), ram(), ouv(), rep(2, [av()])],
  },
  {
    title: "Aller-retour", concept: "Demi-tour",
    goal: "La clé est cachée en haut du chemin. Va la chercher puis reviens !",
    tip: "Avance, tourne à gauche, monte 2 fois, ramasse, demi-tour, redescends 2 fois, tourne à gauche…",
    grid: ["TTTTTTT", "TTKTTTT", "TT.TTTT", "TS.D.FT", "TTTTTTT"], startDir: 1,
    blocks: B1,
    solution: [av(), tg(), rep(2, [av()]), ram(), dt(), rep(2, [av()]), tg(), ouv(), rep(3, [av()])],
  },
  {
    title: "Les gemmes gardées", concept: "Boucle",
    goal: "Chaque gemme est cachée derrière une porte. Ramasse les clés ET les gemmes !",
    tip: "Le motif : avancer, ramasser, ouvrir, avancer, avancer, ramasser. Répète 2 fois.",
    grid: ["TTfTTfTTTT", "TSKDGKDGFT", "TTTfTTTfTT"], startDir: 1,
    blocks: B1, solution: [rep(2, [av(), ram(), ouv(), av(), av(), ram()]), av()],
  },
  {
    title: "Le serpent", concept: "Boucle",
    goal: "Un escalier de portes ! Chaque marche a sa clé.",
    tip: "Une marche : avancer, ramasser, tourner à droite, ouvrir, avancer, tourner à gauche. 3 marches, puis un pas.",
    grid: ["TTTTTTT", "TSKTTfT", "TTDKTTT", "TfTDKTT", "TTTTDFT", "TTTTTTT"], startDir: 1,
    blocks: B1, solution: [rep(3, [av(), ram(), td(), ouv(), av(), tg()]), av()],
  },
  {
    title: "Le grand coffre", concept: "Tout ensemble",
    goal: "Le dernier niveau de la vallée : rocher, rivière, clé et porte !",
    tip: "Casse le rocher, tourne à droite au bout, pose un pont, ramasse la clé et ouvre la porte.",
    grid: ["TTTTTTT", "TS.R.TT", "TTTTWTT", "TfTT.TT", "TTTTKTT", "TTTTDTT", "TTTTFTT", "TTTTTTT"], startDir: 1,
    blocks: B1,
    solution: [av(), cas(), rep(2, [av()]), td(), pont(), rep(3, [av()]), ram(), ouv(), rep(2, [av()])],
  },
];

// ---------------------------------------------------------------- DÉFI 2 : LE VOLCAN
const VOLCAN: RawLevel[] = [
  {
    title: "Le grand saut", concept: "Sauter",
    goal: "De la lave ! Impossible d'y poser un pont… mais Cubo peut SAUTER par-dessus une case.",
    tip: "Avance, saute par-dessus la lave, puis avance.",
    grid: ["LLTTTLL", "TS.L.FT", "LLTTTLL"], startDir: 1,
    blocks: B2, solution: [av(), saut(), av()],
  },
  {
    title: "Saute-mouton", concept: "Boucle",
    goal: "Trois rivières de lave à la suite. Une boucle va t'aider !",
    tip: "Répète 3 fois « sauter », puis avance une fois.",
    grid: ["TTLTLTLTTT", "TSL.L.L.FT", "TTLTLTLTTT"], startDir: 1,
    blocks: B2, solution: [rep(3, [saut()]), av()],
  },
  {
    title: "Jusqu'au coffre", concept: "Boucle jusqu'à",
    goal: "Nouveau bloc : « répéter jusqu'au coffre ». Plus besoin de compter les cases !",
    tip: "Mets un bloc « avancer » dans « répéter jusqu'au coffre ».",
    grid: ["LLTLLTLLTLLL", "TS........FT", "LLLTLLTLLTLL"], startDir: 1,
    blocks: B2, solution: [jusqua([av()])],
  },
  {
    title: "Saut ou pont ?", concept: "Choisir l'action",
    goal: "De l'eau ET de la lave. Pour l'eau, un pont. Pour la lave, un saut !",
    tip: "Pose un pont, avance 2 fois, saute, avance.",
    grid: ["TTWTLTTT", "TSW.L.FT", "TTWTLTTT"], startDir: 1,
    blocks: B2, solution: [pont(), rep(2, [av()]), saut(), av()],
  },
  {
    title: "Le chemin brûlant", concept: "Séquence",
    goal: "Un rocher, un virage et un trou de lave. Garde ton calme !",
    tip: "Avance, casse, avance, tourne à droite, saute, tourne à gauche, avance 2 fois.",
    grid: ["TTTTTTT", "TS.RTTT", "TTTLTTT", "TTT..FT", "TTTTTTT"], startDir: 1,
    blocks: B2, solution: [av(), cas(), av(), td(), saut(), tg(), rep(2, [av()])],
  },
  {
    title: "Les gemmes du volcan", concept: "Boucle jusqu'à",
    goal: "Une gemme toutes les 2 cases. Combine « répéter jusqu'au coffre » et « ramasser » !",
    tip: "Dans la boucle : avancer, avancer, ramasser.",
    grid: ["LLTLLTLLTL", "TS.G.G.GFT", "LTLLTLLTLL"], startDir: 1,
    blocks: B2, solution: [jusqua([av(), av(), ram()])],
  },
  {
    title: "L'escalier de lave", concept: "Boucle",
    goal: "Chaque marche a un trou de lave. Trouve le motif !",
    tip: "Une marche : sauter, tourner à droite, avancer, tourner à gauche. Répète 3 fois.",
    grid: ["TTTTTTTTT", "TSL.TTTTT", "TTT.L.TTT", "TTTTT.LFT", "TTTTTTTTT"], startDir: 1,
    blocks: B2, solution: [rep(3, [saut(), td(), av(), tg()])],
  },
  {
    title: "Saute si c'est de la lave", concept: "Condition",
    goal: "La lave apparaît n'importe où ! Cubo doit vérifier SI il y a de la lave devant lui.",
    tip: "Jusqu'au coffre : « si lave devant → sauter », puis « avancer ».",
    grid: ["TTTLTTLTTTT", "TS.L..L..FT", "TTTLTTLTTTT"], startDir: 1,
    blocks: B2, solution: [jusqua([si("lave", [saut()]), av()])],
  },
  {
    title: "Le tour du cratère", concept: "Boucles imbriquées",
    goal: "Fais le tour du cratère et ramasse les 3 gemmes des coins.",
    tip: "Un côté = avancer 4 fois, ramasser, tourner à droite. Répète jusqu'au coffre !",
    grid: ["TTTTTTT", "TS...GT", "TFLLL.T", "T.LLL.T", "T.LLL.T", "TG...GT", "TTTTTTT"], startDir: 1,
    blocks: B2, solution: [jusqua([rep(4, [av()]), ram(), td()])],
  },
  {
    title: "Le cœur du volcan", concept: "Tout ensemble",
    goal: "Le dernier défi du volcan : lave, rocher, gemme et rivière !",
    tip: "Avance, saute, casse, avance 2 fois, ramasse, tourne à droite, pose un pont, avance 3 fois.",
    grid: ["TTTTTTTT", "TS.L.RGT", "TTTTTTWT", "TfTTTT.T", "TTTTTTFT", "TTTTTTTT"], startDir: 1,
    blocks: B2, solution: [av(), saut(), cas(), rep(2, [av()]), ram(), td(), pont(), rep(3, [av()])],
  },
];

// ---------------------------------------------------------------- DÉFI 3 : LE LABYRINTHE DU MAÎTRE
const MAITRE: RawLevel[] = [
  {
    title: "Si… sinon", concept: "Si… sinon",
    goal: "Nouveau bloc « si… sinon » : SI il y a de la lave, Cubo saute. SINON, il avance.",
    tip: "Jusqu'au coffre : si lave devant → sauter, sinon → avancer.",
    grid: ["TTTLTLTTT", "TS.L.L.FT", "TTTLTLTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([sisinon("lave", [saut()], [av()])])],
  },
  {
    title: "Gemmes et lave", concept: "Si… sinon",
    goal: "Ramasse chaque gemme et saute la lave, sans jamais compter les cases.",
    tip: "Jusqu'au coffre : ramasser, puis si lave → sauter, sinon → avancer.",
    grid: ["TTTLTTLTTT", "TSGLG.LGFT", "TTTLTTLTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([ram(), sisinon("lave", [saut()], [av()])])],
  },
  {
    title: "Pont ou saut", concept: "Conditions imbriquées",
    goal: "Lave ? On saute. Sinon : s'il y a de l'eau, on pose un pont, puis on avance.",
    tip: "Si lave → sauter. Sinon → (si eau → pont) puis avancer. Le tout jusqu'au coffre.",
    grid: ["TTWTLTWTT", "TSW.L.WFT", "TTWTLTWTT"], startDir: 1,
    blocks: B3, solution: [jusqua([sisinon("lave", [saut()], [si("eau", [pont()]), av()])])],
  },
  {
    title: "Le marais", concept: "Plusieurs conditions",
    goal: "De l'eau et des rochers partout. Cubo doit tout vérifier avant chaque pas !",
    tip: "Jusqu'au coffre : si eau → pont, si rocher → casser, puis avancer.",
    grid: ["TTWTTWTTTT", "TSW.RWR.FT", "TTWTTWTTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([si("eau", [pont()]), si("rocher", [cas()]), av()])],
  },
  {
    title: "La spirale", concept: "Si… sinon",
    goal: "Le chemin tourne en spirale. Une seule règle suffit : s'il y a un chemin devant, avance, sinon tourne !",
    tip: "Jusqu'au coffre : si chemin devant → avancer, sinon → tourner à droite.",
    grid: ["TTTTTTT", "TS....T", "TTTTT.T", "T..FT.T", "T.TTT.T", "T.....T", "TTTTTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([sisinon("chemin", [av()], [td()])])],
  },
  {
    title: "Le tour des gemmes", concept: "Si… sinon",
    goal: "Fais le tour du lac et ramasse les 4 gemmes. Elles ne sont pas toutes au même endroit !",
    tip: "Jusqu'au coffre : ramasser, puis si chemin devant → avancer, sinon → tourner à droite.",
    grid: ["TTTTTTTT", "TS.G..GT", "TFWWWW.T", "T.WWWWGT", "TG.....T", "TTTTTTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([ram(), sisinon("chemin", [av()], [td()])])],
  },
  {
    title: "Clés en série", concept: "Si… sinon",
    goal: "Les clés et les portes ne sont pas régulières. Une condition fera le travail !",
    tip: "Jusqu'au coffre : si porte devant → ouvrir, sinon → avancer puis ramasser.",
    grid: ["TTTTTTTTTTTTT", "TSK.DKD..KDFT", "TTfTTTTfTTTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([sisinon("porte", [ouv()], [av(), ram()])])],
  },
  {
    title: "Demi-tour malin", concept: "Conditions",
    goal: "La porte est derrière Cubo, mais la clé est devant ! Écris un programme qui fait demi-tour au bout du chemin.",
    tip: "Jusqu'au coffre : ramasser, si porte → ouvrir, puis si chemin devant → avancer, sinon → demi-tour.",
    grid: ["TTTTTTTTTT", "TFD..S..KT", "TTfTTTTfTT"], startDir: 1,
    blocks: B3, solution: [jusqua([ram(), si("porte", [ouv()]), sisinon("chemin", [av()], [dt()])])],
  },
  {
    title: "Le petit labyrinthe", concept: "Algorithme",
    goal: "Un vrai labyrinthe ! Astuce de pro : garde toujours le mur à ta droite.",
    tip: "Si chemin à droite → tourner à droite et avancer. Sinon : si chemin devant → avancer, sinon → tourner à gauche.",
    grid: ["TTTTTTT", "TS..T.T", "TTT.T.T", "T.....T", "T.TTTTT", "T..FTTT", "TTTTTTT"], startDir: 1,
    blocks: B3,
    solution: [jusqua([sisinon("droite", [td(), av()], [sisinon("chemin", [av()], [tg()])])])],
  },
  {
    title: "Le labyrinthe du maître", concept: "Algorithme",
    goal: "Le défi ultime : traverse le grand labyrinthe et ramasse les 3 gemmes cachées !",
    tip: "Reprends la règle de la main droite, et ajoute « ramasser » au début de la boucle.",
    grid: ["TTTTTTTTT", "TS.T...GT", "TT.T.TT.T", "T....TG.T", "T.TTTT.TT", "TGTF...TT", "TTTTTTTTT"], startDir: 1,
    blocks: B3,
    solution: [jusqua([ram(), sisinon("droite", [td(), av()], [sisinon("chemin", [av()], [tg()])])])],
  },
];

export const COURSES: Course[] = [
  {
    slug: "tutoriel", title: "Tutoriel", subtitle: "Apprends les bases avec Cubo : avancer, tourner, répéter.",
    difficulty: 1, color: "#4FC3F7", newBlocks: ["avancer", "repeter", "si"], preview: 9, levels: numbered(TUTO),
  },
  {
    slug: "vallee-des-cles", title: "La vallée des clés", subtitle: "Des portes fermées partout ! Trouve les clés pour passer.",
    difficulty: 2, color: "#7BD88F", newBlocks: ["ouvrir", "demitour"], preview: 9, levels: numbered(CLES),
  },
  {
    slug: "volcan", title: "Le volcan", subtitle: "Saute par-dessus la lave et répète jusqu'au coffre.",
    difficulty: 3, color: "#FFA94D", newBlocks: ["sauter", "jusqua"], preview: 9, levels: numbered(VOLCAN),
  },
  {
    slug: "labyrinthe", title: "Le labyrinthe du maître", subtitle: "Si… sinon, labyrinthes et vrais algorithmes de pro.",
    difficulty: 4, color: "#C3A6FF", newBlocks: ["sisinon"], preview: 10, levels: numbered(MAITRE),
  },
];

/** Rétrocompatibilité : niveaux du tutoriel. */
export const LEVELS = COURSES[0].levels;

export function buildWorld(level: LevelDef): World {
  const tiles: Tile[][] = [];
  const gems: string[] = [];
  const keys: string[] = [];
  let start = { x: 0, y: 0 };
  let goal = { x: 0, y: 0 };
  level.grid.forEach((row, y) => {
    tiles.push(
      row.split("").map((c, x) => {
        if (c === "S") { start = { x, y }; return "."; }
        if (c === "F") { goal = { x, y }; return "."; }
        if (c === "G") { gems.push(`${x},${y}`); return "."; }
        if (c === "K") { keys.push(`${x},${y}`); return "."; }
        return c as Tile;
      })
    );
  });
  return {
    w: level.grid[0].length, h: level.grid.length, tiles, gems, totalGems: gems.length,
    keys, keysHeld: 0, goal, cubo: { ...start, dir: level.startDir },
  };
}

export const cloneWorld = (w: World): World => ({
  ...w,
  tiles: w.tiles.map((r) => [...r]),
  gems: [...w.gems],
  keys: [...w.keys],
  goal: { ...w.goal },
  cubo: { ...w.cubo },
});

export const DIRS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

export const WALKABLE = (t: Tile) => t === "." || t === "f" || t === "B" || t === "O";

export type StepKind =
  | "move" | "turn" | "collect" | "key" | "nothing" | "break" | "bridge" | "open" | "jump"
  | "check" | "bump" | "splash" | "burn" | "win";

export type Step = { kind: StepKind; blockId: string; world: World; at?: { x: number; y: number } };

export type Outcome =
  | { ok: true }
  | { ok: false; reason: "water" | "lava" | "blocked" | "notAtGoal" | "gemsMissing" | "tooLong" | "empty" };

class Stop extends Error {
  outcome: Outcome;
  constructor(outcome: Outcome) { super("stop"); this.outcome = outcome; }
}

export function countBlocks(list: Block[]): number {
  return list.reduce(
    (n, bl) => n + 1 + (bl.children ? countBlocks(bl.children) : 0) + (bl.alt ? countBlocks(bl.alt) : 0),
    0
  );
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

  const tileAt = (x: number, y: number): Tile =>
    x >= 0 && y >= 0 && x < w.w && y < w.h ? w.tiles[y][x] : "T";
  const ahead = (n = 1, dir: number = w.cubo.dir) => {
    const d = DIRS[dir];
    const x = w.cubo.x + d.x * n;
    const y = w.cubo.y + d.y * n;
    return { x, y, tile: tileAt(x, y) };
  };
  const snap = (kind: StepKind, blockId: string, at?: { x: number; y: number }): Step => ({
    kind, blockId, world: cloneWorld(w), at,
  });
  const atGoal = () => w.cubo.x === w.goal.x && w.cubo.y === w.goal.y;
  const winCheck = function* (id: string): Generator<Step, void> {
    if (atGoal() && w.gems.length === 0) {
      yield snap("win", id);
      throw new Stop({ ok: true });
    }
  };
  const test = (what: string | number) => {
    const f = ahead().tile;
    switch (what) {
      case "eau": return f === "W";
      case "rocher": return f === "R";
      case "lave": return f === "L";
      case "porte": return f === "D";
      case "chemin": return WALKABLE(f);
      case "droite": return WALKABLE(ahead(1, (w.cubo.dir + 1) % 4).tile);
      case "gauche": return WALKABLE(ahead(1, (w.cubo.dir + 3) % 4).tile);
      default: return false;
    }
  };

  function* land(x: number, y: number, id: string, kind: StepKind): Generator<Step, void> {
    const t = tileAt(x, y);
    if (t === "T" || t === "R" || t === "D") {
      yield snap("bump", id, { x, y });
      throw new Stop({ ok: false, reason: "blocked" });
    }
    w.cubo.x = x;
    w.cubo.y = y;
    if (t === "W") { yield snap("splash", id); throw new Stop({ ok: false, reason: "water" }); }
    if (t === "L") { yield snap("burn", id); throw new Stop({ ok: false, reason: "lava" }); }
    yield snap(kind, id);
    yield* winCheck(id);
  }

  function* exec(list: Block[]): Generator<Step, void> {
    for (const bl of list) {
      if (++steps > 600) throw new Stop({ ok: false, reason: "tooLong" });
      switch (bl.type) {
        case "avancer": {
          const f = ahead();
          yield* land(f.x, f.y, bl.id, "move");
          break;
        }
        case "sauter": {
          const over = ahead(1).tile;
          if (over === "T" || over === "D") {
            yield snap("bump", bl.id, ahead(1));
            throw new Stop({ ok: false, reason: "blocked" });
          }
          const f = ahead(2);
          yield* land(f.x, f.y, bl.id, "jump");
          break;
        }
        case "gauche":
        case "droite":
        case "demitour":
          w.cubo.dir = (((w.cubo.dir + (bl.type === "gauche" ? 3 : bl.type === "droite" ? 1 : 2)) % 4) as Dir);
          yield snap("turn", bl.id);
          break;
        case "ramasser": {
          const key = `${w.cubo.x},${w.cubo.y}`;
          const gi = w.gems.indexOf(key);
          const ki = w.keys.indexOf(key);
          if (gi >= 0) {
            w.gems.splice(gi, 1);
            yield snap("collect", bl.id, { x: w.cubo.x, y: w.cubo.y });
            yield* winCheck(bl.id);
          } else if (ki >= 0) {
            w.keys.splice(ki, 1);
            w.keysHeld++;
            yield snap("key", bl.id, { x: w.cubo.x, y: w.cubo.y });
          } else yield snap("nothing", bl.id);
          break;
        }
        case "casser": {
          const f = ahead();
          if (f.tile === "R") { w.tiles[f.y][f.x] = "."; yield snap("break", bl.id, f); }
          else yield snap("nothing", bl.id);
          break;
        }
        case "pont": {
          const f = ahead();
          if (f.tile === "W") { w.tiles[f.y][f.x] = "B"; yield snap("bridge", bl.id, f); }
          else yield snap("nothing", bl.id);
          break;
        }
        case "ouvrir": {
          const f = ahead();
          if (f.tile === "D" && w.keysHeld > 0) {
            w.tiles[f.y][f.x] = "O";
            w.keysHeld--;
            yield snap("open", bl.id, f);
          } else yield snap("nothing", bl.id);
          break;
        }
        case "repeter": {
          const n = Math.max(0, Math.min(20, Number(bl.params.n) || 0));
          for (let k = 0; k < n; k++) yield* exec(bl.children ?? []);
          break;
        }
        case "jusqua": {
          let guard = 0;
          while (!atGoal()) {
            if (++guard > 120 || !(bl.children ?? []).length) throw new Stop({ ok: false, reason: "tooLong" });
            yield* exec(bl.children ?? []);
          }
          break;
        }
        case "si": {
          const yes = test(bl.params.what);
          yield snap("check", bl.id);
          if (yes) yield* exec(bl.children ?? []);
          break;
        }
        case "sisinon": {
          const yes = test(bl.params.what);
          yield snap("check", bl.id);
          yield* exec((yes ? bl.children : bl.alt) ?? []);
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
  lava: "Ouille, la lave est brûlante ! Il fallait sauter par-dessus.",
  blocked: "Aïe ! Il y a un obstacle devant Cubo.",
  notAtGoal: "Presque ! Cubo n'est pas encore arrivé au coffre.",
  gemsMissing: "Il manque des gemmes ! Ramasse-les toutes avant le coffre.",
  tooLong: "Ton programme tourne en rond ou est trop long ! Vérifie tes boucles.",
  empty: "Ton programme est vide ! Glisse des blocs dans la zone de droite.",
};
