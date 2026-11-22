"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Version animée pour la zone de programme. */
export function AnimatedBlock({
  children,
  id,
  hidden,
}: {
  children: ReactNode;
  id: string;
  hidden?: boolean;
}) {
  return (
    <motion.div
      key={id}
      data-wrap
      layout="position"
      initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      className={`w-fit max-w-full ${hidden ? "hidden" : ""}`}
    >
      {children}
    </motion.div>
  );
}
