"use client";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import type { Project, SpriteDef } from "@/lib/runtime";
import { load, save } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import { starter } from "../starter";
import { downloadProject, newSprite, readProject } from "./projectFile";

/** Jeu en cours de création : personnages, décor, personnage choisi, messages et fichiers. */
export function useStudio(stopGame: () => void) {
  const mounted = useMounted();
  const [project, setProject] = useState<Project | null>(null);
  const [sel, setSel] = useState("");
  const [libOpen, setLibOpen] = useState(false);
  const [notice, setNotice] = useState<{ text: string; key: number } | null>(
    null,
  );

  const show = (p: Project) => {
    setProject(p);
    setSel(p.sprites[0]?.id ?? "");
  };
  // Le jeu enregistré sur l'appareil (ou l'exemple), une fois dans le navigateur.
  if (mounted && !project)
    show(load<Project | null>("project", null) ?? starter());

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => save("project", project), 400);
    return () => clearTimeout(t);
  }, [project]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const notify = (text: string) => setNotice({ text, key: Date.now() });
  const updateSprite = (id: string, patch: Partial<SpriteDef>) =>
    setProject(
      (p) =>
        p && {
          ...p,
          sprites: p.sprites.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        },
    );

  const addSprite = (name: string, src: string) => {
    if (!project) return;
    const s = newSprite(project, name, src);
    setProject({ ...project, sprites: [...project.sprites, s] });
    setSel(s.id);
    setLibOpen(false);
    sfx("magic");
  };
  const removeSprite = (id: string) => {
    if (!project || project.sprites.length <= 1) return;
    const sp = project.sprites.find((s) => s.id === id);
    if (!window.confirm(`Supprimer « ${sp?.name} » et ses blocs ?`)) return;
    const rest = project.sprites.filter((s) => s.id !== id);
    setProject({ ...project, sprites: rest });
    setSel(rest[0].id);
    sfx("trash");
  };

  const download = () => {
    if (!project) return;
    downloadProject(project);
    sfx("coin");
    notify("Ton jeu est téléchargé !");
  };
  const openFile = async (f: File) => {
    const p = await readProject(f);
    if (!p) {
      sfx("bump");
      return notify("Oups, ce fichier n'est pas un jeu CuboCode.");
    }
    stopGame();
    show(p);
    sfx("magic");
    notify("Jeu ouvert !");
  };
  const restart = () => {
    if (!window.confirm("Effacer ton jeu et recommencer avec l'exemple ?"))
      return;
    stopGame();
    show(starter());
    sfx("trash");
  };

  return {
    project,
    setProject,
    sel,
    setSel,
    libOpen,
    setLibOpen,
    notice,
    notify,
    updateSprite,
    addSprite,
    removeSprite,
    download,
    openFile,
    restart,
  };
}

export type StudioState = ReturnType<typeof useStudio>;
