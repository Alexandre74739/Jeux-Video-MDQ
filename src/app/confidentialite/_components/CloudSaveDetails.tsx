/** Détail des données de la sauvegarde en ligne (RGPD). */
export default function CloudSaveDetails() {
  return (
    <>
      <h2>Sauvegarde en ligne (facultative)</h2>
      <ul>
        <li>
          <strong>Données :</strong> pseudo, code secret à 4 chiffres
          (enregistré sous forme chiffrée irréversible), identifiant du
          personnage choisi comme avatar, étoiles, badges, tenue, scènes de
          l&apos;histoire vues, dates de création et de dernière utilisation.
        </li>
        <li>
          <strong>Finalité :</strong> retrouver sa progression sur un autre
          appareil.
        </li>
        <li>
          <strong>Base légale :</strong> le consentement (article 6.1.a du
          RGPD). Pour un enfant de moins de 15 ans, ce consentement est donné
          avec l&apos;accord d&apos;un parent ou de l&apos;animateur de la
          séance (article 45 de la loi Informatique et Libertés).
        </li>
        <li>
          <strong>Durée de conservation :</strong> un compte inutilisé pendant
          12 mois est supprimé automatiquement. Une connexion inutilisée pendant
          6 mois expire.
        </li>
        <li>
          <strong>Sécurité :</strong> connexion chiffrée (HTTPS), code secret
          haché avec sel, nombre d&apos;essais limité.
        </li>
      </ul>
    </>
  );
}
