"use client";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Blocks, Check, Clock, Download, Flame, Gamepad2, GraduationCap, ImagePlus, Laptop,
  Map as MapIcon, Music, Palette, Puzzle, Rocket, ShieldCheck, Sparkles, Trophy, Users, Volume2, WifiOff,
  type LucideIcon,
} from "lucide-react";
import { Cubo, Logo } from "@/components/ui";
import { Icon, StarIcon } from "@/components/Icon";
import HomeDemo from "@/components/HomeDemo";
import { BlockView } from "@/components/BlockView";
import { createBlock, type Block } from "@/lib/blocks";
import { LEVELS } from "@/lib/levels";
import { BADGES } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import LIBRARY from "@/lib/sprites.json";

const sw = 2.75;

const floatChips = [
  { icon: "ArrowUp", text: "avancer", bg: "#4FC3F7", x: "-8%", y: "8%", r: -8, d: 0 },
  { icon: "Repeat", text: "répéter 3 fois", bg: "#FFA94D", x: "60%", y: "2%", r: 6, d: 0.4 },
  { icon: "Gem", text: "ramasser", bg: "#7BD88F", x: "68%", y: "78%", r: -5, d: 0.8 },
  { icon: "Zap", text: "quand je clique", bg: "#FFD23F", x: "-12%", y: "74%", r: 7, d: 1.2 },
];

const facts: { icon: LucideIcon; text: string }[] = [
  { icon: GraduationCap, text: "De 6 à 10 ans" },
  { icon: Clock, text: "Une séance de 1h30" },
  { icon: Users, text: "En binôme" },
  { icon: Laptop, text: "Rien à installer" },
  { icon: WifiOff, text: "Marche sans Internet" },
  { icon: ShieldCheck, text: "Sans compte, sans pub" },
];

const steps: { n: number; icon: LucideIcon; title: string; text: string; bg: string }[] = [
  { n: 1, icon: MapIcon, title: "Apprends", text: "10 petits niveaux pour guider Cubo dans un monde en cubes.", bg: "bg-sky" },
  { n: 2, icon: Puzzle, title: "Assemble", text: "Glisse et emboîte des blocs, comme des briques de construction.", bg: "bg-mint" },
  { n: 3, icon: Gamepad2, title: "Crée", text: "Choisis tes personnages et invente ton propre jeu vidéo !", bg: "bg-pink" },
];

function b(type: string, params: Block["params"] = {}, children?: Block[]): Block {
  const x = createBlock(type);
  return { ...x, params: { ...x.params, ...params }, ...(children ? { children } : {}) };
}

const concepts: { title: string; text: string; color: string; levels: string; sample: Block[] }[] = [
  { title: "Séquence", text: "Donner des instructions dans le bon ordre, une par une.", color: "bg-sky", levels: "Niveaux 1 à 3", sample: [b("avancer"), b("droite"), b("avancer")] },
  { title: "Actions", text: "Agir sur le monde : ramasser, casser, construire.", color: "bg-mint", levels: "Niveaux 4, 6, 7", sample: [b("ramasser"), b("pont")] },
  { title: "Boucles", text: "Répéter sans tout réécrire. Le super-pouvoir des codeurs !", color: "bg-orange", levels: "Niveaux 5 à 9", sample: [b("repeter", { n: 3 }, [b("avancer"), b("casser")])] },
  { title: "Conditions", text: "Vérifier avant d'agir : SI il y a de l'eau, ALORS…", color: "bg-lilac", levels: "Niveau 10", sample: [b("si", { what: "eau" }, [b("pont")])] },
];

const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Sparkles, title: `${LIBRARY.length} personnages`, text: "Animaux, héros, véhicules, nature…" },
  { icon: ImagePlus, title: "Tes propres images", text: "Importe un dessin ou une photo." },
  { icon: Palette, title: "7 décors", text: "Ciel, espace, océan, désert…" },
  { icon: Music, title: "Des sons rigolos", text: "Pièce, saut, boing, laser…" },
  { icon: Trophy, title: "Score et victoire", text: "Ajoute des points, gagne ou perds !" },
  { icon: Download, title: "Garde ton jeu", text: "Télécharge-le pour le rejouer chez toi." },
];

