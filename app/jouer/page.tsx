import type { Metadata } from "next";
import LevelGame from "@/components/LevelGame";

export const metadata: Metadata = { title: "L'aventure de Cubo · CuboCode" };

export default function Page() {
  return <LevelGame />;
}
