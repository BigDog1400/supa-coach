import baseConfig, { restrictEnvAccess } from "@supa-coach/eslint-config/base";
import nextjsConfig from "@supa-coach/eslint-config/nextjs";
import reactConfig from "@supa-coach/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
