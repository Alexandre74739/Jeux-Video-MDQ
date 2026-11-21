import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const base: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

// En production : site 100 % statique (out/), les fonctions de api/ sont servies par Vercel.
// En développement : /api/* est redirigé vers le serveur local lancé par « npm run dev » (scripts/dev-api.ts).
export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return { ...base, async rewrites() { return [{ source: "/api/:path*", destination: "http://localhost:3001/api/:path*" }]; } };
  }
  return { ...base, output: "export" };
}
