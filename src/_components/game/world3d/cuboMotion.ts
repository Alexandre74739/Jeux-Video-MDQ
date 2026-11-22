import * as THREE from "three";
import type { World } from "@/lib/levels";
import { ANGLE } from "./materials";

/** État des animations de Cubo, gardé d'une image à l'autre. */
export type CuboMotion = {
  /** Effets en cours (0 = aucun) : se cogner, tomber à l'eau, victoire, petit hochement. */
  fx: { bump: number; splash: number; win: number; nod: number };
  /** Case visée et longueur du déplacement en cours (pour la hauteur du saut). */
  span: { tx: number; tz: number; d: number };
  /** Vrai juste après une remise à zéro : Cubo est placé directement, sans glisser. */
  first: boolean;
};

export const newMotion = (): CuboMotion => ({
  fx: { bump: 0, splash: 0, win: 0, nod: 0 },
  span: { tx: NaN, tz: NaN, d: 1 },
  first: true,
});

/** Applique l'événement du moteur de jeu aux effets de Cubo. */
export function applyEvent(m: CuboMotion, kind: string) {
  const f = m.fx;
  if (kind === "bump" || kind === "caught") f.bump = 1;
  if (kind === "splash" || kind === "burn") f.splash = 0.001;
  if (kind === "win") f.win = 0.001;
  if (
    ["collect", "break", "bridge", "key", "open", "hit", "wait"].includes(kind)
  )
    f.nod = 1;
  if (kind === "reset") {
    f.bump = 0;
    f.splash = 0;
    f.win = 0;
    m.first = true;
  }
}

/** Fait avancer d'une image Cubo (`g` : position et direction, `b` : corps qui saute et tourne). */
export function stepCubo(
  m: CuboMotion,
  g: THREE.Group,
  b: THREE.Group,
  cubo: World["cubo"],
  cx: number,
  cz: number,
  dt: number,
) {
  const tx = cubo.x - cx;
  const tz = cubo.y - cz;
  if (m.first) {
    g.position.set(tx, 0, tz);
    g.rotation.y = ANGLE[cubo.dir];
    m.first = false;
  }
  g.position.x = THREE.MathUtils.damp(g.position.x, tx, 9, dt);
  g.position.z = THREE.MathUtils.damp(g.position.z, tz, 9, dt);
  const sp = m.span;
  if (sp.tx !== tx || sp.tz !== tz) {
    sp.d = Math.max(0.01, Math.hypot(tx - g.position.x, tz - g.position.z));
    sp.tx = tx;
    sp.tz = tz;
  }
  const remaining = Math.hypot(tx - g.position.x, tz - g.position.z);
  const progress = Math.min(1, remaining / sp.d);
  const ta = ANGLE[cubo.dir];
  const diff =
    ((((ta - g.rotation.y + Math.PI) % (Math.PI * 2)) + Math.PI * 2) %
      (Math.PI * 2)) -
    Math.PI;
  g.rotation.y += diff * Math.min(1, dt * 12);

  const f = m.fx;
  let y =
    sp.d > 0.05 ? Math.sin(progress * Math.PI) * (sp.d > 1.5 ? 1 : 0.35) : 0;
  b.rotation.x = 0;
  b.rotation.z = 0;
  if (f.bump > 0) {
    f.bump = Math.max(0, f.bump - dt * 2.5);
    b.position.z = Math.sin(f.bump * Math.PI * 3) * 0.18;
    b.rotation.x = Math.sin(f.bump * Math.PI * 3) * 0.3;
  } else b.position.z = 0;
  if (f.nod > 0) {
    f.nod = Math.max(0, f.nod - dt * 3);
    b.rotation.x = Math.sin(f.nod * Math.PI) * 0.35;
  }
  if (f.splash > 0) {
    f.splash = Math.min(1, f.splash + dt * 1.5);
    y = -f.splash * 0.9;
    b.rotation.z = f.splash * 1.2;
  }
  if (f.win > 0) {
    f.win += dt;
    y = Math.abs(Math.sin(f.win * 7)) * 0.5;
    b.rotation.y = f.win * 9;
  } else b.rotation.y = 0;
  b.position.y = 0.33 + y;
}