const showcase = ["1f916", "2b50", "1f996", "1f680", "1f984", "1f47e", "1f355", "1f409"]
  .map((id) => LIBRARY.find((s) => s.id === id))
  .filter(Boolean) as typeof LIBRARY;

const timeline = [
  { t: "0 – 10 min", title: "Découverte", text: "On présente Cubo et on fait la démo de l'accueil ensemble.", bg: "bg-sun" },
  { t: "10 – 50 min", title: "L'aventure", text: "Les binômes avancent dans les 10 niveaux, chacun à son rythme.", bg: "bg-sky" },
  { t: "50 – 80 min", title: "Création libre", text: "Chaque binôme invente son jeu avec ses personnages préférés.", bg: "bg-pink" },
  { t: "80 – 90 min", title: "On partage !", text: "Chacun montre son jeu aux autres et télécharge sa création.", bg: "bg-mint" },
];

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { type: "spring" as const, stiffness: 120, damping: 18 },
};

function SectionTitle({ kicker, title, light = false }: { kicker: string; title: string; light?: boolean }) {
  return (
    <motion.div {...reveal} className="text-center">
      <span className="toon inline-block rounded-full bg-paper px-4 py-1 font-display text-sm font-bold uppercase tracking-wider">{kicker}</span>
      <h2 className={`mt-4 text-4xl font-bold sm:text-5xl ${light ? "text-white" : ""}`}>{title}</h2>
    </motion.div>
  );
}

