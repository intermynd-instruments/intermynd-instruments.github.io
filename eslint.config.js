import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["_site/**", "_tmp/**", "assets/**", "img/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      camelcase: ["error", { properties: "never" }],
      complexity: ["error", 10],
      curly: ["error", "multi-line", "consistent"],
      eqeqeq: ["error", "always"],
      "max-depth": ["error", 4],
      "max-lines": [
        "error",
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "no-console": "off",
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme"],
          location: "anywhere",
        },
      ],
    },
  },
];
