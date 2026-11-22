"use client";
import dynamic from "next/dynamic";

/** Monde 3D chargé seulement dans le navigateur, quand on en a besoin (three.js est lourd). */
const World3DLazy = dynamic(() => import("./World3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center font-display text-xl">
      Chargement du monde…
    </div>
  ),
});

export default World3DLazy;
