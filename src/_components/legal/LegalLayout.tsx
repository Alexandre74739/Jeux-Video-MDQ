import PageHeader from "@/_components/layout/PageHeader";
import SiteFooter from "@/_components/layout/SiteFooter";

/** Mise en page commune des pages légales (mentions légales, confidentialité). */
export default function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <PageHeader />
      <main id="contenu" className="legal mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm font-bold text-ink-soft">Dernière mise à jour : {updated}</p>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
