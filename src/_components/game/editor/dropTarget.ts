import type { Target } from "./types";

/**
 * Cherche sous le point (x, y) la liste de blocs où déposer, et la place exacte dans cette liste.
 * `trash` : le pointeur est au-dessus de la palette (le bloc sera jeté).
 */
export function findDropTarget(
  x: number,
  y: number,
  accepts: (listId: string) => boolean,
): { trash: boolean; target: Target | null } {
  const els = document.elementsFromPoint(x, y) as HTMLElement[];
  const trash = els.some((el) => el.dataset?.trash);
  const listEl = trash ? undefined : els.find((el) => el.dataset?.list);
  if (!listEl) return { trash, target: null };
  const listId = listEl.dataset.list!;
  if (!accepts(listId)) return { trash, target: null };

  const lr = listEl.getBoundingClientRect();
  const kids = Array.from(
    listEl.querySelectorAll<HTMLElement>(":scope > [data-wrap]"),
  ).filter((k) => k.getClientRects().length > 0);
  let index = kids.length;
  for (let i = 0; i < kids.length; i++) {
    const r = kids[i].getBoundingClientRect();
    if (y < r.top + Math.min(r.height / 2, 22)) {
      index = i;
      break;
    }
  }
  let top = lr.top + 8;
  if (kids.length) {
    top =
      index < kids.length
        ? kids[index].getBoundingClientRect().top - 4
        : kids[kids.length - 1].getBoundingClientRect().bottom + 3;
  }
  return {
    trash,
    target: {
      listId,
      index,
      top,
      left: lr.left + 6,
      width: Math.min(lr.width - 12, 240),
    },
  };
}
