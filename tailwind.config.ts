import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00A8E8',   // A vibrant blue
        'secondary': '#00171F', // A very dark blue, almost black
        'accent': '#FFC300',    // A sharp yellow for highlights
        'light-base': '#F0F4F8', // Light background for contrast
        'dark-1': '#003459',
        'dark-2': '#007EA7',
        'gray-light': '#d3dce6',
        'gray-dark': '#8492a6',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
