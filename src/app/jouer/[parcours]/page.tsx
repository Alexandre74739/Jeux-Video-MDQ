import type { Metadata } from "next";
import LevelGame from "@/app/jouer/[parcours]/_components/LevelGame";
import { COURSES } from "@/lib/levels";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ parcours: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ parcours: string }> }): Promise<Metadata> {
  const { parcours } = await params;
  const c = COURSES.find((x) => x.slug === parcours);
  // Les mondes à débloquer restent une surprise : pas d'indexation par les moteurs de recherche.
  return { title: c?.unlockStars ? "Défi" : (c?.title ?? "Défi"), robots: c?.unlockStars ? { index: false, follow: false } : undefined };
}

export default async function Page({ params }: { params: Promise<{ parcours: string }> }) {
  const { parcours } = await params;
  return <LevelGame key={parcours} slug={parcours} />;
}
