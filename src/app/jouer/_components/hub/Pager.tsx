"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Pages des défis : précédente, numéros, suivante. */
export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="Pages des défis"
    >
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="btn grid size-12 place-items-center bg-paper disabled:opacity-40"
        aria-label="Page précédente"
      >
        <ArrowLeft size={22} strokeWidth={3} aria-hidden="true" />
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPage(i)}
          aria-current={i === page ? "page" : undefined}
          aria-label={`Page ${i + 1}`}
          className={`btn grid size-12 place-items-center font-display text-xl ${i === page ? "bg-grape text-white" : "bg-paper"}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages - 1}
        className="btn grid size-12 place-items-center bg-paper disabled:opacity-40"
        aria-label="Page suivante"
      >
        <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
      </button>
    </nav>
  );
}
