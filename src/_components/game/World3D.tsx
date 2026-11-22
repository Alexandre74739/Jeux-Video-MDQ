"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import type { Mob, StepKind, World } from "@/lib/levels";
import { useOutfit } from "@/lib/outfit";
import { colorOf, trailOf, type Outfit } from "@/lib/rewards";

export type WorldEvent = {
  kind: StepKind | "reset";
  at?: { x: number; y: number };
  key: number;
};

const INK = "#16123A";
const mat = (
  color: string,
  extra: Partial<THREE.MeshLambertMaterialParameters> = {},
) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });

const M = {
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
const groundMats = (tree: boolean, alt: boolean) => {
  const top = tree ? M.grassDark : alt ? M.path : M.path2;
  return [M.dirt, M.dirt, top, M.dirt, M.dirt, M.dirt];
};
const ARROW_GEO = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-0.2, 0, 0, 0, 0, 0.3, 0.2, 0, 0], 3),
  );
  g.computeVertexNormals();
  return g;
})();
const hash = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

export function Box({
  size,
  pos,
  material,
  edges = true,
  rot,
}: {
  size: [number, number, number];
  pos: [number, number, number];
  material: THREE.Material | THREE.Material[];
  edges?: boolean;
  rot?: number;
}) {
  return (
    <mesh
      position={pos}
      rotation={[0, rot ?? 0, 0]}
      material={material}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      {edges && <Edges color={INK} threshold={20} />}
    </mesh>
  );
}

function PopIn({ children, from = 0 }: { children: ReactNode; from?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, 1, 10, dt);
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} scale={from}>
      {children}
    </group>
  );
}

function Lava() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(() => M.lava.clone(), []);
  useFrame(({ clock }) => {
    const m = ref.current?.material as THREE.MeshPhongMaterial | undefined;
    if (m) m.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 3) * 0.35;
  });
  return (
    <group>
      <Box
        size={[1, 1, 1]}
        pos={[0, -0.6, 0]}
        material={M.lavaRock}
        edges={false}
      />
      <mesh ref={ref} position={[0, -0.12, 0]} material={material}>
        <boxGeometry args={[0.98, 0.06, 0.98]} />
      </mesh>
    </group>
  );
}

/** Porte en bois : fermée (D) ou ouverte (O). horizontal = le chemin passe d'ouest en est. */
function Door({ open, horizontal }: { open: boolean; horizontal: boolean }) {
  const leaf = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (leaf.current)
      leaf.current.rotation.y = THREE.MathUtils.damp(
        leaf.current.rotation.y,
        open ? -Math.PI / 2 : 0,
        6,
        dt,
      );
  });
  return (
    <group rotation={[0, horizontal ? Math.PI / 2 : 0, 0]}>
      <Box size={[0.14, 1.05, 0.2]} pos={[-0.43, 0.52, 0]} material={M.post} />
      <Box size={[0.14, 1.05, 0.2]} pos={[0.43, 0.52, 0]} material={M.post} />
      <Box size={[1, 0.16, 0.22]} pos={[0, 1.1, 0]} material={M.post} />
      <group ref={leaf} position={[-0.36, 0, 0]}>
        <Box size={[0.72, 0.95, 0.1]} pos={[0.36, 0.48, 0]} material={M.door} />
        <Box size={[0.12, 0.16, 0.14]} pos={[0.58, 0.5, 0]} material={M.gold} />
      </group>
    </group>
  );
}

function KeyItem() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 2.2;
    ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <group ref={ref}>
      <mesh material={M.gold} castShadow position={[0, 0.12, 0]}>
        <torusGeometry args={[0.13, 0.05, 8, 16]} />
      </mesh>
      <Box size={[0.07, 0.32, 0.07]} pos={[0, -0.12, 0]} material={M.gold} />
      <Box
        size={[0.12, 0.05, 0.07]}
        pos={[0.07, -0.22, 0]}
        material={M.gold}
        edges={false}
      />
      <Box
        size={[0.1, 0.05, 0.07]}
        pos={[0.06, -0.12, 0]}
        material={M.gold}
        edges={false}
      />
    </group>
  );
}

