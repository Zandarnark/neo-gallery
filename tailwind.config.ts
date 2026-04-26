import type { Config } from 'tailwindcss'

const config: Config = {
content: [
'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
theme: {
extend: {
colors: {
background: 'var(--background)',
foreground: 'var(--foreground)',
muted: 'var(--muted)',
'muted-foreground': 'var(--muted-foreground)',
border: 'var(--border)',
accent: {
DEFAULT: 'var(--accent)',
foreground: 'var(--accent-foreground)',
},
card: {
DEFAULT: 'var(--card)',
foreground: 'var(--card-foreground)',
},
destructive: 'var(--destructive)',
success: 'var(--success)',
},
fontFamily: {
sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
mono: ['var(--font-geist-mono)', 'monospace'],
},
container: {
center: true,
padding: '1rem',
screens: {
sm: '640px',
md: '768px',
lg: '1024px',
xl: '1280px',
},
},
keyframes: {
shimmer: {
'0%, 100%': { backgroundPosition: '0% 50%' },
'50%': { backgroundPosition: '100% 50%' },
},
float: {
'0%, 100%': { transform: 'translateY(0px)' },
'50%': { transform: 'translateY(-12px)' },
},
'float-delayed': {
'0%, 100%': { transform: 'translateY(0px)' },
'50%': { transform: 'translateY(-8px)' },
},
'pulse-glow': {
'0%, 100%': { boxShadow: '0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent)' },
'50%': { boxShadow: '0 0 20px 8px color-mix(in srgb, var(--accent) 15%, transparent)' },
},
'rotate-slow': {
from: { transform: 'rotate(0deg)' },
to: { transform: 'rotate(360deg)' },
},
drift: {
'0%': { transform: 'translate(0, 0) rotate(0deg)' },
'25%': { transform: 'translate(30px, -20px) rotate(90deg)' },
'50%': { transform: 'translate(-10px, -40px) rotate(180deg)' },
'75%': { transform: 'translate(-30px, -10px) rotate(270deg)' },
'100%': { transform: 'translate(0, 0) rotate(360deg)' },
},
morph: {
'0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
'25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
'50%': { borderRadius: '50% 60% 30% 60% / 30% 40% 70% 60%' },
'75%': { borderRadius: '60% 30% 60% 40% / 70% 50% 40% 60%' },
},
aurora: {
'0%': { backgroundPosition: '0% 50%' },
'50%': { backgroundPosition: '100% 50%' },
'100%': { backgroundPosition: '0% 50%' },
},
'fade-up': {
from: { opacity: '0', transform: 'translateY(30px)' },
to: { opacity: '1', transform: 'translateY(0)' },
},
'scale-in': {
from: { opacity: '0', transform: 'scale(0.9)' },
to: { opacity: '1', transform: 'scale(1)' },
},
'slide-in-left': {
from: { opacity: '0', transform: 'translateX(-40px)' },
to: { opacity: '1', transform: 'translateX(0)' },
},
'slide-in-right': {
from: { opacity: '0', transform: 'translateX(40px)' },
to: { opacity: '1', transform: 'translateX(0)' },
},
'confetti-fall': {
'0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
'100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
},
ripple: {
'0%': { transform: 'scale(0)', opacity: '0.5' },
'100%': { transform: 'scale(4)', opacity: '0' },
},
'border-dance': {
'0%, 100%': { clipPath: 'inset(0 0 98 0)' },
'25%': { clipPath: 'inset(0 98 0 0)' },
'50%': { clipPath: 'inset(98 0 0 0)' },
'75%': { clipPath: 'inset(0 0 0 98)' },
},
grain: {
'0%, 100%': { transform: 'translate(0, 0)' },
'10%': { transform: 'translate(-5%, -10%)' },
'30%': { transform: 'translate(3%, -15%)' },
'50%': { transform: 'translate(12%, 9%)' },
'70%': { transform: 'translate(9%, 4%)' },
'90%': { transform: 'translate(-1%, 7%)' },
},
},
animation: {
shimmer: 'shimmer 3s ease-in-out infinite',
float: 'float 6s ease-in-out infinite',
'float-delayed': 'float-delayed 5s ease-in-out 1s infinite',
'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
'rotate-slow': 'rotate-slow 20s linear infinite',
drift: 'drift 15s ease-in-out infinite',
morph: 'morph 8s ease-in-out infinite',
aurora: 'aurora 8s ease-in-out infinite',
'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
'scale-in': 'scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
'slide-in-left': 'slide-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
'slide-in-right': 'slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
'confetti-fall': 'confetti-fall 3s ease-in forwards',
ripple: 'ripple 0.6s ease-out',
'border-dance': 'border-dance 3s linear infinite',
grain: 'grain 8s steps(10) infinite',
},
},
},
plugins: [],
}
export default config
