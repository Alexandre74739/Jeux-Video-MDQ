"use client";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

/** Place la caméra : vise le centre visuel de l'île (sol + terre en dessous) et la cadre au plus près. */
function fitCamera(
  cam: THREE.OrthographicCamera,
  size: { width: number; height: number },
  w: number,
  h: number,
) {
  cam.position.set(9, 17, 11);
  cam.lookAt(0, -0.3, 0);
  cam.zoom = Math.min(
    size.width / (0.74 * (w + h) + 0.4),
    size.height / (0.55 * (w + h) + 1),
  );
  cam.updateProjectionMatrix();
}

/** Recadre la caméra quand le niveau ou la taille de l'écran change. */
export function Fit({ w, h }: { w: number; h: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    fitCamera(camera as THREE.OrthographicCamera, size, w, h);
  }, [camera, size, w, h]);
  return null;
}
