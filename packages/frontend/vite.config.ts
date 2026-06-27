import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import packageJson from './package.json';

export default defineConfig({
  // ── Env Injection ────────────────────────────────────────
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },

  // ── Plugins ──────────────────────────────────────────────
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 native Vite integration — no PostCSS config needed
  ],

  // ── Path Resolution ──────────────────────────────────────
  resolve: {
    alias: {
      // Resolves the @family-kindness/shared workspace package
      // directly to source during development for instant HMR.
      // Vite serves raw .ts files — no build step needed for shared.
      '@family-kindness/shared': path.resolve(__dirname, '../shared/src'),
    },
  },

  // ── Dev Server ───────────────────────────────────────────
  server: {
    port: 3000,
    // Proxy API requests to the backend dev server
    // to eliminate CORS issues during development.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
