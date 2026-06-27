import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── Base Recommended Rules ─────────────────────────────────
  eslint.configs.recommended,

  // ── Strict TypeScript Checking ─────────────────────────────
  ...tseslint.configs.strictTypeChecked,

  // ── TypeScript Parser Configuration ────────────────────────
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ── Rule Overrides ─────────────────────────────────────────
  {
    rules: {
      // Allow unused vars prefixed with underscore (common pattern
      // for Express middleware _req, _next parameters).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // ── Test Files: Disable Type-Checked Rules ─────────────────
  // Test files are excluded from each package's build tsconfig
  // (see tsconfig.json "exclude") so they aren't part of the
  // type-aware project service.
  {
    files: ['**/__tests__/**/*.ts'],
    ...tseslint.configs.disableTypeChecked,
  },

  // ── Global Ignores ─────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      'coverage/**',
      'eslint.config.js',
      'vitest.config.ts',
      '**/vite.config.ts',
    ],
  },
);
