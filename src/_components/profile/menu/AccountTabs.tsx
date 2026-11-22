"use client";
import { LogIn, UserPlus, type LucideIcon } from "lucide-react";
import { sfx } from "@/lib/sound";
import { ICON_STROKE } from "@/lib/site";
import type { ProfileMenuState } from "./useProfileMenu";

const TABS: { id: "new" | "login"; label: string; icon: LucideIcon }[] = [
  { id: "new", label: "Je suis nouveau", icon: UserPlus },
  { id: "login", label: "J'ai déjà un compte", icon: LogIn },
];

/** Choix entre créer un joueur et se connecter à un compte existant. */
export function AccountTabs({ m }: { m: ProfileMenuState }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={m.tab === t.id}
          onClick={() => {
            m.setTab(t.id);
            m.setError(null);
            m.setCode([]);
            sfx("click");
          }}
          className={`btn py-2 text-sm sm:text-base ${m.tab === t.id ? "bg-grape text-white" : "bg-paper"}`}
        >
          <t.icon
            size={17}
            strokeWidth={ICON_STROKE}
            className="mr-1 inline"
            aria-hidden="true"
          />{" "}
          {t.label}
        </button>
      ))}
    </div>
  );
}