function Tile({
  t,
  x,
  y,
  horizontal,
}: {
  t: string;
  x: number;
  y: number;
  horizontal: boolean;
}) {
  const h = hash(x, y);
  const alt = (x + y) % 2 === 0;
  if (t === "L") return <Lava />;
  if (t === "W" || t === "B") {
    return (
      <group>
        <Box
          size={[1, 0.7, 1]}
          pos={[0, -0.65, 0]}
          material={M.water}
          edges={false}
        />
        {t === "B" && (
          <PopIn>
            <Box
              size={[1, 0.16, 0.86]}
              pos={[0, -0.12, 0]}
              material={M.plank}
            />
            <Box
              size={[0.08, 0.17, 0.86]}
              pos={[0.2, -0.11, 0]}
              material={M.trunk}
              edges={false}
            />
            <Box
              size={[0.08, 0.17, 0.86]}
              pos={[-0.2, -0.11, 0]}
              material={M.trunk}
              edges={false}
            />
          </PopIn>
        )}
      </group>
    );
  }
  return (
    <group>
      <Box
        size={[1, 1, 1]}
        pos={[0, -0.5, 0]}
        material={groundMats(t === "T", alt)}
      />
      {t === "T" && (
        <group>
          <Box size={[0.2, 0.26, 0.2]} pos={[0, 0.13, 0]} material={M.trunk} />
          <Box
            size={[0.66, 0.46, 0.66]}
            pos={[0, 0.48, 0]}
            material={h % 2 ? M.leaf : M.leaf2}
          />
        </group>
      )}
      {(t === "D" || t === "O") && (
        <Door open={t === "O"} horizontal={horizontal} />
      )}
      {t === "R" && (
        <Box
          size={[0.78, 0.62, 0.78]}
          pos={[0, 0.31, 0]}
          material={M.rock}
          rot={(h % 5) * 0.15}
        />
      )}
      {t === "f" && (
        <>
          <Box
            size={[0.12, 0.12, 0.12]}
            pos={[-0.22, 0.06, -0.18]}
            material={M.red}
            edges={false}
          />
          <Box
            size={[0.12, 0.12, 0.12]}
            pos={[0.2, 0.06, 0.1]}
            material={M.yellow}
            edges={false}
          />
          <Box
            size={[0.12, 0.12, 0.12]}
            pos={[-0.05, 0.06, 0.26]}
            material={M.white}
            edges={false}
          />
        </>
      )}
    </group>
  );
}

function Gem() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 2;
    ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  return (
    <mesh ref={ref} material={M.gem} castShadow>
      <octahedronGeometry args={[0.3]} />
      <Edges color={INK} />
    </mesh>
  );
}

function Goal({ open }: { open: boolean }) {
  const beam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (beam.current)
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        (open ? 0.3 : 0.14) + Math.sin(clock.elapsedTime * 4) * 0.08;
  });
  return (
    <group>
      <Box size={[0.7, 0.42, 0.52]} pos={[0, 0.21, 0]} material={M.chest} />
      <Box size={[0.74, 0.18, 0.56]} pos={[0, 0.5, 0]} material={M.chest} />
      <Box size={[0.14, 0.2, 0.06]} pos={[0, 0.38, 0.28]} material={M.gold} />
      {
        <mesh ref={beam} position={[0, 1.6, 0]} material={M.beam}>
          <cylinderGeometry args={[0.45, 0.45, 3, 12, 1, true]} />
        </mesh>
      }
    </group>
  );
}

const ANGLE = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];

const HAT = {
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

function Propeller() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 9;
  });
  return (
    <group ref={ref} position={[0, 0.66, 0]}>
      <Box size={[0.56, 0.03, 0.1]} pos={[0, 0, 0]} material={M.yellow} />
      <Box size={[0.1, 0.03, 0.56]} pos={[0, 0, 0]} material={HAT.blue} />
    </group>
  );
}

