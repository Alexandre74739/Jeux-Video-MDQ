"use client";
import { motion } from "motion/react";

/** Apparition douce quand le bloc entre dans l'écran (une seule fois). Utilisable depuis un composant serveur. */
type Props = { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties };

export default function Reveal({ children, className = "", delay = 0, style }: Props) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
