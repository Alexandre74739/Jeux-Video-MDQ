import * as THREE from "three";
import { mat } from "./materials";

/** Matières des particules : bulles transparentes, flammes et paillettes lumineuses, sinon mates. */
export function trailMaterials(colors: string[], kind: string) {
  return colors.map((c) =>
    kind === "bulles"
      ? new THREE.MeshLambertMaterial({
          color: c,
          transparent: true,
          opacity: 0.75,
        })
      : kind === "flammes" || kind === "paillettes"
        ? new THREE.MeshBasicMaterial({ color: c })
        : mat(c),
  );
}

/** Forme des particules : bulle, paillette (octaèdre) ou petit cube. */
export function trailGeometry(kind: string) {
  return kind === "bulles"
    ? new THREE.SphereGeometry(0.07, 10, 8)
    : kind === "paillettes"
      ? new THREE.OctahedronGeometry(0.06)
      : new THREE.BoxGeometry(0.1, 0.1, 0.1);
}
