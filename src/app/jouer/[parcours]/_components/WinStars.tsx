"use client";
import { motion } from "motion/react";
import { StarIcon } from "@/_components/icons/Icon";

/** Les trois étoiles de la victoire, qui tournent en apparaissant. */
export function WinStars({ stars }: { stars: number }) {
  return (
    <div
      className="my-4 flex justify-center gap-3"
      aria-label={`${stars} étoiles sur 3`}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: i < stars ? 1 : 0.8, rotate: 0 }}
          transition={{
            delay: 0.35 + i * 0.3,
            type: "spring",
            stiffness: 400,
            damping: 10,
          }}
          aria-hidden="true"
        >
          <StarIcon
            size={68}
            filled={i < stars}
            className="size-14 sm:size-[68px]"
          />
        </motion.span>
      ))}
    </div>
  );
}
