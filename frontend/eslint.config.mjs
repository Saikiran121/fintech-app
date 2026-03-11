import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rule overrides — relax strict TypeScript rules for this project
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",   // downgrade error -> warning
      "@typescript-eslint/no-unused-vars": "warn",    // downgrade error -> warning
    },
  },
]);

export default eslintConfig;
