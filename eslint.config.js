// @ts-check

import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {ignores: ["dist/"]},
    {plugins: {}},
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            ecmaVersion: 2024,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {project: "./tsconfig.json"},
        },
        rules: {
            eqeqeq: "error",
            "no-console": "off",
            "no-plusplus": ["error", {allowForLoopAfterthoughts: true}],
            "no-unused-expressions": ["error", {allowShortCircuit: true}],
            "spaced-comment": ["error", "always", {markers: ["/"]}],
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/ban-types": "off",
            "@typescript-eslint/explicit-module-boundary-types": ["error", {allowHigherOrderFunctions: true}],
            "@typescript-eslint/prefer-namespace-keyword": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-empty-object-type": ["error", {allowInterfaces: "with-single-extends"}],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-namespace": ["error", {allowDeclarations: true}],
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unsafe-declaration-merging": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_[A-Z]", // Use only with type parameters
                },
            ],
            "@typescript-eslint/array-type": ["error", {default: "array"}],
        },
    },
    {
        rules: {"global-require": "off"},
    },
);
