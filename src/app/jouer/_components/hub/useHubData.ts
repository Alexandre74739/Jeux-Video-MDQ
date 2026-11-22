"use client";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { DATA_EVENT } from "@/lib/profiles";
import { emptyProgress, type Progress } from "@/lib/rewards";
import { load, loadSession } from "@/lib/storage";

/**
 * Progression du joueur et scènes d'histoire déjà vues, lues sur l'appareil
 * (et relues après une synchronisation en ligne), plus la page de défis gardée pour l'onglet.
 */
export function useHubData(pages: number) {
  const mounted = useMounted();
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [seen, setSeen] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  if (mounted && !loaded) {
    setLoaded(true);
    setProgress(load<Progress>("progress", emptyProgress));
    setSeen(load<string[]>("story", []));
    setPage(Math.min(pages - 1, loadSession("hubPage", 0)));
  }

  useEffect(() => {
    const reload = () => {
      setProgress(load<Progress>("progress", emptyProgress));
      setSeen(load<string[]>("story", []));
    };
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, []);

  return { progress, seen, page, setPage };
}
