import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/SWRegister";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "CuboCode : crée ton jeu vidéo",
  description: "Apprends à coder en t'amusant : glisse des blocs, guide Cubo et crée ton propre jeu vidéo.",
};

export const viewport: Viewport = { themeColor: "#FFD23F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
