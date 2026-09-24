/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',

      // Core palette — dark slate
      slate: {
        950: '#0a0f1a',
        900: '#111827',
        800: '#1e2736',
        700: '#2d3748',
        600: '#4a5568',
        500: '#64748b',
        400: '#94a3b8',
        300: '#cbd5e1',
        200: '#e2e8f0',
        100: '#f1f5f9',
        50: '#f8fafc',
      },

      // Primary accent — burnt amber
      amber: {
        burnt: '#c2742f',
        muted: '#d4915a',
        dim: '#8b5e3c',
        light: '#e8b88a',
      },

      // Semantic status colors
      status: {
        critical: '#b91c1c',
        high: '#c2742f',
        medium: '#b8860b',
        low: '#5b7a8a',
        open: '#3b82b0',
        progress: '#c2742f',
        resolved: '#4a7c59',
        closed: '#6b7280',
        breach: '#991b1b',
      },

      // Functional colors
      success: {
        DEFAULT: '#4a7c59',
        light: '#6b9c7a',
      },
      danger: {
        DEFAULT: '#b91c1c',
        light: '#dc2626',
      },
      warning: {
        DEFAULT: '#b8860b',
        light: '#d4a017',
      },
      info: {
        DEFAULT: '#3b82b0',
        light: '#5ba3d0',
      },
    },

    fontFamily: {
      sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },

    fontSize: {
      xs: ['0.6875rem', { lineHeight: '1rem' }],       // 11px
      sm: ['0.75rem', { lineHeight: '1.125rem' }],     // 12px
      base: ['0.8125rem', { lineHeight: '1.25rem' }],  // 13px
      md: ['0.875rem', { lineHeight: '1.375rem' }],    // 14px
      lg: ['1rem', { lineHeight: '1.5rem' }],          // 16px
      xl: ['1.125rem', { lineHeight: '1.625rem' }],    // 18px
      '2xl': ['1.375rem', { lineHeight: '1.75rem' }],  // 22px
      '3xl': ['1.75rem', { lineHeight: '2.125rem' }],  // 28px
    },

    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },

    extend: {
      spacing: {
        'sidebar-collapsed': '56px',
        'sidebar-expanded': '220px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