/** Chapeau de Cubo en 3D (le haut du corps est à y = 0.32). */
function Hat3D({ id }: { id: string }) {
  switch (id) {
    case "aucun":
      return null;
    case "helice":
      return (
        <group>
          <Box size={[0.5, 0.1, 0.5]} pos={[0, 0.37, 0]} material={HAT.red} />
          <Box
            size={[0.3, 0.06, 0.18]}
            pos={[0, 0.34, 0.32]}
            material={HAT.red}
          />
          <Box
            size={[0.05, 0.24, 0.05]}
            pos={[0, 0.52, 0]}
            material={M.black}
            edges={false}
          />
          <Propeller />
        </group>
      );
    case "sorcier":
      return (
        <group>
          <mesh position={[0, 0.35, 0]} material={HAT.purpleDark} castShadow>
            <cylinderGeometry args={[0.46, 0.46, 0.04, 20]} />
            <Edges color={INK} threshold={20} />
          </mesh>
          <mesh
            position={[0, 0.68, 0]}
            rotation={[0.12, 0, 0]}
            material={HAT.purple}
            castShadow
          >
            <coneGeometry args={[0.27, 0.66, 12]} />
            <Edges color={INK} threshold={30} />
          </mesh>
          <Box
            size={[0.1, 0.1, 0.03]}
            pos={[0, 0.56, 0.2]}
            material={M.yellow}
            edges={false}
          />
        </group>
      );
    case "cowboy":
      return (
        <group>
          <mesh position={[0, 0.35, 0]} material={HAT.brown} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.04, 20]} />
            <Edges color={INK} threshold={20} />
          </mesh>
          <mesh position={[0, 0.49, 0]} material={HAT.brownLight} castShadow>
            <cylinderGeometry args={[0.23, 0.27, 0.26, 16]} />
            <Edges color={INK} threshold={20} />
          </mesh>
          <mesh position={[0, 0.41, 0]} material={HAT.brownDark}>
            <cylinderGeometry args={[0.275, 0.275, 0.06, 16]} />
          </mesh>
        </group>
      );
    case "pirate":
      return (
        <group>
          <Box size={[0.82, 0.18, 0.3]} pos={[0, 0.42, 0]} material={M.black} />
          <Box size={[0.5, 0.16, 0.26]} pos={[0, 0.58, 0]} material={M.black} />
          <Box
            size={[0.12, 0.12, 0.03]}
            pos={[0, 0.5, 0.16]}
            material={M.white}
            edges={false}
          />
        </group>
      );
    case "couronne":
      return (
        <group>
          <mesh position={[0, 0.43, 0]} material={M.gold} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 10, 1, true]} />
            <Edges color={INK} threshold={20} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k / 5) * Math.PI * 2;
            return (
              <mesh
                key={k}
                position={[Math.sin(a) * 0.25, 0.6, Math.cos(a) * 0.25]}
                material={M.gold}
              >
                <coneGeometry args={[0.07, 0.16, 6]} />
              </mesh>
            );
          })}
          <Box
            size={[0.08, 0.08, 0.03]}
            pos={[0, 0.43, 0.285]}
            material={M.red}
            edges={false}
          />
        </group>
      );
    case "licorne":
      return (
        <group position={[0, 0.5, 0.12]} rotation={[0.4, 0, 0]}>
          <mesh material={HAT.horn} castShadow>
            <coneGeometry args={[0.09, 0.5, 10]} />
            <Edges color={INK} threshold={30} />
          </mesh>
          <mesh position={[0, -0.08, 0]} material={HAT.pink}>
            <torusGeometry args={[0.07, 0.018, 6, 12]} />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          <Box size={[0.5, 0.1, 0.5]} pos={[0, 0.37, 0]} material={M.cap} />
          <Box
            size={[0.3, 0.06, 0.18]}
            pos={[0, 0.34, 0.32]}
            material={M.cap}
          />
        </group>
      );
  }
}

