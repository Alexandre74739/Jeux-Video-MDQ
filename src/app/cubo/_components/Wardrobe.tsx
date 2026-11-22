"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, LayoutGrid, Lock } from "lucide-react";
import BackButton from "@/_components/ui/BackButton";
import ProfileMenu from "@/_components/profile/ProfileMenu";
import { DATA_EVENT } from "@/lib/profiles";
import { Cubo } from "@/_components/ui/Cubo";
import { Logo } from "@/_components/ui/Logo";
import { SoundToggle } from "@/_components/ui/SoundToggle";
import { StarIcon } from "@/_components/icons/Icon";
import { load, save } from "@/lib/storage";
import { getOutfit, setOutfit } from "@/lib/outfit";
import {
  BADGES,
  DEFAULT_OUTFIT,
  SLOTS,
  TRAILS,
  emptyProgress,
  isUnlocked,
  nextItem,
  totalStars,
  type Item,
  type Outfit,
  type Progress,
  type Slot,
} from "@/lib/rewards";
import { badgeLine } from "@/lib/lines";
import { sfx, speak } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";

const Preview3D = dynamic(() => import("@/_components/game/CuboPreview3D"), {
  ssr: false,
});

function ItemArt({
  slot,
  item,
  outfit,
}: {
  slot: Slot;
  item: Item;
  outfit: Outfit;
}) {
  if (slot === "trail") {
    const t = TRAILS.find((x) => x.id === item.id)!;
    return (
      <span
        className="flex h-16 items-center justify-center gap-1"
        aria-hidden="true"
      >
        {t.colors.length === 0 ? (
          <span className="font-display text-2xl font-bold text-ink-soft">
            —
          </span>
        ) : (
          t.colors
            .slice(0, 5)
            .map((c, i) => (
              <span
                key={i}
                className="block rounded-full border-2 border-ink"
                style={{ background: c, width: 10 + i * 3, height: 10 + i * 3 }}
              />
            ))
        )}
      </span>
    );
  }
  return <Cubo size={58} outfit={{ ...outfit, [slot]: item.id }} />;
}

