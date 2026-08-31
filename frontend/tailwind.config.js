/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'monospace'],
            },
            colors: {
                /* Reference theme palette */
                bg: {
                    base: '#0e0e0e',   /* page bg */
                    card: '#1a1a1a',   /* card surface */
                    hover: '#222222',  /* hover surface */
                    input: '#2a2a2a',  /* input bg */
                },
                border: {
                    DEFAULT: 'rgba(255,255,255,0.07)',
                    hover: 'rgba(255,255,255,0.14)',
                    subtle: 'rgba(255,255,255,0.04)',
                },
                accent: {
                    green: '#4ade80',
                    'green-dim': 'rgba(74,222,128,0.15)',
                    blue: '#6366f1',
                    'blue-dim': 'rgba(99,102,241,0.25)',
                    purple: '#a78bfa',
                    amber: '#fbbf24',
                    rose: '#fb7185',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#9ca3af',
                    muted: '#6b7280',
                    dim: '#4b5563',
                }
            },
            borderRadius: {
                'xl2': '16px',
                'xl3': '20px',
                'xl4': '24px',
            },
            boxShadow: {
                'card': '0 1px 2px rgba(0,0,0,0.4)',
                'card-hover': '0 4px 20px rgba(0,0,0,0.5)',
                'green-glow': '0 0 16px rgba(74,222,128,0.2)',
                'blue-glow': '0 0 16px rgba(99,102,241,0.25)',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.97)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                dotBlink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-400px 0' },
                    '100%': { backgroundPosition: '400px 0' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                barFill: {
                    '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
                    '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
                },
            },
            animation: {
                'fade-up': 'fadeUp 0.35s ease forwards',
                'fade-in': 'fadeIn 0.3s ease forwards',
                'scale-in': 'scaleIn 0.25s ease forwards',
                'dot-blink': 'dotBlink 1.4s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'count-up': 'countUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
                'bar-fill': 'barFill 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
            },
        },
    },
    plugins: [],
}
