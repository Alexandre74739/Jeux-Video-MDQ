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
// Monstres (posés sur un chemin, ils avancent d'une case à chaque pas de Cubo) :
//          "M" / "m" Grognon (à esquiver) qui patrouille de gauche à droite / de haut en bas,
//          "N" / "n" Gloups (on peut le battre avec « frapper ») qui patrouille de gauche à droite / de haut en bas
export type Tile = "." | "f" | "T" | "W" | "R" | "B" | "L" | "D" | "O";

/** Grognon : costaud et invincible, il faut l'esquiver. Gloups : on peut le battre avec « frapper » quand il est juste devant. */
export type MobKind = "gloups" | "grognon";
/** Monstre du niveau : il avance d'une case à chaque pas de Cubo et fait demi-tour contre un obstacle. On ne passe jamais sur lui. */
export type Mob = { id: number; kind: MobKind; x: number; y: number; dir: Dir };

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
  mobs: Mob[];
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
  /** Monde secret : étoiles nécessaires pour l'ouvrir. */
  unlockStars?: number;
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
const att = () => b("attendre");
const frap = () => b("frapper");

type RawLevel = Omit<LevelDef, "optimal" | "id"> & { optimal?: number };
const numbered = (raw: RawLevel[]): LevelDef[] =>
  raw.map((l, i) => ({ ...l, id: i + 1, optimal: l.optimal ?? countBlocks(l.solution) }));

const BASE = ["avancer", "gauche", "droite"];
const B1 = [...BASE, "demitour", "ramasser", "casser", "pont", "ouvrir", "repeter"];
const B2 = [...BASE, "demitour", "ramasser", "casser", "pont", "sauter", "repeter", "jusqua", "si"];
const B4 = [...BASE, "demitour", "ramasser", "ouvrir", "sauter", "attendre", "frapper", "repeter", "jusqua", "si", "sisinon"];
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

