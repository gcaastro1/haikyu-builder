import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ['var(--font-inter)', 'sans-serif'], 
        bricolage: ['var(--font-bricolage)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;