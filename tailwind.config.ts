import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Stitch: SF Pro system stack
        sans:     ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
        headline: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
        body:     ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text',    'Inter', 'sans-serif'],
        label:    ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text',    'Inter', 'sans-serif'],
        // Keep display/Playfair for hero fallback
        display:  ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        // Stitch minimal radius scale — "carved not coded"
        DEFAULT: '0.125rem',
        sm:      '0.125rem',
        md:      '0.375rem',
        lg:      '0.25rem',
        xl:      '0.5rem',
        '2xl':   '0.75rem',
        full:    '9999px',
      },
      colors: {
        // ── Stitch Design System ──────────────────────────────────
        // Primary / Forest Green
        primary:           '#173124',
        'primary-container': '#2d4739',
        'on-primary':        '#ffffff',
        'on-primary-container': '#98b5a3',
        'primary-fixed':     '#ccead6',
        'primary-fixed-dim': '#b0cdbb',
        'on-primary-fixed':  '#062014',
        'on-primary-fixed-variant': '#324c3e',
        'inverse-primary':   '#b0cdbb',

        // Surface hierarchy (tonal, no-line rule)
        'background':                '#faf9f5',
        'surface':                   '#faf9f5',
        'surface-bright':            '#faf9f5',
        'surface-dim':               '#dbdad6',
        'surface-variant':           '#e3e2df',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#f4f4f0',
        'surface-container':         '#efeeea',
        'surface-container-high':    '#e9e8e4',
        'surface-container-highest': '#e3e2df',

        // On-surface
        'on-background':      '#1b1c1a',
        'on-surface':         '#1b1c1a',
        'on-surface-variant': '#424844',

        // Inverse
        'inverse-surface':    '#2f312e',
        'inverse-on-surface': '#f2f1ed',

        // Outline
        'outline':         '#727973',
        'outline-variant': '#c2c8c2',

        // Surface tint
        'surface-tint': '#496455',

        // Secondary (burnt orange accent — Stitch)
        secondary:                    '#a04100',
        'secondary-container':        '#ff7a2e',
        'on-secondary':               '#ffffff',
        'on-secondary-container':     '#612500',
        'secondary-fixed':            '#ffdbcc',
        'secondary-fixed-dim':        '#ffb693',
        'on-secondary-fixed':         '#351000',
        'on-secondary-fixed-variant': '#7a3000',

        // Tertiary (sandy gold)
        tertiary:                     '#6a5e33',
        'tertiary-container':         '#baaa79',
        'on-tertiary':                '#ffffff',
        'on-tertiary-container':      '#493e17',
        'tertiary-fixed':             '#f3e2ac',
        'tertiary-fixed-dim':         '#d6c692',
        'on-tertiary-fixed':          '#231b00',
        'on-tertiary-fixed-variant':  '#51461e',

        // Error
        error:              '#ba1a1a',
        'error-container':  '#ffdad6',
        'on-error':         '#ffffff',
        'on-error-container': '#93000a',

        // ── Legacy admin palette (keep for admin pages) ────────────
        banjaran: {
          50:  '#f0f9f4',
          100: '#dcf0e5',
          200: '#bce1ce',
          300: '#8dcaad',
          400: '#59ad86',
          500: '#369168',
          600: '#267553',
          700: '#1f5e44',
          800: '#1b4b37',
          900: '#173e2e',
          950: '#0c2319',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-in-out',
        'fade-in-up':     'fadeInUp 0.4s ease-out both',
        'slide-up':       'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'badge-pop':      'badgePop 0.4s cubic-bezier(0.36,0.07,0.19,0.97)',
        'soft-pulse':     'softPulse 1.8s ease-in-out infinite',
        'shimmer':        'shimmer 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:     { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:      { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        badgePop:     { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.45)' }, '65%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)' } },
        softPulse:    { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
        shimmer:      { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}

export default config