const ACC = {
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

/** Accessoire de dos en 3D (le dos du cube est en z = -0.32). */
function Back3D({ id }: { id: string }) {
  const flame = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flame.current)
      flame.current.scale.y = 0.8 + Math.sin(clock.elapsedTime * 20) * 0.25;
  });
  switch (id) {
    case "rien":
      return null;
    case "cape":
      return (
        <mesh
          position={[0, -0.04, -0.37]}
          rotation={[0.18, 0, 0]}
          material={ACC.cape}
          castShadow
        >
          <boxGeometry args={[0.6, 0.66, 0.04]} />
          <Edges color={INK} />
        </mesh>
      );
    case "ailes":
      return (
        <group position={[0, 0.1, -0.36]}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh
                position={[s * 0.3, 0.1, 0]}
                rotation={[0, s * 0.5, s * 0.5]}
                material={ACC.wingA}
              >
                <boxGeometry args={[0.42, 0.3, 0.03]} />
                <Edges color={INK} />
              </mesh>
              <mesh
                position={[s * 0.26, -0.18, 0]}
                rotation={[0, s * 0.5, -s * 0.4]}
                material={ACC.wingB}
              >
                <boxGeometry args={[0.3, 0.22, 0.03]} />
                <Edges color={INK} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "carapace":
      return (
        <group position={[0, 0.02, -0.38]}>
          <Box size={[0.58, 0.58, 0.14]} pos={[0, 0, 0]} material={ACC.shell} />
          <Box
            size={[0.26, 0.26, 0.06]}
            pos={[0, 0, -0.09]}
            material={ACC.shell2}
            edges={false}
          />
        </group>
      );
    case "jetpack":
      return (
        <group position={[0, 0.02, -0.42]}>
          {[-0.12, 0.12].map((x) => (
            <group key={x}>
              <mesh position={[x, 0, 0]} material={ACC.metal} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.44, 12]} />
                <Edges color={INK} threshold={30} />
              </mesh>
              <group ref={x < 0 ? flame : undefined} position={[x, -0.28, 0]}>
                <mesh rotation={[Math.PI, 0, 0]} material={ACC.flame}>
                  <coneGeometry args={[0.07, 0.18, 8]} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      );
    default:
      return (
        <Box
          size={[0.42, 0.42, 0.16]}
          pos={[0, 0.02, -0.38]}
          material={M.pack}
        />
      );
  }
}

/** Accessoire du visage en 3D (yeux en x = ±0.14, y = 0.06, face avant en z = 0.32). */
function Face3D({ id }: { id: string }) {
  switch (id) {
    case "lunettes":
      return (
        <group position={[0, 0.06, 0.36]}>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0, 0]} material={M.black}>
              <torusGeometry args={[0.11, 0.022, 6, 16]} />
            </mesh>
          ))}
          <Box
            size={[0.08, 0.03, 0.03]}
            pos={[0, 0.02, 0]}
            material={M.black}
            edges={false}
          />
        </group>
      );
    case "soleil":
      return (
        <group position={[0, 0.06, 0.37]}>
          {[-0.14, 0.14].map((x) => (
            <Box
              key={x}
              size={[0.22, 0.16, 0.03]}
              pos={[x, 0, 0]}
              material={M.black}
              edges={false}
            />
          ))}
          <Box
            size={[0.08, 0.03, 0.03]}
            pos={[0, 0.03, 0]}
            material={M.black}
            edges={false}
          />
        </group>
      );
    case "monocle":
      return (
        <mesh position={[0.14, 0.06, 0.37]} material={ACC.gold}>
          <torusGeometry args={[0.12, 0.025, 6, 16]} />
        </mesh>
      );
    case "masque":
      return (
        <Box
          size={[0.66, 0.2, 0.02]}
          pos={[0, 0.06, 0.33]}
          material={ACC.purple}
          edges={false}
        />
      );
    default:
      return null;
  }
}

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

