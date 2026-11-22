"use client";
import BlockEditor from "@/_components/game/BlockEditor";
import { Confetti } from "@/_components/animations/Confetti";
import { CuboBubble } from "./level/CuboBubble";
import { groupsFor } from "./level/gameData";
import { LevelDialogs } from "./level/LevelDialogs";
import { LevelHeader } from "./level/LevelHeader";
import { ProgramToolbar } from "./level/ProgramToolbar";
import { RunControls } from "./level/RunControls";
import { useLevelGame } from "./level/useLevelGame";
import { WorldFrame } from "./level/WorldFrame";
import { LockedWorld } from "./LockedWorld";

/** Un parcours de défis : le monde et Cubo à gauche, l'éditeur de blocs à droite. */
export default function LevelGame({ slug }: { slug: string }) {
  const g = useLevelGame(slug);
  if (g.lock) return <LockedWorld lock={g.lock} />;

  return (
    <div className="flex min-h-dvh flex-col bg-cream lg:h-dvh lg:min-h-155 lg:overflow-hidden">
      <Confetti fire={g.confetti} />
      <LevelHeader g={g} />
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[min(40vw,560px)]">
          <CuboBubble g={g} />
          <WorldFrame g={g} />
          <RunControls g={g} />
        </div>
        <BlockEditor
          program={g.program}
          onChange={g.changeProgram}
          groups={groupsFor(g.level.blocks)}
          mode="stack"
          activeId={g.activeId}
          disabled={g.running}
          onAdd={g.bounce}
          title="Mon programme"
          toolbar={<ProgramToolbar g={g} />}
        />
      </main>
      <LevelDialogs g={g} />
    </div>
  );
}
