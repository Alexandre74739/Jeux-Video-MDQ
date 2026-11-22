"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { colorOf, type Outfit } from "@/lib/rewards";
import { mat, M } from "./materials";
import { Box } from "./Box";
import { Hat3D } from "./Hat3D";
import { Back3D } from "./Back3D";
import { Face3D } from "./Face3D";

/** Matière du corps de Cubo : couleur unie, ou rayures diagonales dessinées dans une petite texture. */
function bodyMaterial(id: string): THREE.Material {
  const c = colorOf(id);
  if (!c.stripes || typeof document === "undefined") return mat(c.faces[1]);
  const S = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const g = canvas.getContext("2d")!;
  g.fillStyle = c.faces[1];
  g.fillRect(0, 0, S, S);
  g.fillStyle = c.stripes[1];
  // 4 bandes diagonales qui se raccordent d'une face à l'autre (motif répétable)
  for (let k = -S; k < 2 * S; k += S / 2) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + S / 4, 0);
    g.lineTo(k + S / 4 - S, S);
    g.lineTo(k - S, S);
    g.closePath();
    g.fill();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return mat("#ffffff", { map });
}

/** Corps de Cubo (cube, yeux, accessoires, chapeau) avec la tenue choisie. */
export function CuboBody({ outfit }: { outfit: Outfit }) {
  const body = useMemo(() => bodyMaterial(outfit.color), [outfit.color]);
  return (
    <>
      <Box size={[0.64, 0.64, 0.64]} pos={[0, 0, 0]} material={body} />
      <Hat3D id={outfit.hat} />
      <Box
        size={[0.14, 0.18, 0.04]}
        pos={[-0.14, 0.06, 0.33]}
        material={M.white}
        edges={false}
      />
      <Box
        size={[0.14, 0.18, 0.04]}
        pos={[0.14, 0.06, 0.33]}
        material={M.white}
        edges={false}
      />
      <Box
        size={[0.07, 0.09, 0.03]}
        pos={[-0.13, 0.04, 0.355]}
        material={M.black}
        edges={false}
      />
      <Box
        size={[0.07, 0.09, 0.03]}
        pos={[0.15, 0.04, 0.355]}
        material={M.black}
        edges={false}
      />
      <Box
        size={[0.18, 0.05, 0.03]}
        pos={[0, -0.12, 0.335]}
        material={M.black}
        edges={false}
      />
      <Face3D id={outfit.face} />
      <Back3D id={outfit.back} />
    </>
  );
}
