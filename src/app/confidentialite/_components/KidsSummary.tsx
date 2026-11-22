/** Résumé de la politique de confidentialité, écrit pour les enfants. */
export default function KidsSummary() {
  return (
    <aside className="toon mt-6 rounded-3xl bg-sun/40 p-5">
      <p className="mt-0! font-display text-xl font-bold">
        En bref, pour les enfants
      </p>
      <ul>
        <li>
          Tu peux jouer sans rien donner : pas de nom, pas d&apos;e-mail, pas de
          compte.
        </li>
        <li>
          Tes étoiles et tes jeux restent sur ton ordinateur ou ta tablette.
        </li>
        <li>
          Si tu choisis la sauvegarde en ligne, on garde seulement ton pseudo,
          ton code (caché) et ta progression.
        </li>
        <li>N&apos;utilise jamais ton vrai prénom ou ton nom comme pseudo.</li>
        <li>Tu peux tout effacer quand tu veux, depuis le menu du joueur.</li>
      </ul>
    </aside>
  );
}
