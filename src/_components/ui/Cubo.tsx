"use client";
import { useOutfit } from "@/lib/outfit";
import { colorOf, type Outfit } from "@/lib/rewards";

export type Mood = "happy" | "wow" | "sad" | "think";

/** Chapeaux de Cubo en 2D, posés sur la face du dessus (centre ≈ 60,26). */
function Hat2D({ id }: { id: string }) {
  const S = { stroke: "#16123A", strokeWidth: 3.5, strokeLinejoin: "round" as const };
  switch (id) {
    case "aucun": return null;
    case "helice":
      return (
        <g>
          <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#FF6B57" {...S} />
          <path d="M60 24 L60 8" stroke="#16123A" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="49" cy="7" rx="11" ry="3.5" fill="#FFD23F" {...S} strokeWidth={3} />
          <ellipse cx="71" cy="7" rx="11" ry="3.5" fill="#4FC3F7" {...S} strokeWidth={3} />
          <circle cx="60" cy="7" r="3" fill="#16123A" />
        </g>
      );
    case "sorcier":
      return (
        <g>
          <ellipse cx="60" cy="29" rx="27" ry="9" fill="#7356E0" {...S} />
          <path d="M42 29 Q50 6 62 -8 Q66 10 78 29 Z" fill="#9B7BFF" {...S} />
          <path d="M57 14 l2 -5 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 Z" fill="#FFD23F" stroke="#16123A" strokeWidth="1.5" />
        </g>
      );
    case "cowboy":
      return (
        <g>
          <ellipse cx="60" cy="30" rx="36" ry="11" fill="#B5672D" {...S} />
          <path d="M45 29 L47 12 Q60 6 73 12 L75 29 Q60 34 45 29 Z" fill="#D69A5B" {...S} />
          <path d="M46 24 Q60 29 74 24" fill="none" stroke="#6B4423" strokeWidth="4" />
        </g>
      );
    case "pirate":
      return (
        <g>
          <path d="M28 31 Q44 2 60 8 Q76 2 92 31 Q60 22 28 31 Z" fill="#16123A" {...S} />
          <circle cx="60" cy="18" r="4.5" fill="#fff" />
          <path d="M55 24 l10 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "couronne":
      return (
        <g>
          <path d="M42 32 L40 12 L50 21 L60 6 L70 21 L80 12 L78 32 Q60 38 42 32 Z" fill="#FFD23F" {...S} />
          <circle cx="60" cy="26" r="3" fill="#FF6B57" stroke="#16123A" strokeWidth="1.5" />
          <circle cx="49" cy="27" r="2.4" fill="#4FC3F7" stroke="#16123A" strokeWidth="1.5" />
          <circle cx="71" cy="27" r="2.4" fill="#3DDC97" stroke="#16123A" strokeWidth="1.5" />
        </g>
      );
    case "licorne":
      return (
        <g>
          <path d="M53 30 L63 -6 L69 30 Q61 34 53 30 Z" fill="#FFF1BF" {...S} />
          <path d="M55 22 L67 18 M57 13 L66 9 M59 4 L64 2" stroke="#FF8FC7" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return <path d="M38 26 L60 15 L82 26 L60 37 Z" fill="#7BD88F" {...S} />;
  }
}

/** Accessoire de dos en 2D (dessiné derrière le cube, côté droit). */
function Back2D({ id }: { id: string }) {
  const S = { stroke: "#16123A", strokeWidth: 4, strokeLinejoin: "round" as const };
  switch (id) {
    case "rien": return null;
    case "cape": return <path d="M90 38 L112 50 L116 104 L100 98 L92 76 Z" fill="#FF6B57" {...S} />;
    case "ailes":
      return (
        <g>
          <path d="M94 44 Q122 14 118 54 Q108 62 94 54 Z" fill="#C9B8FF" {...S} />
          <path d="M94 58 Q120 64 110 88 Q98 86 94 70 Z" fill="#FF8FC7" {...S} />
        </g>
      );
    case "carapace": return <path d="M90 40 Q118 46 112 86 L92 80 Z" fill="#3DDC97" {...S} />;
    case "jetpack":
      return (
        <g>
          <path d="M92 42 L108 50 L108 84 L92 76 Z" fill="#A5ADC0" {...S} />
          <path d="M96 80 L100 98 L104 82 Z" fill="#FFA94D" stroke="#16123A" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      );
    default: return <path d="M92 44 L106 52 L106 80 L92 72 Z" fill="#4FC3F7" {...S} />;
  }
}

/** Accessoire du visage en 2D. Les yeux sont en (34, y) et (50, y + 8) sur la face gauche. */
function Face2D({ id, y, under }: { id: string; y: number; under: boolean }) {
  const S = { stroke: "#16123A", strokeWidth: 3, strokeLinejoin: "round" as const };
  if (under) return id === "masque" ? <path d="M21 47 L60 66 L60 80 L21 61 Z" fill="#9B7BFF" {...S} /> : null;
  switch (id) {
    case "lunettes":
      return (
        <g fill="none" {...S}>
          <circle cx="34" cy={y} r="8.5" /><circle cx="50" cy={y + 8} r="8.5" />
          <path d={`M42 ${y + 3} L42 ${y + 5}`} /><path d={`M25.5 ${y - 2} L20 ${y - 5}`} />
        </g>
      );
    case "soleil":
      return (
        <g {...S}>
          <rect x="25" y={y - 7} width="18" height="13" rx="5" fill="#16123A" transform={`rotate(26 34 ${y})`} />
          <rect x="41" y={y + 1} width="18" height="13" rx="5" fill="#16123A" transform={`rotate(26 50 ${y + 8})`} />
          <path d={`M43 ${y + 2} L41 ${y + 6}`} fill="none" />
          <path d={`M29 ${y - 3} l4 2`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "monocle":
      return (
        <g fill="none" {...S}>
          <circle cx="50" cy={y + 8} r="9" stroke="#E0AE10" strokeWidth="3.5" />
          <path d={`M54 ${y + 16} Q56 ${y + 30} 48 ${y + 38}`} stroke="#E0AE10" strokeWidth="2" />
        </g>
      );
    default: return null;
  }
}

/** Cubo, la mascotte : un petit cube explorateur (SVG isométrique), avec la tenue choisie. */
export function Cubo({ size = 120, mood = "happy", className = "", outfit }: { size?: number; mood?: Mood; className?: string; outfit?: Outfit }) {
  const current = useOutfit();
  const o = outfit ?? current;
  const [top, left, right] = colorOf(o.color).faces;
  const eyeY = mood === "sad" ? 62 : 58;
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * 1.08} className={className} style={{ overflow: "visible" }} aria-hidden="true">
      <ellipse cx="60" cy="122" rx="38" ry="6" fill="#16123A" opacity="0.18" />
      {/* accessoire de dos */}
      <Back2D id={o.back} />
      {/* faces du cube */}
      <path d="M60 14 L100 34 L60 54 L20 34 Z" fill={top} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M20 34 L60 54 L60 108 L20 88 Z" fill={left} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 34 L60 54 L60 108 L100 88 Z" fill={right} stroke="#16123A" strokeWidth="4" strokeLinejoin="round" />
      <Hat2D id={o.hat} />
      <Face2D id={o.face} y={eyeY} under />
      {/* yeux */}
      {mood === "wow" ? (
        <>
          <path d="M28 58 l6 -6 l6 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 66 l6 -6 l6 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="34" cy={eyeY} rx="5.5" ry="7" fill="#fff" stroke="#16123A" strokeWidth="3" />
          <ellipse cx="50" cy={eyeY + 8} rx="5.5" ry="7" fill="#fff" stroke="#16123A" strokeWidth="3" />
          <circle cx={mood === "think" ? 33 : 35} cy={eyeY + (mood === "think" ? -2 : 1)} r="2.6" fill="#16123A" />
          <circle cx={mood === "think" ? 49 : 51} cy={eyeY + (mood === "think" ? 6 : 9)} r="2.6" fill="#16123A" />
        </>
      )}
      <Face2D id={o.face} y={eyeY} under={false} />
      {/* bouche */}
      {mood === "sad" ? (
        <path d="M34 84 q8 -6 14 4" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
      ) : mood === "think" ? (
        <path d="M34 80 l14 6" fill="none" stroke="#16123A" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M32 76 q8 14 18 10" fill="#16123A" stroke="#16123A" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      <ellipse cx="28" cy="72" rx="4" ry="3" fill="#FF6B57" opacity="0.7" />
    </svg>
  );
}
