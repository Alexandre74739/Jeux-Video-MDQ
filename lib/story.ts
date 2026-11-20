// L'histoire de Cubo : la carte au trésor dispersée par le vent, et l'île secrète.
// Fichier sans import : lisible par les scripts Node (génération des voix).

export type Mood = "happy" | "wow" | "sad" | "think";
export type Scene = { title: string; pages: { text: string; mood: Mood }[] };
export type Chapter = { intro: Scene; outro: Scene; piece?: number };

/** Étoiles nécessaires pour allumer le phare et ouvrir l'île secrète. */
export const ISLAND_STARS = 60;
export const ISLAND_SLUG = "ile-secrete";
/** Parcours qui cachent un morceau de la carte, dans l'ordre. */
export const MAP_COURSES = ["tutoriel", "vallee-des-cles", "volcan", "labyrinthe"];

export const STORY: Record<string, Chapter> = {
  tutoriel: {
    intro: {
      title: "La carte envolée",
      pages: [
        { text: "Salut, moi c'est Cubo ! Cette nuit, un grand coup de vent a déchiré ma carte au trésor en 4 morceaux.", mood: "sad" },
        { text: "Les morceaux sont partis très loin. Pour les retrouver, j'ai besoin de toi : c'est toi qui écris mes programmes !", mood: "think" },
        { text: "On commence par les bases : avancer, tourner, répéter. Prêt ? C'est parti !", mood: "wow" },
      ],
    },
    outro: {
      title: "Le premier morceau !",
      pages: [
        { text: "Regarde ! Dans le dernier coffre, il y avait le premier morceau de la carte !", mood: "wow" },
        { text: "Il montre une vallée pleine de portes fermées. Le deuxième morceau doit être caché là-bas.", mood: "think" },
      ],
    },
    piece: 0,
  },
  "vallee-des-cles": {
    intro: {
      title: "La vallée des clés",
      pages: [
        { text: "Nous voici dans la vallée des clés. Toutes les portes sont fermées à clé !", mood: "think" },
        { text: "Ramasse les clés et ouvre les portes. Le deuxième morceau de la carte nous attend au bout.", mood: "happy" },
      ],
    },
    outro: {
      title: "Le deuxième morceau !",
      pages: [
        { text: "Hourra, le deuxième morceau ! On dirait le dessin d'une montagne qui fume…", mood: "wow" },
        { text: "C'est un volcan ! Il faudra apprendre à sauter par-dessus la lave.", mood: "think" },
      ],
    },
    piece: 1,
  },
  volcan: {
    intro: {
      title: "Le volcan",
      pages: [
        { text: "Ouh là, il fait chaud ici ! La lave coule partout autour du volcan.", mood: "sad" },
        { text: "Avec le bloc sauter, je peux passer par-dessus. Le troisième morceau est tout en haut !", mood: "happy" },
      ],
    },
    outro: {
      title: "Le troisième morceau !",
      pages: [
        { text: "On a le troisième morceau ! Il montre des couloirs qui tournent dans tous les sens.", mood: "wow" },
        { text: "C'est le labyrinthe du maître. Il paraît que seuls les vrais codeurs en sortent !", mood: "think" },
      ],
    },
    piece: 2,
  },
  labyrinthe: {
    intro: {
      title: "Le labyrinthe du maître",
      pages: [
        { text: "Le labyrinthe du maître ! Ici, il faut que je réfléchisse tout seul à chaque pas.", mood: "think" },
        { text: "Avec le bloc si sinon, tu peux m'apprendre à choisir. Le dernier morceau est au centre !", mood: "happy" },
      ],
    },
    outro: {
      title: "La carte est complète !",
      pages: [
        { text: "Le quatrième morceau ! La carte est enfin complète !", mood: "wow" },
        { text: "Elle montre une île cachée au milieu de la mer, avec un phare. Mais le phare est éteint…", mood: "think" },
        { text: "Il paraît que les étoiles que tu gagnes peuvent l'allumer. Avec 60 étoiles, on pourra partir vers l'île secrète !", mood: "happy" },
      ],
    },
    piece: 3,
  },
  "ile-secrete": {
    intro: {
      title: "L'île secrète",
      pages: [
        { text: "Le phare brille de toutes ses étoiles ! Grâce à toi, le bateau a trouvé l'île secrète.", mood: "wow" },
        { text: "Ici, il faudra utiliser tous les blocs que tu connais. Le trésor est caché au bout de l'île !", mood: "happy" },
      ],
    },
    outro: {
      title: "Le vrai trésor",
      pages: [
        { text: "On a ouvert le grand coffre de l'île ! Il y a de l'or, des gemmes… et un petit mot.", mood: "wow" },
        { text: "Il dit : « Le vrai trésor, c'est ce que tu as appris en chemin. » Et c'est vrai : maintenant, tu sais coder !", mood: "happy" },
        { text: "Merci de m'avoir aidé. Tu peux maintenant inventer tes propres jeux dans la création libre !", mood: "wow" },
      ],
    },
  },
};
