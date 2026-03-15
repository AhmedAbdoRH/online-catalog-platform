import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "android/**/build/**",
      "android/**/intermediates/**",
      "android/app/src/main/assets/**",
      "public/_next/**",
    ],
  },
  nextCoreWebVitals,
  nextTypescript,
]);
