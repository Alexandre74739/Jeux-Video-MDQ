"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/_components/ui/Logo";
import InstallButton from "./InstallButton";
import ProfileMenu from "@/_components/profile/ProfileMenu";
import { sfx } from "@/lib/sound";

const LINKS = [
  { href: "#demo", label: "Essayer" },
  { href: "#aventure", label: "L'aventure" },
  { href: "#creer", label: "Créer" },
  { href: "#animateurs", label: "Animateurs" },
  { href: "#a-propos", label: "À propos" },
];

/** En-tête de l'accueil : navigation complète sur grand écran, menu burger déroulant sur mobile/tablette. */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const resize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", esc);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", esc);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav
          className="hidden items-center gap-6 font-display text-lg font-semibold lg:flex"
          aria-label="Sections"
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-grape">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ProfileMenu />
          <InstallButton />
          <Link
            href="/jouer/"
            className="btn flex items-center gap-2 bg-sun px-5 py-2.5 text-lg"
            onClick={() => sfx("click")}
          >
            Jouer <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ProfileMenu />
          <button
            className="btn grid size-12 place-items-center bg-paper"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => {
              setOpen(!open);
              sfx("click");
            }}
          >
            <motion.span
              key={open ? "x" : "m"}
              initial={{ rotate: -90, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
            >
              {open ? (
                <X size={26} strokeWidth={3} aria-hidden="true" />
              ) : (
                <Menu size={26} strokeWidth={3} aria-hidden="true" />
              )}
            </motion.span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
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
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
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
                  Jouer{" "}
                  <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
                </Link>
                <InstallButton full className="py-3" />
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
