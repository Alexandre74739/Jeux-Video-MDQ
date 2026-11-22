import type { MetadataRoute } from "next";
import { PUBLIC_COURSES } from "@/lib/levels";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/jouer/",
    "/creer/",
    ...PUBLIC_COURSES.map((c) => `/jouer/${c.slug}/`),
    "/mentions-legales/",
    "/confidentialite/",
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : 0.6,
  }));
}
