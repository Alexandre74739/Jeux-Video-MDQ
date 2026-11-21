import type { Metadata } from "next";
import Wardrobe from "@/app/cubo/_components/Wardrobe";

export const metadata: Metadata = { title: "Mon Cubo" };

export default function Page() {
  return <Wardrobe />;
}
