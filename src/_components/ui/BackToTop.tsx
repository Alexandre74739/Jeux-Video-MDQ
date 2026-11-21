"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { sfx } from "@/lib/sound";

/** Bouton flottant pour remonter en haut de la page (apparaît après un peu de défilement). */
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}
          whileHover={{ y: -4 }} whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          onClick={() => {
            sfx("jump");
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
          className="btn fixed right-4 bottom-4 z-50 grid size-14 place-items-center bg-sun sm:right-6 sm:bottom-6"
          aria-label="Remonter en haut de la page"
        >
          <ArrowUp size={28} strokeWidth={3} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
