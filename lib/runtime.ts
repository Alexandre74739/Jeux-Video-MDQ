// Moteur des jeux créés en mode libre : chaque script est un « fil » (générateur)
// avancé à chaque image, comme dans Scratch.
import type { Block } from "./blocks";
import { sfx, type SfxName } from "./sound";

export const STAGE_W = 480;
export const STAGE_H = 360;
export const BASE = 64;

export type SpriteDef = {
  id: string;
  name: string;
  src: string;
  x: number;
  y: number;
  size: number;
  scripts: Block[];
};

export type Project = { bg: string; sprites: SpriteDef[] };

export type SpriteState = {
  id: string; x: number; y: number; size: number; visible: boolean;
  say: string | null; sayUntil: number; spin: number;
  /** Direction : 0 haut, 1 droite, 2 bas, 3 gauche (pour avancer / tourner / sauter). */
  dir: number;
  /** Décalage vertical pendant un saut. */
  jy: number;
};

export type Plank = { x: number; y: number; horizontal: boolean };

const STEP = 32;
const DIR = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
/** Conditions « … devant » : un personnage dont le nom correspond est juste devant. */
const NAMED: Record<string, RegExp> = {
  eau: /eau|vague|mer|lac|rivi/i,
  rocher: /rocher|pierre|caillou/i,
  lave: /lave|feu|volcan/i,
  porte: /porte/i,
};

type Thread = { hatId: string; spriteId: string; gen: Generator<void, void>; waitUntil: number };

export class Runtime {
  sprites: Record<string, SpriteState> = {};
  score = 0;
  ended: "win" | "lose" | null = null;
  scoreBump = 0;
  planks: Plank[] = [];
  private threads: Thread[] = [];
  private touching = new Set<string>();
  private now = 0;

  constructor(private project: Project, private onEnd: (r: "win" | "lose") => void) {
    for (const s of project.sprites) {
      this.sprites[s.id] = { id: s.id, x: s.x, y: s.y, size: s.size, visible: true, say: null, sayUntil: 0, spin: 0, dir: 1, jy: 0 };
    }
  }

  private hats(type: string, filter?: (b: Block) => boolean) {
    const res: { sprite: SpriteDef; hat: Block }[] = [];
    for (const sprite of this.project.sprites)
      for (const hat of sprite.scripts)
        if (hat.type === type && (!filter || filter(hat))) res.push({ sprite, hat });
    return res;
  }

  private start(sprite: SpriteDef, hat: Block, restart = false) {
    const running = this.threads.findIndex((t) => t.hatId === hat.id);
    if (running >= 0) {
      if (!restart) return;
      this.threads.splice(running, 1);
    }
    this.threads.push({ hatId: hat.id, spriteId: sprite.id, gen: this.exec(sprite.id, hat.children ?? []), waitUntil: 0 });
  }

  green() { for (const { sprite, hat } of this.hats("ev_start")) this.start(sprite, hat, true); }
  key(k: string) { for (const { sprite, hat } of this.hats("ev_key", (h) => h.params.key === k)) this.start(sprite, hat); }
  click(spriteId: string) {
    for (const { sprite, hat } of this.hats("ev_click")) if (sprite.id === spriteId) this.start(sprite, hat, true);
  }

  rect(id: string) {
    const s = this.sprites[id];
    const half = (BASE * s.size) / 100 / 2 * 0.72;
    return { l: s.x - half, r: s.x + half, t: s.y - half, b: s.y + half };
  }
  touches(a: string, b: string) {
    const A = this.sprites[a];
    const B = this.sprites[b];
    if (!A || !B || !A.visible || !B.visible || a === b) return false;
    const ra = this.rect(a);
    const rb = this.rect(b);
    return ra.l < rb.r && ra.r > rb.l && ra.t < rb.b && ra.b > rb.t;
  }

  private clamp(s: SpriteState) {
    const half = (BASE * s.size) / 200;
    s.x = Math.max(half * 0.5, Math.min(STAGE_W - half * 0.5, s.x));
    s.y = Math.max(half * 0.5, Math.min(STAGE_H - half * 0.5, s.y));
  }

  private nameOf(id: string) {
    return this.project.sprites.find((x) => x.id === id)?.name ?? "";
  }

  /** Premier autre personnage visible touché. */
  private touchingAny(id: string) {
    return this.project.sprites.find((o) => this.touches(id, o.id))?.id ?? null;
  }

