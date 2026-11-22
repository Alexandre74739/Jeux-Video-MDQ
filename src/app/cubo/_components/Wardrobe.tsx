"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { DATA_EVENT } from "@/lib/profiles";
import { load, save } from "@/lib/storage";
import { getOutfit, setOutfit } from "@/lib/outfit";
import {
  BADGES,
  DEFAULT_OUTFIT,
  emptyProgress,
  isUnlocked,
  totalStars,
  type Item,
  type Outfit,
  type Progress,
  type Slot,
} from "@/lib/rewards";
import { badgeLine } from "@/lib/lines";
import { sfx, speak } from "@/lib/sound";
import { OutfitPreview } from "./OutfitPreview";
import { WardrobeHeader } from "./WardrobeHeader";
import { WardrobeItems } from "./WardrobeItems";

export default function Wardrobe() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [outfit, setO] = useState<Outfit>(DEFAULT_OUTFIT);
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
      <WardrobeHeader stars={stars} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold sm:text-5xl">Mon Cubo</h1>
        <p className="mt-1 text-lg font-semibold text-ink-soft">
          Gagne des étoiles et des badges pour débloquer des couleurs, des
          chapeaux, des lunettes, des capes et des traînées magiques !
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <OutfitPreview outfit={outfit} stars={stars} />
          <WardrobeItems
            outfit={outfit}
            progress={progress}
            onChoose={choose}
          />
        </div>
      </main>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            role="status"
            className="fixed bottom-5 left-1/2 z-120 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border-[3px] border-ink bg-lilac px-5 py-3 font-display text-lg font-bold shadow-pop"
          >
            Nouveau badge secret : {toast} !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
