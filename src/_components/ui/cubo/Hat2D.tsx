import { COSTUME_HATS } from "./costumeHats";
import { INK, line, outline } from "./stroke";

const S = outline(3.5);
const thin = { stroke: INK, strokeWidth: 1.5 };
const thick = outline(3);
/** Pales de l'hélice : position et couleur. */
const PROPELLER = [
  ["49", "#FFD23F"],
  ["71", "#4FC3F7"],
];

/** Chapeaux de Cubo en 2D, posés sur la face du dessus (centre ≈ 60,26). */
export function Hat2D({ id }: { id: string }) {
  if (COSTUME_HATS[id]) return COSTUME_HATS[id];
  switch (id) {
    case "aucun":
      return null;
    case "helice":
      return (
        <g>
          <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#FF6B57" {...S} />
          <path d="M60 24 L60 8" {...line(3.5)} />
          {PROPELLER.map(([cx, fill]) => (
            <ellipse
              key={cx}
              cx={cx}
              cy="7"
              rx="11"
              ry="3.5"
              fill={fill}
              {...thick}
            />
          ))}
          <circle cx="60" cy="7" r="3" fill={INK} />
        </g>
      );
    case "couronne":
      return (
        <g>
          <path
            d="M42 32 L40 12 L50 21 L60 6 L70 21 L80 12 L78 32 Q60 38 42 32 Z"
            fill="#FFD23F"
            {...S}
          />
          <circle cx="60" cy="26" r="3" fill="#FF6B57" {...thin} />
          <circle cx="49" cy="27" r="2.4" fill="#4FC3F7" {...thin} />
          <circle cx="71" cy="27" r="2.4" fill="#3DDC97" {...thin} />
        </g>
      );
    case "licorne":
      return (
        <g>
          <path d="M53 30 L63 -6 L69 30 Q61 34 53 30 Z" fill="#FFF1BF" {...S} />
          <path
            d="M55 22 L67 18 M57 13 L66 9 M59 4 L64 2"
            {...line(3)}
            stroke="#FF8FC7"
          />
        </g>
      );
    default:
      return <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#7BD88F" {...S} />;
  }
}
