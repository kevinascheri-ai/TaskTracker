import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Default theme colors
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          focus: 'var(--border-focus)',
        },
        // Priority colors
        priority: {
          p0: 'var(--priority-p0)',
          p1: 'var(--priority-p1)',
          p2: 'var(--priority-p2)',
          p3: 'var(--priority-p3)',
        },
        // Status colors
        status: {
          backlog: 'var(--status-backlog)',
          doing: 'var(--status-doing)',
          blocked: 'var(--status-blocked)',
          done: 'var(--status-done)',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
