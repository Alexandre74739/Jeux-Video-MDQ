"use client";
import { AnimatePresence, motion } from "motion/react";
import { Cubo } from "@/_components/ui/Cubo";
import ViewToggle from "@/_components/game/ViewToggle";
import World2D from "@/_components/game/World2D";
import World3DLazy from "@/_components/game/World3DLazy";
import type { WorldEvent } from "@/_components/game/World3D";
import type { World } from "@/lib/levels";
import { useView3d } from "@/hooks/useView3d";
import type { DemoState } from "./useDemo";

const MOOD = { idle: "happy", run: "think", short: "sad", far: "sad" } as const;

/** Monde de la démo (vrai rendu du jeu) et message de Cubo en dessous. */
export function DemoStage({
  world,
  event,
  state,
  hasBlocks,
}: {
  world: World;
  event: WorldEvent;
  state: DemoState;
  hasBlocks: boolean;
}) {
  const [view3d, setView3d] = useView3d();
  const msg = {
    idle: hasBlocks
      ? "Appuie sur Lancer pour voir Cubo avancer !"
      : "Ajoute des blocs « avancer », puis appuie sur Lancer !",
    run: "C'est parti…",
    short: "Presque ! Cubo n'est pas arrivé au coffre. Ajoute un bloc.",
    far: "Oups, trop loin : Cubo s'est cogné ! Enlève un bloc.",
  }[state];
  const fallback2D = <World2D world={world} />;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="toon relative aspect-[4/3] w-full overflow-hidden rounded-[28px] sm:aspect-[16/10]"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #D5F1FD 0%, #8FD8FA 100%)",
        }}
      >
        <div className="absolute inset-0">
          {view3d !== null &&
            (view3d ? (
              <World3DLazy world={world} event={event} fallback={fallback2D} />
            ) : (
              fallback2D
            ))}
        </div>
        <ViewToggle
          view3d={view3d ?? true}
          onChange={setView3d}
          className="absolute top-3 right-3"
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msg}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="toon mx-auto flex w-fit max-w-full items-center gap-3 rounded-2xl bg-paper px-4 py-2 text-center font-display text-lg font-semibold"
          aria-live="polite"
        >
          <Cubo size={40} mood={MOOD[state]} />
          {msg}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
