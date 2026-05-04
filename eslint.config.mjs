import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    plugins: {
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptEslint,
    },
  },
  ...compat.extends("next/core-web-vitals"),
  ...compat.config({
    rules: {
      // Existing rules
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/display-name": "off",
      "@next/next/no-img-element": "warn",
    },
  }),
];

export default eslintConfig;
