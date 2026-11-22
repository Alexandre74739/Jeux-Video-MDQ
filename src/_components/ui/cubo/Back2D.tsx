import { outline } from "./stroke";

const S = outline(4);

/** Accessoire de dos en 2D (dessiné derrière le cube, côté droit). */
export function Back2D({ id }: { id: string }) {
  switch (id) {
    case "rien":
      return null;
    case "cape":
      return (
        <path
          d="M90 38 L112 50 L116 104 L100 98 L92 76 Z"
          fill="#FF6B57"
          {...S}
        />
      );
    case "ailes":
      return (
        <g>
          <path
            d="M94 44 Q122 14 118 54 Q108 62 94 54 Z"
            fill="#C9B8FF"
            {...S}
          />
          <path
            d="M94 58 Q120 64 110 88 Q98 86 94 70 Z"
            fill="#FF8FC7"
            {...S}
          />
        </g>
      );
    case "carapace":
      return <path d="M90 40 Q118 46 112 86 L92 80 Z" fill="#3DDC97" {...S} />;
    case "jetpack":
      return (
        <g>
          <path d="M92 42 L108 50 L108 84 L92 76 Z" fill="#A5ADC0" {...S} />
          <path d="M96 80 L100 98 L104 82 Z" fill="#FFA94D" {...outline(2.5)} />
        </g>
      );
    default:
      return <path d="M92 44 L106 52 L106 80 L92 72 Z" fill="#4FC3F7" {...S} />;
  }
}
