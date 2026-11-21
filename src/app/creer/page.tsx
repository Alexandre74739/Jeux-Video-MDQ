import type { Metadata } from "next";
import FreeStudio from "@/app/creer/_components/FreeStudio";

export const metadata: Metadata = { title: "Création libre" };

export default function Page() {
  return <FreeStudio />;
}