// ---------------------------------------------------------------- DÉFI BONUS : LE VILLAGE DES CUBES
// Deux monstres qui se déplacent : Grognon (M / m, à esquiver) et Gloups (N / n, on peut le battre avec « frapper »).
// On ne peut jamais passer sur un monstre.
const VILLAGE: RawLevel[] = [
  {
    title: "Voici Gloups", concept: "Frapper",
    goal: "Voici Gloups, le monstre vert tout gluant ! Lui, on peut le battre : quand il est JUSTE devant Cubo, utilise « frapper ».",
    tip: "Avance 4 fois, attends que Gloups arrive juste devant toi, frappe-le, puis avance 2 fois.",
    grid: ["TTTTTTTTT", "TS.N...FT", "TTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [rep(4, [av()]), att(), frap(), rep(2, [av()])],
  },
  {
    title: "Attends ton tour", concept: "Attendre",
    goal: "Voici Grognon, le monstre violet à cornes : lui, on ne peut pas le battre ! À chaque pas de Cubo, il fait un pas. Utilise « attendre » pour le laisser passer : on ne peut jamais marcher sur lui.",
    tip: "Avance une fois, attends 2 fois que Grognon passe, puis avance 4 fois.",
    grid: ["TTTTTTTT", "TS....FT", "TTTT.TTT", "TTTT.TTT", "TTTTmTTT", "TTTTTTTT"], startDir: 1,
    blocks: B4, solution: [av(), rep(2, [att()]), rep(4, [av()])],
  },
  {
    title: "Deux Gloups", concept: "Frapper",
    goal: "Deux Gloups se promènent dans le couloir. Attends le bon moment pour les frapper, sans jamais marcher sur eux !",
    tip: "Avance 5 fois et frappe le premier Gloups. Avance, attends le deuxième, frappe-le, puis avance 2 fois.",
    grid: ["TTTTTTTTTTT", "TS.N..N..FT", "TTTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [rep(5, [av()]), frap(), av(), att(), frap(), rep(2, [av()])],
  },
  {
    title: "La ronde de Grognon", concept: "Attendre",
    goal: "Grognon se promène de gauche à droite. Traverse son chemin sans jamais te trouver sur sa case !",
    tip: "Avance une fois, attends 2 fois, puis avance 3 fois.",
    grid: ["TTTTTTTT", "TTTFTTTT", "TTT.TTTT", "TM.....T", "TTT.TTTT", "TTTSTTTT", "TTTTTTTT"], startDir: 0,
    blocks: B4, solution: [av(), rep(2, [att()]), rep(3, [av()])],
  },
  {
    title: "Si monstre devant… sinon", concept: "Condition",
    goal: "Deux Grognons gardent le chemin. Nouveau bloc « si… sinon » : SI un monstre arrive devant, Cubo attend, SINON il avance.",
    tip: "Jusqu'au coffre : si monstre devant → attendre, sinon → avancer.",
    grid: ["TTTTTTTTTTT", "TS..m....FT", "TTTT.TTmTTT", "TTTT.TT.TTT", "TTTT.TT.TTT", "TTTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [jusqua([sisinon("monstre", [att()], [av()])])],
  },
  {
    title: "Lave et Grognon", concept: "Conditions imbriquées",
    goal: "De la lave ET un Grognon ! Cubo vérifie d'abord le monstre, puis la lave.",
    tip: "Jusqu'au coffre : si monstre → attendre, sinon (si lave → sauter, sinon → avancer).",
    grid: ["TTTTTTTTTT", "TS.L...LFT", "TTTTT.TTTT", "TTTTT.TTTT", "TTTTTmTTTT", "TTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [jusqua([sisinon("monstre", [att()], [sisinon("lave", [saut()], [av()])])])],
  },
  {
    title: "Grognon ou Gloups ?", concept: "Conditions imbriquées",
    goal: "Un Grognon ET un Gloups ! Gloups devant ? On le frappe. Sinon, un monstre arrive ? On attend. Sinon, on avance.",
    tip: "Jusqu'au coffre : ramasser, puis si Gloups devant → frapper, sinon (si monstre devant → attendre, sinon → avancer).",
    grid: ["TTTTTTTTTTTT", "TS.Gm.GN.GFT", "TTTT.TT.TTTT", "TTTT.TT.TTTT", "TTTT.TT.TTTT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [jusqua([ram(), sisinon("gloups", [frap()], [sisinon("monstre", [att()], [av()])])])],
  },
  {
    title: "Clé, porte et Grognon", concept: "Condition",
    goal: "Une porte, puis Grognon qui fait sa ronde derrière. Il faudra être patient !",
    tip: "Avance, ramasse la clé, ouvre la porte. Puis jusqu'au coffre : si monstre → attendre, sinon → avancer.",
    grid: ["TTTTTTTTTT", "TSKD....FT", "TTTTTTmTTT", "TTTTTT.TTT", "TTTTTT.TTT", "TTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [av(), ram(), ouv(), jusqua([sisinon("monstre", [att()], [av()])])],
  },
  {
    title: "La cueillette", concept: "Boucle + condition",
    goal: "Ramasse les 3 gemmes sans te faire attraper par les deux Grognons !",
    tip: "Jusqu'au coffre : ramasser, puis si monstre → attendre, sinon → avancer.",
    grid: ["TTTTTTTTTTTT", "TS.Gm.Gm.GFT", "TTTT.TT.TTTT", "TTTT.TT.TTTT", "TTTT.TT.TTTT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [jusqua([ram(), sisinon("monstre", [att()], [av()])])],
  },
  {
    title: "La nuit au village", concept: "Algorithme",
    goal: "Le grand final ! Clé, porte, gemmes, un Grognon à esquiver et un Gloups à battre. Écris UNE boucle qui sait tout faire !",
    tip: "Jusqu'au coffre : ramasser, si porte → ouvrir, puis si Gloups → frapper, sinon (si monstre → attendre, sinon → avancer).",
    grid: ["TTTTTTTTTTTTTT", "TSGKDGm.GN..FT", "TTTTTT.TT.T.TT", "TTTTTT.TT.T.TT", "TTTTTT.TT.T.TT", "TTTTTTTTTTTTTT"], startDir: 1,
    blocks: B4, solution: [jusqua([ram(), si("porte", [ouv()]), sisinon("gloups", [frap()], [sisinon("monstre", [att()], [av()])])])],
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

// ---------------------------------------------------------------- MONDE FINAL : L'ÎLE SECRÈTE
const ILE: RawLevel[] = [
  {
    title: "L'arrivée sur l'île", concept: "Séquence",
    goal: "Le bateau a accosté ! Pose un pont pour traverser, ramasse la gemme et file au coffre.",
    tip: "Avance, pose un pont, avance 3 fois, ramasse, puis fais un dernier pas.",
    grid: ["WWWWWWWW", "WS.W.GFW", "WWWWWWWW"], startDir: 1,
    blocks: B3, solution: [av(), pont(), rep(3, [av()]), ram(), av()],
  },
  {
    title: "Les cocotiers", concept: "Boucle",
    goal: "Des rochers et des gemmes, encore et encore. Trouve le motif qui se répète !",
    tip: "Le motif : casser, avancer, avancer, ramasser. Répète-le 3 fois, puis avance.",
    grid: ["WWWWWWWWWW", "WSRGRGRGFW", "WWTWWTWWTW"], startDir: 1,
    blocks: B3, solution: [rep(3, [cas(), av(), av(), ram()]), av()],
  },
  {
    title: "Les pierres du lagon", concept: "Boucle",
    goal: "Marche de pierre en pierre sans tomber à l'eau, et ramasse la gemme de chaque pierre !",
    tip: "Une marche : avancer, ramasser, tourner à gauche, avancer, tourner à droite. Répète 4 fois, puis avance.",
    grid: ["WWWWWWWW", "WWWWW.FW", "WWWW.GWW", "WWW.GWWW", "WW.GWWWW", "WSGWWWWW", "WWWWWWWW"], startDir: 1,
    blocks: B3, solution: [rep(4, [av(), ram(), tg(), av(), td()]), av()],
  },
  {
    title: "Le gué brûlant", concept: "Conditions",
    goal: "De l'eau et de la lave sur le chemin ! Laisse Cubo décider tout seul à chaque pas.",
    tip: "Jusqu'au coffre : si eau → pont. Puis si lave → sauter, sinon → avancer.",
    grid: ["WWWWWLWWWLWW", "WS.W.L..WLFW", "WWWWWLWWWLWW"], startDir: 1,
    blocks: B3, solution: [jusqua([si("eau", [pont()]), sisinon("lave", [saut()], [av()])])],
  },
  {
    title: "La grotte aux clés", concept: "Si… sinon",
    goal: "Le chemin tourne et les portes sont fermées. Une seule règle peut tout faire !",
    tip: "Jusqu'au coffre : ramasser, puis si porte → ouvrir, sinon (si chemin devant → avancer, sinon → tourner à droite).",
    grid: ["TTTTTTT", "TSK.D.T", "TTTTT.T", "TF.DK.T", "TTTTTTT"], startDir: 1,
    blocks: B3, solution: [jusqua([ram(), sisinon("porte", [ouv()], [sisinon("chemin", [av()], [td()])])])],
  },
  {
    title: "Le ponton", concept: "Boucle",
    goal: "Le lagon est profond ! Construis un long ponton planche par planche jusqu'à la plage.",
    tip: "Répète 4 fois « poser un pont, avancer », puis ramasse la gemme et avance.",
    grid: ["WWWWWWWWW", "WSWWWWGFW", "WWWWWWWWW"], startDir: 1,
    blocks: B3, solution: [rep(4, [pont(), av()]), av(), ram(), av()],
  },
  {
    title: "Rochers et lave", concept: "Conditions",
    goal: "Sur le sentier du volcan de l'île, il y a des rochers et de la lave. Laisse Cubo décider tout seul !",
    tip: "Jusqu'au coffre : si rocher → casser. Puis si lave → sauter, sinon → avancer.",
    grid: ["WWWWWWWWWWWW", "WS.R.L.RL.FW", "WWWWWWWWWWWW"], startDir: 1,
    blocks: B3, solution: [jusqua([si("rocher", [cas()]), sisinon("lave", [saut()], [av()])])],
  },
  {
    title: "Le tour du phare", concept: "Boucles imbriquées",
    goal: "Fais le tour du phare en posant des ponts, et ramasse la gemme de chaque coin.",
    tip: "Un côté : répète 3 fois « si eau → pont, avancer », puis ramasser et tourner à droite. Répète les 4 côtés.",
    grid: ["WWWWWWW", "WS.W.GW", "WFTTT.W", "WWTTTWW", "W.TTT.W", "WG.W.GW", "WWWWWWW"], startDir: 1,
    blocks: B3, solution: [rep(4, [rep(4, [si("eau", [pont()]), av()]), ram(), td()])],
  },
  {
    title: "La crique en spirale", concept: "Algorithme",
    goal: "Le sentier s'enroule autour de la crique. Ramasse les gemmes et trouve le coffre au centre !",
    tip: "Jusqu'au coffre : ramasser, puis si chemin devant → avancer, sinon → tourner à droite.",
    grid: ["WWWWWWWW", "WS..G..W", "WWWWWW.W", "W.G.FW.W", "W.WWWWGW", "W..G...W", "WWWWWWWW"], startDir: 1,
    blocks: B3, solution: [jusqua([ram(), sisinon("chemin", [av()], [td()])])],
  },
  {
    title: "Le trésor de l'île", concept: "Tout ensemble",
    goal: "Le grand final ! Clé, porte, rocher, rivière, lave et gemmes : écris le programme qui sait tout faire.",
    tip: "Jusqu'au coffre : ramasser, si eau → pont, si rocher → casser, si porte → ouvrir, puis si lave → sauter, sinon (si chemin → avancer, sinon → tourner à droite).",
    grid: ["TTTTTTTTTT", "TSK.D.R.GT", "TfTTTTTTWT", "TTTTTTTT.T", "TTTTfTTTLT", "TTTF.L.G.T", "TTTTTTTTTT"], startDir: 1,
    blocks: B3,
    solution: [jusqua([
      ram(), si("eau", [pont()]), si("rocher", [cas()]), si("porte", [ouv()]),
      sisinon("lave", [saut()], [sisinon("chemin", [av()], [td()])]),
    ])],
  },
];

// ---------------------------------------------------------------- DÉFI MOYEN : LA RIVIÈRE DES CASTORS
const BR = [...BASE, "demitour", "ramasser", "casser", "pont", "repeter", "si"];
const RIVIERE: RawLevel[] = [
  {
    title: "Le gué", concept: "Boucle",
    goal: "Les castors ont laissé deux trous d'eau sur le chemin. Trouve le motif qui se répète !",
    tip: "Répète 2 fois « avancer, poser un pont, avancer », puis avance 2 fois.",
    grid: ["TTTTTTTTT", "TS.W.W.FT", "TTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(2, [av(), pont(), av()]), rep(2, [av()])],
  },
  {
    title: "Les galets brillants", concept: "Boucle",
    goal: "Une gemme toutes les deux cases au bord de la rivière. Une boucle fera le travail !",
    tip: "Répète 3 fois « avancer, ramasser, avancer », puis un dernier pas.",
    grid: ["TTTTTTTTTT", "TSG.G.G.FT", "TTTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(3, [av(), ram(), av()]), av()],
  },
  {
    title: "Le barrage", concept: "Actions",
    goal: "Rochers et eau bloquent le chemin des castors. Dans quel ordre faut-il agir ?",
    tip: "Avance, casse, avance 2 fois, pose un pont, avance 2 fois, casse, puis avance 3 fois.",
    grid: ["TTTTTTTTTTT", "TS.R.W.R.FT", "TTTTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [av(), cas(), rep(2, [av()]), pont(), rep(2, [av()]), cas(), rep(3, [av()])],
  },
  {
    title: "L'escalier du moulin", concept: "Boucle",
    goal: "Chaque marche de l'escalier tombe dans l'eau. Trouve la marche qui se répète !",
    tip: "Une marche : avancer, tourner à droite, poser un pont, avancer, tourner à gauche. Répète 3 fois, puis avance.",
    grid: ["TTTTTTT", "TS.TTTT", "TTW.TTT", "TTTW.TT", "TTTTWFT", "TTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(3, [av(), td(), pont(), av(), tg()]), av()],
  },
  {
    title: "La gemme du castor", concept: "Demi-tour",
    goal: "Le castor a caché une gemme derrière Cubo. Va la chercher avant de traverser !",
    tip: "Demi-tour, avance, ramasse, demi-tour, avance 2 fois, pose un pont, puis avance 4 fois.",
    grid: ["TTTTTTTTT", "TGS.W..FT", "TTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [dt(), av(), ram(), dt(), rep(2, [av()]), pont(), rep(4, [av()])],
  },
  {
    title: "Le tour de la hutte", concept: "Boucles imbriquées",
    goal: "Fais le tour de la hutte des castors : chaque côté a son trou d'eau et une gemme au coin.",
    tip: "Un côté : avancer, poser un pont, avancer 3 fois, ramasser, tourner à droite. Répète 4 fois.",
    grid: ["TTTTTTT", "TS.W.GT", "TFTTT.T", "TWTTTWT", "T.TTT.T", "TG.W.GT", "TTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(4, [av(), pont(), rep(3, [av()]), ram(), td()])],
  },
  {
    title: "Si eau devant", concept: "Condition",
    goal: "L'eau est n'importe où ! Cubo doit vérifier à chaque pas : SI il y a de l'eau, ALORS il pose un pont.",
    tip: "Répète 8 fois : « si eau devant → poser un pont », puis « avancer ».",
    grid: ["TTTTTTTTTTT", "TS.W.WW..FT", "TTTTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(8, [si("eau", [pont()]), av()])],
  },
  {
    title: "Rochers ou rivière ?", concept: "Conditions",
    goal: "Un rocher ? On le casse. De l'eau ? On pose un pont. Cubo doit tout vérifier avant chaque pas.",
    tip: "Répète 8 fois : si eau → pont, si rocher → casser, puis avancer.",
    grid: ["TTTTTTTTTTT", "TSRW.R.W.FT", "TTTTTTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(8, [si("eau", [pont()]), si("rocher", [cas()]), av()])],
  },
  {
    title: "Le grand méandre", concept: "Boucles imbriquées",
    goal: "La rivière fait des virages comme un serpent. Repère le grand motif et répète-le !",
    tip: "Avance 4 fois, droite, avance 2 fois, droite, avance 4 fois, gauche, avance 2 fois, gauche. Répète tout 2 fois.",
    grid: ["TTTTTTT", "TS....T", "TTTTT.T", "T.....T", "T.TTTTT", "T....FT", "TTTTTTT"], startDir: 1,
    blocks: BR,
    solution: [rep(2, [rep(4, [av()]), td(), rep(2, [av()]), td(), rep(4, [av()]), tg(), rep(2, [av()]), tg()])],
  },
  {
    title: "Le barrage des castors", concept: "Tout ensemble",
    goal: "Le grand final de la rivière : fais le tour du barrage, casse les rochers, pose les ponts et ramasse les gemmes !",
    tip: "Un côté : répète 4 fois (si eau → pont, si rocher → casser, avancer), puis ramasser et tourner à droite. Répète les 4 côtés.",
    grid: ["TTTTTTT", "TS.R.GT", "TFTTT.T", "TWTTTRT", "T.TTT.T", "TG.W.GT", "TTTTTTT"], startDir: 1,
    blocks: BR, solution: [rep(4, [rep(4, [si("eau", [pont()]), si("rocher", [cas()]), av()]), ram(), td()])],
  },
];

// ---------------------------------------------------------------- DÉFI EXPERT : LE CHÂTEAU DU DRAGON
const BX = [...BASE, "demitour", "ramasser", "casser", "pont", "ouvrir", "sauter", "attendre", "frapper", "repeter", "jusqua", "si", "sisinon"];
const CHATEAU: RawLevel[] = [
  {
    title: "Le pont-levis", concept: "Conditions",
    goal: "Clés, portes et douves : une seule boucle doit savoir tout faire pour entrer dans le château !",
    tip: "Jusqu'au coffre : ramasser, si porte → ouvrir, si eau → pont, puis avancer.",
    grid: ["TTTTTTTTTTTT", "TSK.DWW.KDFT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([ram(), si("porte", [ouv()]), si("eau", [pont()]), av()])],
  },
  {
    title: "La tour en spirale", concept: "Algorithme",
    goal: "L'escalier de la tour tourne en spirale. Casse les rochers, ramasse les gemmes et monte jusqu'au coffre !",
    tip: "Jusqu'au coffre : ramasser, si rocher → casser, puis si chemin devant → avancer, sinon → tourner à droite.",
    grid: ["TTTTTTT", "TS.R..T", "TTTTT.T", "T..FT.T", "T.TTTGT", "T..G..T", "TTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([ram(), si("rocher", [cas()]), sisinon("chemin", [av()], [td()])])],
  },
  {
    title: "Les couloirs secrets", concept: "Algorithme",
    goal: "Un labyrinthe dans les murs du château, avec une porte fermée. Garde la main droite sur le mur !",
    tip: "Jusqu'au coffre : ramasser, si porte → ouvrir, puis si chemin à droite → (droite, avancer), sinon (si chemin devant → avancer, sinon → gauche).",
    grid: ["TTTTTTT", "TSK.T.T", "TTT.T.T", "T..D..T", "T.TTTTT", "T..FTTT", "TTTTTTT"], startDir: 1,
    blocks: BX,
    solution: [jusqua([ram(), si("porte", [ouv()]), sisinon("droite", [td(), av()], [sisinon("chemin", [av()], [tg()])])])],
  },
  {
    title: "La garde du château", concept: "Conditions imbriquées",
    goal: "Un Gloups et deux Grognons gardent la cour. Gloups devant ? On frappe. Un monstre arrive ? On attend. Sinon, on avance !",
    tip: "Jusqu'au coffre : si Gloups devant → frapper, sinon (si monstre devant → attendre, sinon → avancer).",
    grid: ["TTTTTTTTTTTT", "TS.N.m..m.FT", "TTT.T.TT.TTT", "TTT.T.TT.TTT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([sisinon("gloups", [frap()], [sisinon("monstre", [att()], [av()])])])],
  },
  {
    title: "Les douves de lave", concept: "Conditions imbriquées",
    goal: "De la lave, un Grognon et un Gloups ! D'abord les monstres, ensuite la lave.",
    tip: "Jusqu'au coffre : si Gloups → frapper, sinon (si monstre → attendre, sinon (si lave → sauter, sinon → avancer)).",
    grid: ["TTTTTTTTTTTT", "TS.L.m.L..FT", "TTTTT.TT.TTT", "TTTTT.TT.TTT", "TTTTTnTT.TTT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([sisinon("gloups", [frap()], [sisinon("monstre", [att()], [sisinon("lave", [saut()], [av()])])])])],
  },
  {
    title: "La salle des gemmes", concept: "Algorithme",
    goal: "Trois gemmes, deux Gloups à battre et un Grognon à esquiver. Ne laisse aucune gemme derrière toi !",
    tip: "Jusqu'au coffre : ramasser, puis si Gloups → frapper, sinon (si monstre → attendre, sinon → avancer).",
    grid: ["TTTTTTTTTTTT", "TSGN.Gm.GNFT", "TTT.TT.TT.TT", "TTT.TT.TT.TT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([ram(), sisinon("gloups", [frap()], [sisinon("monstre", [att()], [av()])])])],
  },
  {
    title: "L'escalier brûlant", concept: "Boucle",
    goal: "Chaque marche du donjon a son trou de lave et sa gemme. Trouve la marche qui se répète !",
    tip: "Une marche : sauter, ramasser, tourner à droite, avancer, tourner à gauche. Répète 4 fois.",
    grid: ["TTTTTTTTTTT", "TSLGTTTTTTT", "TTT.LGTTTTT", "TTTTT.LGTTT", "TTTTTTT.LFT", "TTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [rep(4, [saut(), ram(), td(), av(), tg()])],
  },
  {
    title: "Le pont des gardes", concept: "Conditions imbriquées",
    goal: "Les douves, un Grognon qui fait sa ronde et un Gloups sur le pont. Garde ton calme !",
    tip: "Jusqu'au coffre : si eau → pont. Puis si Gloups → frapper, sinon (si monstre → attendre, sinon → avancer).",
    grid: ["TTTTTTTTTTTT", "TS.W.m.WN.FT", "TTTTT.TT.TTT", "TTTTT.TT.TTT", "TTTTT.TT.TTT", "TTTTTTTTTTTT"], startDir: 1,
    blocks: BX, solution: [jusqua([si("eau", [pont()]), sisinon("gloups", [frap()], [sisinon("monstre", [att()], [av()])])])],
  },
  {
    title: "Les oubliettes", concept: "Algorithme",
    goal: "Le grand labyrinthe des oubliettes, avec un rocher et des gemmes cachées. La main droite te guidera !",
    tip: "Jusqu'au coffre : ramasser, si rocher → casser, puis si chemin à droite → (droite, avancer), sinon (si chemin devant → avancer, sinon → gauche).",
    grid: ["TTTTTTTTT", "TS.T...GT", "TT.T.TT.T", "T..R.TG.T", "T.TTTT.TT", "TGTF...TT", "TTTTTTTTT"], startDir: 1,
    blocks: BX,
    solution: [jusqua([ram(), si("rocher", [cas()]), sisinon("droite", [td(), av()], [sisinon("chemin", [av()], [tg()])])])],
  },
  {
    title: "Le trésor du dragon", concept: "Tout ensemble",
    goal: "Le défi ultime : clé, porte, lave, gemmes, un Grognon à esquiver et un Gloups à battre. Écris LA boucle parfaite !",
    tip: "Jusqu'au coffre : ramasser, si porte → ouvrir, puis si Gloups → frapper, sinon (si monstre → attendre, sinon (si lave → sauter, sinon → avancer)).",
    grid: ["TTTTTTTTTTTTTTT", "TSGKDG..L.Gm.FT", "TTTTTTnTTTT.TTT", "TTTTTT.TTTT.TTT", "TTTTTT.TTTT.TTT", "TTTTTTTTTTTTTTT"], startDir: 1,
    blocks: BX,
    solution: [jusqua([ram(), si("porte", [ouv()]), sisinon("gloups", [frap()], [sisinon("monstre", [att()], [sisinon("lave", [saut()], [av()])])])])],
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
    slug: "riviere", title: "La rivière des castors", subtitle: "Ponts, rochers et méandres : entraîne-toi aux boucles et aux conditions.",
    difficulty: 2, color: "#7FDBDA", newBlocks: [], preview: 6, levels: numbered(RIVIERE),
  },
  {
    slug: "volcan", title: "Le volcan", subtitle: "Saute par-dessus la lave et répète jusqu'au coffre.",
    difficulty: 3, color: "#FFA94D", newBlocks: ["sauter", "jusqua"], preview: 9, levels: numbered(VOLCAN),
  },
  {
    slug: "village", title: "Le village des monstres", subtitle: "Esquive Grognon, le monstre à cornes, et bats Gloups, le monstre gluant !",
    difficulty: 3, color: "#B9E769", newBlocks: ["attendre", "frapper", "sisinon"], preview: 10, levels: numbered(VILLAGE),
  },
  {
    slug: "labyrinthe", title: "Le labyrinthe du maître", subtitle: "Si… sinon, labyrinthes et vrais algorithmes de pro.",
    difficulty: 4, color: "#C3A6FF", newBlocks: ["sisinon"], preview: 10, levels: numbered(MAITRE),
  },
  {
    slug: "chateau", title: "Le château du dragon", subtitle: "Algorithmes, lave et gardes monstres : le défi des vrais experts !",
    difficulty: 4, color: "#FF8FC7", newBlocks: [], preview: 10, levels: numbered(CHATEAU),
  },
  {
    slug: "ile-secrete", title: "L'île secrète", subtitle: "Le monde caché de la carte au trésor. Tous tes blocs pour une seule aventure !",
    difficulty: 3, color: "#5EE6C8", newBlocks: [], preview: 3, levels: numbered(ILE), unlockStars: 60,
  },
];

/** Nombre total de niveaux, tous parcours confondus. */
export const TOTAL_LEVELS = COURSES.reduce((n, c) => n + c.levels.length, 0);

/** Parcours présentés publiquement (accueil, SEO) : les mondes à débloquer restent une surprise du jeu. */
export const PUBLIC_COURSES = COURSES.filter((c) => !c.unlockStars);
export const PUBLIC_LEVELS = PUBLIC_COURSES.reduce((n, c) => n + c.levels.length, 0);

/** Rétrocompatibilité : niveaux du tutoriel. */
export const LEVELS = COURSES[0].levels;

export function buildWorld(level: LevelDef): World {
  const tiles: Tile[][] = [];
  const gems: string[] = [];
  const keys: string[] = [];
  const mobs: Mob[] = [];
  let start = { x: 0, y: 0 };
  let goal = { x: 0, y: 0 };
  level.grid.forEach((row, y) => {
    tiles.push(
      row.split("").map((c, x) => {
        if (c === "S") { start = { x, y }; return "."; }
        if (c === "F") { goal = { x, y }; return "."; }
        if (c === "G") { gems.push(`${x},${y}`); return "."; }
        if (c === "K") { keys.push(`${x},${y}`); return "."; }
        if ("MmNn".includes(c)) {
          mobs.push({ id: mobs.length, kind: c === "M" || c === "m" ? "grognon" : "gloups", x, y, dir: c === "M" || c === "N" ? 1 : 2 });
          return ".";
        }
        return c as Tile;
      })
    );
  });
  return {
    w: level.grid[0].length, h: level.grid.length, tiles, gems, totalGems: gems.length,
    keys, keysHeld: 0, goal, cubo: { ...start, dir: level.startDir }, mobs,
  };
}

export const cloneWorld = (w: World): World => ({
  ...w,
  tiles: w.tiles.map((r) => [...r]),
  gems: [...w.gems],
  keys: [...w.keys],
  goal: { ...w.goal },
  cubo: { ...w.cubo },
  mobs: w.mobs.map((m) => ({ ...m })),
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
  | "check" | "bump" | "splash" | "burn" | "win" | "wait" | "hit" | "caught";

export type Step = { kind: StepKind; blockId: string; world: World; at?: { x: number; y: number } };

export type Outcome =
  | { ok: true }
  | { ok: false; reason: "water" | "lava" | "blocked" | "monster" | "notAtGoal" | "gemsMissing" | "tooLong" | "empty" };

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
  const monsters = () => w.mobs;
  const monsterAt = (x: number, y: number) => monsters().some((m) => m.x === x && m.y === y);
  const free = (x: number, y: number) => WALKABLE(tileAt(x, y));
  /** Prochaine case d'un monstre : tout droit, ou demi-tour s'il est bloqué. */
  const nextOf = (m: Mob) => {
    for (const dir of [m.dir, ((m.dir + 2) % 4) as Dir]) {
      const x = m.x + DIRS[dir].x;
      const y = m.y + DIRS[dir].y;
      if (free(x, y)) return { x, y, dir };
    }
    return { x: m.x, y: m.y, dir: m.dir };
  };
  /** Les monstres font un pas. Vrai si l'un d'eux attrape Cubo (même case, ou ils se croisent). */
  // Règle : Cubo ne peut jamais passer par la case d'un monstre (ni marcher, ni sauter dessus).
  const tick = (from: { x: number; y: number }) => {
    let caught = false;
    for (const m of monsters()) {
      const n = nextOf(m);
      const swap = n.x === from.x && n.y === from.y && m.x === w.cubo.x && m.y === w.cubo.y;
      Object.assign(m, n);
      if (swap || (m.x === w.cubo.x && m.y === w.cubo.y)) caught = true;
    }
    return caught;
  };
  const test = (what: string | number) => {
    const f = ahead().tile;
    switch (what) {
      case "gloups": {
        const a = ahead();
        return w.mobs.some((m) => m.kind === "gloups" && m.x === a.x && m.y === a.y);
      }
      case "monstre": {
        const a = ahead();
        return monsters().some((m) => {
          const n = nextOf(m);
          return (m.x === a.x && m.y === a.y) || (n.x === a.x && n.y === a.y);
        });
      }
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
    if (monsterAt(x, y)) {
      // Interdit de marcher (ou d'atterrir) sur un monstre
      w.cubo.x = x;
      w.cubo.y = y;
      yield snap("caught", id);
      throw new Stop({ ok: false, reason: "monster" });
    }
    const from = { x: w.cubo.x, y: w.cubo.y };
    w.cubo.x = x;
    w.cubo.y = y;
    if (t === "W") { yield snap("splash", id); throw new Stop({ ok: false, reason: "water" }); }
    if (t === "L") { yield snap("burn", id); throw new Stop({ ok: false, reason: "lava" }); }
    yield* step(kind, id, from);
    yield* winCheck(id);
  }

  /** Cubo a agi (pas, saut ou attente) : les monstres bougent en même temps que lui. */
  function* step(kind: StepKind, id: string, from: { x: number; y: number }): Generator<Step, void> {
    const caught = tick(from);
    yield snap(kind, id);
    if (caught) { yield snap("caught", id); throw new Stop({ ok: false, reason: "monster" }); }
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
          if (monsterAt(ahead(1).x, ahead(1).y)) {
            // Impossible de sauter par-dessus un monstre : il attrape Cubo au passage
            yield snap("caught", bl.id, ahead(1));
            throw new Stop({ ok: false, reason: "monster" });
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
        case "attendre":
          yield* step("wait", bl.id, { x: w.cubo.x, y: w.cubo.y });
          break;
        case "frapper": {
          // Seul un Gloups juste devant peut être battu ; Grognon est trop costaud (le coup rebondit).
          const f = ahead();
          const g = w.mobs.find((m) => m.kind === "gloups" && m.x === f.x && m.y === f.y);
          if (g) {
            w.mobs = w.mobs.filter((m) => m !== g);
            yield snap("hit", bl.id, f);
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
  monster: "Un monstre a attrapé Cubo ! On ne passe jamais sur un monstre : esquive Grognon, frappe Gloups.",
  notAtGoal: "Presque ! Cubo n'est pas encore arrivé au coffre.",
  gemsMissing: "Il manque des gemmes ! Ramasse-les toutes avant le coffre.",
  tooLong: "Ton programme tourne en rond ou est trop long ! Vérifie tes boucles.",
  empty: "Ton programme est vide ! Glisse des blocs dans la zone de droite.",
};
