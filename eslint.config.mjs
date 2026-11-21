import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow plain ' and " directly in JSX text (e.g. quotes, apostrophes).
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Moteur de jeu (boucle requestAnimationFrame, three.js, canvas) : il s'appuie volontairement sur des refs
    // mutables et sur des objets three.js modifiés en place. Le site étant exporté en statique, les données
    // du stockage local ne peuvent être lues qu'après le montage. Ces règles restent visibles en avertissement
    // pour être traitées au fil des refontes.
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
