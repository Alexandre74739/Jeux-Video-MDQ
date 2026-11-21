import type { Metadata } from "next";
import LegalLayout from "@/_components/legal/LegalLayout";
import { PUBLISHER } from "@/lib/site";

export const metadata: Metadata = { title: "Confidentialité", alternates: { canonical: "/confidentialite/" } };

export default function Confidentialite() {
  const contact = PUBLISHER.contact
    ? <a href={`mailto:${PUBLISHER.contact}`}>{PUBLISHER.contact}</a>
    : <em>adresse e-mail de contact à compléter</em>;
  return (
    <LegalLayout title="Confidentialité" updated="21 novembre 2026">
      <aside className="toon mt-6 rounded-3xl bg-sun/40 p-5">
        <p className="mt-0! font-display text-xl font-bold">En bref, pour les enfants</p>
        <ul>
          <li>Tu peux jouer sans rien donner : pas de nom, pas d&apos;e-mail, pas de compte.</li>
          <li>Tes étoiles et tes jeux restent sur ton ordinateur ou ta tablette.</li>
          <li>Si tu choisis la sauvegarde en ligne, on garde seulement ton pseudo, ton code (caché) et ta progression.</li>
          <li>N&apos;utilise jamais ton vrai prénom ou ton nom comme pseudo.</li>
          <li>Tu peux tout effacer quand tu veux, depuis le menu du joueur.</li>
        </ul>
      </aside>

      <h2>Responsable du traitement</h2>
      <p>{PUBLISHER.name}, éditeur du site. Contact : {contact}.</p>

      <h2>Données gardées sur l&apos;appareil uniquement</h2>
      <p>
        Joueurs, progression, badges, tenue de Cubo, programmes, jeux créés, photos importées et réglages du son sont
        enregistrés dans le stockage local du navigateur. Ils ne sont jamais envoyés sur Internet (sauf la progression,
        si la sauvegarde en ligne est activée). Les photos sont réduites et ne quittent jamais l&apos;appareil.
      </p>

      <h2>Sauvegarde en ligne (facultative)</h2>
      <ul>
        <li><strong>Données :</strong> pseudo, code secret à 4 chiffres (enregistré sous forme chiffrée irréversible), identifiant du personnage choisi comme avatar, étoiles, badges, tenue, scènes de l&apos;histoire vues, dates de création et de dernière utilisation.</li>
        <li><strong>Finalité :</strong> retrouver sa progression sur un autre appareil.</li>
        <li><strong>Base légale :</strong> le consentement (article 6.1.a du RGPD). Pour un enfant de moins de 15 ans, ce consentement est donné avec l&apos;accord d&apos;un parent ou de l&apos;animateur de la séance (article 45 de la loi Informatique et Libertés).</li>
        <li><strong>Durée de conservation :</strong> un compte inutilisé pendant 12 mois est supprimé automatiquement. Une connexion inutilisée pendant 6 mois expire.</li>
        <li><strong>Sécurité :</strong> connexion chiffrée (HTTPS), code secret haché avec sel, nombre d&apos;essais limité.</li>
      </ul>

      <h2>Adresse IP</h2>
      <p>
        Pour bloquer les abus (essais de codes en masse), l&apos;adresse IP est utilisée pour compter les demandes faites à la
        sauvegarde en ligne. Ces compteurs sont effacés automatiquement au bout d&apos;une heure au plus. L&apos;hébergeur peut
        aussi conserver des journaux techniques pendant une courte durée.
      </p>

      <h2>Destinataires et hébergement</h2>
      <p>
        Les données ne sont ni vendues, ni partagées, ni utilisées pour de la publicité. Elles sont hébergées par nos
        sous-traitants Vercel Inc. (site et fonctions serveur, exécutées à Paris) et MongoDB, Inc. (base de données hébergée
        en France, AWS Paris eu-west-3). Ces sociétés américaines adhèrent au cadre de protection des données UE–États-Unis
        (Data Privacy Framework).
      </p>

      <h2>Cookies</h2>
      <p>
        Aucun cookie, aucun traceur, aucune mesure d&apos;audience. Le stockage local sert uniquement au fonctionnement
        du jeu : il ne nécessite pas de consentement (article 82 de la loi Informatique et Libertés).
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les corriger ou les effacer. L&apos;effacement est immédiat depuis le menu du
        joueur : « Supprimer aussi le compte en ligne ». Pour toute autre demande : {contact}. Vous pouvez aussi adresser
        une réclamation à la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>
    </LegalLayout>
  );
}
