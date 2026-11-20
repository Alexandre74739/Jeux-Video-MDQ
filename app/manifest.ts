import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CuboCode : crée ton jeu vidéo",
    short_name: "CuboCode",
    description: "Apprends à coder en t'amusant : glisse des blocs, guide Cubo et crée ton propre jeu vidéo.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "landscape",
    lang: "fr",
    background_color: "#FFF7E8",
    theme_color: "#4FC3F7",
    categories: ["education", "games", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Les défis", url: "/jouer/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Création libre", url: "/creer/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
