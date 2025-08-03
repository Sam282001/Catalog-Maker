/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    // This line tells Tailwind to scan Flowbite's components for classes
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {},
  },
  // This line adds Flowbite's styles
  plugins: [require("flowbite/plugin")],
};
