import type { Metadata } from "next";
import FreeStudio from "@/components/FreeStudio";

export const metadata: Metadata = { title: "Création libre · CuboCode" };

export default function Page() {
  return <FreeStudio />;
}
