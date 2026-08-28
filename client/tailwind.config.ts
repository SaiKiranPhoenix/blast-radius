import type { Config } from 'tailwindcss';

export default {
  // ─── Content paths ────────────────────────────────────────────────
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  // ─── Dark mode ───────────────────────────────────────────────────
  // Using 'class' strategy if we ever add a theme toggle.
  // For now the app is always dark — no toggle needed.
  darkMode: 'class',

  theme: {
    extend: {
      // ─── Typography ────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },

      // ─── Extended Colors ───────────────────────────────────────
      colors: {
        // Custom shade between slate-700 and slate-800 (card hover state)
        'slate-750': '#1e2a3a',
        // Slightly darker than slate-950 for the deepest backgrounds
        'slate-975': '#060a12',
        // HUD specific colors
        'hud-black': '#000000',
        'hud-panel': '#0a0a0c',
        'hud-border': '#1f2937',
        'hud-cyan': '#22d3ee',
        'hud-cyan-dim': 'rgba(34, 211, 238, 0.15)',
        'hud-red': '#f87171',
        'hud-red-dim': 'rgba(248, 113, 113, 0.15)',
      },

      // ─── Animations ────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-in-up': 'fadeInUp 300ms ease-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },

      // ─── Box Shadow ────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        panel: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'hud-glow-cyan': '0 0 15px rgba(34, 211, 238, 0.4)',
        'hud-glow-red': '0 0 15px rgba(248, 113, 113, 0.4)',
      },

      // ─── Border Radius ─────────────────────────────────────────
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },

      // ─── Transition Duration ───────────────────────────────────
      transitionDuration: {
        '0': '0ms',
      },
    },
  },

  plugins: [],
} satisfies Config;
