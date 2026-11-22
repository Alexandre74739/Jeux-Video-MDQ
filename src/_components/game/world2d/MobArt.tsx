"use client";
import { motion } from "motion/react";
import type { Mob } from "@/lib/levels";

/** Gloups (gluant vert, on peut le battre) ou Grognon (violet à cornes, à esquiver), vus de dessus. */
export function MobArt({ mob }: { mob: Mob }) {
  const gloups = mob.kind === "gloups";
  return (
    <motion.div
      className={`absolute inset-[14%] border-[3px] border-ink ${gloups ? "rounded-[30%]" : "rounded-[18%]"}`}
      style={{
        background: gloups ? "#7BD88F" : "#9B7BFF",
        boxShadow: "3px 4px 0 rgba(22,18,58,.35)",
      }}
      animate={gloups ? { scale: [1, 1.08, 0.94, 1] } : { rotate: [-6, 6, -6] }}
      transition={{ repeat: Infinity, duration: gloups ? 0.9 : 0.7 }}
    >
      {gloups ? (
        <div className="absolute inset-[22%] rounded-[30%] bg-[#3FAE4A]/60" />
      ) : (
        <>
          <span className="absolute top-[-22%] left-[8%] h-[30%] w-[22%] rounded-t-full border-[3px] border-ink bg-[#FFF1BF]" />
          <span className="absolute top-[-22%] right-[8%] h-[30%] w-[22%] rounded-t-full border-[3px] border-ink bg-[#FFF1BF]" />
        </>
      )}
      <span className="absolute top-[22%] left-[16%] size-[26%] rounded-full border-2 border-ink bg-white">
        <span className="absolute top-[30%] left-[30%] size-[45%] rounded-full bg-ink" />
      </span>
      <span className="absolute top-[22%] right-[16%] size-[26%] rounded-full border-2 border-ink bg-white">
        <span className="absolute top-[30%] left-[30%] size-[45%] rounded-full bg-ink" />
      </span>
      {!gloups && (
        <span
          className="absolute top-[14%] left-[14%] h-[8%] w-[72%] bg-ink"
          style={{
            clipPath:
              "polygon(0 0, 45% 100%, 55% 100%, 100% 0, 100% 100%, 0 100%)",
          }}
        />
      )}
      <span
        className={`absolute bottom-[16%] left-[28%] h-[12%] w-[44%] bg-ink ${gloups ? "rounded-b-full" : "rounded-t-full"}`}
      />
    </motion.div>
  );
}
