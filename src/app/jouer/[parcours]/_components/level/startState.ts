import { worldLock, type Course } from "@/lib/levels";
import { emptyProgress, type Progress } from "@/lib/rewards";
import { load, loadSession } from "@/lib/storage";
import { STORY } from "@/lib/story";

/**
 * État de départ d'un parcours, lu sur l'appareil : progression, série du jour, niveau à ouvrir
 * et s'il faut d'abord raconter le début de l'histoire.
 */
export function startState(course: Course) {
  const levels = course.levels;
  const progress = load<Progress>("progress", emptyProgress);
  const done = (i: number) =>
    !!progress.stars[`${course.slug}:${levels[i].id}`];
  const intro =
    !worldLock(course, progress.stars) &&
    !!STORY[course.slug] &&
    !load<string[]>("story", []).includes(`${course.slug}:intro`);
  const firstTodo = levels.findIndex((_, i) => !done(i));
  // « ?niveau=N » dans l'adresse ouvre directement ce niveau (s'il est débloqué), sinon le premier à faire.
  const asked =
    Number(new URLSearchParams(window.location.search).get("niveau")) - 1;
  const askedOk =
    Number.isInteger(asked) &&
    asked >= 0 &&
    asked < levels.length &&
    (asked === 0 || done(asked - 1));
  const idx = askedOk
    ? asked
    : firstTodo === -1
      ? levels.length - 1
      : firstTodo;
  return { progress, streak: loadSession("streak", 0), idx, intro };
}