const TRAIL_N = 36;
/** Traînée de particules derrière Cubo quand il se déplace (dans le repère de son parent). */
export function Trail({
  target,
  kind,
}: {
  target: React.RefObject<THREE.Group | null>;
  kind: string;
}) {
  const def = trailOf(kind);
  const mats = useMemo(
    () =>
      def.colors.map((c) =>
        kind === "bulles"
          ? new THREE.MeshLambertMaterial({
              color: c,
              transparent: true,
              opacity: 0.75,
            })
          : kind === "flammes" || kind === "paillettes"
            ? new THREE.MeshBasicMaterial({ color: c })
            : mat(c),
      ),
    [def, kind],
  );
  const geo = useMemo(
    () =>
      kind === "bulles"
        ? new THREE.SphereGeometry(0.07, 10, 8)
        : kind === "paillettes"
          ? new THREE.OctahedronGeometry(0.06)
          : new THREE.BoxGeometry(0.1, 0.1, 0.1),
    [kind],
  );
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useRef(
    Array.from({ length: TRAIL_N }, () => ({
      life: 0,
      p: new THREE.Vector3(),
      v: new THREE.Vector3(),
    })),
  );
  const last = useRef<THREE.Vector3 | null>(null);
  const acc = useRef(0);
  const next = useRef(0);
  useFrame((_, dt) => {
    const g = target.current;
    if (!g || !mats.length) return;
    const pos = g.position;
    if (!last.current) last.current = pos.clone();
    const moved = last.current.distanceTo(pos);
    last.current.copy(pos);
    // Pas de traînée lors d'un saut de position (réinitialisation du niveau)
    if (moved < 1) acc.current += moved;
    while (acc.current > 0.09) {
      acc.current -= 0.09;
      const pt = parts.current[next.current];
      next.current = (next.current + 1) % TRAIL_N;
      pt.life = 1;
      pt.p.set(
        pos.x + (Math.random() - 0.5) * 0.3,
        0.15 + Math.random() * 0.4,
        pos.z + (Math.random() - 0.5) * 0.3,
      );
      const up =
        kind === "flammes"
          ? 1.6
          : kind === "bulles"
            ? 0.7
            : kind === "paillettes"
              ? -0.2
              : 0.4;
      pt.v.set((Math.random() - 0.5) * 0.4, up, (Math.random() - 0.5) * 0.4);
    }
    parts.current.forEach((pt, i) => {
      const m = meshes.current[i];
      if (!m) return;
      if (pt.life <= 0) {
        m.visible = false;
        return;
      }
      pt.life -= dt * (kind === "flammes" ? 1.8 : 1.1);
      pt.p.addScaledVector(pt.v, dt);
      m.visible = pt.life > 0;
      m.position.copy(pt.p);
      m.scale.setScalar(Math.max(0.01, pt.life));
      m.rotation.y += dt * 4;
    });
  });
  if (!mats.length) return null;
  return (
    <>
      {parts.current.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={geo}
          material={mats[i % mats.length]}
          visible={false}
        />
      ))}
    </>
  );
}

