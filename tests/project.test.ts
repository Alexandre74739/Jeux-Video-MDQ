import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeProject } from "../src/lib/project.ts";

const isBlock = (t: string) => ["ev_key", "move", "repeter"].includes(t);
const isBg = (id: string) => ["prairie", "espace"].includes(id);

const sprite = (over: Record<string, unknown> = {}) => ({
  id: "s1",
  name: "Robot",
  src: "/sprites/1f916.svg",
  x: 120,
  y: 220,
  size: 100,
  scripts: [],
  ...over,
});

test("un jeu valide est gardé tel quel", () => {
  const p = sanitizeProject(
    {
      bg: "espace",
      sprites: [
        sprite({ scripts: [{ id: "b1", type: "move", params: { n: 10 } }] }),
      ],
    },
    isBlock,
    isBg,
  );
  assert.equal(p?.bg, "espace");
  assert.equal(p?.sprites[0].scripts[0].params.n, 10);
});

test("les images externes sont refusées (pas de pistage)", () => {
  const p = sanitizeProject(
    {
      sprites: [
        sprite({ src: "https://exemple.com/pixel.png" }),
        sprite({ id: "s2", src: "javascript:alert(1)" }),
      ],
    },
    isBlock,
    isBg,
  );
  assert.equal(p, null);
});

test("les images importées sur l'appareil sont acceptées", () => {
  const p = sanitizeProject(
    { sprites: [sprite({ src: "data:image/png;base64,iVBORw0KGgo=" })] },
    isBlock,
    isBg,
  );
  assert.equal(p?.sprites.length, 1);
});

test("les blocs inconnus et les valeurs hors limites sont filtrés", () => {
  const p = sanitizeProject(
    {
      bg: "inconnu",
      sprites: [
        sprite({
          size: 99999,
          x: "a",
          scripts: [
            { id: "b1", type: "eval", params: {} },
            {
              id: "b2",
              type: "repeter",
              params: { n: 3 },
              children: [{ id: "b3", type: "move", params: {} }],
            },
          ],
        }),
      ],
    },
    isBlock,
    isBg,
  );
  assert.equal(p?.bg, "prairie");
  assert.equal(p?.sprites[0].size, 400);
  assert.equal(p?.sprites[0].x, 0);
  assert.deepEqual(
    p?.sprites[0].scripts.map((b) => b.type),
    ["repeter"],
  );
  assert.equal(p?.sprites[0].scripts[0].children?.[0].type, "move");
});

test("un fichier qui n'est pas un jeu renvoie null", () => {
  assert.equal(sanitizeProject(null, isBlock, isBg), null);
  assert.equal(sanitizeProject({ sprites: "x" }, isBlock, isBg), null);
  assert.equal(sanitizeProject({ sprites: [] }, isBlock, isBg), null);
});
