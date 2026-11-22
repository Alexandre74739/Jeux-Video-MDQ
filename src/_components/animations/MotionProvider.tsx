"use client";
import { MotionConfig } from "motion/react";

/**
 * Respecte le réglage système « réduire les animations » (WCAG 2.2.2 et 2.3.3) pour toutes les
 * animations motion du site : les déplacements et boucles sont désactivés, les fondus restent.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
