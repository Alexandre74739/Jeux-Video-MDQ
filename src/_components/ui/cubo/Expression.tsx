import { INK, line } from "./stroke";

export type Mood = "happy" | "wow" | "sad" | "think";

const eye = { rx: "5.5", ry: "7", fill: "#fff", stroke: INK, strokeWidth: 3 };

/** Yeux de Cubo selon son humeur (étonné : yeux en chevrons ; pensif : regard vers le haut). */
export function Eyes({ mood, y }: { mood: Mood; y: number }) {
  if (mood === "wow")
    return (
      <>
        <path d="M28 58 l6 -6 l6 6" {...line(4)} />
        <path d="M44 66 l6 -6 l6 6" {...line(4)} />
      </>
    );
  const think = mood === "think";
  return (
    <>
      <ellipse cx="34" cy={y} {...eye} />
      <ellipse cx="50" cy={y + 8} {...eye} />
      <circle
        cx={think ? 33 : 35}
        cy={y + (think ? -2 : 1)}
        r="2.6"
        fill={INK}
      />
      <circle
        cx={think ? 49 : 51}
        cy={y + (think ? 6 : 9)}
        r="2.6"
        fill={INK}
      />
    </>
  );
}

/** Bouche de Cubo selon son humeur. */
export function Mouth({ mood }: { mood: Mood }) {
  if (mood === "sad") return <path d="M34 84 q8 -6 14 4" {...line(4)} />;
  if (mood === "think") return <path d="M34 80 l14 6" {...line(4)} />;
  return (
    <path
      d="M32 76 q8 14 18 10"
      fill={INK}
      stroke={INK}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
  );
}
