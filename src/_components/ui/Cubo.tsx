"use client";
import { useId } from "react";
import { useOutfit } from "@/lib/outfit";
import { colorOf, type Outfit } from "@/lib/rewards";
import { Back2D } from "./cubo/Back2D";
import { Eyes, Mouth, type Mood } from "./cubo/Expression";
import { Face2D } from "./cubo/Face2D";
import { Hat2D } from "./cubo/Hat2D";
import { INK, outline } from "./cubo/stroke";

export type { Mood };

const FACE = outline(4);

/** Cubo, la mascotte : un petit cube explorateur (SVG isométrique), avec la tenue choisie. */
export function Cubo({
  size = 120,
  mood = "happy",
  className = "",
  outfit,
}: {
  size?: number;
  mood?: Mood;
  className?: string;
  outfit?: Outfit;
}) {
  const current = useOutfit();
  const o = outfit ?? current;
  const color = colorOf(o.color);
  const uid = useId().replace(/:/g, "");
  // Couleur rayée : un motif de rayures diagonales par face (mêmes ombres que les couleurs unies).
  const fills = color.faces.map((f, i) =>
    color.stripes ? `url(#${uid}-s${i})` : f,
  );
  const [top, left, right] = fills;
  const eyeY = mood === "sad" ? 62 : 58;
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={size * 1.08}
      className={className}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {color.stripes && (
        <defs>
          {color.faces.map((f, i) => (
            <pattern
              key={i}
              id={`${uid}-s${i}`}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="14" height="14" fill={f} />
              <rect width="7" height="14" fill={color.stripes![i]} />
            </pattern>
          ))}
        </defs>
      )}
      <ellipse cx="60" cy="122" rx="38" ry="6" fill={INK} opacity="0.18" />
      {/* accessoire de dos */}
      <Back2D id={o.back} />
      <path d="M60 14 L100 34 L60 54 L20 34 Z" fill={top} {...FACE} />
      <path d="M20 34 L60 54 L60 108 L20 88 Z" fill={left} {...FACE} />
      <path d="M100 34 L60 54 L60 108 L100 88 Z" fill={right} {...FACE} />
      <Hat2D id={o.hat} />
      <Face2D id={o.face} y={eyeY} under />
      <Eyes mood={mood} y={eyeY} />
      <Face2D id={o.face} y={eyeY} under={false} />
      <Mouth mood={mood} />
      <ellipse cx="28" cy="72" rx="4" ry="3" fill="#FF6B57" opacity="0.7" />
    </svg>
  );
}
