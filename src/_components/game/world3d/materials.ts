import * as THREE from "three";

export const INK = "#16123A";
export const mat = (
  color: string,
  extra: Partial<THREE.MeshLambertMaterialParameters> = {},
) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });

export const M = {
  dirt: mat("#9C6A3C"),
  path: mat("#F4E2AE"),
  path2: mat("#EAD596"),
  grassDark: mat("#4FB548"),
  arrow: new THREE.MeshBasicMaterial({
    color: "#FFD23F",
    side: THREE.DoubleSide,
  }),
  lava: new THREE.MeshPhongMaterial({
    color: "#FF6A1F",
    emissive: "#B83200",
    flatShading: true,
  }),
  lavaRock: mat("#5A4A5E"),
  door: mat("#A0612E"),
  post: mat("#6B4423"),
  grassA: mat("#7ED957"),
  grassB: mat("#6CCB48"),
  water: mat("#3FA9F5", { transparent: true, opacity: 0.88 }),
  plank: mat("#D69A5B"),
  trunk: mat("#8A5A2E"),
  leaf: mat("#3FAE4A"),
  leaf2: mat("#56C25A"),
  rock: mat("#A5ADC0"),
  gem: new THREE.MeshPhongMaterial({
    color: "#36E2F5",
    emissive: "#0A6F86",
    shininess: 90,
    flatShading: true,
  }),
  chest: mat("#B5672D"),
  gold: new THREE.MeshPhongMaterial({
    color: "#FFD23F",
    emissive: "#7A5A00",
    shininess: 80,
  }),
  beam: new THREE.MeshBasicMaterial({
    color: "#FFE680",
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  }),
  body: mat("#FF8A3D"),
  cap: mat("#7BD88F"),
  white: mat("#FFFFFF"),
  black: mat(INK),
  pack: mat("#4FC3F7"),
  red: mat("#FF6B57"),
  yellow: mat("#FFD23F"),
};

// Cases praticables = chemin de sable clair ; arbres = herbe foncée (lecture immédiate du parcours).
export const groundMats = (tree: boolean, alt: boolean) => {
  const top = tree ? M.grassDark : alt ? M.path : M.path2;
  return [M.dirt, M.dirt, top, M.dirt, M.dirt, M.dirt];
};
export const ARROW_GEO = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-0.2, 0, 0, 0, 0, 0.3, 0.2, 0, 0], 3),
  );
  g.computeVertexNormals();
  return g;
})();
export const hash = (x: number, y: number) =>
  ((x * 73856093) ^ (y * 19349663)) >>> 0;

export const ANGLE = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];

/** Matières des chapeaux. */
export const HAT = {
  red: mat("#FF6B57"),
  blue: mat("#4FC3F7"),
  purple: mat("#9B7BFF"),
  purpleDark: mat("#7356E0"),
  brown: mat("#B5672D"),
  brownLight: mat("#D69A5B"),
  brownDark: mat("#6B4423"),
  horn: mat("#FFF1BF"),
  pink: mat("#FF8FC7"),
};

/** Matières des accessoires (dos et visage). */
export const ACC = {
  cape: mat("#FF6B57"),
  wingA: new THREE.MeshLambertMaterial({
    color: "#C9B8FF",
    transparent: true,
    opacity: 0.9,
  }),
  wingB: new THREE.MeshLambertMaterial({
    color: "#FF8FC7",
    transparent: true,
    opacity: 0.9,
  }),
  shell: mat("#3DDC97"),
  shell2: mat("#22B377"),
  metal: mat("#A5ADC0"),
  flame: new THREE.MeshBasicMaterial({ color: "#FFA94D" }),
  purple: mat("#9B7BFF"),
  gold: mat("#E0AE10"),
};

/** Matières des monstres. */
export const MOB = {
  slime: new THREE.MeshLambertMaterial({
    color: "#7BD88F",
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  }),
  slimeCore: mat("#3FAE4A"),
  grognon: mat("#9B7BFF"),
  grognonDark: mat("#7356E0"),
  horn: mat("#FFF1BF"),
};
