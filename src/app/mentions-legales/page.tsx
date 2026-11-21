import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/_components/legal/LegalLayout";
import { PUBLISHER, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales/" } };

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" updated="21 novembre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>{SITE_URL.replace(/^https?:\/\//, "")}</strong> est édité par <strong>{PUBLISHER.name}</strong>,
        à titre personnel. Directeur de la publication : {PUBLISHER.name}.
        <br />
        Contact : {PUBLISHER.contact ? <a href={`mailto:${PUBLISHER.contact}`}>{PUBLISHER.contact}</a> : <em>adresse e-mail de contact à compléter</em>}.
      </p>

      <h2>Hébergement</h2>
      <p>
        Site et fonctions serveur : <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        (<a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>).
        <br />
        Base de données de la sauvegarde en ligne : <strong>MongoDB, Inc.</strong> (service MongoDB Atlas),
        1633 Broadway, 38th Floor, New York, NY 10019, États-Unis. Données hébergées en France (AWS Paris, eu-west-3).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le code, les textes, la mascotte Cubo et les niveaux sont la propriété de l&apos;éditeur.
        Les personnages proviennent d&apos;<a href="https://openmoji.org" target="_blank" rel="noopener noreferrer">OpenMoji</a>,
        sous licence <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
        Les icônes proviennent de <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">Lucide</a> (licence ISC).
        Les polices Fredoka et Nunito sont sous licence SIL Open Font License.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le site ne dépose aucun cookie et n&apos;utilise aucun outil de mesure d&apos;audience ni de publicité.
        Pour tout savoir sur les données enregistrées, voir la page <Link href="/confidentialite/">Confidentialité</Link>.
      </p>
    </LegalLayout>
  );
}
