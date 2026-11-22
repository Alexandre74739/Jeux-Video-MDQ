import { Flame, Lock } from "lucide-react";
import Reveal from "@/_components/animations/Reveal";
import { Icon, StarIcon } from "@/_components/icons/Icon";
import { BADGES } from "@/lib/rewards";
import { ICON_STROKE } from "@/lib/site";

/** Badges montrés en exemple (les autres sont à découvrir en jouant). */
const BADGE_SAMPLE = 5;

/** Bandeau des récompenses : étoiles, flamme et quelques badges. */
export default function RewardsBanner() {
  const sample = Object.entries(BADGES)
    .filter(([, bd]) => !bd.secret && !bd.at?.startsWith("ile-secrete"))
    .slice(0, BADGE_SAMPLE);
  return (
    <Reveal className="toon mt-14 grid items-center gap-8 rounded-4xl bg-sun p-8 md:grid-cols-[1fr_1.3fr]">
      <div>
        <h3 className="text-3xl font-bold">Gagne des étoiles et des badges</h3>
        <p className="mt-2 text-lg font-bold">
          Jusqu&apos;à 3 étoiles par niveau : moins tu utilises de blocs, plus
          tu en gagnes. Enchaîne les réussites du premier coup pour faire
          grimper ta flamme.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div
          className="toon flex items-center gap-1 rounded-full bg-paper px-4 py-2"
          aria-label="3 étoiles"
        >
          {[0, 1, 2].map((i) => (
            <StarIcon key={i} size={34} />
          ))}
        </div>
        <div className="toon flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-display text-2xl font-bold">
          <Flame
            size={30}
            strokeWidth={ICON_STROKE}
            fill="#FFD23F"
            aria-hidden="true"
          />{" "}
          5
        </div>
        {sample.map(([k, bd]) => (
          <span
            key={k}
            title={bd.name}
            className="grid size-14 place-items-center rounded-full border-[3px] border-ink bg-lilac shadow-pop"
          >
            <Icon name={bd.icon} size={26} />
            <span className="sr-only">{bd.name}</span>
          </span>
        ))}
        <span
          title="Badge secret"
          className="grid size-14 place-items-center rounded-full border-[3px] border-ink bg-grape text-white shadow-pop"
        >
          <Lock size={24} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span className="sr-only">Badge secret</span>
        </span>
        <span className="toon rounded-full bg-paper px-4 py-2 font-display text-lg font-bold">
          + {Object.keys(BADGES).length - BADGE_SAMPLE - 1} badges à découvrir
        </span>
      </div>
    </Reveal>
  );
}
