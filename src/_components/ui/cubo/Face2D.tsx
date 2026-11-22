import { INK, outline } from "./stroke";

const S = outline(3);

/**
 * Accessoire du visage en 2D. Les yeux sont en (34, y) et (50, y + 8) sur la face gauche.
 * `under` : partie dessinée sous les yeux (le masque), sinon par-dessus (lunettes…).
 */
export function Face2D({
  id,
  y,
  under,
}: {
  id: string;
  y: number;
  under: boolean;
}) {
  if (under)
    return id === "masque" ? (
      <path d="M21 47 L60 66 L60 80 L21 61 Z" fill="#9B7BFF" {...S} />
    ) : null;
  switch (id) {
    case "lunettes":
      return (
        <g fill="none" {...S}>
          <circle cx="34" cy={y} r="8.5" />
          <circle cx="50" cy={y + 8} r="8.5" />
          <path d={`M42 ${y + 3} L42 ${y + 5}`} />
          <path d={`M25.5 ${y - 2} L20 ${y - 5}`} />
        </g>
      );
    case "soleil":
      return (
        <g {...S}>
          <rect
            x="25"
            y={y - 7}
            width="18"
            height="13"
            rx="5"
            fill={INK}
            transform={`rotate(26 34 ${y})`}
          />
          <rect
            x="41"
            y={y + 1}
            width="18"
            height="13"
            rx="5"
            fill={INK}
            transform={`rotate(26 50 ${y + 8})`}
          />
          <path d={`M43 ${y + 2} L41 ${y + 6}`} fill="none" />
          <path
            d={`M29 ${y - 3} l4 2`}
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case "monocle":
      return (
        <g fill="none" {...S}>
          <circle cx="50" cy={y + 8} r="9" stroke="#E0AE10" strokeWidth="3.5" />
          <path
            d={`M54 ${y + 16} Q56 ${y + 30} 48 ${y + 38}`}
            stroke="#E0AE10"
            strokeWidth="2"
          />
        </g>
      );
    default:
      return null;
  }
}
