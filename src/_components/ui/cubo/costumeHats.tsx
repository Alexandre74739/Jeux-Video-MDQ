import { INK, line, outline } from "./stroke";

const S = outline(3.5);
const thin = { stroke: INK, strokeWidth: 1.5 };

/** Chapeaux de déguisement (sorcier, cowboy, pirate) en 2D. */
export const COSTUME_HATS: Record<string, React.ReactElement> = {
  sorcier: (
    <g>
      <ellipse cx="60" cy="29" rx="27" ry="9" fill="#7356E0" {...S} />
      <path d="M42 29 Q50 6 62 -8 Q66 10 78 29 Z" fill="#9B7BFF" {...S} />
      <path
        d="M57 14 l2 -5 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 Z"
        fill="#FFD23F"
        {...thin}
      />
    </g>
  ),
  cowboy: (
    <g>
      <ellipse cx="60" cy="30" rx="36" ry="11" fill="#B5672D" {...S} />
      <path
        d="M45 29 L47 12 Q60 6 73 12 L75 29 Q60 34 45 29 Z"
        fill="#D69A5B"
        {...S}
      />
      <path
        d="M46 24 Q60 29 74 24"
        fill="none"
        stroke="#6B4423"
        strokeWidth="4"
      />
    </g>
  ),
  pirate: (
    <g>
      <path
        d="M28 31 Q44 2 60 8 Q76 2 92 31 Q60 22 28 31 Z"
        fill={INK}
        {...S}
      />
      <circle cx="60" cy="18" r="4.5" fill="#fff" />
      <path d="M55 24 l10 0" {...line(2.5)} stroke="#fff" />
    </g>
  ),
};
