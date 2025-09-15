const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: 'selector',
    theme: {
        extend: {
            fontFamily: {
                'open-sans': ['var(--font-open-sans)', 'sans-serif'],
                'kalam': ['var(--font-kalam)']
            },
            keyframes: {
                'slide-from-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' }
                },
                'slide-to-right': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                'slide-from-left': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' }
                },
                'slide-to-left': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' }
                },
                'slide-from-bottom': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' }
                },
                'slide-to-bottom': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                'slide-from-top': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' }
                },
                'slide-to-top': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100%)' }
                },
                'fade-in': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 }
                },
                'fade-out': {
                    '0%': { opacity: 1 },
                    '100%': { opacity: 0 }
                },
                'rating-pulse': {
                    '0%': { transform: 'scale(1.05)' },
                    '50%': { transform: 'scale(1.15)' },
                    '100%': { transform: 'scale(1.05)' }
                },
                'fade-in-up': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(-10px) scale(0.95)'
                    },
                    '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
                }
            },
            animation: {
                'slide-from-right': 'slide-from-right 0.3s ease-in-out',
                'slide-to-right': 'slide-to-right 0.3s ease-in-out',
                'slide-from-left': 'slide-from-left 0.3s ease-in-out',
                'slide-to-left': 'slide-to-left 0.3s ease-in-out',
                'slide-from-bottom': 'slide-from-bottom 0.3s ease-in-out',
                'slide-to-bottom': 'slide-to-bottom 0.3s ease-in-out',
                'slide-from-top': 'slide-from-top 0.3s ease-in-out',
                'slide-to-top': 'slide-to-top 0.3s ease-in-out',
                'fade-in': 'fade-in 0.15s ease-in-out',
                'fade-out': 'fade-out 0.15s ease-in-out',
                'fade-in-slow': 'fade-in 0.3s ease-in-out',
                'fade-out-slow': 'fade-out 0.3s ease-in-out',
                'rating-pulse': 'rating-pulse 0.75s ease-in-out',
                'fade-in-up':
                    'fade-in-up 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards'
            }
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1200px',
            '2xl': '1536px',
            '3xl': '2000px'
        },
        colors: {
            ...colors,

            primary: colors.blue,
            secondary: colors.green,
            success: colors.green,
            danger: colors.red,
            warning: colors.yellow,
            info: colors.blue,
            sheet: colors.gray
        }
    },
    plugins: []
};
