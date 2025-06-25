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
                primary: 'var(--primary)',
                paper: 'var(--paper)',
                info: 'var(--info)',
                warning: 'var(--warning)',
                error: 'var(--error)',
                success: 'var(--success)',
            },
        },
    },
    plugins: [],
}
export default config
