// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = tseslint.config(
  // ─── Base JS recommended ─────────────────────────────────────────
  eslint.configs.recommended,

  // ─── TypeScript recommended (all TS/TSX files) ───────────────────
  ...tseslint.configs.recommended,

  // ─── React + React Hooks (client source only) ────────────────────
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 17+ JSX transform — no need to import React in scope
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // TypeScript handles this
      'react/display-name': 'warn',
      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ─── Node / server source ────────────────────────────────────────
  {
    files: ['server/src/**/*.ts', 'seed/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // ─── Shared TypeScript rules (all TS/TSX) ────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Disallow console.log left in production code; warn so CI fails
      'no-console': 'warn',
      // Unused variables are always bugs — error
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Require explicit return types on exported functions
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      // No implicit any — strict typing enforced
      '@typescript-eslint/no-explicit-any': 'error',
      // Consistent type imports (import type { Foo } from '...')
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      // No non-null assertions — handle nulls explicitly
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Note: prefer-nullish-coalescing and prefer-optional-chain require
      // typed linting (parserOptions.project) which adds significant build
      // overhead in a monorepo. Omitted intentionally.
    },
  },

  // ─── Config / tooling files (relaxed rules) ──────────────────────
  {
    files: ['*.config.{js,ts,cjs,mjs}', '.*.{js,cjs}', 'commitlint.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },

  // ─── Test files (relaxed rules) ──────────────────────────────────
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // ─── Global ignores ──────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '**/node_modules/**',
      'client/dist/**',
      'client/src/shaders/landing-pages/**',
    ],
  },
);
