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

  // ── Global Ignores ─────────────────────────────────────────
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      'eslint.config.js',
      '**/vite.config.ts',
    ],
  },
);
