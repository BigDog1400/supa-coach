import baseConfig from "@supa-coach/eslint-config/base";
import reactConfig from "@supa-coach/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