function CuboModel({
  world,
  event,
  cx,
  cz,
}: {
  world: World;
  event: WorldEvent;
  cx: number;
  cz: number;
}) {
  const outfit = useOutfit();
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const fx = useRef({ bump: 0, splash: 0, win: 0, nod: 0 });
  const span = useRef({ tx: NaN, tz: NaN, d: 1 });
  const first = useRef(true);

  useEffect(() => {
    const f = fx.current;
    if (event.kind === "bump" || event.kind === "caught") f.bump = 1;
    if (event.kind === "splash" || event.kind === "burn") f.splash = 0.001;
    if (event.kind === "win") f.win = 0.001;
    if (
      ["collect", "break", "bridge", "key", "open", "hit", "wait"].includes(
        event.kind,
      )
    )
      f.nod = 1;
    if (event.kind === "reset") {
      f.bump = 0;
      f.splash = 0;
      f.win = 0;
      first.current = true;
    }
  }, [event]);

  useFrame((_, dt) => {
    const g = ref.current;
    const b = body.current;
    if (!g || !b) return;
    const tx = world.cubo.x - cx;
    const tz = world.cubo.y - cz;
    if (first.current) {
      g.position.set(tx, 0, tz);
      g.rotation.y = ANGLE[world.cubo.dir];
      first.current = false;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 9, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 9, dt);
    const sp = span.current;
    if (sp.tx !== tx || sp.tz !== tz) {
      sp.d = Math.max(0.01, Math.hypot(tx - g.position.x, tz - g.position.z));
      sp.tx = tx;
      sp.tz = tz;
    }
    const remaining = Math.hypot(tx - g.position.x, tz - g.position.z);
    const progress = Math.min(1, remaining / sp.d);
    const ta = ANGLE[world.cubo.dir];
    const diff =
      ((((ta - g.rotation.y + Math.PI) % (Math.PI * 2)) + Math.PI * 2) %
        (Math.PI * 2)) -
      Math.PI;
    g.rotation.y += diff * Math.min(1, dt * 12);

    const f = fx.current;
    let y =
      sp.d > 0.05 ? Math.sin(progress * Math.PI) * (sp.d > 1.5 ? 1 : 0.35) : 0;
    b.rotation.x = 0;
    b.rotation.z = 0;
    if (f.bump > 0) {
      f.bump = Math.max(0, f.bump - dt * 2.5);
      b.position.z = Math.sin(f.bump * Math.PI * 3) * 0.18;
      b.rotation.x = Math.sin(f.bump * Math.PI * 3) * 0.3;
    } else b.position.z = 0;
    if (f.nod > 0) {
      f.nod = Math.max(0, f.nod - dt * 3);
      b.rotation.x = Math.sin(f.nod * Math.PI) * 0.35;
    }
    if (f.splash > 0) {
      f.splash = Math.min(1, f.splash + dt * 1.5);
      y = -f.splash * 0.9;
      b.rotation.z = f.splash * 1.2;
    }
    if (f.win > 0) {
      f.win += dt;
      y = Math.abs(Math.sin(f.win * 7)) * 0.5;
      b.rotation.y = f.win * 9;
    } else b.rotation.y = 0;
    b.position.y = 0.33 + y;
  });

  return (
    <>
      <Trail target={ref} kind={outfit.trail} />
      <group ref={ref}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 20]} />
          <meshBasicMaterial color={INK} transparent opacity={0.2} />
        </mesh>
        {/* Flèche au sol : indique où Cubo va avancer */}
        <mesh position={[0, 0.03, 0.4]} geometry={ARROW_GEO} material={M.arrow}>
          <Edges color={INK} />
        </mesh>
        <group ref={body}>
          <CuboBody outfit={outfit} />
        </group>
      </group>
    </>
  );
}

