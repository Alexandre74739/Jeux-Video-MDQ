import SectionTitle from "./SectionTitle";
import CoursePath from "./CoursePath";
import ConceptCards from "./adventure/ConceptCards";
import RewardsBanner from "./adventure/RewardsBanner";

export default function Adventure() {
  return (
    <section
      id="aventure"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6"
    >
      <SectionTitle
        title="Ce que l'enfant apprend"
        intro="Chaque parcours enchaîne des niveaux de plus en plus difficiles, qui se débloquent l'un après l'autre. Par exemple, le tutoriel :"
      />
      <CoursePath />
      <ConceptCards />
      <RewardsBanner />
    </section>
  );
}
