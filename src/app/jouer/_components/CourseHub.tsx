"use client";
import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import StoryModal from "@/_components/game/StoryModal";
import { COURSES, worldLock } from "@/lib/levels";
import { totalStars } from "@/lib/rewards";
import { saveSession } from "@/lib/storage";
import { MAP_COURSES, STORY } from "@/lib/story";
import { sfx } from "@/lib/sound";
import { BadgeList } from "./hub/BadgeList";
import { CourseCard } from "./hub/CourseCard";
import { HubHeader } from "./hub/HubHeader";
import { HubIntro } from "./hub/HubIntro";
import { LockedCourseCard } from "./hub/LockedCourseCard";
import { Pager } from "./hub/Pager";
import { TreasureSection } from "./hub/TreasureSection";
import { useHubData } from "./hub/useHubData";

/** Défis affichés par page : seuls les aperçus de la page en cours sont dessinés. */
const PAGE_SIZE = 4;
const PAGES = Math.ceil(COURSES.length / PAGE_SIZE);

/** Page « Choisis ton défi » : carte au trésor, parcours (par pages) et badges. */
export default function CourseHub() {
  const { progress, seen, page, setPage } = useHubData(PAGES);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [replay, setReplay] = useState<string | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const starsOf = (key: string) => progress.stars[key] ?? 0;
  const done = (slug: string) => {
    const c = COURSES.find((x) => x.slug === slug);
    return !!c && c.levels.every((l) => starsOf(`${c.slug}:${l.id}`));
  };
  const got = MAP_COURSES.map(done);

  const goPage = (p: number) => {
    const n = Math.max(0, Math.min(PAGES - 1, p));
    sfx("click");
    setPage(n);
    setOpenInfo(null);
    saveSession("hubPage", n);
    grid.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-cream">
      <HubHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <HubIntro />
        <TreasureSection
          got={got}
          total={totalStars(progress)}
          seen={seen}
          onReplay={setReplay}
        />
        <div
          ref={grid}
          className="mt-10 grid scroll-mt-24 gap-8 md:grid-cols-2"
        >
          {COURSES.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(
            (c, i) => {
              const lock = worldLock(c, progress.stars);
              return lock ? (
                <LockedCourseCard
                  key={c.slug}
                  course={c}
                  lock={lock}
                  index={i}
                />
              ) : (
                <CourseCard
                  key={c.slug}
                  course={c}
                  index={i}
                  starsOf={starsOf}
                  infoOpen={openInfo === c.slug}
                  onInfo={(open) => setOpenInfo(open ? c.slug : null)}
                />
              );
            },
          )}
        </div>
        <Pager page={page} pages={PAGES} onPage={goPage} />
        <BadgeList owned={progress.badges} />
      </main>
      <AnimatePresence>
        {replay && (
          <StoryModal
            scene={STORY[replay].outro}
            map={STORY[replay].piece !== undefined ? { got } : undefined}
            cta="Fermer"
            onClose={() => setReplay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
