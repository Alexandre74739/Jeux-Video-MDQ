"use client";
import { motion } from "motion/react";

/** Petit nombre qui rebondit quand il change. */
export function BumpNumber({ value, className = "" }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.8, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 12 }}
      className={`inline-block ${className}`}
    >
      {value}
    </motion.span>
  );
}
