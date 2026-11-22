import type { Block } from "@/lib/blocks";
import { starsFor, type Course, type LevelDef } from "@/lib/levels";
import {
  badgeItems,
  badgesFor,
  newItems,
  totalStars,
  type Progress,
} from "@/lib/rewards";
import { load } from "@/lib/storage";
import { STORY } from "@/lib/story";
import type { WinInfo } from "../WinCard";
import { coursesDone } from "./gameData";

/** Niveau réussi : nouvelle progression, et ce qu'affiche la carte de victoire (étoiles, badges, cadeaux). */
export function winResult(c: {
  course: Course;
  level: LevelDef;
  last: boolean;
  progress: Progress;
  program: Block[];
  used: number;
  fails: number;
}): { next: Progress; info: WinInfo } {
  const { course, level, progress } = c;
  const key = `${course.slug}:${level.id}`;
  const stars = starsFor(level, c.used);
  const prev = progress.stars[key] ?? 0;
  const after: Progress = {
    ...progress,
    stars: { ...progress.stars, [key]: Math.max(prev, stars) },
  };
  const badges = badgesFor(
    {
      slug: course.slug,
      levelId: level.id,
      difficulty: course.difficulty,
      stars,
      prevStars: prev,
      fails: c.fails,
      used: c.used,
      optimal: level.optimal,
      program: c.program,
      after,
      coursesDone: coursesDone(after),
    },
    progress.badges,
  );
  const next: Progress = { ...after, badges: [...progress.badges, ...badges] };
  const gifts = [
    ...newItems(totalStars(progress), totalStars(next)),
    ...badgeItems(badges),
  ].map((g) => g.item);
  // Fin du parcours : la suite de l'histoire, si elle n'a pas encore été vue.
  const outro =
    c.last &&
    !!STORY[course.slug] &&
    !load<string[]>("story", []).includes(`${course.slug}:outro`);
  return {
    next,
    info: { stars, used: c.used, best: stars > prev, badges, gifts, outro },
  };
}