function CTA({ href, children, bg = "bg-sun", big = false }: { href: string; children: React.ReactNode; bg?: string; big?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.05, rotate: -1 }} whileTap={{ scale: 0.95 }} className="inline-block">
      <Link href={href} onClick={() => sfx("click")} className={`btn inline-flex items-center gap-2.5 shadow-pop-lg ${bg} ${big ? "px-8 py-4 text-2xl" : "px-6 py-3 text-xl"}`}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-cream">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 font-display text-lg font-semibold md:flex" aria-label="Sections">
            <a href="#demo" className="hover:text-grape">Essayer</a>
            <a href="#aventure" className="hover:text-grape">L&apos;aventure</a>
            <a href="#creer" className="hover:text-grape">Créer</a>
            <a href="#animateurs" className="hover:text-grape">Animateurs</a>
          </nav>
          <Link href="/jouer/" className="btn flex items-center gap-2 bg-sun px-5 py-2.5 text-lg" onClick={() => sfx("click")}>
            Jouer <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <motion.span aria-hidden="true" className="absolute top-14 -left-10 hidden size-24 rounded-full border-[3px] border-ink bg-pink lg:block" animate={{ y: [0, 14, 0] }} transition={{ repeat: Infinity, duration: 4 }} />
          <motion.span aria-hidden="true" className="absolute right-4 bottom-6 hidden size-16 rounded-2xl border-[3px] border-ink bg-mint lg:block" animate={{ rotate: [12, 30, 12] }} transition={{ repeat: Infinity, duration: 5 }} />

          <div className="relative">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="toon inline-flex items-center gap-2 rounded-full bg-lilac px-4 py-1.5 font-display font-bold">
              <Rocket size={18} strokeWidth={sw} aria-hidden="true" /> Pour les explorateurs de 6 à 10 ans
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }} className="mt-5 text-5xl leading-[1.02] font-bold sm:text-7xl">
              Crée ton{" "}
              <span className="relative inline-block">
                <span className="relative z-10">jeu vidéo</span>
                <motion.span aria-hidden="true" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="absolute bottom-1 left-0 h-5 w-full origin-left rounded-full bg-sun sm:h-7" />
              </span>{" "}
              en t&apos;amusant !
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 max-w-xl text-xl font-semibold text-ink-soft">
              Glisse des blocs, guide Cubo à travers son monde en cubes, puis invente ton propre jeu. Pas besoin de savoir coder !
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-wrap gap-4">
              <CTA href="/jouer/" big><MapIcon size={26} strokeWidth={sw} aria-hidden="true" /> Commencer l&apos;aventure</CTA>
              <CTA href="/creer/" bg="bg-paper" big><Palette size={26} strokeWidth={sw} aria-hidden="true" /> Création libre</CTA>
            </motion.div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-110">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="absolute inset-[8%] rounded-full border-[3px] border-ink bg-sky" style={{ boxShadow: "10px 12px 0 0 #16123A" }} />
            <motion.div className="absolute inset-0 grid place-items-center" animate={{ y: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}>
              <Cubo size={250} />
            </motion.div>
            {floatChips.map((c) => (
              <motion.span
                key={c.text}
                aria-hidden="true"
                initial={{ scale: 0, rotate: c.r - 30 }}
                animate={{ scale: 1, rotate: c.r, y: [0, -10, 0] }}
                transition={{ scale: { delay: 0.5 + c.d / 2, type: "spring" }, rotate: { delay: 0.5 + c.d / 2 }, y: { repeat: Infinity, duration: 3, delay: c.d } }}
                className="absolute flex items-center gap-2 rounded-2xl border-[3px] border-ink px-3 py-2 font-display text-base font-semibold whitespace-nowrap shadow-pop sm:text-lg"
                style={{ left: c.x, top: c.y, background: c.bg }}
              >
                <span className="grid size-7 place-items-center rounded-lg bg-paper/70"><Icon name={c.icon} size={17} /></span>
                {c.text}
              </motion.span>
            ))}
          </div>
        </section>

        {/* BANDEAU DÉFILANT */}
        <div className="overflow-hidden border-y-[3px] border-ink bg-ink py-4" aria-label="Points clés">
          <motion.ul className="flex w-max gap-10" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 28, ease: "linear" }}>
            {[...facts, ...facts].map((f, i) => (
              <li key={i} aria-hidden={i >= facts.length} className="flex items-center gap-3 font-display text-xl font-semibold text-white">
                <span className="grid size-10 place-items-center rounded-full bg-sun text-ink"><f.icon size={20} strokeWidth={sw} aria-hidden="true" /></span>
                {f.text}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* DÉMO */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
          <SectionTitle kicker="Essaie tout de suite" title="Ton tout premier programme" />
          <motion.p {...reveal} className="mx-auto mt-3 max-w-2xl text-center text-lg font-semibold text-ink-soft">
            Cubo veut ouvrir le coffre. Combien de blocs « avancer » faut-il ? À toi de jouer !
          </motion.p>
          <motion.div {...reveal} className="mt-10">
            <HomeDemo />
          </motion.div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="border-y-[3px] border-ink bg-grape px-4 py-20 sm:px-6">
          <SectionTitle kicker="En 3 étapes" title="Comment ça marche ?" light />
          <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.12, type: "spring" }}
                whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
                className={`relative rounded-[28px] border-[3px] border-ink p-6 ${s.bg}`}
                style={{ boxShadow: "8px 9px 0 0 #16123A" }}
              >
                <span className="toon absolute -top-5 -left-3 grid size-12 place-items-center rounded-full bg-paper font-display text-2xl font-bold">{s.n}</span>
                <span className="toon grid size-16 place-items-center rounded-2xl bg-paper"><s.icon size={34} strokeWidth={sw} aria-hidden="true" /></span>
                <h3 className="mt-4 text-3xl font-bold">{s.title}</h3>
                <p className="mt-1 text-lg font-bold">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* L'AVENTURE */}
        <section id="aventure" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
          <SectionTitle kicker="L'aventure" title="10 niveaux pour devenir codeur" />

          {/* Chemin des niveaux */}
          <motion.ol {...reveal} className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-y-6" aria-label="Les 10 niveaux">
            {LEVELS.map((l, i) => (
              <li key={l.id} className="flex items-center">
                {i > 0 && <span className="h-1.5 w-4 bg-ink sm:w-6" aria-hidden="true" />}
                <motion.span
                  whileHover={{ y: -6, scale: 1.1 }}
                  title={l.title}
                  className={`grid size-14 place-items-center rounded-full border-[3px] border-ink font-display text-xl font-bold shadow-pop ${
                    l.concept.includes("Condition") ? "bg-lilac" : l.concept.includes("Boucle") ? "bg-orange" : l.concept === "Actions" ? "bg-mint" : "bg-sky"
                  }`}
                >
                  {l.id}
                </motion.span>
              </li>
            ))}
          </motion.ol>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {concepts.map((c, i) => (
              <motion.article
                key={c.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                whileHover={{ y: -6 }}
                className="toon flex flex-col overflow-hidden rounded-[28px] bg-paper"
              >
                <div className={`border-b-[3px] border-ink px-5 py-4 ${c.color}`}>
                  <span className="text-sm font-extrabold">{c.levels}</span>
                  <h3 className="text-2xl font-bold">{c.title}</h3>
                </div>
                <p className="px-5 pt-4 font-bold">{c.text}</p>
                <div className="dots m-4 mt-3 flex flex-1 flex-col gap-1.5 rounded-2xl border-2 border-ink/15 p-3">
                  {c.sample.map((s) => <BlockView key={s.id} block={s} mode="static" />)}
                </div>
              </motion.article>
            ))}
          </div>

          {/* Récompenses */}
          <motion.div {...reveal} className="toon mt-14 grid items-center gap-8 rounded-[32px] bg-sun p-8 md:grid-cols-[1fr_1.3fr]">
            <div>
              <h3 className="text-3xl font-bold">Gagne des étoiles et des badges</h3>
              <p className="mt-2 text-lg font-bold">
                Jusqu&apos;à 3 étoiles par niveau : moins tu utilises de blocs, plus tu en gagnes. Enchaîne les réussites
                du premier coup pour faire grimper ta flamme !
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="toon flex items-center gap-1 rounded-full bg-paper px-4 py-2">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>
                    <StarIcon size={34} />
                  </motion.span>
                ))}
              </div>
              <div className="toon flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-display text-2xl font-bold">
                <motion.span animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 0.6 }}><Flame size={30} strokeWidth={sw} fill="#FFD23F" aria-hidden="true" /></motion.span>
                5
              </div>
              {Object.entries(BADGES).map(([k, bd], i) => (
                <motion.span
                  key={k}
                  title={bd.name}
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 400, damping: 12 }}
                  whileHover={{ rotate: 12, scale: 1.15 }}
                  className="grid size-14 place-items-center rounded-full border-[3px] border-ink bg-lilac shadow-pop"
                >
                  <Icon name={bd.icon} size={26} />
                  <span className="sr-only">{bd.name}</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CRÉATION LIBRE */}
        <section id="creer" className="scroll-mt-24 border-y-[3px] border-ink bg-pink/40 px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <motion.div {...reveal}>
              <span className="toon inline-block rounded-full bg-paper px-4 py-1 font-display text-sm font-bold uppercase tracking-wider">Création libre</span>
              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Invente ton propre jeu</h2>
              <p className="mt-3 text-lg font-semibold text-ink-soft">
                Fais bouger tes personnages avec les flèches du clavier, attrape des étoiles, compte les points… Tu décides des règles !
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <span className="toon grid size-12 shrink-0 place-items-center rounded-2xl bg-paper"><f.icon size={24} strokeWidth={sw} aria-hidden="true" /></span>
                    <span>
                      <span className="block font-display text-lg font-bold">{f.title}</span>
                      <span className="font-semibold text-ink-soft">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8"><CTA href="/creer/" bg="bg-pink"><Palette size={24} strokeWidth={sw} aria-hidden="true" /> Créer mon jeu</CTA></div>
            </motion.div>

            {/* Aperçu de la scène */}
            <motion.div {...reveal} className="relative">
              <div className="toon relative aspect-4/3 overflow-hidden rounded-[28px]" style={{ background: "linear-gradient(transparent 72%, #6CCB48 72% 76%, #7ED957 76% 84%, #9C6A3C 84%), linear-gradient(#8FD8FA, #D5F1FD)", boxShadow: "10px 12px 0 0 #16123A" }}>
                <div className="toon absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 font-display text-lg font-bold">
                  <StarIcon size={20} /> Score : 3
                </div>
                {showcase.map((s, i) => (
                  <motion.img
                    key={s.id}
                    src={s.src}
                    alt=""
                    className="absolute size-[16%]"
                    style={{ left: `${8 + (i % 4) * 23}%`, top: `${22 + Math.floor(i / 4) * 30}%` }}
                    animate={{ y: [0, -14, 0], rotate: [0, i % 2 ? 8 : -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2 + (i % 3) * 0.4, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <motion.div
                initial={{ rotate: 6, scale: 0.8, opacity: 0 }} whileInView={{ rotate: -3, scale: 1, opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-10 -left-4 hidden sm:block"
              >
                <BlockView mode="static" block={b("ev_key", { key: "ArrowRight" }, [b("move", { dir: "right", n: 10 })])} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ANIMATEURS */}
        <section id="animateurs" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
          <SectionTitle kicker="Pour les animateurs" title="Une séance de 1h30 clé en main" />
          <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
            <span className="absolute top-8 right-[12%] left-[12%] hidden h-1.5 bg-ink md:block" aria-hidden="true" />
            {timeline.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: "spring" }}
                className="relative flex flex-col items-center text-center"
              >
                <span className={`toon relative z-10 grid size-16 place-items-center rounded-full font-display text-2xl font-bold ${s.bg}`}>{i + 1}</span>
                <span className="mt-3 rounded-full bg-ink px-3 py-0.5 text-sm font-bold text-white">{s.t}</span>
                <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
                <p className="mt-1 font-semibold text-ink-soft">{s.text}</p>
              </motion.li>
            ))}
          </ol>

          <motion.div {...reveal} className="toon mt-14 grid gap-6 rounded-[32px] bg-paper p-8 md:grid-cols-2">
            <ul className="space-y-3">
              {[
                "Aucune installation : un navigateur suffit, même sur des PC prêtés.",
                "Une fois la page ouverte, tout fonctionne même si le Wi-Fi coupe.",
                "La progression est gardée automatiquement sur chaque poste.",
                "Consignes lues à voix haute pour les plus jeunes lecteurs.",
                "Textes très contrastés et grands boutons, faciles à la souris.",
              ].map((t) => (
                <li key={t} className="flex gap-3 font-bold">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-mint"><Check size={16} strokeWidth={3.5} aria-hidden="true" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col justify-center gap-4 rounded-3xl bg-cream p-6">
              <div className="flex items-center gap-3">
                <span className="toon grid size-12 place-items-center rounded-2xl bg-lilac"><Blocks size={24} strokeWidth={sw} aria-hidden="true" /></span>
                <h3 className="text-2xl font-bold">Toutes les solutions</h3>
              </div>
              <p className="font-semibold text-ink-soft">
                Un binôme bloqué ? Retrouvez la solution 3 étoiles de chaque niveau, avec l&apos;indice donné aux enfants.
              </p>
              <Link href="/solutions/" className="btn flex w-fit items-center gap-2 bg-paper px-5 py-2.5">
                Voir les solutions <ArrowRight size={18} strokeWidth={3} aria-hidden="true" />
              </Link>
              <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                <Volume2 size={16} strokeWidth={sw} aria-hidden="true" /> Pensez à brancher des haut-parleurs ou des casques !
              </p>
            </div>
          </motion.div>
        </section>

        {/* CTA FINAL */}
        <section className="border-t-[3px] border-ink bg-sky px-4 py-20 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <motion.div animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Cubo size={120} mood="wow" />
            </motion.div>
            <h2 className="text-5xl font-bold">Prêt·e à relever le défi ?</h2>
            <p className="text-xl font-bold">Cubo t&apos;attend pour sa première aventure.</p>
            <motion.div animate={{ rotate: [0, -2, 2, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <CTA href="/jouer/" bg="bg-sun" big>C&apos;est parti ! <ArrowRight size={26} strokeWidth={3} aria-hidden="true" /></CTA>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t-[3px] border-ink bg-paper px-4 py-6 text-sm font-semibold sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Logo small />
          <p>
            Images : <a href="https://openmoji.org" className="underline decoration-2 underline-offset-2">OpenMoji</a> (licence CC BY-SA 4.0).
          </p>
          <Link href="/solutions/" className="underline decoration-2 underline-offset-2">Espace animateur : solutions</Link>
        </div>
      </footer>
    </div>
  );
}
