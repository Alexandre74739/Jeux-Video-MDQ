import { Logo } from "@/_components/ui/Logo";
import BackButton from "@/_components/ui/BackButton";

/** En-tête simple des pages secondaires : retour + logo, et une action facultative à droite. */
export default function PageHeader({ back = "/", action }: { back?: string | false; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {back !== false && <BackButton fallback={back} />}
          <Logo small />
        </div>
        {action}
      </div>
    </header>
  );
}
