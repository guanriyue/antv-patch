import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  {
    ignores: ['coverage', '**/public', '**/dist', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tseslint.configs.recommended as any,
  eslintPluginPrettierRecommended,
]);
