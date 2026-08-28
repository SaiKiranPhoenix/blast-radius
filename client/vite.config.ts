import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use Babel for React Fast Refresh (default)
      // Enables React DevTools in development
    }),
  ],

  // ─── Path aliases (mirrors client/tsconfig.json) ─────────────────
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // ─── Dev server ───────────────────────────────────────────────────
  server: {
    port: 5173,
    strictPort: true, // Fail if port is occupied instead of auto-incrementing
    // Security headers in development
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // ─── Preview server (for testing production build locally) ────────
  preview: {
    port: 4173,
    strictPort: true,
  },

  // ─── Build ────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Warn on chunks larger than 500kB; helps catch accidental large imports
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching:
        // vendor chunk (React, React DOM, React Router) changes rarely
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },

  // ─── Test (Vitest in-source config) ──────────────────────────────
  test: {
    // Vitest config will be in vitest.config.ts (Phase 9)
    // Defined here as a placeholder to avoid Vitest config warnings
  },
});
