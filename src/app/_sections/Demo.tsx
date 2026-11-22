import Reveal from "@/_components/animations/Reveal";
import HomeDemo from "./HomeDemo";
import SectionTitle from "./SectionTitle";

/** Le tout premier niveau, jouable directement depuis l'accueil. */
export default function Demo() {
  return (
    <section
      id="demo"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
    >
      <SectionTitle
        title="Écris ton tout premier programme, ici, en moins d'une minute"
        intro="Cubo veut ouvrir le coffre. Ajoute des blocs « avancer », appuie sur Lancer, et corrige si besoin."
      />
      <Reveal className="mt-10">
        <HomeDemo />
      </Reveal>
    </section>
  );
}