const MOB = {
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

/** Gloups : cube gluant qui rebondit (on peut le battre). Grognon : cube violet à cornes qui se dandine (à esquiver). */
function MobModel({ mob, cx, cz }: { mob: Mob; cx: number; cz: number }) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const first = useRef(true);
  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const tx = mob.x - cx;
    const tz = mob.y - cz;
    if (first.current) {
      g.position.set(tx, 0, tz);
      g.rotation.y = ANGLE[mob.dir];
      first.current = false;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 9, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 9, dt);
    const diff =
      ((((ANGLE[mob.dir] - g.rotation.y + Math.PI) % (Math.PI * 2)) +
        Math.PI * 2) %
        (Math.PI * 2)) -
      Math.PI;
    g.rotation.y += diff * Math.min(1, dt * 10);
    const b = body.current;
    if (b) {
      const t = clock.elapsedTime * (mob.kind === "gloups" ? 6 : 5) + mob.id;
      b.position.y = mob.kind === "gloups" ? Math.abs(Math.sin(t)) * 0.18 : 0;
      b.rotation.z = mob.kind === "grognon" ? Math.sin(t) * 0.15 : 0;
      if (mob.kind === "gloups") {
        const k = Math.sin(t * 2) * 0.05;
        b.scale.set(1 + k, 1 - k, 1 + k);
      }
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 20]} />
        <meshBasicMaterial color={INK} transparent opacity={0.2} />
      </mesh>
      <group ref={body}>
        {mob.kind === "gloups" ? (
          <>
            <Box
              size={[0.3, 0.3, 0.3]}
              pos={[0, 0.27, 0]}
              material={MOB.slimeCore}
              edges={false}
            />
            <Box
              size={[0.6, 0.56, 0.6]}
              pos={[0, 0.28, 0]}
              material={MOB.slime}
            />
            <Box
              size={[0.14, 0.14, 0.04]}
              pos={[-0.14, 0.36, 0.31]}
              material={M.white}
              edges={false}
            />
            <Box
              size={[0.14, 0.14, 0.04]}
              pos={[0.14, 0.36, 0.31]}
              material={M.white}
              edges={false}
            />
            <Box
              size={[0.07, 0.07, 0.03]}
              pos={[-0.12, 0.34, 0.335]}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.07, 0.07, 0.03]}
              pos={[0.16, 0.34, 0.335]}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.2, 0.05, 0.03]}
              pos={[0, 0.18, 0.315]}
              material={M.black}
              edges={false}
            />
          </>
        ) : (
          <>
            <Box
              size={[0.56, 0.5, 0.5]}
              pos={[0, 0.27, 0]}
              material={MOB.grognon}
            />
            <Box
              size={[0.4, 0.12, 0.4]}
              pos={[0, 0.02, 0]}
              material={MOB.grognonDark}
              edges={false}
            />
            {[-0.18, 0.18].map((x) => (
              <mesh
                key={x}
                position={[x, 0.62, 0]}
                rotation={[0, 0, x < 0 ? 0.35 : -0.35]}
                material={MOB.horn}
              >
                <coneGeometry args={[0.07, 0.24, 6]} />
                <Edges color={INK} threshold={30} />
              </mesh>
            ))}
            <Box
              size={[0.13, 0.13, 0.04]}
              pos={[-0.13, 0.34, 0.26]}
              material={M.white}
              edges={false}
            />
            <Box
              size={[0.13, 0.13, 0.04]}
              pos={[0.13, 0.34, 0.26]}
              material={M.white}
              edges={false}
            />
            <Box
              size={[0.06, 0.06, 0.03]}
              pos={[-0.12, 0.33, 0.285]}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.06, 0.06, 0.03]}
              pos={[0.14, 0.33, 0.285]}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.14, 0.035, 0.03]}
              pos={[-0.13, 0.43, 0.27]}
              rot={0}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.14, 0.035, 0.03]}
              pos={[0.13, 0.43, 0.27]}
              material={M.black}
              edges={false}
            />
            <Box
              size={[0.22, 0.05, 0.03]}
              pos={[0, 0.16, 0.26]}
              material={M.black}
              edges={false}
            />
          </>
        )}
      </group>
    </group>
  );
}

type BurstDef = {
  id: number;
  x: number;
  z: number;
  y: number;
  color: string;
  n: number;
};

function Burst({
  def,
  onDone,
}: {
  def: BurstDef;
  onDone: (id: number) => void;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useMemo(
    () =>
      Array.from({ length: def.n }, () => ({
        v: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          2.5 + Math.random() * 3,
          (Math.random() - 0.5) * 4,
        ),
        p: new THREE.Vector3(def.x, def.y, def.z),
      })),
    [def],
  );
  const life = useRef(0);
  const material = useMemo(() => mat(def.color), [def.color]);
  useFrame((_, dt) => {
    life.current += dt;
    parts.forEach((pt, i) => {
      pt.v.y -= 9 * dt;
      pt.p.addScaledVector(pt.v, dt);
      const m = refs.current[i];
      if (m) {
        m.position.copy(pt.p);
        m.scale.setScalar(Math.max(0, 1 - life.current));
        m.rotation.x += dt * 6;
      }
    });
    if (life.current > 1) onDone(def.id);
  });
  return (
    <>
      {parts.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          material={material}
        >
          <boxGeometry args={[0.12, 0.12, 0.12]} />
        </mesh>
      ))}
    </>
  );
}

