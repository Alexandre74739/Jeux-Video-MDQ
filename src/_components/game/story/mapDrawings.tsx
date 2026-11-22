export const INK = "#16123A";

/**
 * Dessin de chaque morceau, dans l'ordre de MAP_COURSES. Comme dans l'histoire, chaque morceau montre le lieu suivant :
 * la vallée aux portes fermées, la montagne qui fume, les couloirs qui tournent, puis l'île au phare.
 */
export const DRAWINGS = [
  // 1. Vallée des clés : une porte et sa clé
  <g key="cles">
    <image href="/sprites/1f6aa.svg" x="12" y="14" width="54" height="54" />
    <image href="/sprites/1f511.svg" x="52" y="48" width="34" height="34" />
  </g>,
  // 2. Le volcan qui fume
  <image
    key="volcan"
    href="/sprites/1f30b.svg"
    x="113"
    y="12"
    width="74"
    height="74"
  />,
  // 3. Le labyrinthe : des couloirs qui tournent jusqu'au centre
  <g key="laby">
    <path
      d="M34 120 H82 V182 H18 V120 M34 136 H66 V166 H34 V150 H50"
      fill="none"
      stroke="#8A5A2B"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="42"
      cy="158"
      r="5"
      fill="#FFD23F"
      stroke={INK}
      strokeWidth="2"
    />
  </g>,
  // 4. L'île secrète et son phare
  <g key="ile">
    <path
      d="M110 182 q6 -5 12 0 t12 0 M164 182 q6 -5 12 0 t12 0 M118 192 q6 -5 12 0 t12 0 t12 0 t12 0 t12 0"
      fill="none"
      stroke="#4FB6E8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <ellipse
      cx="150"
      cy="172"
      rx="34"
      ry="10"
      fill="#F2C46D"
      stroke={INK}
      strokeWidth="2.5"
    />
    <path d="M142 168 L145 128 H155 L158 168 Z" fill="#fff" />
    <path
      d="M142.75 158 L143.35 150 H156.65 L157.25 158 Z M143.95 142 L144.55 134 H155.45 L156.05 142 Z"
      fill="#FF5A4E"
    />
    <path
      d="M142 168 L145 128 H155 L158 168 Z"
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="144"
      y="117"
      width="12"
      height="11"
      fill="#FFD23F"
      stroke={INK}
      strokeWidth="2.5"
    />
    <path
      d="M140 118 L150 107 L160 118 Z"
      fill="#FF5A4E"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </g>,
];
