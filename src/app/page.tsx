import SiteHeader from "@/_components/layout/SiteHeader";
import SiteFooter from "@/_components/layout/SiteFooter";
import BackToTop from "@/_components/ui/BackToTop";
import Hero from "./_sections/Hero";
import Demo from "./_sections/Demo";
import Steps from "./_sections/Steps";
import Adventure from "./_sections/Adventure";
import Creation from "./_sections/Creation";
import Animators from "./_sections/Animators";
import About from "./_sections/About";
import FinalCta from "./_sections/FinalCta";

// Composant serveur : seules les parties interactives (démo, boutons, animations) envoient du JavaScript.
export default function Home() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-cream">
      <SiteHeader />
      <BackToTop />

      <main id="contenu">
        <Hero />
        <Demo />
        <About />
        <Steps />
        <Adventure />
        <Creation />
        <Animators />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