  /** Personnages présents dans la case juste devant (ou à droite / à gauche) du personnage. */
  private ahead(id: string, turn = 0) {
    const s = this.sprites[id];
    const d = DIR[(s.dir + turn + 4) % 4];
    const r = this.rect(id);
    const box = { l: r.l + d.x * STEP, r: r.r + d.x * STEP, t: r.t + d.y * STEP, b: r.b + d.y * STEP };
    const inside = box.l >= 0 && box.t >= 0 && box.r <= STAGE_W && box.b <= STAGE_H;
    const hits = this.project.sprites.filter((o) => {
      const st = this.sprites[o.id];
      if (o.id === id || !st?.visible) return false;
      const ro = this.rect(o.id);
      return box.l < ro.r && box.r > ro.l && box.t < ro.b && box.b > ro.t;
    });
    return { inside, hits };
  }

  private test(id: string, what: string) {
    if (what === "chemin" || what === "droite" || what === "gauche") {
      const a = this.ahead(id, what === "droite" ? 1 : what === "gauche" ? -1 : 0);
      return a.inside && a.hits.length === 0;
    }
    const re = NAMED[what];
    return !!re && this.ahead(id).hits.some((o) => re.test(o.name));
  }

  private *exec(id: string, list: Block[]): Generator<void, void> {
    const s = this.sprites[id];
    for (const bl of list) {
      if (this.ended) return;
      const p = bl.params;
      switch (bl.type) {
        case "move": {
          const n = Number(p.n) || 0;
          if (p.dir === "right") s.x += n;
          if (p.dir === "left") s.x -= n;
          if (p.dir === "up") s.y -= n;
          if (p.dir === "down") s.y += n;
          const half = (BASE * s.size) / 200;
          s.x = Math.max(half * 0.5, Math.min(STAGE_W - half * 0.5, s.x));
          s.y = Math.max(half * 0.5, Math.min(STAGE_H - half * 0.5, s.y));
          yield;
          break;
        }
        // --- Blocs de l'aventure ---
        case "avancer": {
          const d = DIR[s.dir];
          for (let i = 0; i < 8; i++) { s.x += (d.x * STEP) / 8; s.y += (d.y * STEP) / 8; this.clamp(s); yield; }
          break;
        }
        case "gauche": s.dir = (s.dir + 3) % 4; yield; break;
        case "droite": s.dir = (s.dir + 1) % 4; yield; break;
        case "demitour": s.dir = (s.dir + 2) % 4; yield; break;
        case "sauter": {
          const d = DIR[s.dir];
          sfx("jump");
          for (let i = 1; i <= 16; i++) {
            s.x += (d.x * STEP * 2) / 16; s.y += (d.y * STEP * 2) / 16; this.clamp(s);
            s.jy = -Math.sin((Math.PI * i) / 16) * 48;
            yield;
          }
          s.jy = 0;
          break;
        }
        case "ramasser":
        case "casser":
        case "ouvrir": {
          const t = this.touchingAny(id);
          if (t) {
            this.sprites[t].visible = false;
            if (bl.type === "ramasser") { this.score += 1; this.scoreBump++; sfx("coin"); }
            else sfx(bl.type === "casser" ? "crack" : "magic");
          }
          yield;
          break;
        }
        case "pont": {
          const d = DIR[s.dir];
          this.planks.push({ x: s.x + d.x * STEP * 1.2, y: s.y + d.y * STEP * 1.2, horizontal: d.x !== 0 });
          sfx("plank");
          yield;
          break;
        }
        case "repeter": {
          const n = Number(p.n) || 0;
          for (let i = 0; i < n; i++) { yield* this.exec(id, bl.children ?? []); yield; }
          break;
        }
        case "jusqua":
          // « répéter jusqu'au coffre » : jusqu'à toucher un personnage nommé « Coffre ».
          while (!this.ended && !this.project.sprites.some((o) => /coffre/i.test(o.name) && this.touches(id, o.id))) {
            yield* this.exec(id, bl.children ?? []);
            yield;
          }
          break;
        case "si":
          if (this.test(id, String(p.what))) yield* this.exec(id, bl.children ?? []);
          break;
        case "sisinon":
          yield* this.exec(id, (this.test(id, String(p.what)) ? bl.children : bl.alt) ?? []);
          break;
        case "random":
          s.x = 40 + Math.random() * (STAGE_W - 80);
          s.y = 40 + Math.random() * (STAGE_H - 80);
          yield;
          break;
        case "goto_center":
          s.x = STAGE_W / 2; s.y = STAGE_H / 2;
          yield;
          break;
        case "say": {
          s.say = String(p.text);
          const until = this.now + 2000;
          s.sayUntil = until;
          while (this.now < until) yield;
          if (s.sayUntil === until) s.say = null;
          break;
        }
        case "grow": s.size = Math.min(300, s.size + 20); yield; break;
        case "shrink": s.size = Math.max(20, s.size - 20); yield; break;
        case "hide": s.visible = false; yield; break;
        case "show": s.visible = true; yield; break;
        case "spin": {
          for (let i = 0; i < 18; i++) { s.spin = (i + 1) * 20; yield; }
          s.spin = 0;
          break;
        }
        case "sound": sfx(String(p.s) as SfxName); yield; break;
        case "wait": {
          const until = this.now + (Number(p.n) || 0) * 1000;
          while (this.now < until) yield;
          break;
        }
        case "repeat": {
          const n = Number(p.n) || 0;
          for (let i = 0; i < n; i++) { yield* this.exec(id, bl.children ?? []); yield; }
          break;
        }
        case "forever":
          while (!this.ended) { yield* this.exec(id, bl.children ?? []); yield; }
          break;
        case "if_touch":
          if (this.touches(id, String(p.target))) yield* this.exec(id, bl.children ?? []);
          break;
        case "score_add": this.score += Number(p.n) || 0; this.scoreBump++; yield; break;
        case "score_reset": this.score = 0; this.scoreBump++; yield; break;
        case "win": this.end("win"); return;
        case "lose": this.end("lose"); return;
      }
    }
  }