function Fit({ w, h }: { w: number; h: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.position.set(9, 17, 11);
    // Vise le centre visuel de l'île (sol + terre en dessous) et la cadre au plus près.
    cam.lookAt(0, -0.3, 0);
    cam.zoom = Math.min(
      size.width / (0.74 * (w + h) + 0.4),
      size.height / (0.55 * (w + h) + 1),
    );
    cam.updateProjectionMatrix();
  }, [camera, size, w, h]);
  return null;
}

const BURST_COLORS: Partial<Record<StepKind, string>> = {
  collect: "#36E2F5",
  hit: "#9B7BFF",
  caught: "#7BD88F",
  break: "#A5ADC0",
  bridge: "#D69A5B",
  splash: "#3FA9F5",
  win: "#FFD23F",
  key: "#FFD23F",
  open: "#A0612E",
  burn: "#FF6A1F",
};

function Scene({ world, event }: { world: World; event: WorldEvent }) {
  const cx = (world.w - 1) / 2;
  const cz = (world.h - 1) / 2;
  const [bursts, setBursts] = useState<BurstDef[]>([]);

  useEffect(() => {
    const color = BURST_COLORS[event.kind as StepKind];
    if (!color) return;
    const at = event.at ?? { x: world.cubo.x, y: world.cubo.y };
    setBursts((b) => [
      ...b,
      {
        id: event.key,
        x: at.x - cx,
        z: at.y - cz,
        y: event.kind === "splash" || event.kind === "burn" ? -0.2 : 0.5,
        color,
        n: event.kind === "win" ? 30 : 16,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return (
    <>
      <Fit w={world.w} h={world.h} />
      <ambientLight intensity={1.6} />
      <hemisphereLight args={["#ffffff", "#7ED957", 0.8]} />
      <directionalLight
        position={[6, 12, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {world.tiles.map((row, y) =>
        row.map((t, x) => (
          <group key={`${x},${y}`} position={[x - cx, 0, y - cz]}>
            <Tile
              t={t}
              x={x}
              y={y}
              horizontal={
                (row[x - 1] ?? "T") !== "T" || (row[x + 1] ?? "T") !== "T"
              }
            />
            {world.gems.includes(`${x},${y}`) && <Gem />}
            {world.keys.includes(`${x},${y}`) && <KeyItem />}
            {world.goal.x === x && world.goal.y === y && (
              <Goal open={world.gems.length === 0} />
            )}
          </group>
        )),
      )}
      {world.mobs.map((m) => (
        <MobModel key={m.id} mob={m} cx={cx} cz={cz} />
      ))}
      <CuboModel world={world} event={event} cx={cx} cz={cz} />
      {bursts.map((b) => (
        <Burst
          key={b.id}
          def={b}
          onDone={(id) => setBursts((l) => l.filter((x) => x.id !== id))}
        />
      ))}
    </>
  );
}

class GLBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function World3D({
  world,
  event,
  fallback,
}: {
  world: World;
  event: WorldEvent;
  fallback: ReactNode;
}) {
  return (
    <GLBoundary fallback={fallback}>
      <Canvas
        shadows
        orthographic
        dpr={[1, 2]}
        camera={{ position: [10, 15, 12], zoom: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        aria-label="Monde de Cubo en 3D"
        role="img"
      >
        <Scene world={world} event={event} />
      </Canvas>
    </GLBoundary>
  );
}
