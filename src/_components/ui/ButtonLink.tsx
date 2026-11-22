"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { sfx } from "@/lib/sound";

/**
 * Lien en forme de bouton de la charte. Une seule couleur d'action principale (jaune soleil) sur tout
 * le site ; « secondary » (blanc) pour l'action d'à côté.
 */
const VARIANTS = { primary: "bg-sun", secondary: "bg-paper" } as const;
const SIZES = {
  sm: "gap-2 px-5 py-2.5 text-base",
  md: "gap-2.5 px-6 py-3 text-xl shadow-pop-lg",
  lg: "gap-2.5 px-8 py-4 text-2xl shadow-pop-lg",
} as const;

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
}: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, rotate: -1 }}
      whileTap={{ scale: 0.96 }}
      className="inline-block"
    >
      <Link
        href={href}
        onClick={() => sfx("click")}
        className={`btn inline-flex items-center ${VARIANTS[variant]} ${SIZES[size]}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