  private end(r: "win" | "lose") {
    if (this.ended) return;
    this.ended = r;
    this.threads = [];
    this.onEnd(r);
  }

  /** Avance le jeu d'une image. */
  tick(now: number) {
    this.now = now;
    if (this.ended) return;
    // Collisions « quand je touche… » (déclenchées à l'entrée en contact)
    for (const { sprite, hat } of this.hats("ev_touch")) {
      const key = `${hat.id}`;
      const t = this.touches(sprite.id, String(hat.params.target));
      if (t && !this.touching.has(key)) { this.touching.add(key); this.start(sprite, hat); }
      if (!t) this.touching.delete(key);
    }
    for (const th of [...this.threads]) {
      let ops = 0;
      const r = th.gen.next();
      ops++;
      if (r.done || ops > 1000) this.threads = this.threads.filter((x) => x !== th);
      if (this.ended) return;
    }
  }
}

export const BACKGROUNDS: { id: string; name: string; css: string }[] = [
  { id: "ciel", name: "Ciel", css: "radial-gradient(circle at 80% 15%, #FFF3B0 0 28px, transparent 30px), radial-gradient(ellipse 60px 22px at 25% 25%, #fff 98%, transparent), radial-gradient(ellipse 80px 26px at 60% 40%, #fff 98%, transparent), linear-gradient(#8FD8FA, #D5F1FD)" },
  { id: "prairie", name: "Prairie", css: "linear-gradient(transparent 70%, #6CCB48 70% 74%, #7ED957 74% 82%, #9C6A3C 82%), radial-gradient(ellipse 70px 24px at 30% 22%, #fff 98%, transparent), linear-gradient(#8FD8FA, #D5F1FD)" },
  { id: "espace", name: "Espace", css: "radial-gradient(circle at 20% 30%, #fff 0 1.5px, transparent 2px), radial-gradient(circle at 70% 20%, #fff 0 2px, transparent 2.5px), radial-gradient(circle at 85% 70%, #fff 0 1.5px, transparent 2px), radial-gradient(circle at 40% 80%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 10% 85%, #C3A6FF 0 40px, transparent 42px), linear-gradient(#1B1640, #3B2A8A)" },
  { id: "ocean", name: "Océan", css: "radial-gradient(circle at 20% 80%, #ffffff55 0 6px, transparent 7px), radial-gradient(circle at 75% 60%, #ffffff55 0 9px, transparent 10px), linear-gradient(transparent 85%, #F2D49B 85%), linear-gradient(#4FC3F7, #1E6FB8)" },
  { id: "desert", name: "Désert", css: "radial-gradient(circle at 75% 20%, #FFD23F 0 30px, transparent 32px), radial-gradient(ellipse 260px 80px at 30% 100%, #E9B96E 98%, transparent), radial-gradient(ellipse 300px 90px at 85% 100%, #DDA55A 98%, transparent), linear-gradient(#FFE0B2, #FFC77D)" },
  { id: "nuit", name: "Nuit", css: "radial-gradient(circle at 80% 20%, #FFF3B0 0 26px, transparent 28px), radial-gradient(circle at 30% 30%, #fff 0 1.5px, transparent 2px), radial-gradient(circle at 55% 15%, #fff 0 1.5px, transparent 2px), linear-gradient(transparent 78%, #2D6B3A 78%), linear-gradient(#24305E, #4A5A9A)" },
  { id: "blanc", name: "Blanc", css: "#FFFFFF" },
];
