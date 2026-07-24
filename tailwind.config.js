/** @type {import('tailwindcss').Config} */

// Every h-* color reads from a CSS variable (defined in globals.css as an
// "R G B" triplet, once for :root and once for .dark) instead of a fixed hex.
// That's what makes dark mode work by just toggling a class on <html> —
// every existing bg-h-*/text-h-*/border-h-* utility in every component
// already repaints itself; nothing else has to change.
function withOpacity(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(${varName}))`
      : `rgb(var(${varName}) / ${opacityValue})`;
}

module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
      },
      width: { '4.5': '1.125rem' },
      height: { '4.5': '1.125rem' },
      colors: {
        // Primary — soft dusty blue. Lighter/calmer than a saturated brand blue,
        // still reads as clinical/trustworthy.
        'h-blue':        withOpacity('--color-h-blue'),
        'h-blue-dark':   withOpacity('--color-h-blue-dark'),
        'h-blue-light':  withOpacity('--color-h-blue-light'),
        // Health / consent / vitality — soft sage teal.
        'h-teal':        withOpacity('--color-h-teal'),
        'h-teal-dark':   withOpacity('--color-h-teal-dark'),
        'h-teal-light':  withOpacity('--color-h-teal-light'),
        // Success — soft sage green, distinct hue from teal.
        'h-green':       withOpacity('--color-h-green'),
        'h-green-dark':  withOpacity('--color-h-green-dark'),
        'h-green-light': withOpacity('--color-h-green-light'),
        // Caution / medication — warm terracotta amber. Kept clear (not overly
        // muted) since it flags real dosage/pending states.
        'h-amber':       withOpacity('--color-h-amber'),
        'h-amber-light': withOpacity('--color-h-amber-light'),
        // Danger — muted brick red. Kept legible since it flags real safety
        // issues (drug interactions, allergy conflicts) — reserved exclusively
        // for alerts, no role/identity color reuses this hue.
        'h-red':         withOpacity('--color-h-red'),
        'h-red-light':   withOpacity('--color-h-red-light'),
        // Info / insurance / audit — soft plum.
        'h-purple':      withOpacity('--color-h-purple'),
        'h-purple-light':withOpacity('--color-h-purple-light'),
        // Neutrals — warm linen/paper (light) or warm charcoal (dark).
        'h-bg':          withOpacity('--color-h-bg'),
        'h-surface':     withOpacity('--color-h-surface'),
        'h-border':      withOpacity('--color-h-border'),
        'h-text':        withOpacity('--color-h-text'),
        'h-text-muted':  withOpacity('--color-h-text-muted'),
        'h-text-light':  withOpacity('--color-h-text-light'),
      },
      boxShadow: {
        'card':        '0 1px 3px rgb(var(--shadow-color) / 0.06), 0 1px 2px rgb(var(--shadow-color) / 0.04)',
        'card-hover':  '0 8px 24px rgb(var(--color-h-blue) / 0.14), 0 2px 8px rgb(var(--shadow-color) / 0.06)',
        'modal':       '0 20px 60px rgb(var(--shadow-color) / 0.20)',
        'btn':         '0 4px 12px rgb(var(--color-h-blue) / 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'fade-in':    { from:{ opacity:0, transform:'translateY(6px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        'scale-in':   { from:{ opacity:0, transform:'scale(0.96)' },     to:{ opacity:1, transform:'scale(1)' } },
        'slide-in':   { from:{ transform:'translateX(-8px)', opacity:0 }, to:{ transform:'translateX(0)', opacity:1 } },
        'pulse-slow': { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.6 } },
        'shake': {
          '0%, 100%':      { transform: 'rotate(0)' },
          '10%, 30%, 50%': { transform: 'rotate(-12deg)' },
          '20%, 40%, 60%': { transform: 'rotate(12deg)' },
          '70%':           { transform: 'rotate(0)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.25s ease-out',
        'scale-in':   'scale-in 0.2s ease-out',
        'slide-in':   'slide-in 0.25s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'shake':      'shake 0.6s ease-in-out',
      },
      borderRadius: { xl:'12px', '2xl':'16px', '3xl':'20px' },
    },
  },
  plugins: [],
};
