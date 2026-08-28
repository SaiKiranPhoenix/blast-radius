/**
 * client/src/main.tsx — React application entry point
 *
 * Responsibilities:
 *  - Set up TanStack Query (React Query) with production-grade defaults
 *  - Wrap the app in RouterProvider (react-router-dom v6)
 *  - Mount the app to #root
 *
 * Implementation: Phase 7 — Frontend Shell
 */

// Minimal stub so TypeScript compilation passes during Phase 0
// Replace this file entirely in Phase 7

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        color: '#cbd5e1',
        gap: '8px',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>BlastRadius</h1>
      <p style={{ margin: 0, color: '#94a3b8' }}>See what breaks when something breaks.</p>
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          color: '#475569',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        Phase 7 — Frontend Shell — not yet implemented
      </p>
    </div>
  </React.StrictMode>,
);
