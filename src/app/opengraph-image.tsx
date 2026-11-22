import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";
export const alt = "CuboCode, apprends à coder en créant ton jeu vidéo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu des liens partagés (WhatsApp, Teams, réseaux sociaux), générée au build. */
export default async function OpenGraphImage() {
  const icon = await readFile(join(process.cwd(), "src/app/icon.svg"));
  const src = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: 80,
        background: "#FFF7E8",
        color: "#16123A",
        borderBottom: "24px solid #FFD23F",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={320} height={320} alt="" />
      <div
        style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800 }}>
          Cubo<span style={{ color: "#5B3DF5" }}>Code</span>
        </div>
        <div style={{ fontSize: 40, lineHeight: 1.3, color: "#3D3866" }}>
          {SITE_DESCRIPTION.replace(`${SITE_NAME} `, "")}
        </div>
      </div>
    </div>,
    size,
  );
}
