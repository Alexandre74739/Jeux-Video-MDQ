import type { Metadata } from "next";
import Solutions from "./_components/Solutions";

export const metadata: Metadata = {
  title: "Espace animateur : solutions",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Solutions />;
}
