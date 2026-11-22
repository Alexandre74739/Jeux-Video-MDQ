"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import InstallButton from "./InstallButton";
import { sfx } from "@/lib/sound";

/** Menu déroulant de l'accueil sur mobile et tablette. */
export default function MobileMenu({
  links,
  onClose,
}: {
  links: { href: string; label: string }[];
  onClose: () => void;
}) {
  return (
    <motion.nav
      id="menu-mobile"
      aria-label="Menu"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="max-h-[calc(100dvh-80px)] overflow-y-auto border-t-[3px] border-ink bg-cream lg:hidden"
    >
      <ul className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
        {links.map((l, i) => (
          <motion.li
            key={l.href}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 * i }}
          >
            <a
              href={l.href}
              onClick={onClose}
              className="toon flex items-center justify-between rounded-2xl bg-paper px-4 py-3 font-display text-xl font-semibold"
            >
              {l.label}{" "}
              <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
            </a>
          </motion.li>
        ))}
        <li className="mt-2 grid gap-3 sm:grid-cols-2">
          <Link
            href="/jouer/"
            onClick={() => sfx("click")}
            className="btn flex items-center justify-center gap-2 bg-sun py-3 text-xl"
          >
            Jouer <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
          </Link>
          <InstallButton full className="py-3" />
        </li>
      </ul>
    </motion.nav>
  );
}
