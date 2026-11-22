import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanPseudo,
  emptyCloudData,
  isValidCode,
  mergeData,
  pseudoKey,
  sanitizeData,
} from "../src/lib/cloud.ts";

test("cleanPseudo accepte 3 à 16 caractères simples et normalise les espaces", () => {
  assert.equal(cleanPseudo("  Léa   38 "), "Léa 38");
  assert.equal(cleanPseudo("ab"), null);
  assert.equal(cleanPseudo("x".repeat(17)), null);
  assert.equal(cleanPseudo("<script>"), null);
  assert.equal(cleanPseudo(42), null);
});

test("pseudoKey ignore majuscules et accents", () => {
  assert.equal(pseudoKey("Léa"), pseudoKey("lea"));
});

test("isValidCode exige exactement 4 chiffres", () => {
  assert.ok(isValidCode(["1", "2", "3", "4"]));
  assert.ok(!isValidCode(["1", "2", "3"]));
  assert.ok(!isValidCode(["1", "2", "3", "a"]));
  assert.ok(!isValidCode("1234"));
});

test("sanitizeData ne garde que les valeurs attendues", () => {
  const d = sanitizeData({
    progress: {
      stars: { "tutoriel:1": 9, "BAD KEY": 3, "volcan:2": -1 },
      streak: "x",
      badges: ["ok", "pas ok!", "ok"],
    },
    story: ["tutoriel:intro", "hack"],
    outfit: { hat: "couronne", evil: "x", color: "<b>" },
    $where: "1",
  });
  assert.deepEqual(d.progress.stars, { "tutoriel:1": 3, "volcan:2": 0 });
  assert.equal(d.progress.streak, 0);
  assert.deepEqual(d.progress.badges, ["ok"]);
  assert.deepEqual(d.story, ["tutoriel:intro"]);
  assert.deepEqual(d.outfit, { hat: "couronne" });
  assert.ok(!("$where" in d));
});

test("sanitizeData renvoie des données vides pour une entrée invalide", () => {
  assert.deepEqual(sanitizeData(null), emptyCloudData());
  assert.deepEqual(sanitizeData("texte"), emptyCloudData());
});

test("mergeData garde le meilleur des deux sauvegardes", () => {
  const a = sanitizeData({
    progress: {
      stars: { "tutoriel:1": 3, "tutoriel:2": 1 },
      streak: 4,
      badges: ["a"],
    },
    story: ["tutoriel:intro"],
    outfit: { hat: "pirate" },
    outfitAt: 10,
  });
  const b = sanitizeData({
    progress: {
      stars: { "tutoriel:2": 2, "tutoriel:3": 1 },
      streak: 2,
      badges: ["b"],
    },
    story: ["tutoriel:outro"],
    outfit: { hat: "cowboy" },
    outfitAt: 20,
  });
  const m = mergeData(a, b);
  assert.deepEqual(m.progress.stars, {
    "tutoriel:1": 3,
    "tutoriel:2": 2,
    "tutoriel:3": 1,
  });
  assert.equal(m.progress.streak, 4);
  assert.deepEqual(m.progress.badges.sort(), ["a", "b"]);
  assert.equal(m.outfit.hat, "cowboy");
  assert.equal(m.outfitAt, 20);
});
