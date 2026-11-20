import type { Metadata } from "next";
import LevelGame from "@/components/LevelGame";
import { COURSES } from "@/lib/levels";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSES.map((c) => ({ parcours: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ parcours: string }> }): Promise<Metadata> {
  const { parcours } = await params;
  const c = COURSES.find((x) => x.slug === parcours);
  return { title: `${c?.title ?? "Défi"} · CuboCode` };
}

export default async function Page({ params }: { params: Promise<{ parcours: string }> }) {
  const { parcours } = await params;
  return <LevelGame key={parcours} slug={parcours} />;
}