export default function Wardrobe() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [outfit, setO] = useState<Outfit>(DEFAULT_OUTFIT);
  const [tab, setTab] = useState<Slot>("hat");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const reload = () => {
      setProgress(load<Progress>("progress", emptyProgress));
      setO(getOutfit());
    };
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, []);

  const stars = totalStars(progress);
  const gift = nextItem(stars);

  const choose = (slot: Slot, item: Item) => {
    if (!isUnlocked(item, progress)) {
      sfx("bump");
      return;
    }
    sfx("pop");
    setO(setOutfit({ [slot]: item.id }));
    // Badge secret « Styliste » au premier changement de tenue
    if (!progress.badges.includes("styliste")) {
      const p = { ...progress, badges: [...progress.badges, "styliste"] };
      setProgress(p);
      save("progress", p);
      setTimeout(() => sfx("badge"), 250);
      setToast(BADGES.styliste.name);
      speak(badgeLine(BADGES.styliste.name));
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <div className="flex items-center gap-2">
            <BackButton fallback="/jouer/" />
            <span className="hidden sm:block">
              <Logo small />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileMenu />
            <span
              className="toon flex items-center gap-1.5 rounded-full bg-sun px-3 py-1.5 font-display text-lg font-bold"
              title="Étoiles gagnées"
            >
              <StarIcon size={22} /> {stars}
              <span className="sr-only">étoiles</span>
            </span>
            <Link
              href="/jouer/"
              className="btn hidden items-center gap-2 bg-mint px-4 py-2 sm:flex"
            >
              <LayoutGrid
                size={20}
                strokeWidth={ICON_STROKE}
                aria-hidden="true"
              />{" "}
              <span className="hidden sm:inline">Défis</span>
            </Link>
            <SoundToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold sm:text-5xl">Mon Cubo</h1>
        <p className="mt-1 text-lg font-semibold text-ink-soft">
          Gagne des étoiles et des badges pour débloquer des couleurs, des
          chapeaux, des lunettes, des capes et des traînées magiques !
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section className="flex min-w-0 flex-col gap-4" aria-label="Aperçu">
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[30px] border-[3px] border-ink shadow-pop sm:aspect-[4/3] lg:aspect-square"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)",
              }}
            >
              <div className="absolute inset-0">
                <Preview3D
                  outfit={outfit}
                  fallback={
                    <div className="grid h-full place-items-center">
                      <Cubo size={160} />
                    </div>
                  }
                />
              </div>
            </div>
            {gift ? (
              <div className="toon rounded-3xl bg-paper p-4">
                <p className="font-bold">
                  Prochain cadeau : <strong>{gift.item.name}</strong>
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="h-4 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-cream"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={gift.item.stars}
                    aria-valuenow={stars}
                    aria-label="Étoiles pour le prochain cadeau"
                  >
                    <motion.div
                      className="h-full bg-sun"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stars / gift.item.stars) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="flex items-center gap-1 font-display font-bold whitespace-nowrap">
                    <StarIcon size={18} /> {stars} / {gift.item.stars}
                  </span>
                </div>
              </div>
            ) : (
              <p className="toon rounded-3xl bg-sun p-4 font-bold">
                Tu as tout débloqué. Bravo, super codeur !
              </p>
            )}
          </section>

          <section className="min-w-0" aria-label="Garde-robe">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Catégories"
            >
              {(Object.keys(SLOTS) as Slot[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => {
                    setTab(k);
                    sfx("click");
                  }}
                  className={`btn min-w-[30%] flex-1 px-2 py-2 text-sm sm:min-w-0 sm:px-3 sm:text-lg ${tab === k ? "bg-grape text-white" : "bg-paper"}`}
                >
                  {SLOTS[k].label}
                </button>
              ))}
            </div>
            <ul
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
              role="tabpanel"
            >
              {SLOTS[tab].items
                .filter((item) => !item.hidden || isUnlocked(item, progress))
                .map((item) => {
                  const open = isUnlocked(item, progress);
                  const on = outfit[tab] === item.id;
                  return (
                    <li key={item.id}>
                      <motion.button
                        whileHover={open ? { y: -4 } : undefined}
                        whileTap={open ? { scale: 0.94 } : undefined}
                        onClick={() => choose(tab, item)}
                        aria-pressed={on}
                        aria-label={`${item.name}${open ? "" : item.badge ? `, verrouillé : badge ${BADGES[item.badge]?.secret ? "secret" : BADGES[item.badge]?.name}` : `, verrouillé : ${item.stars} étoiles`}`}
                        className={`relative flex w-full flex-col items-center gap-1 rounded-3xl border-[3px] p-3 text-center ${
                          on
                            ? "border-ink bg-mint shadow-pop"
                            : open
                              ? "border-ink bg-paper shadow-pop"
                              : "border-ink/25 bg-[#EEEAF5]"
                        }`}
                      >
                        <span className={open ? "" : "opacity-35 grayscale"}>
                          <ItemArt slot={tab} item={item} outfit={outfit} />
                        </span>
                        <span
                          className={`font-display text-base leading-tight font-bold ${open ? "" : "text-ink-soft"}`}
                        >
                          {item.name}
                        </span>
                        {!open && (
                          <span className="flex items-center gap-1 rounded-full border-2 border-ink/30 bg-paper px-2 text-sm font-extrabold">
                            <Lock
                              size={13}
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                            {item.badge ? (
                              <span className="text-xs">
                                Badge{" "}
                                {BADGES[item.badge]?.secret
                                  ? "secret"
                                  : `« ${BADGES[item.badge]?.name} »`}
                              </span>
                            ) : (
                              <>
                                <StarIcon size={14} /> {item.stars}
                              </>
                            )}
                          </span>
                        )}
                        {on && (
                          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full border-2 border-ink bg-paper">
                            <Check
                              size={16}
                              strokeWidth={3.5}
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </motion.button>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            role="status"
            className="fixed bottom-5 left-1/2 z-[120] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border-[3px] border-ink bg-lilac px-5 py-3 font-display text-lg font-bold shadow-pop"
          >
            Nouveau badge secret : {toast} !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
