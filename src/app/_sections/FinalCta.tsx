import { ArrowRight } from "lucide-react";
import { Cubo } from "@/_components/ui/Cubo";
import ButtonLink from "@/_components/ui/ButtonLink";

/** Dernière section de l'accueil : l'invitation à commencer. */
export default function FinalCta() {
  return (
    <section className="border-t-[3px] border-ink bg-sky px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="motion-safe:animate-bounce motion-safe:[animation-duration:2s]">
          <Cubo size={120} mood="wow" />
        </div>
        <h2 className="text-5xl font-bold text-balance">On relève le défi ?</h2>
        <p className="text-xl font-bold">Cubo t&apos;attend pour sa première aventure.</p>
        <ButtonLink href="/jouer/" size="lg">
          C&apos;est parti <ArrowRight size={26} strokeWidth={3} aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}
