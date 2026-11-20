import type { Metadata } from "next";
import Wardrobe from "@/components/Wardrobe";

export const metadata: Metadata = { title: "Mon Cubo · CuboCode" };

export default function Page() {
  return <Wardrobe />;
}
