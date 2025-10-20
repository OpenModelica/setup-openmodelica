import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import github from "eslint-plugin-github";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    globalIgnores(["**/dist/", "**/lib/", "**/node_modules/", "**/jest.config.js"]),

    ...github.getFlatConfigs().typescript,
    github.getFlatConfigs().recommended,

    {
        plugins: {
            jest,
            stylistic,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...jest.environments.globals.globals,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "i18n-text/no-en": "off",
            "eslint-comments/no-use": "off",
            "import/no-namespace": "off",
            "no-unused-vars": "off",
            "func-call-spacing": ["error", "never"],
            "semi": ["error", "never"],

            "stylistic/type-annotation-spacing": "error",

            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/explicit-member-accessibility": ["error", {
                accessibility: "no-public",
            }],
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/array-type": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            camelcase: "off",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/explicit-function-return-type": ["error", {
                allowExpressions: true,
            }],
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-useless-constructor": "error",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-function-type": "warn",
            "@typescript-eslint/prefer-includes": "error",
            "@typescript-eslint/prefer-string-starts-ends-with": "error",
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/require-array-sort-compare": "error",
            "@typescript-eslint/restrict-plus-operands": "error",
            "@typescript-eslint/unbound-method": "error",
        },
    },
]);
